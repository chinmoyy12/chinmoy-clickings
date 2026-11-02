"use client";

import { useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { setCursorLabel } from "@/components/CustomCursor";
import type { Photo } from "@/data/types";
import { optimizedUrl } from "@/utils/media";

const SPACING = 2.9;
const START_Z = 5;
const FOG = "#080808";

interface Hung {
  photo: Photo;
  position: [number, number, number];
  tilt: number;
}

interface Props {
  items: Photo[];
  progress: React.RefObject<number>;
  running: boolean;
  dpr: number;
  focused: number | null;
  onSelect: (index: number) => void;
  onArrive: () => void;
  onContextLost: () => void;
}

// Fixed placements rather than random ones, so the hang is composed, not scattered.
function hang(items: Photo[]): Hung[] {
  const lanes: [number, number][] = [[-1.55, 0.28], [1.5, -0.32], [-0.7, -0.5], [1.85, 0.42], [-1.9, -0.12], [0.55, 0.5]];
  return items.map((photo, i) => {
    const [x, y] = lanes[i % lanes.length];
    return { photo, position: [x, y, -i * SPACING], tilt: (x > 0 ? -1 : 1) * 0.1 };
  });
}

function Plate({ item, index, onSelect }: { item: Hung; index: number; onSelect: (index: number) => void }) {
  const texture = useTexture(optimizedUrl(item.photo.src, 1200));
  const mesh = useRef<THREE.Mesh>(null);
  const invalidate = useThree((state) => state.invalidate);
  const [hover, setHover] = useState(false);
  const aspect = item.photo.width / item.photo.height;
  const height = aspect > 1 ? 1.1 : 1.5;

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
  }, [texture]);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    const next = THREE.MathUtils.damp(mesh.current.scale.x, hover ? 1.04 : 1, 6, delta);
    if (Math.abs(next - mesh.current.scale.x) > 0.0005) invalidate();
    mesh.current.scale.setScalar(next);
  });

  return (
    <mesh
      ref={mesh}
      position={item.position}
      rotation={[0, item.tilt, 0]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(index);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHover(true);
        setCursorLabel("Open");
        invalidate();
      }}
      onPointerOut={() => {
        setHover(false);
        setCursorLabel(null);
        invalidate();
      }}
    >
      <planeGeometry args={[height * aspect, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} fog />
    </mesh>
  );
}

function Rig({ hung, progress, focused, onArrive }: { hung: Hung[]; progress: Props["progress"]; focused: number | null; onArrive: () => void }) {
  const invalidate = useThree((state) => state.invalidate);
  const pointer = useRef({ x: 0, y: 0 });
  const eased = useRef({ x: 0, y: 0, z: START_Z });
  const arrived = useRef(false);
  const end = -(hung.length - 1) * SPACING + 2.4;

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = event.clientX / window.innerWidth - 0.5;
      pointer.current.y = event.clientY / window.innerHeight - 0.5;
      invalidate();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [invalidate]);

  useEffect(() => {
    arrived.current = false;
    invalidate();
  }, [focused, invalidate]);

  useFrame(({ camera }, delta) => {
    const item = focused === null ? null : hung[focused];
    const target = item
      ? { x: item.position[0], y: item.position[1], z: item.position[2] + 1.45 }
      : { x: pointer.current.x * 0.5, y: -pointer.current.y * 0.3, z: START_Z + (end - START_Z) * progress.current };
    const rate = item ? 3.6 : 4;
    const e = eased.current;
    e.x = THREE.MathUtils.damp(e.x, target.x, rate, delta);
    e.y = THREE.MathUtils.damp(e.y, target.y, rate, delta);
    e.z = THREE.MathUtils.damp(e.z, target.z, rate, delta);
    camera.position.set(e.x, e.y, e.z);
    camera.rotation.y = THREE.MathUtils.damp(camera.rotation.y, item ? 0 : -pointer.current.x * 0.05, rate, delta);
    camera.rotation.x = THREE.MathUtils.damp(camera.rotation.x, item ? 0 : -pointer.current.y * 0.03, rate, delta);

    const distance = Math.abs(e.z - target.z) + Math.abs(e.x - target.x) + Math.abs(e.y - target.y);
    if (distance > 0.002) invalidate();
    if (item && distance < 0.09 && !arrived.current) {
      arrived.current = true;
      onArrive();
    }
  });
  return null;
}

function Nudge({ progress, running }: { progress: Props["progress"]; running: boolean }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    if (!running) return;
    let last = -1;
    let frame = 0;
    const loop = () => {
      if (progress.current !== last) {
        last = progress.current;
        invalidate();
      }
      frame = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(frame);
  }, [running, progress, invalidate]);
  return null;
}

export default function ArchiveScene({ items, progress, running, dpr, focused, onSelect, onArrive, onContextLost }: Props) {
  const hung = useMemo(() => hang(items), [items]);
  return (
    <Canvas
      className="!absolute inset-0"
      frameloop={running ? "demand" : "never"}
      dpr={[1, dpr]}
      gl={{ antialias: dpr > 1, powerPreference: "high-performance", alpha: false }}
      camera={{ fov: 42, near: 0.1, far: 30, position: [0, 0, START_Z] }}
      onCreated={({ gl }) => gl.domElement.addEventListener("webglcontextlost", onContextLost)}
      aria-hidden
    >
      <color attach="background" args={[FOG]} />
      <fog attach="fog" args={[FOG, 2.2, 10]} />
      <Rig hung={hung} progress={progress} focused={focused} onArrive={onArrive} />
      <Nudge progress={progress} running={running} />
      <Suspense fallback={null}>
        {hung.map((item, i) => (
          <Plate key={item.photo.id} item={item} index={i} onSelect={onSelect} />
        ))}
      </Suspense>
    </Canvas>
  );
}
