import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF, Environment, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function ThreeViewer({ url }: { url?: string }) {
  return (
    <div className="w-full h-full bg-black/50 rounded-lg overflow-hidden border border-border relative">
      {!url ? (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-mono text-xs uppercase tracking-widest">
          No model loaded
        </div>
      ) : (
        <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
          <Suspense fallback={null}>
            <Stage intensity={0.5} environment="city" shadows={{ type: 'contact', opacity: 0.2, blur: 3 }}>
              <Model url={url} />
            </Stage>
            <OrbitControls makeDefault />
            <Environment preset="city" />
            <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
