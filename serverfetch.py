import time
import socket
import os

broadcast_ip = "255.255.255.255"  # os.getenv("BROADCAST_IP", "172.30.0.255")
port = int(os.getenv("PORT", 19009))

my_ip = os.getenv("CURRENT_IP", "172.30.0.255")
host = "172.19.0.1"


def test_host_or_find_one(curr_host):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.settimeout(1)
    message = "client"
    try:
        sock.sendto(message.encode(), (curr_host, port))
        # Esperar y recibir respuestas
        while True:
            data, addr = sock.recvfrom(1024)
            if data.decode() == "server":
                print(f"Respuesta recibida de {addr}: {data.decode()}")
                sock.close()
                return addr[0]

    except Exception:
        return udp_broadcast_and_receive()


def udp_broadcast_and_receive():
    # Configuración del socket de broadcast
    message = "client"

    # Crear socket UDP
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind(("", port))
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    sock.settimeout(2)

    # Configurar timeout para la recepción
    try:
        # Enviar mensaje de broadcast
        print(f"Enviando broadcast: {message} a {broadcast_ip},{port}")
        sock.sendto(message.encode(), (broadcast_ip, port))

        # Esperar y recibir respuestas
        while True:
            try:
                data, addr = sock.recvfrom(1024)
                if data.decode() == "server":
                    print(f"Respuesta recibida de {addr}: {data.decode()}")
                    sock.close()
                    return addr[0]
            except socket.timeout:
                print("Tiempo de espera agotado. No se recibieron más respuestas.")
                break

        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

    finally:
        sock.close()
