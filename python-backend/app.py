from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import os
import uuid
import subprocess
import logging

app = Flask(__name__)
CORS(app) # Permite que seu frontend fale com este servidor

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

logging.basicConfig(level=logging.INFO)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ready", "engine": "Blender 3D"})

@app.route("/convert", methods=["POST"])
def convert():
    if "file" not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400
    
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Nome de arquivo vazio"}), 400

    job_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_FOLDER, f"{job_id}.blend")
    output_path = os.path.join(OUTPUT_FOLDER, f"{job_id}.glb")
    
    try:
        file.save(input_path)
        logging.info(f"Iniciando conversão: {file.filename}")

        # Executa o Blender em modo background
        # O script 'convert.py' deve estar na mesma pasta
        result = subprocess.run(
            ["blender", "--background", "--python", "convert.py", "--", input_path, output_path],
            capture_output=True,
            text=True,
            timeout=300 # 5 minutos de limite
        )

        if result.returncode != 0:
            logging.error(f"Erro no Blender: {result.stderr}")
            return jsonify({"error": "Falha no processamento do Blender", "details": result.stderr}), 500

        if not os.path.exists(output_path):
            return jsonify({"error": "Arquivo de saída não foi gerado"}), 500

        return send_file(output_path, as_attachment=True, download_name=file.filename.replace(".blend", ".glb"))

    except Exception as e:
        logging.error(f"Erro interno: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        # Limpeza opcional (cuidado em produção)
        if os.path.exists(input_path):
            os.remove(input_path)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
