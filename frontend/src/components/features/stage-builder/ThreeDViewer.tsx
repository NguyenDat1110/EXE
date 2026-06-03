import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Html,
  useProgress,
  Environment,
  Box,
  Cylinder,
  Cone,
  Sphere,
  ContactShadows,
  Float,
  MeshReflectorMaterial,
} from '@react-three/drei';
import { Loader2, Compass } from 'lucide-react';
import * as THREE from 'three';
import { useStageBuilderStore, StageItem } from '../../../store/stageBuilderStore';

// ─── Loading Spinner ───
function Loader3D() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan animate-spin" />
        <span className="text-xs text-white/50 font-mono">{progress.toFixed(0)}%</span>
      </div>
    </Html>
  );
}

// ─── Coordinate mapping: 2D canvas → 3D world ───
// 2D canvas is 1200×800, we map to a 3D floor of roughly 30×20 units
const SCALE_X = 30 / 1200;
const SCALE_Z = 20 / 800;
const OFFSET_X = -15; // center
const OFFSET_Z = -10; // center

function to3D(item: StageItem): [number, number, number] {
  return [
    item.x * SCALE_X + OFFSET_X,
    0,
    item.y * SCALE_Z + OFFSET_Z,
  ];
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

// ═══════════════════════════════════════════════════
//  EXISTING 3D MODELS
// ═══════════════════════════════════════════════════

function StageModel({ item }: { item: StageItem }) {
  const pos = to3D(item);
  return (
    <group position={[pos[0], 0.25, pos[2]]} rotation={[0, -toRadians(item.rotation), 0]}>
      {/* Main stage platform */}
      <Box args={[3, 0.5, 2]} castShadow receiveShadow>
        <meshStandardMaterial color="#5c4033" roughness={0.6} metalness={0.2} />
      </Box>
      {/* Stage trim / gold strip */}
      <Box args={[3.1, 0.06, 2.1]} position={[0, 0.28, 0]}>
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.8} />
      </Box>
      {/* Backdrop panel */}
      <Box args={[3, 2, 0.1]} position={[0, 1.25, -0.95]} castShadow>
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.4} />
      </Box>
      {/* LED screen */}
      <Box args={[2.4, 1.3, 0.08]} position={[0, 1.35, -0.89]}>
        <meshBasicMaterial color="#00d4ff" />
      </Box>
    </group>
  );
}

