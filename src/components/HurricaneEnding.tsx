import { motion } from "motion/react";
import { useEffect } from "react";

export function HurricaneEnding() {
  useEffect(() => {
    // Disable scrolling and interaction
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[#0a0a09] flex flex-col items-center justify-center text-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 5, ease: "easeIn" }}
    >
      {/* Hurricane visual effect using CSS animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vh] animate-spin-slow" style={{ animationDuration: '3s' }}>
          <div className="w-full h-full bg-[radial-gradient(circle,transparent_10%,#0a0a09_70%)]" />
          {/* Add some noise/dust */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay" />
        </div>
      </div>

      <motion.div
        className="relative z-10 max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 4, duration: 2 }}
      >
        <p className="font-serif text-xl md:text-2xl text-[#e8e4d9]/80 leading-relaxed mb-12 italic">
          “羊皮卷上所写的一切自始至终、永远不会重复，因为注定经受百年孤独的家族不会有第二次机会在大地上出现。”
        </p>
        
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 border border-[#c6a87c]/30 rounded-full text-[#c6a87c] font-sans text-xs tracking-widest uppercase hover:bg-[#c6a87c]/10 transition-colors"
        >
          重新开始
        </button>
      </motion.div>
    </motion.div>
  );
}
