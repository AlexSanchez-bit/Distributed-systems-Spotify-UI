# Usar una imagen base de Python
FROM python:3.11

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

COPY . .
# Instalar las dependencias
RUN pip install --no-cache-dir -r requirements.txt

RUN chmod +x env.sh

ENTRYPOINT ["./env.sh"]

# Ejecutar el script principal
CMD ["python", "client.py",">>","logs.txt"]