function TableRoundModel({ item }: { item: StageItem }) {
  const pos = to3D(item);
  const chairCount = 10;

  return (
    <group position={[pos[0], 0, pos[2]]} rotation={[0, -toRadians(item.rotation), 0]}>
      {/* Table top (white tablecloth) */}
      <Cylinder args={[1, 1, 0.08, 32]} position={[0, 0.8, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#f8fafc" roughness={0.5} metalness={0.05} />
      </Cylinder>
      {/* Table leg */}
      <Cylinder args={[0.08, 0.08, 0.8, 16]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.9} />
      </Cylinder>
      {/* Centerpiece */}
      <Cylinder args={[0.12, 0.08, 0.3, 8]} position={[0, 0.99, 0]}>
        <meshStandardMaterial color="#f472b6" roughness={0.5} />
      </Cylinder>
      {/* Chairs */}
      {Array.from({ length: chairCount }).map((_, i) => {
        const angle = (i / chairCount) * Math.PI * 2;
        const cx = Math.cos(angle) * 1.35;
        const cz = Math.sin(angle) * 1.35;
        return (
          <group key={i} position={[cx, 0, cz]} rotation={[0, -angle + Math.PI, 0]}>
            <Box args={[0.28, 0.04, 0.28]} position={[0, 0.45, 0]} castShadow>
              <meshStandardMaterial color="#e2e8f0" roughness={0.5} metalness={0.1} />
            </Box>
            <Box args={[0.28, 0.35, 0.04]} position={[0, 0.64, -0.12]} castShadow>
              <meshStandardMaterial color="#cbd5e1" roughness={0.5} metalness={0.1} />
            </Box>
            {[[-0.1, 0, -0.1], [0.1, 0, -0.1], [-0.1, 0, 0.1], [0.1, 0, 0.1]].map(
              ([lx, , lz], li) => (
                <Cylinder key={li} args={[0.015, 0.015, 0.45, 6]} position={[lx, 0.225, lz]}>
                  <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.7} />
                </Cylinder>
              )
            )}
          </group>
        );
      })}
    </group>
  );
}

function TableRectModel({ item }: { item: StageItem }) {
  const pos = to3D(item);
  return (
    <group position={[pos[0], 0, pos[2]]} rotation={[0, -toRadians(item.rotation), 0]}>
      <Box args={[2, 0.08, 1]} position={[0, 0.75, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.05} />
      </Box>
      {[[-0.85, 0, -0.4], [0.85, 0, -0.4], [-0.85, 0, 0.4], [0.85, 0, 0.4]].map(
        ([lx, , lz], i) => (
          <Cylinder key={i} args={[0.04, 0.04, 0.75, 8]} position={[lx, 0.375, lz]}>
            <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.8} />
          </Cylinder>
        )
      )}
      {Array.from({ length: 4 }).map((_, i) => {
        const cx = -0.75 + i * 0.5;
        return (
          <group key={`f-${i}`}>
            <group position={[cx, 0, 0.75]}>
              <Box args={[0.28, 0.04, 0.28]} position={[0, 0.45, 0]} castShadow>
                <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
              </Box>
              <Box args={[0.28, 0.3, 0.04]} position={[0, 0.62, 0.12]} castShadow>
                <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
              </Box>
            </group>
            <group position={[cx, 0, -0.75]} rotation={[0, Math.PI, 0]}>
              <Box args={[0.28, 0.04, 0.28]} position={[0, 0.45, 0]} castShadow>
                <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
              </Box>
              <Box args={[0.28, 0.3, 0.04]} position={[0, 0.62, 0.12]} castShadow>
                <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
              </Box>
            </group>
          </group>
        );
      })}
    </group>
  );
}

function FlowerPillarModel({ item }: { item: StageItem }) {
  const pos = to3D(item);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = 1.1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.04;
    }
  });

  return (
    <group position={[pos[0], 0, pos[2]]} rotation={[0, -toRadians(item.rotation), 0]}>
      <Cylinder args={[0.2, 0.25, 0.15, 16]} position={[0, 0.075, 0]} castShadow>
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} metalness={0.3} />
      </Cylinder>
      <Cylinder args={[0.08, 0.08, 1.0, 12]} position={[0, 0.65, 0]} castShadow>
        <meshStandardMaterial color="#d1d5db" roughness={0.3} metalness={0.6} />
      </Cylinder>
      <Cone ref={meshRef} args={[0.3, 0.7, 8]} position={[0, 1.1, 0]} castShadow>
        <meshStandardMaterial color="#f472b6" roughness={0.6} metalness={0.1} />
      </Cone>
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12, 0.15, 32]} />
        <meshBasicMaterial color="#f472b6" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════
//  NEW 3D MODELS
// ═══════════════════════════════════════════════════

// ── Spotlight 3D (đèn chiếu sáng trên trụ) ──
function SpotlightModel({ item }: { item: StageItem }) {
  const pos = to3D(item);

  return (
    <group position={[pos[0], 0, pos[2]]} rotation={[0, -toRadians(item.rotation), 0]}>
      {/* Tripod base */}
      <Cylinder args={[0.25, 0.3, 0.08, 16]} position={[0, 0.04, 0]} castShadow>
        <meshStandardMaterial color="#333" roughness={0.4} metalness={0.8} />
      </Cylinder>
      {/* Pole */}
      <Cylinder args={[0.04, 0.04, 2.5, 8]} position={[0, 1.29, 0]} castShadow>
        <meshStandardMaterial color="#444" roughness={0.3} metalness={0.9} />
      </Cylinder>
      {/* Lamp housing */}
      <Cylinder args={[0.15, 0.25, 0.35, 16]} position={[0, 2.55, 0.12]} rotation={[0.3, 0, 0]} castShadow>
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.7} />
      </Cylinder>
      {/* Bulb glow */}
      <Sphere args={[0.1, 16, 16]} position={[0, 2.5, 0.25]}>
        <meshBasicMaterial color="#fef08a" />
      </Sphere>
      {/* Light cone (visual) */}
      <Cone args={[0.8, 2, 16, 1, true]} position={[0, 1.4, 0.5]} rotation={[0.3, 0, 0]}>
        <meshBasicMaterial color="#fef9c3" transparent opacity={0.04} side={THREE.DoubleSide} />
      </Cone>
      {/* Actual spotlight for illumination */}
      <spotLight
        position={[0, 2.5, 0.3]}
        target-position={[0, 0, 1.5]}
        angle={0.4}
        penumbra={0.6}
        intensity={1.5}
        color="#fef3c7"
        distance={8}
        castShadow={false}
      />
    </group>
  );
}

