# Usamos uma imagem que já tenha o Blender ou instalamos manualmente
FROM python:3.10-slim

# Instala dependências do sistema e o Blender
RUN apt-get update && apt-get install -y \
    blender \
    libglu1-mesa \
    libxi6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Render usa a variável de ambiente PORT
ENV PORT=5000
EXPOSE 5000

CMD ["python", "app.py"]
