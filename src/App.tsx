import { useState } from "react";
import { Box, Download, Cpu, Activity, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster, toast } from "sonner";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import UploadZone from "./components/UploadZone";
import ThreeViewer from "./components/ThreeViewer";

export default function App() {
  const [isConverting, setIsConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ name: string; date: string; status: string }[]>([]);
  const [apiUrl, setApiUrl] = useState<string>("/api/convert"); // Default para o simulador local

  // Check backend health on mount
  useState(() => {
    fetch("/api/health")
      .then(res => res.json())
      .then(data => console.log("[FRONTEND] Backend healthy:", data))
      .catch(err => console.error("[FRONTEND] Backend unreachable:", err));
  });

  const handleUpload = async (file: File) => {
    setIsConverting(true);
    setError(null);
    setConvertedUrl(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        let errorMsg = `Erro ${response.status}: `;
        try {
          const errData = await response.json();
          errorMsg += errData.error || errData.details || response.statusText;
        } catch {
          errorMsg += "O servidor encontrou um erro crítico.";
        }
        throw new Error(errorMsg);
      }

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.success) {
          toast.success("Conversão simulada com sucesso!");
          setConvertedUrl("https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb");
          setHistory(prev => [{ name: file.name, date: new Date().toLocaleTimeString(), status: "Success" }, ...prev]);
        } else {
          throw new Error(data.error || "Falha na conversão");
        }
      } else if (contentType && (contentType.includes("model/gltf-binary") || contentType.includes("application/octet-stream") || contentType.includes("model/gltf+json"))) {
        // Se for um arquivo real (vindo do Blender no Render)
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setConvertedUrl(url);
        toast.success("Conversão REAL concluída!");
        setHistory(prev => [{ name: file.name, date: new Date().toLocaleTimeString(), status: "Real Success" }, ...prev]);
      } else {
        throw new Error("Resposta inesperada do servidor. Verifique a URL da API.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido na conexão";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white p-6 flex items-center justify-center">
      <Toaster position="top-right" theme="dark" />
      
      <div className="bento-grid w-full max-w-[1200px] h-full lg:h-[800px]">
        
        {/* Header Section (span 3x1) */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 col-span-4 lg:col-span-3">
          <span className="label-mono">Product Overview</span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">
            Vertex 3D Engine <Badge className="ml-2 bg-[#262626] text-white border-none">V2.4.0 PRO</Badge>
          </h1>
          <p className="text-[#888888] text-sm mt-2">
            Professional .blend to .glb automated converter optimized for web and metaverse environments.
          </p>
        </div>

        {/* Runtime Info (span 1x1) */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 col-span-4 lg:col-span-1">
          <span className="label-mono">API Configuration</span>
          <div className="mt-2">
            <input 
              type="text" 
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://seu-app.render.com/convert"
              className="w-full bg-[#080808] border border-[#262626] rounded-lg px-3 py-2 text-[10px] font-mono focus:border-[#00ff88] outline-none transition-colors"
            />
            <p className="text-[#888888] text-[9px] mt-2 italic">
              Use "/api/convert" para simulação ou sua URL do Render para conversão real.
            </p>
          </div>
        </div>

        {/* Main Converter / Viewer (span 2x3) */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 col-span-4 lg:col-span-2 lg:row-span-3 flex flex-col">
          <span className="label-mono">Dropzone & Preview</span>
          <h2 className="text-lg font-semibold mb-4">3D Workspace</h2>
          
          <div className="flex-1 relative min-h-[300px]">
            <ThreeViewer url={convertedUrl || undefined} />
            
            <AnimatePresence>
              {!convertedUrl && !isConverting && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10"
                >
                  <UploadZone onUpload={handleUpload} isConverting={isConverting} error={error} />
                </motion.div>
              )}
            </AnimatePresence>

            {isConverting && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20 rounded-lg">
                <div className="w-12 h-12 border-2 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin" />
                <p className="label-mono animate-pulse">Processing Geometry...</p>
              </div>
            )}
          </div>

          {convertedUrl && (
            <div className="mt-4 flex gap-2">
              <Button className="flex-1 bg-[#00ff88] text-black hover:bg-[#00ff88]/90 font-bold">
                <Download className="mr-2 h-4 w-4" /> DOWNLOAD .GLB
              </Button>
              <Button variant="outline" onClick={() => setConvertedUrl(null)} className="border-[#262626] hover:bg-[#262626]">
                RESET
              </Button>
            </div>
          )}
        </div>

        {/* Engine Specs (span 1x2) */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 col-span-4 lg:col-span-1 lg:row-span-2">
          <span className="label-mono">Engine Specs</span>
          <div className="space-y-4 mt-4">
            <div className="flex justify-between items-center border-b border-[#262626] pb-3">
              <span className="text-[#888888] text-xs">Input Format</span>
              <span className="font-mono text-xs">.BLEND</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#262626] pb-3">
              <span className="text-[#888888] text-xs">Output Format</span>
              <span className="font-mono text-xs text-[#00ff88]">.GLB</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#262626] pb-3">
              <span className="text-[#888888] text-xs">Compression</span>
              <span className="text-xs font-bold">DRACO</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#888888] text-xs">Baking</span>
              <span className="text-xs font-bold">AUTO</span>
            </div>
          </div>
        </div>

        {/* Live Status (span 1x1) */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 col-span-4 lg:col-span-1">
          <span className="label-mono">Live Status</span>
          <div className="flex items-center mt-2">
            <span className="status-dot"></span>
            <span className="font-semibold text-sm">Cluster: Active</span>
          </div>
          <p className="text-[#888888] text-[11px] mt-2">Latency: 42ms</p>
        </div>

        {/* Deploy Instance (span 1x1) */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 col-span-4 lg:col-span-1">
          <span className="label-mono">Deploy Instance</span>
          <h2 className="text-sm font-semibold flex items-center gap-2 mt-1">
            <Globe size={14} className="text-[#00ff88]" /> Cloud Run
          </h2>
          <p className="text-[#888888] text-[10px] mt-1">build-id: vtx_992x</p>
        </div>

        {/* Recent History (span 2x1) */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 col-span-4 lg:col-span-2">
          <span className="label-mono">Recent Exports</span>
          <div className="flex gap-3 mt-3 overflow-x-auto pb-2 scrollbar-hide">
            {history.length === 0 ? (
              <p className="text-[#888888] text-xs italic">No recent exports</p>
            ) : (
              history.map((item, i) => (
                <div key={i} className="bg-[#080808] border border-[#262626] p-3 rounded-xl flex items-center gap-3 min-w-[200px]">
                  <div className="bg-[#00ff88]/10 p-2 rounded text-[#00ff88] font-bold text-[10px]">GLB</div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold truncate">{item.name}</p>
                    <p className="text-[10px] text-[#888888]">{item.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
