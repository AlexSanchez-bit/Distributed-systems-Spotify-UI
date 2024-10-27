from flask import Flask, render_template, redirect, url_for, request, jsonify, session
import requests
import os
from serverfetch import test_host_or_find_one, udp_broadcast_and_receive

host = udp_broadcast_and_receive()


def baseUrl():
    global host
    host = test_host_or_find_one(host)
    return f"http://{host}:54321"


app = Flask(__name__)
app.secret_key = "supersecretkey"  # Necesario para manejar sesiones


# Función para obtener la URL base de la API


# Ruta principal, mostrar dashboard o página de inicio
@app.route("/")
def index():
    if "username" in session:
        return render_template("dashboard.html", username=session["username"])
    return render_template("login.html")


# Vista para el login
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        # Autenticación con la API
        response = requests.post(
            f"{baseUrl()}/auth", json={"username": username, "password": password}
        )
        if response.status_code == 200:
            session["username"] = username
            return redirect(url_for("index"))
        else:
            return render_template("login.html", error="Invalid credentials")
    return render_template("login.html")


# Vista para crear grupos
@app.route("/create_group", methods=["GET", "POST"])
def create_group():
    if "username" not in session:
        return redirect(url_for("login"))

    if request.method == "POST":
        group_name = request.form["group_name"]
        users = request.form.getlist("users")
        # Crear grupo usando la API
        response = requests.post(
            f"{baseUrl()}/create_group", json={"name": group_name, "users": users}
        )
        if response.status_code == 201:
            return redirect(url_for("groups"))
        else:
            return render_template("create_group.html", error="Error creating group")
    # Obtener todos los usuarios para mostrar en el formulario
    users_response = requests.get(f"{baseUrl()}/users")
    users = users_response.json()
    return render_template("create_group.html", users=users)


# Vista para mostrar grupos
@app.route("/groups")
def groups():
    if "username" not in session:
        return redirect(url_for("login"))

    # Obtener los grupos desde la API
    response = requests.get(f"{baseUrl()}/groups")
    groups = response.json()
    return render_template("groups.html", groups=groups)


# Vista para crear eventos grupales
@app.route("/create_event", methods=["GET", "POST"])
def create_event():
    if "username" not in session:
        return redirect(url_for("login"))

    if request.method == "POST":
        event_name = request.form["event_name"]
        description = request.form["description"]
        start = request.form["start"]
        end = request.form["end"]
        # Crear evento usando la API
        response = requests.post(
            f"{baseUrl()}/create_event",
            json={
                "name": event_name,
                "description": description,
                "start": start,
                "implied_users": [session["username"]],
                "end": end,
                "group_id": "",
            },
        )
        if response.status_code == 201:
            return redirect(url_for("events"))
        else:
            return render_template("create_event.html", error="Error creating event")

    # Obtener grupos para asociar un evento
    groups_response = requests.post(f"{baseUrl()}/groups", json={"filter": {}})
    groups = groups_response.json()
    return render_template("create_event.html", groups=groups)


# Vista para mostrar eventos
@app.route("/events")
def events():
    if "username" not in session:
        return redirect(url_for("login"))

    # Obtener eventos desde la API
    response = requests.get(f"{baseUrl()}/events")
    events = response.json()
    return render_template("events.html", events=events)


# Vista para visualizar la agenda de un grupo
@app.route("/schedule/<int:group_id>")
def schedule(group_id):
    if "username" not in session:
        return redirect(url_for("login"))

    # Obtener agenda del grupo desde la API
    response = requests.get(f"{baseUrl()}/groups/{group_id}")
    group = response.json()

    # Aquí podrías procesar la información para detectar conflictos en las agendas
    return render_template("schedule.html", group=group)


# Crear Usuarios
@app.route("/create_user", methods=["GET", "POST"])
def create_user():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        # Crear usuario usando la API
        response = requests.post(
            f"{baseUrl()}/create_user",
            json={"name": username, "passw": password},
        )

        if response.status_code == 201:
            return redirect(url_for("index"))
        else:
            return render_template("create_user.html", error="Error creating user")

    return render_template("create_user.html")


# Cerrar sesión
@app.route("/logout")
def logout():
    session.pop("username", None)
    return redirect(url_for("index"))


my_ip = os.getenv("CURRENT_IP", "172.30.0.255")
app.run(host=my_ip, port=54321, debug=True)
print(f"mi ip es {my_ip}")
