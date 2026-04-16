import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import fs from "fs";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const OUTPUT_DIR = path.join(process.cwd(), "outputs");

// Ensure directories exist
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.toLowerCase().endsWith(".blend")) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos .blend são permitidos"));
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  // API de Conversão Real/Simulada
  app.post("/api/convert", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });

      const inputPath = req.file.path;
      const outputFilename = req.file.filename.replace(/\.[^/.]+$/, "") + ".glb";
      const outputPath = path.join(OUTPUT_DIR, outputFilename);

      console.log(`[SERVER] Iniciando processamento: ${req.file.originalname}`);

      // Verifica se o Blender está disponível no sistema (Render Docker)
      const checkBlender = spawn("blender", ["--version"]);
      
      checkBlender.on("error", () => {
        console.log("[SERVER] Blender não encontrado. Usando modo simulação.");
        setTimeout(() => {
          res.json({ 
            success: true, 
            mode: "simulation",
            message: "Conversão simulada (Blender não instalado no ambiente atual)",
            filename: outputFilename
          });
        }, 2000);
      });

      checkBlender.on("close", (code) => {
        if (code === 0) {
          console.log("[SERVER] Blender detectado. Iniciando conversão real...");
          
          // O script convert.py deve estar na raiz
          const blender = spawn("blender", [
            "--background", 
            "--python", "convert.py", 
            "--", inputPath, outputPath
          ]);

          blender.stderr.on("data", (data) => console.error(`[BLENDER ERR] ${data}`));
          
          blender.on("close", (exitCode) => {
            if (exitCode === 0 && fs.existsSync(outputPath)) {
              res.sendFile(outputPath);
            } else {
              res.status(500).json({ error: "Erro interno no Blender durante a conversão" });
            }
          });
        }
      });

    } catch (error) {
      console.error("[SERVER] Erro:", error);
      res.status(500).json({ error: "Falha crítica no servidor" });
    }
  });

  // Servir arquivos estáticos no Render (Produção)
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      if (!req.path.startsWith("/api")) {
        res.sendFile(path.join(distPath, "index.html"));
      }
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Rodando em http://0.0.0.0:${PORT} (${process.env.NODE_ENV || 'dev'})`);
  });
}

startServer();
