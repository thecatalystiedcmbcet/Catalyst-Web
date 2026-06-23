import { useRef, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Point drei's GLTFLoader at our local Draco WASM decoder.
useGLTF.setDecoderPath("/draco/");

const MAX_ROT_X = THREE.MathUtils.degToRad(15);
const MAX_ROT_Y = THREE.MathUtils.degToRad(20);
const SMOOTHING = 0.05;

const LogoContainer = () => {
  const modelRef = useRef(null);
  const { scene } = useGLTF("/model/logo.glb");
  const rotation = useRef({ x: 0, y: 0 });

  // Apply our custom mirror material directly to the scene.
  // Because we clear the cache on unmount, this scene is always fresh!
  useMemo(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0.6, 0.6, 0.6), // Original grey
          metalness: 1.0, // High metalness
          roughness: 0.1, // Low roughness for mirror finish
          envMapIntensity: 1.5, // Multiplies the HDRI reflections
        });
      }
    });
  }, [scene]);

  // Completely clear the GLB from memory cache when navigating away.
  // This guarantees the next visit parses the file freshly, preventing WebGL crashes.
  useEffect(() => {
    return () => {
      useGLTF.clear("/model/logo.glb");
    };
  }, []);

  useFrame((state) => {
    if (!modelRef.current || !scene) return;

    const targetX = state.pointer.y * -MAX_ROT_X;
    const targetY = state.pointer.x * MAX_ROT_Y;

    rotation.current.x += (targetX - rotation.current.x) * SMOOTHING;
    rotation.current.y += (targetY - rotation.current.y) * SMOOTHING;

    modelRef.current.rotation.x = rotation.current.x;
    modelRef.current.rotation.y = rotation.current.y;
    modelRef.current.position.y =
      -10 + Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
  });

  if (!scene) return null;

  return (
    <group ref={modelRef} position={[0, -10, 20]} scale={1.2}>
      <primitive object={scene} />
    </group>
  );
};

export default LogoContainer;
