import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

const PARTICLE_COUNT = 12000;

function IceParticles({ shatterState }: { shatterState: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const [timeAfterShatter, setTimeAfterShatter] = useState(0);

  const { positions, velocities, colors, phases } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const phs = new Float32Array(PARTICLE_COUNT);

    const color = new THREE.Color();
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Ice block shape
      const x = (Math.random() - 0.5) * 2;
      const y = (Math.random() - 0.5) * 2;
      const z = (Math.random() - 0.5) * 2;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Outward velocity
      const length = Math.sqrt(x * x + y * y + z * z);
      const speed = Math.random() * 0.2 + 0.05;
      vel[i * 3] = (x / length) * speed;
      vel[i * 3 + 1] = (y / length) * speed;
      vel[i * 3 + 2] = (z / length) * speed;

      // Phase for floating sine wave
      phs[i] = Math.random() * Math.PI * 2;

      // Icy blue
      color.setHSL(0.55 + Math.random() * 0.1, 0.8, 0.8);
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }

    return { positions: pos, velocities: vel, colors: col, phases: phs };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const positionsAttr = pointsRef.current.geometry.attributes.position;
    const colorsAttr = pointsRef.current.geometry.attributes.color;
    
    if (shatterState === 0) {
      // Idle rotation
      pointsRef.current.rotation.y += delta * 0.1;
      pointsRef.current.rotation.x += delta * 0.05;
    } else {
      setTimeAfterShatter((t) => t + delta);
      
      if (shatterState === 1) {
        // 1. Slow cracking phase (2 seconds)
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const i3 = i * 3;
          // Expand very slowly to simulate cracking/pressure building
          positionsAttr.array[i3] += velocities[i3] * 0.015;
          positionsAttr.array[i3 + 1] += velocities[i3 + 1] * 0.015;
          positionsAttr.array[i3 + 2] += velocities[i3 + 2] * 0.015;
        }
        positionsAttr.needsUpdate = true;
        
        // Slightly faster rotation as energy builds
        pointsRef.current.rotation.y += delta * 0.15;
        pointsRef.current.rotation.x += delta * 0.08;
      }

      if (shatterState === 2) {
        // 2. Explosive scatter phase
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const i3 = i * 3;
          
          // Move by velocity
          positionsAttr.array[i3] += velocities[i3];
          positionsAttr.array[i3 + 1] += velocities[i3 + 1];
          positionsAttr.array[i3 + 2] += velocities[i3 + 2];

          // Drag
          velocities[i3] *= 0.94;
          velocities[i3 + 1] *= 0.94;
          velocities[i3 + 2] *= 0.94;

          // Gentle floating drift
          const driftSpeed = 0.002;
          positionsAttr.array[i3] += Math.sin(state.clock.elapsedTime + phases[i]) * driftSpeed;
          positionsAttr.array[i3 + 1] += Math.cos(state.clock.elapsedTime * 0.8 + phases[i]) * driftSpeed;

          // Color transition to twilight
          const scatterTime = timeAfterShatter - 2; // Time since state 2 started
          const progress = Math.min(scatterTime / 3, 1);
          if (progress < 1) {
            const currentColor = new THREE.Color(colorsAttr.array[i3], colorsAttr.array[i3 + 1], colorsAttr.array[i3 + 2]);
            const targetColor = new THREE.Color();
            // Twilight colors: warm orange, soft pink, deep purple
            const hue = Math.random() > 0.5 ? 0.05 + Math.random() * 0.1 : 0.8 + Math.random() * 0.15;
            targetColor.setHSL(hue, 0.9, 0.6 + Math.random() * 0.4);
            
            currentColor.lerp(targetColor, 0.05);
            colorsAttr.array[i3] = currentColor.r;
            colorsAttr.array[i3 + 1] = currentColor.g;
            colorsAttr.array[i3 + 2] = currentColor.b;
          }
        }
        
        positionsAttr.needsUpdate = true;
        colorsAttr.needsUpdate = true;
        
        // Rotation slows down and stops after 5 seconds of scattering
        const scatterTime = timeAfterShatter - 2;
        if (scatterTime < 5) {
          const speedMultiplier = Math.max(0, 1 - (scatterTime / 5));
          pointsRef.current.rotation.y += delta * 0.15 * speedMultiplier;
          pointsRef.current.rotation.x += delta * 0.08 * speedMultiplier;
        }
      }
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} colors={colors}>
      <PointMaterial
        transparent
        vertexColors
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export function IceShatterEffect({ onClose }: { onClose: () => void }) {
  // 0: idle, 1: light burst & crack, 2: scatter
  const [shatterState, setShatterState] = useState(0);

  const handleClick = () => {
    if (shatterState === 0) {
      setShatterState(1); // Trigger light buildup and slow crack
      setTimeout(() => {
        setShatterState(2); // Trigger explosive scatter after 2 seconds
      }, 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-[#050510] flex items-center justify-center overflow-hidden cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 1 } }}
        onClick={handleClick}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-8 right-8 z-50 p-3 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Twilight Glow (Spreading outward) */}
        <motion.div 
          className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] md:w-[120vw] md:h-[120vw] pointer-events-none mix-blend-screen blur-[100px]"
          style={{
            background: 'radial-gradient(circle at center, rgba(255, 160, 60, 0.8) 0%, rgba(220, 80, 120, 0.6) 25%, rgba(100, 60, 180, 0.3) 50%, transparent 70%)'
          }}
          initial={{ opacity: 0, scale: 0.1 }}
          animate={{ 
            opacity: shatterState >= 1 ? 1 : 0, 
            scale: shatterState >= 1 ? (shatterState === 2 ? 1.2 : 1) : 0.1
          }}
          transition={{ 
            opacity: { duration: 2.5, ease: "easeInOut" },
            scale: { duration: 4, ease: "easeOut" }
          }}
        />

        {/* Core Intense Glow */}
        <motion.div
          className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none mix-blend-screen blur-[60px]"
          style={{
            background: 'radial-gradient(circle at center, rgba(255, 220, 150, 1) 0%, rgba(255, 150, 80, 0.8) 40%, transparent 70%)'
          }}
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{ 
            opacity: shatterState >= 1 ? 1 : 0,
            scale: shatterState >= 1 ? (shatterState === 2 ? 2 : 1) : 0.2
          }}
          transition={{ 
            opacity: { duration: 2, ease: "easeInOut" },
            scale: { duration: 3, ease: "easeOut" }
          }}
        />

        <div className="absolute inset-0 z-10 pointer-events-none -translate-y-[5%]">
          <Canvas camera={{ position: [0, 0, 6], fov: 60 }} gl={{ alpha: true }}>
            <ambientLight intensity={0.5} />
            <IceParticles shatterState={shatterState} />
          </Canvas>
        </div>

        <div className="absolute inset-x-0 bottom-12 z-20 flex flex-col items-center justify-center pointer-events-none px-8">
          <motion.p
            className="font-serif text-lg md:text-xl text-white/90 max-w-3xl text-center leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            “多年以后，面对行刑队，奥雷里亚诺·布恩迪亚上校将会回想起父亲带他去见识冰块的那个遥远的下午。”
          </motion.p>
          
          <AnimatePresence>
            {shatterState === 0 && (
              <motion.p
                className="mt-6 font-sans text-xs tracking-widest uppercase text-[#fbbf24] animate-pulse"
                exit={{ opacity: 0 }}
              >
                点击屏幕打碎冰块
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
