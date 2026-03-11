import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

function EarthParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  // Using a reliable water/land mask texture (water is white, land is black)
  const texture = useTexture('https://unpkg.com/three-globe/example/img/earth-water.png');
  
  const particlesCount = 40000; // High density for small particles
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particlesCount);
      const theta = Math.sqrt(particlesCount * Math.PI) * phi;
      const r = 2.5; // Radius
      
      pos[i * 3] = r * Math.cos(theta) * Math.sin(phi);
      pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [particlesCount]);

  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTexture: { value: texture },
      uTime: { value: 0 }
    },
    vertexShader: `
      uniform sampler2D uTexture;
      uniform float uTime;
      varying vec3 vColor;
      
      void main() {
        vec3 normalizedPos = normalize(position);
        
        // Calculate UV coordinates for equirectangular projection
        float u = 0.5 + atan(normalizedPos.z, normalizedPos.x) / (2.0 * 3.14159265);
        float v = 0.5 - asin(normalizedPos.y) / 3.14159265;
        
        vec4 texColor = texture2D(uTexture, vec2(u, v));
        
        // In this texture, water is white (>0.5), land is black (<0.5)
        bool isLand = texColor.r < 0.5;
        
        if (isLand) {
          vColor = vec3(0.13, 0.85, 0.36); // Bright Green for continents
        } else {
          // Add some noise/variation to the orange ocean
          float noise = fract(sin(dot(normalizedPos.xy, vec2(12.9898, 78.233))) * 43758.5453);
          if (noise > 0.5) {
            vColor = vec3(0.98, 0.45, 0.06); // Orange
          } else {
            vColor = vec3(0.91, 0.34, 0.04); // Darker Orange
          }
        }
        
        // Add slight bump to land
        vec3 finalPos = position;
        if (isLand) {
          finalPos += normalizedPos * 0.03;
        }
        
        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
        
        // Smaller particles
        gl_PointSize = (isLand ? 2.5 : 1.5) * (10.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        // Make particles circular
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        
        gl_FragColor = vec4(vColor, 0.85);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }), [texture]);

  useFrame((state) => {
    if (pointsRef.current) {
      // Very slow rotation
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02; 
      (pointsRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
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

interface StandaloneEarthViewProps {
  onClose: () => void;
}

export function StandaloneEarthView({ onClose }: StandaloneEarthViewProps) {
  return (
    <motion.div 
      className="fixed inset-0 z-[60] bg-[#020205] flex flex-col"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-10 p-3 text-[#fef08a]/50 hover:text-[#fbbf24] transition-all rounded-full hover:bg-[#fbbf24]/10 border border-transparent hover:border-[#fbbf24]/30"
      >
        <X className="w-8 h-8" />
      </button>
      
      <div className="absolute top-12 left-12 z-10 pointer-events-none">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="font-serif text-4xl md:text-6xl text-[#fbbf24] mb-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"
        >
          橘子地球
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="font-sans text-lg md:text-xl tracking-widest text-[#fef08a]/80 flex items-center gap-3"
        >
          <span className="w-3 h-3 rounded-full bg-[#22c55e] animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
          “地球是圆的，就像个橘子。”
        </motion.p>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="font-sans text-sm text-white/40 mt-6"
        >
          拖拽以 360° 旋转观察
        </motion.p>
      </div>

      <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <Suspense fallback={null}>
            <EarthParticles />
          </Suspense>
          <OrbitControls 
            enableZoom={true} 
            enablePan={false} 
            autoRotate 
            autoRotateSpeed={0.3} // Very slow auto rotation
            maxDistance={12}
            minDistance={4}
          />
        </Canvas>
      </div>
    </motion.div>
  );
}
