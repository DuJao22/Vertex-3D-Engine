import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "uploads");
const OUTPUT_DIR = path.join(__dirname, "outputs");

// Ensure directories exist
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith(".blend")) {
      cb(null, true);
    } else {
      cb(new Error("Only .blend files are allowed"));
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Debug middleware
  app.use((req, res, next) => {
    console.log(`[SERVER] ${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: "simulation", timestamp: new Date().toISOString() });
  });

  // API Routes
  app.post("/api/convert", (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Upload error: ${err.message}`, success: false });
      } else if (err) {
        return res.status(400).json({ error: err.message, success: false });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded", success: false });
      }

      const inputPath = req.file.path;
      const outputFilename = req.file.filename.replace(".blend", ".glb");
      
      console.log(`[SERVER] Converting: ${req.file.originalname}`);

      // Simulação de delay de conversão
      setTimeout(() => {
        res.json({ 
          success: true, 
          message: "Conversion successful (Simulated)",
          filename: outputFilename,
          downloadUrl: `/api/download/${outputFilename}` 
        });
      }, 2000);

    } catch (error) {
      console.error("[SERVER] Conversion error:", error);
      res.status(500).json({ error: "Internal server error during conversion", success: false });
    }
  });

  app.get("/api/download/:filename", (req, res) => {
    res.status(404).json({ error: "File not found in simulation mode", success: false });
  });

  // Global Error Handler for API
  app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[SERVER] API Error:", err);
    res.status(err.status || 500).json({
      error: err.message || "An unexpected error occurred",
      success: false
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
