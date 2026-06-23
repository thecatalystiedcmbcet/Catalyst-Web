"use client";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import LogoContainer from "@/components/shared/LogoContainer";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/** Placeholder shown while the GLB is downloading.
 *  Uses plain Three primitives so it renders in <10ms.
 */
function LogoPlaceholder() {
  return (
    <mesh>
      <sphereGeometry args={[3.5, 32, 32]} />
      <meshStandardMaterial
        color="#333333"
        metalness={0.9}
        roughness={0.2}
        wireframe
        transparent
        opacity={0.25}
      />
    </mesh>
  );
}

const Hero3D = () => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <div className={`absolute inset-0 ${!isDesktop ? "pointer-events-none" : ""}`}>
      <Canvas
        camera={{ position: [0, -55, 110], fov: isDesktop ? 4.5 : 7 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        performance={{ min: 0.55 }}
        frameloop="always"
        className="w-full h-full"
      >
        <Suspense fallback={<LogoPlaceholder />}>
          {/* High quality studio HDRI for perfect metallic reflections */}
          <Environment files="/model/studio_small_09_2k.hdr" />
          <LogoContainer />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Hero3D;
