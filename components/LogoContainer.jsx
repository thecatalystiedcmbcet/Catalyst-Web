import React, { useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Pre-allocate all vectors/objects OUTSIDE the component to avoid per-frame GC
const _raycaster = new THREE.Raycaster();
const _mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -20);
const _intersectionPoint = new THREE.Vector3();
const _direction = new THREE.Vector3();
const MODEL_POSITION = new THREE.Vector3(0, -10, 20);

const MAX_ROT_X = THREE.MathUtils.degToRad(15);
const MAX_ROT_Y = THREE.MathUtils.degToRad(20);
const SMOOTHING = 0.05;

const LogoContainer = () => {
  const modelRef = useRef(null);
  const { scene } = useGLTF("./model/logo.glb");

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

    // Reuse pre-allocated objects — no GC pressure
    _raycaster.setFromCamera(state.mouse, state.camera);
    _raycaster.ray.intersectPlane(_mousePlane, _intersectionPoint);

    _direction.copy(_intersectionPoint).sub(MODEL_POSITION).normalize();

    const clampedX = THREE.MathUtils.clamp(
      Math.atan2(_direction.y, _direction.z),
      -MAX_ROT_X,
      MAX_ROT_X
    );
    const clampedY = THREE.MathUtils.clamp(
      Math.atan2(_direction.x, _direction.z),
      -MAX_ROT_Y,
      MAX_ROT_Y
    );

    rotation.current.x += (clampedX - rotation.current.x) * SMOOTHING;
    rotation.current.y += (clampedY - rotation.current.y) * SMOOTHING;

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
