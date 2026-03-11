import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

function RainParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const particlesCount = 150000; // High density for the "dense lines" effect

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    const spd = new Float32Array(particlesCount);
    for (let i = 0; i < particlesCount; i++) {
      // Spread particles in a large volume
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      // Randomize speed slightly for each drop
      spd[i] = 0.4 + Math.random() * 0.6; 
    }
    return [pos, spd];
  }, [particlesCount]);

  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 }
    },
    vertexShader: `
      uniform float uTime;
      attribute float aSpeed;
      varying float vAlpha;
      void main() {
        vec3 pos = position;
        
        // Fall downwards slowly. 40 is the height of the volume.
        // Modulo creates the infinite falling loop.
        float y = mod(pos.y - uTime * aSpeed * 6.0 + 20.0, 40.0) - 20.0;
        vec4 mvPosition = modelViewMatrix * vec4(pos.x, y, pos.z, 1.0);
        
        // Particles further away are dimmer to create depth
        vAlpha = smoothstep(-30.0, 10.0, mvPosition.z) * 0.8;
        
        // Small particle size
        gl_PointSize = 4.0 * (10.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      void main() {
        // Center coordinate of the point
        vec2 coord = gl_PointCoord - vec2(0.5);
        
        // Squish the X axis to make the point look like a vertical streak/line
        coord.x *= 6.0; 
        
        float dist = length(coord);
        if (dist > 0.5) discard;
        
        // Soft blueish-white color for rain
        gl_FragColor = vec4(0.6, 0.75, 0.9, vAlpha * (0.5 - dist) * 2.0);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }), []);

  useFrame((state) => {
    if (pointsRef.current) {
      (pointsRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
      // Very slow camera rotation to give a subtle 3D parallax feel
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.03;
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
        <bufferAttribute
          attach="attributes-aSpeed"
          count={speeds.length}
          array={speeds}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial args={[shaderArgs]} />
    </points>
  );
}

interface StandaloneRainViewProps {
  onClose: () => void;
}

export function StandaloneRainView({ onClose }: StandaloneRainViewProps) {
  return (
    <motion.div 
      className="fixed inset-0 z-[60] bg-[#020308] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-10 p-3 text-[#93c5fd]/50 hover:text-[#bfdbfe] transition-all rounded-full hover:bg-[#3b82f6]/10 border border-transparent hover:border-[#3b82f6]/30"
      >
        <X className="w-8 h-8" />
      </button>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none text-center w-full px-4">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 2 }}
          className="font-serif text-3xl md:text-5xl text-[#bfdbfe] tracking-widest leading-relaxed drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        >
          “奥雷里亚诺，马孔多在下雨。”
        </motion.p>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 2 }}
          className="font-sans text-sm md:text-base text-[#93c5fd]/60 mt-8 tracking-[0.3em]"
        >
          一场下了四年十一个月零两天的雨
        </motion.p>
      </div>

      <div className="flex-1 w-full h-full">
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <Suspense fallback={null}>
            <RainParticles />
          </Suspense>
        </Canvas>
      </div>
    </motion.div>
  );
}
