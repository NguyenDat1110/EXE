import { useState, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, useProgress, Environment, Box, Cylinder, Sphere } from '@react-three/drei';
import { X, Share2, Bookmark, Compass, Loader2 } from 'lucide-react';
import * as THREE from 'three';

const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4 text-primary">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="font-mono text-sm">{progress.toFixed(0)}%</span>
      </div>
    </Html>
  );
};

const Hotspot = ({ position, label, description }: { position: [number, number, number], label: string, description: string }) => {
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <group position={position}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setOpen(!open)}
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={hovered ? '#00d4ff' : '#ffffff'} transparent opacity={0.8} />
      </mesh>
      
      {/* Pulsing ring */}
      <mesh>
        <ringGeometry args={[0.25, 0.3, 32]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      <Html position={[0, 0.5, 0]} center zIndexRange={[100, 0]}>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="glass-card p-4 rounded-xl w-48 pointer-events-auto border-primary/30"
            >
              <h4 className="text-primary font-bold text-sm mb-1">{label}</h4>
              <p className="text-slate-300 text-xs leading-relaxed">{description}</p>
              <button 
                onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                className="absolute top-2 right-2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Html>
    </group>
  );
};

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#00d4ff" />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#ffaa00" />
      
      {/* Room/Stage bounds */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a2535" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Backdrop */}
      <Box args={[12, 6, 0.5]} position={[0, 1, -5]}>
        <meshStandardMaterial color="#0a0f1e" roughness={0.5} metalness={0.8} />
      </Box>

      {/* LED Screen */}
      <Box args={[8, 4, 0.6]} position={[0, 1.5, -4.8]}>
        <meshBasicMaterial color="#00d4ff" />
      </Box>

      {/* Podium */}
      <Cylinder args={[0.5, 0.5, 1.2, 32]} position={[0, -1.4, -2]}>
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.8} />
      </Cylinder>

      {/* Tables */}
      {[-3, 3].map((x, i) => (
        <group key={i} position={[x, -1.5, 2]}>
          <Cylinder args={[1.5, 1.5, 0.1, 32]} position={[0, 0.5, 0]}>
            <meshStandardMaterial color="#2a3545" />
          </Cylinder>
          <Cylinder args={[0.1, 0.1, 1, 16]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#ffffff" metalness={0.9} />
          </Cylinder>
        </group>
      ))}

      {/* Hotspots */}
      <Hotspot position={[0, 2, -4.5]} label="Màn hình LED Matrix" description="Màn hình LED cong P3.0 độ phân giải 4K, hiển thị visual tương tác." />
      <Hotspot position={[0, -0.5, -2]} label="Bục Phát Biểu Acrylic" description="Thiết kế trong suốt tích hợp đèn LED viền cyan." />
      <Hotspot position={[-3, -0.5, 2]} label="Bàn Tiệc VIP" description="Setup bàn tiệc tròn 10 người với hoa tươi nhập khẩu." />
    </>
  );
};

const CameraController = ({ targetPosition }: { targetPosition: [number, number, number] }) => {
  const controls = useRef<any>(null);
  
  useFrame(() => {
    if (controls.current) {
      // Smoothly interpolate camera position
      controls.current.object.position.lerp(new THREE.Vector3(...targetPosition), 0.05);
      controls.current.update();
    }
  });

  return <OrbitControls ref={controls} enablePan={false} maxPolarAngle={Math.PI / 2 - 0.1} minDistance={2} maxDistance={15} />;
};

export default function StageViewer360({ onClose, navigate, vendorId }: { onClose: () => void, navigate: (page: string, params?: any) => void, vendorId: any }) {
  const [cameraPos, setCameraPos] = useState<[number, number, number]>([0, 2, 8]);

  const presets = [
    { label: 'Chính Diện', pos: [0, 2, 8] as [number, number, number] },
    { label: 'Góc Khách', pos: [-5, 1.5, 5] as [number, number, number] },
    { label: 'Bên Trái', pos: [-6, 2, 0] as [number, number, number] },
    { label: 'Bên Phải', pos: [6, 2, 0] as [number, number, number] },
    { label: 'Từ Trên', pos: [0, 8, 2] as [number, number, number] },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 lg:p-8"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-7xl h-[85vh] glass-card rounded-3xl overflow-hidden flex flex-col"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 lg:px-6 border-b border-white/10 bg-background-dark/50 backdrop-blur-md z-10">
          <div>
            <h3 className="text-lg font-serif text-white">Lumina Events</h3>
            <p className="text-sm text-primary font-medium">Gói Siêu Cấp (Luxury)</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg glass-card text-sm font-medium hover:bg-white/10 transition-colors">
              <Share2 className="w-4 h-4" /> Chia sẻ
            </button>
            <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg glass-card text-sm font-medium hover:bg-white/10 transition-colors">
              <Bookmark className="w-4 h-4" /> Lưu
            </button>
            <button 
              onClick={() => {
                onClose();
                navigate('booking', { vendorId, packageId: 3 }); // Assuming packageId 3 for "Gói Siêu Cấp"
              }} 
              className="px-6 py-2 bg-primary text-background-dark rounded-lg text-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all cyan-glow"
            >
              Đặt Gói Này
            </button>
            <div className="w-px h-8 bg-white/20 mx-2" />
            <button onClick={onClose} className="p-2 rounded-full glass-card hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Area */}
        <div className="flex-1 relative cursor-grab active:cursor-grabbing">
          <Canvas shadows camera={{ position: [0, 2, 8], fov: 50 }}>
            <Suspense fallback={<Loader />}>
              <Scene />
              <Environment preset="city" />
              <CameraController targetPosition={cameraPos} />
            </Suspense>
          </Canvas>

          {/* UI Overlay */}
          <div className="absolute top-6 left-6 pointer-events-none flex items-center gap-2 text-white/50 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
            <Compass className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-widest">Kéo để xoay 360°</span>
          </div>
        </div>

        {/* Bottom Presets */}
        <div className="p-4 lg:px-6 border-t border-white/10 bg-background-dark/50 backdrop-blur-md z-10 overflow-x-auto">
          <div className="flex items-center justify-center gap-3 min-w-max">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setCameraPos(preset.pos)}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                  cameraPos === preset.pos 
                    ? 'bg-primary/20 text-primary border border-primary/50 cyan-glow' 
                    : 'glass-card text-slate-300 hover:bg-white/10'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