// ── Disco Light 3D (đèn nháy xoay) ──
function DiscoLightModel({ item }: { item: StageItem }) {
  const pos = to3D(item);
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Rotating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 1.5;
    }
    if (glowRef.current) {
      const t = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + t * 0.2;
    }
  });

  const lightColors = ['#a78bfa', '#fb7185', '#34d399', '#38bdf8', '#fbbf24', '#f472b6'];

  return (
    <group position={[pos[0], 0, pos[2]]} rotation={[0, -toRadians(item.rotation), 0]}>
      {/* Mounting rod */}
      <Cylinder args={[0.03, 0.03, 3, 8]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#444" roughness={0.3} metalness={0.8} />
      </Cylinder>
      {/* Disco ball body */}
      <Sphere args={[0.25, 16, 16]} position={[0, 2.8, 0]} castShadow>
        <meshStandardMaterial color="#e2e8f0" roughness={0.1} metalness={0.95} />
      </Sphere>
      {/* Outer glow sphere */}
      <Sphere ref={glowRef} args={[0.4, 16, 16]} position={[0, 2.8, 0]}>
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.15} side={THREE.BackSide} />
      </Sphere>
      {/* Rotating light beams */}
      <group ref={groupRef} position={[0, 2.8, 0]}>
        {lightColors.map((color, i) => {
          const angle = (i / lightColors.length) * Math.PI * 2;
          return (
            <pointLight
              key={i}
              position={[Math.cos(angle) * 0.5, -0.2, Math.sin(angle) * 0.5]}
              color={color}
              intensity={0.6}
              distance={4}
            />
          );
        })}
      </group>
    </group>
  );
}

// ── Curtain 3D (rèm nhung sân khấu) ──
function CurtainModel({ item }: { item: StageItem }) {
  const pos = to3D(item);

  return (
    <group position={[pos[0], 0, pos[2]]} rotation={[0, -toRadians(item.rotation), 0]}>
      {/* Curtain rod (top) */}
      <Cylinder args={[0.04, 0.04, 0.6, 8]} position={[0, 2.95, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#d4a017" roughness={0.3} metalness={0.8} />
      </Cylinder>
      {/* Rod end caps */}
      <Sphere args={[0.06, 8, 8]} position={[-0.3, 2.95, 0]}>
        <meshStandardMaterial color="#d4a017" roughness={0.3} metalness={0.8} />
      </Sphere>
      <Sphere args={[0.06, 8, 8]} position={[0.3, 2.95, 0]}>
        <meshStandardMaterial color="#d4a017" roughness={0.3} metalness={0.8} />
      </Sphere>
      {/* Main curtain fabric — left drape */}
      <Box args={[0.25, 2.8, 0.06]} position={[-0.15, 1.5, 0]} castShadow>
        <meshStandardMaterial color="#991b1b" roughness={0.8} metalness={0.05} />
      </Box>
      {/* Right drape */}
      <Box args={[0.25, 2.8, 0.06]} position={[0.15, 1.5, 0]} castShadow>
        <meshStandardMaterial color="#7f1d1d" roughness={0.8} metalness={0.05} />
      </Box>
      {/* Gold tie-back (left) */}
      <Cylinder args={[0.02, 0.02, 0.15, 8]} position={[-0.28, 1.8, 0.04]} rotation={[0, 0, 0.4]}>
        <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.7} />
      </Cylinder>
      {/* Gold tie-back (right) */}
      <Cylinder args={[0.02, 0.02, 0.15, 8]} position={[0.28, 1.8, 0.04]} rotation={[0, 0, -0.4]}>
        <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.7} />
      </Cylinder>
    </group>
  );
}

