import { motion } from "motion/react";
import { BookOpen } from "lucide-react";

interface LandingScreenProps {
  onEnter: () => void;
  key?: string;
}

export function LandingScreen({ onEnter }: LandingScreenProps) {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050510] text-[#fef08a]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
    >
      <div className="relative flex flex-col items-center max-w-2xl text-center px-6">
        {/* Ouroboros / Cyclical Motif */}
        <motion.div
          className="absolute -top-32 w-64 h-64 border-[1px] border-[#fbbf24]/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -top-24 w-48 h-48 border-[1px] border-[#fbbf24]/10 rounded-full border-dashed"
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />

        <motion.h1
          className="font-serif text-5xl md:text-7xl font-light tracking-wider mb-6 text-[#fbbf24] z-10 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          马孔多
        </motion.h1>

        <motion.p
          className="font-sans text-sm md:text-base tracking-[0.2em] uppercase text-[#fef08a]/70 mb-12 z-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1 }}
        >
          百年孤独
        </motion.p>

        <motion.div
          className="font-serif text-lg md:text-xl italic text-[#fef08a]/70 max-w-lg leading-relaxed mb-16 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 2 }}
        >
          “仿佛时间转了一个圈，我们又回到了起点。”
        </motion.div>

        <motion.button
          onClick={onEnter}
          className="group relative flex items-center gap-3 px-8 py-4 border border-[#fbbf24]/30 rounded-full overflow-hidden transition-colors hover:bg-[#fbbf24]/10 z-10 shadow-[0_0_15px_rgba(251,191,36,0.1)]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 3 }}
        >
          <span className="font-sans text-xs tracking-widest uppercase text-[#fbbf24]">
            进入轮回
          </span>
          <BookOpen className="w-4 h-4 text-[#fbbf24] group-hover:rotate-12 transition-transform" />

          {/* Button glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#fbbf24]/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
        </motion.button>
      </div>
    </motion.div>
  );
}
