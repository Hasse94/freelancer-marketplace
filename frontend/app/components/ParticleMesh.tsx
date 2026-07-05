"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles() {
  const ref = useRef<THREE.Points>(null!);
  const count = 300;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const orange = new THREE.Color("#f97316");
    const dim = new THREE.Color("#ea580c");

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const c = Math.random() > 0.5 ? orange : dim;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.2;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

function Lines() {
  const ref = useRef<THREE.LineSegments>(null!);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(200 * 6);

    for (let i = 0; i < 200; i++) {
      pos[i * 6] = (Math.random() - 0.5) * 8;
      pos[i * 6 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 6 + 2] = (Math.random() - 0.5) * 8;
      pos[i * 6 + 3] = pos[i * 6] + (Math.random() - 0.5) * 2;
      pos[i * 6 + 4] = pos[i * 6 + 1] + (Math.random() - 0.5) * 2;
      pos[i * 6 + 5] = pos[i * 6 + 2] + (Math.random() - 0.5) * 2;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.2;
  });

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#f97316" transparent opacity={0.1} />
    </lineSegments>
  );
}

const noEvents = { enabled: false, priority: 0 };

export default function ParticleMesh() {
  return (
    <div className="absolute inset-0 z-0" style={{ pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ pointerEvents: "none" }}
        events={() => noEvents as never}
      >
        <ambientLight intensity={0.5} />
        <Particles />
        <Lines />
      </Canvas>
    </div>
  );
}
