import React, { useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const MAX_ROT_X = THREE.MathUtils.degToRad(15);
const MAX_ROT_Y = THREE.MathUtils.degToRad(20);
const SMOOTHING = 0.05;

const LogoContainer = () => {
  const modelRef = useRef(null);
  const { scene } = useGLTF("/model/logo.glb");

  // Track current rotation without useState re-renders
  const rotation = useRef({ x: 0, y: 0 });

  // Apply chrome-like materials — only once when scene loads
  useMemo(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0.6, 0.6, 0.6),
          metalness: 1,
          roughness: 0.1,
          envMapIntensity: 1.5,
          opacity: child.material.opacity,
          transparent: child.material.transparent,
        });
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (!modelRef.current) return;

    // Use normalized pointer coordinates [-1, 1] directly instead of expensive raycasting
    const targetX = state.pointer.y * -MAX_ROT_X; // Inverse pitch
    const targetY = state.pointer.x * MAX_ROT_Y;  // Yaw

    rotation.current.x += (targetX - rotation.current.x) * SMOOTHING;
    rotation.current.y += (targetY - rotation.current.y) * SMOOTHING;

    modelRef.current.rotation.x = rotation.current.x;
    modelRef.current.rotation.y = rotation.current.y;

    // Idle bob
    modelRef.current.position.y = -10 + Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
  });

  return (
    <group ref={modelRef} position={[0, -10, 20]} scale={1.2}>
      <primitive object={scene} />
    </group>
  );
};

export default LogoContainer;

