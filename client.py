import json
from types import MethodType
from flask_socketio import SocketIO, send, emit
from flask import Flask, render_template, request, redirect, url_for
from flask import Flask, jsonify
import os
import requests
from serverfetch import test_host_or_find_one, udp_broadcast_and_receive
import socketio

host = udp_broadcast_and_receive()


def baseUrl():
    global host
    host = test_host_or_find_one(host)
    return f"http://{host}:54321"


app = Flask(__name__)
port = 54321
mainsocketio = SocketIO(app, resources={r"/*": {"origins": "*"}}, port=port)
remote_sockets = {}


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/admin")
def home_():
    return render_template("admin.html")


@app.route("/get-server")
def socket_conection():
    if host is None:
        return jsonify({"data": None, "error": {"message": " error"}})
    return jsonify({"data": host, "error": None})


@app.route("/get-all-playlists", methods=["POST"])
def fetch_playlists():
    filters = request.json
    resp = requests.post(f"{baseUrl()}/get-all-playlists", json=filters)
    if resp.status_code == 200:
        result = resp.json()
        return result
    else:
        return jsonify({"error": 500})


@app.route("/add-playlist", methods=["POST"])
def upload_playlist():
    data = request.json
    print(data)
    resp = requests.post(f"{baseUrl()}/add-playlist", json=data)
    if resp.status_code == 201:
        return resp.json(), 200
    else:
        return jsonify({"error": {"message": "Error from Host", "code": 500}}), 500


@app.route("/update-playlist", methods=["POST"])
def update_playlist():
    data = request.json
    print(data)
    resp = requests.put(f"{baseUrl()}/update-playlist", json=data)
    if resp.status_code == 200:
        return resp.json(), 200
    else:
        return jsonify({"error": {"message": "Error from Host", "code": 500}}), 500


@app.route("/get-playlist/<id>")
def get_playlist(id):
    response = requests.get(f"{baseUrl()}/get-playlist/{id}")

    return response.json(), response.status_code


@app.route("/remove-playlist/<id>")
def remove_playlist(id):
    response = requests.delete(f"{baseUrl()}/delete-playlist/{id}")
    return response.json(), response.status_code


@app.route("/upload-song", methods=["POST"])
def upload_song():
    if "file" not in request.files:
        return jsonify({"message": "No file part"}), 400
    file = request.files["file"]

    if file.filename == "":
        return jsonify({"message": "No selected file"}), 400

    # El parámetro 'files' debe ser un diccionario en formato {'nombre_campo': archivo}
    files = {"file": (file.filename, file.stream, file.mimetype)}

    # Realiza la solicitud POST al endpoint de subida de archivos
    response = requests.post(f"{baseUrl()}/upload-file", files=files)

    return response.json(), 200


@app.route("/get-music-steam/<id>")
def music_stream(id):
    result = requests.get(f"{baseUrl()}/get-song/{id}")
    if result.status_code != 200:
        return jsonify({"message": "not found"}), 404
    host_ip = result.json().get("host")
    remote_socket = socketio.Client()
    remote_socket.connect(f"ws://{host_ip}:{54321}")

    # Guardar la conexión remota en el diccionario usando el id como clave

    @remote_socket.on("song_info")
    def handle_remote_message(data):
        # Reenviar el mensaje recibido al cliente conectado a este servidor
        mainsocketio.emit(
            f"server_message_{id}",
            {"command": "song_info", "data": data},
        )

    @remote_socket.on("audio_chunk")
    def handle_remote_message2(data):
        # Reenviar el mensaje recibido al cliente conectado a este servidor
        mainsocketio.emit(
            f"server_message_{id}", {"command": "audio_chunk", "data": data}
        )

    @remote_socket.on("disconnect")
    def handle_remote_message3():
        # Reenviar el mensaje recibido al cliente conectado a este servidor
        music_stream(id)

    remote_sockets[id] = remote_socket
    return result.json(), 200


@mainsocketio.on("client_message")
def handle_client_message(data):
    # Supongamos que el mensaje contiene el id de la canción para identificar el socket remoto
    song_id = data.get("song_id")
    remote_socket = remote_sockets.get(song_id)

    if remote_socket:
        # Reenviar el mensaje al WebSocket remoto correspondiente
        remote_socket.emit(data.get("command"), data.get("params"))
    else:
        print(f"No active connection found for song id: {song_id}")


@mainsocketio.on("test")
def test():
    print("test")
    mainsocketio.emit("test")


my_ip = os.getenv("CURRENT_IP", "172.30.0.255")
print(f"mi ip es {my_ip}")
# app.run(host=my_ip, debug=True, port=port)
mainsocketio.run(
    app,
    host=my_ip,
    port=port,
    debug=True,
    use_reloader=False,
    log_output=False,
    allow_unsafe_werkzeug=True,
)
