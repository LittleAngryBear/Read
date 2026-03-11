import { motion, AnimatePresence } from "motion/react";
import { Character } from "../data/characters";

interface CharacterEffectsProps {
  character: Character | null;
}

export function CharacterEffects({ character }: CharacterEffectsProps) {
  if (!character) return null;

  return (
    <AnimatePresence>
      {character.id === "remedios-the-beauty" && (
        <motion.div
          key="remedios"
          className="fixed inset-0 pointer-events-none z-[45] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Floating white sheets */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white/10 backdrop-blur-sm rounded-full w-[40vw] h-[20vh] blur-xl mix-blend-screen"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: ["0vh", "-100vh"],
                x: ["0vw", `${(Math.random() - 0.5) * 20}vw`],
                rotate: [0, 90],
                scale: [1, 1.5],
                opacity: [0, 0.4, 0],
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear",
              }}
            />
          ))}
          {/* Sparkling star particles */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_10px_#fff]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: ["0vh", "-100vh"],
                opacity: [0, 1, 0],
                scale: [0, Math.random() * 2, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear",
              }}
            />
          ))}
        </motion.div>
      )}

      {character.id === "rebeca" && (
        <motion.div
          key="rebeca"
          className="fixed inset-0 pointer-events-none z-[45] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Falling dirt particles */}
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={`dirt-${i}`}
              className="absolute w-2 h-2 bg-[#8b4513]/60 rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
              }}
              animate={{
                y: ["0vh", "100vh"],
                rotate: [0, 360],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear",
              }}
            />
          ))}
          
          {/* Shaking effect overlay (subtle) */}
          <motion.div
            className="absolute inset-0 bg-[#8b4513]/5 mix-blend-multiply"
            animate={{
              x: [-2, 2, -2, 2, 0],
              y: [-1, 1, -1, 1, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
