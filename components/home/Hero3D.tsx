"use client";
import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import LogoContainer from "@/components/LogoContainer";
import { Environment } from "@react-three/drei";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useInView } from "framer-motion";

const Hero3D = () => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef);

  return (
    <div ref={containerRef} className={`absolute inset-0 ${!isDesktop ? 'pointer-events-none' : ''}`}>
      <Canvas
        camera={{ position: [0, -55, 110], fov: isDesktop ? 4.5 : 7 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
        }}
        performance={{ min: 0.55 }}
        frameloop={isInView ? "always" : "demand"}
        className="w-full h-full"
      >
        <Environment
          files={[
            "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/studio_small_09_2k.hdr",
          ]}
        />
        <Suspense fallback={null}>
          <LogoContainer />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Hero3D;
