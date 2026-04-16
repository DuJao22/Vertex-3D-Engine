import { useState, useCallback } from "react";
import { Upload, Box, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface UploadZoneProps {
  onUpload: (file: File) => void;
  isConverting: boolean;
  error?: string | null;
}

export default function UploadZone({ onUpload, isConverting, error }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".blend")) {
      setSelectedFile(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".blend")) {
      setSelectedFile(file);
    }
  };

  const handleConvert = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex-1 border-2 border-dashed rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-4 text-center p-8",
          isDragging ? "border-[#00ff88] bg-[#00ff88]/5 scale-[1.02]" : "border-[#262626] bg-white/5",
          selectedFile ? "border-[#00ff88]/50" : ""
        )}
      >
        <input
          type="file"
          accept=".blend"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleFileChange}
          disabled={isConverting}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-[#00ff88]/10 rounded-full flex items-center justify-center text-[#00ff88]">
              <Box size={32} />
            </div>
            <div>
              <p className="font-medium text-white">{selectedFile.name}</p>
              <p className="text-xs text-[#888888]">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-[#00ff88]/15 rounded-full flex items-center justify-center text-[#00ff88]">
              <Upload size={24} />
            </div>
            <div>
              <p className="font-medium text-white">Arraste seu arquivo .blend</p>
              <p className="text-xs text-[#888888]">Máximo 50MB por arquivo</p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <Button
        onClick={handleConvert}
        disabled={!selectedFile || isConverting}
        className="mt-6 w-full h-12 bg-[#00ff88] text-black hover:bg-[#00ff88]/90 font-bold uppercase tracking-widest text-xs"
      >
        {isConverting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            CONVERTENDO...
          </>
        ) : (
          "CONVERTER AGORA"
        )}
      </Button>
    </div>
  );
}
