# 🚀 Vertex 3D (.blend → .glb)

Professional 3D model converter and viewer. Convert .blend files to .glb automatically and preview them in real-time.

---

## 🔧 Technologies

- **Frontend**: React 19, Vite, Tailwind CSS 4, shadcn/ui, Framer Motion
- **3D Engine**: Three.js, @react-three/fiber, @react-three/drei
- **Backend**: Node.js, Express, Multer
- **AI**: Google Gemini (Optional for metadata generation)

---

## ⚙️ How to run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Access: `http://localhost:3000`

---

## ☁️ Deployment

This project is structured for **Render** or **Docker** deployment.

### Render Deployment
1. Connect your GitHub repository to Render.
2. Use the following build command:
   ```bash
   pip install -r requirements.txt && npm install && npm run build
   ```
3. Ensure **Blender** is installed in the environment (use a custom Dockerfile or Render's `apt-get` build command).

---

## ⚠️ Important Note (Preview Environment)

In this preview environment, **Blender** is not installed. The conversion process is **simulated**. 
To enable real conversion, you must deploy this to an environment where the `blender` CLI is available.

---

## 💡 Features

- [x] Real-time 3D Preview
- [x] Drag & Drop .blend upload
- [x] Hardware-inspired UI
- [x] Conversion History
- [ ] Multi-format support (OBJ, STL, FBX)
- [ ] Auto-optimization (Draco compression)

---

## 🧠 Author
Vertex 3D - Professional SaaS Template
