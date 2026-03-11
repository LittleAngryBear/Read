import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

function AscensionParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const particlesCount = 40000; // High density for a smooth cloth-like feel

  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    const width = 200;
    const height = 200;
    let idx = 0;
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        // Create a dense, small horizontal grid
        pos[idx++] = (i / width - 0.5) * 8;  // X spread (width)
        pos[idx++] = 0;                      // Y (will be animated)
        pos[idx++] = (j / height - 0.5) * 6; // Z spread (depth)
      }
    }
    return pos;
  }, [particlesCount]);

  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 }
    },
    vertexShader: `
      uniform float uTime;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        
        // Wavy effect on Y axis (flapping sheet)
        float wave1 = sin(p.x * 1.5 + uTime * 1.2) * 0.4;
        float wave2 = cos(p.z * 1.5 + uTime * 0.9) * 0.4;
        float wave3 = sin((p.x + p.z) * 1.0 - uTime * 0.7) * 0.3;
        
        // Base Y movement (slowly ascending)
        // Loop it from -8 to +8 so it stays in view
        float baseY = mod(uTime * 0.8 + 8.0, 16.0) - 8.0;
        
        p.y += baseY + wave1 + wave2 + wave3;
        
        // Non-linear drift (不要直线上升)
        // The entire sheet drifts left and right as it ascends
        p.x += sin(baseY * 0.3 + uTime * 0.5) * 1.5;
        p.z += cos(baseY * 0.2 + uTime * 0.4) * 1.0;
        
        // Fade out at top (随光芒而去) and bottom (spawning)
        float fadeTop = smoothstep(6.0, 2.0, p.y);
        float fadeBottom = smoothstep(-6.0, -2.0, p.y);
        vAlpha = fadeTop * fadeBottom;
        
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        
        // Small particles
        gl_PointSize = 2.0 * (10.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      void main() {
        // Make particles circular
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        
        // Ethereal glowing white/gold (仙气)
        gl_FragColor = vec4(1.0, 0.98, 0.9, vAlpha * (0.5 - dist) * 2.0);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }), []);

  useFrame((state) => {
    if (pointsRef.current) {
      (pointsRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
      // Slow camera pan/rotate to enhance the 3D floating feel
      pointsRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
      pointsRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.15) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial args={[shaderArgs]} />
    </points>
  );
}

interface StandaloneAscensionViewProps {
  onClose: () => void;
}

export function StandaloneAscensionView({ onClose }: StandaloneAscensionViewProps) {
  return (
    <motion.div 
      className="fixed inset-0 z-[60] bg-[#05050a] flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    >
      {/* The Light at the top (随光芒而去) */}
      <div className="absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-[#fef08a]/20 via-[#fef08a]/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-[#fef08a]/10 rounded-full blur-[100px] pointer-events-none" />

      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-10 p-3 text-[#fef08a]/50 hover:text-[#fef08a] transition-all rounded-full hover:bg-[#fef08a]/10 border border-transparent hover:border-[#fef08a]/30"
      >
        <X className="w-8 h-8" />
      </button>
      
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center w-full px-4">
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 2.5 }}
          className="font-serif text-base md:text-lg text-[#fef08a] tracking-widest leading-relaxed drop-shadow-[0_0_15px_rgba(254,240,138,0.5)]"
        >
          “她连同那些床单一起冉冉升起，消失在连飞得最高的老鹰也无法企及的高空。”
        </motion.p>
      </div>

      <div className="flex-1 w-full h-full">
        <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
          <Suspense fallback={null}>
            <AscensionParticles />
          </Suspense>
        </Canvas>
      </div>
    </motion.div>
  );
}