// ── Flower Arch 3D (cổng hoa vòm) ──
function FlowerArchModel({ item }: { item: StageItem }) {
  const pos = to3D(item);

  // Generate small flower buds along the arch
  const buds: React.ReactElement[] = [];
  const budColors = ['#f9a8d4', '#f472b6', '#fb7185', '#fda4af', '#e879f9', '#fbcfe8'];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 11) * Math.PI; // semicircle
    const r = 1.1;
    const bx = Math.cos(angle) * r;
    const by = Math.sin(angle) * r + 1.8;
    buds.push(
      <Sphere key={`bud-${i}`} args={[0.08, 8, 8]} position={[bx, by, 0]}>
        <meshStandardMaterial color={budColors[i % budColors.length]} roughness={0.6} />
      </Sphere>
    );
  }

  return (
    <group position={[pos[0], 0, pos[2]]} rotation={[0, -toRadians(item.rotation), 0]}>
      {/* Left pillar */}
      <Box args={[0.15, 2, 0.15]} position={[-1.1, 1, 0]} castShadow>
        <meshStandardMaterial color="#d1d5db" roughness={0.4} metalness={0.3} />
      </Box>
      {/* Right pillar */}
      <Box args={[0.15, 2, 0.15]} position={[1.1, 1, 0]} castShadow>
        <meshStandardMaterial color="#d1d5db" roughness={0.4} metalness={0.3} />
      </Box>
      {/* Arch top — torus arc */}
      <mesh position={[0, 1.8, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1.1, 0.08, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Vine wrap on arch — slightly larger torus */}
      <mesh position={[0, 1.8, 0]} rotation={[Math.PI / 2, 0, 0.1]}>
        <torusGeometry args={[1.12, 0.04, 6, 24, Math.PI]} />
        <meshStandardMaterial color="#4ade80" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Flower buds */}
      {buds}
      {/* Pillar base blocks */}
      <Box args={[0.25, 0.1, 0.25]} position={[-1.1, 0.05, 0]} castShadow>
        <meshStandardMaterial color="#e5e7eb" roughness={0.5} />
      </Box>
      <Box args={[0.25, 0.1, 0.25]} position={[1.1, 0.05, 0]} castShadow>
        <meshStandardMaterial color="#e5e7eb" roughness={0.5} />
      </Box>
    </group>
  );
}

// ─── Render dispatcher ───
function Render3DItem({ item }: { item: StageItem }) {
  switch (item.type) {
    case 'stage':
      return <StageModel item={item} />;
    case 'table_round':
      return <TableRoundModel item={item} />;
    case 'table_rect':
      return <TableRectModel item={item} />;
    case 'flower':
      return <FlowerPillarModel item={item} />;
    case 'spotlight':
      return <SpotlightModel item={item} />;
    case 'disco_light':
      return <DiscoLightModel item={item} />;
    case 'curtain':
      return <CurtainModel item={item} />;
    case 'flower_arch':
      return <FlowerArchModel item={item} />;
    default:
      return null;
  }
}

// ─── Full Scene ───
function Scene() {
  const { items } = useStageBuilderStore();

  return (
    <>
      {/* Ambient fill */}
      <ambientLight intensity={0.35} color="#c7d2fe" />

      {/* Key light – warm spotlight from above */}
      <spotLight
        position={[0, 12, 5]}
        angle={0.5}
        penumbra={0.8}
        intensity={2.5}
        color="#fef3c7"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Fill light – cool blue from side */}
      <directionalLight position={[-8, 6, -4]} intensity={0.6} color="#93c5fd" />

      {/* Rim light – cyan accent */}
      <pointLight position={[6, 3, 6]} intensity={0.8} color="#00d4ff" distance={20} />

      {/* Reflective floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[40, 30]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={0.8}
          mixStrength={0.6}
          roughness={0.85}
          depthScale={0.8}
          color="#0f172a"
          metalness={0.3}
          mirror={0.15}
        />
      </mesh>

      {/* Grid helper (subtle) */}
      <gridHelper args={[30, 30, '#1e293b', '#1e293b']} position={[0, 0.001, 0]} />

      {/* Contact shadows for grounding */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.35}
        scale={30}
        blur={2}
        far={8}
        color="#000000"
      />

      {/* Render all items */}
      {items.map((item) => (
        <Render3DItem key={item.id} item={item} />
      ))}
    </>
  );
}

// ─── Main 3D Viewer Export ───
export default function ThreeDViewer() {
  return (
    <div className="flex-1 relative overflow-hidden rounded-2xl border border-white/5 bg-[#080d1a]">
      {/* 3D hint overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-white/40 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5 pointer-events-none">
        <Compass className="w-3.5 h-3.5 animate-pulse" />
        <span className="text-[10px] font-medium uppercase tracking-widest">Kéo để xoay 360°</span>
      </div>

      <Canvas
        shadows
        camera={{ position: [10, 8, 14], fov: 45 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        style={{ background: '#080d1a' }}
      >
        <Suspense fallback={<Loader3D />}>
          <Scene />
          <Environment preset="city" />
          <OrbitControls
            enablePan={true}
            maxPolarAngle={Math.PI / 2 - 0.05}
            minDistance={3}
            maxDistance={35}
            autoRotate
            autoRotateSpeed={0.3}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
