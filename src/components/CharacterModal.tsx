import { motion, AnimatePresence } from "motion/react";
import { Character } from "../data/characters";
import { X, Clock, Quote, Link as LinkIcon, Sparkles, Globe, CloudRain, Wind } from "lucide-react";
import { cn } from "../lib/utils";

interface CharacterModalProps {
  character: Character | null;
  onClose: () => void;
  onQuoteClick?: (quote: string) => void;
  onOpenEarth?: () => void;
  onOpenRain?: () => void;
  onOpenAscension?: () => void;
}

export function CharacterModal({ character, onClose, onQuoteClick, onOpenEarth, onOpenRain, onOpenAscension }: CharacterModalProps) {
  return (
    <AnimatePresence>
      {character && (
        <>
          <motion.div
            className="fixed inset-0 bg-[#050510]/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 right-0 bottom-0 w-full md:w-[480px] bg-[#13111c] border-l border-[#fbbf24]/20 p-8 overflow-y-auto z-50 shadow-[0_0_50px_rgba(251,191,36,0.1)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-[#fef08a]/50 hover:text-[#fbbf24] transition-colors rounded-full hover:bg-[#fbbf24]/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mt-8 relative z-10">
              <span className="font-sans text-xs tracking-widest uppercase text-[#fbbf24]/70 mb-2 block font-bold">
                第 {character.generation} 代
              </span>
              <h2 className="font-serif text-4xl text-[#fbbf24] mb-8 leading-tight font-bold drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                {character.name}
              </h2>

              <div className="space-y-8">
                <section>
                  <h3 className="font-sans text-xs tracking-widest uppercase text-[#fef08a]/70 mb-3 font-bold">
                    人物生平
                  </h3>
                  <p className="font-serif text-base text-white leading-relaxed">
                    {character.description}
                  </p>
                </section>

                {character.relationshipsText && (
                  <section>
                    <h3 className="font-sans text-xs tracking-widest uppercase text-[#fef08a]/70 mb-3 flex items-center gap-2 font-bold">
                      <LinkIcon className="w-4 h-4" />
                      关系梳理
                    </h3>
                    <div className="flex flex-col gap-3 bg-[#1b1b3a]/50 border border-[#fbbf24]/20 p-5 rounded-xl shadow-inner">
                      {character.relationshipsText.split('；').filter(Boolean).map((rel, idx) => {
                        const [role, name] = rel.split('：');
                        if (!name) return <span key={idx} className="font-serif text-base text-white/90">{rel}</span>;
                        return (
                          <div key={idx} className="flex items-start gap-3 font-serif text-base">
                            <span className="text-[#fbbf24] min-w-[70px] font-bold">{role}</span>
                            <span className="text-white/90">{name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                <section>
                  <h3 className="font-sans text-xs tracking-widest uppercase text-[#fef08a]/70 mb-3 font-bold">
                    性格特质
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {character.traits.map((trait, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-xs font-sans text-[#fbbf24] border border-[#fbbf24]/30 rounded-full bg-[#fbbf24]/10 font-medium shadow-[0_0_10px_rgba(251,191,36,0.1)]"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </section>

                <section className="bg-[#1b1b3a]/50 border border-[#fbbf24]/20 rounded-xl p-5 relative overflow-hidden shadow-inner">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Clock className="w-24 h-24 text-[#fbbf24]" />
                  </div>
                  <h3 className="font-sans text-xs tracking-widest uppercase text-[#fbbf24] mb-3 relative z-10 font-bold">
                    孤独的维度
                  </h3>
                  <p className="font-serif text-lg text-white font-bold mb-4 relative z-10">
                    {character.solitudeType}
                  </p>
                  <h3 className="font-sans text-xs tracking-widest uppercase text-[#fbbf24] mb-3 relative z-10 mt-6 font-bold">
                    命运轮回
                  </h3>
                  <p className="font-serif text-lg text-white/90 italic mb-4 relative z-10">
                    {character.cyclicalTheme}
                  </p>
                  <div className="relative z-10 border-t border-[#fbbf24]/20 pt-4 mt-4">
                    <span className="font-sans text-[10px] tracking-widest uppercase text-[#fef08a]/70 block mb-1 font-bold">
                      最终宿命
                    </span>
                    <p className="font-serif text-base text-white/80">
                      {character.fate}
                    </p>
                  </div>
                </section>

                {character.quote && (
                  <section className="pt-6 mt-6 border-t border-[#fbbf24]/10">
                    <h3 className="font-sans text-xs tracking-widest uppercase text-[#fef08a]/70 mb-4 flex items-center gap-2 font-bold">
                      <Quote className="w-4 h-4" />
                      好句摘抄
                    </h3>
                    <div 
                      className={cn(
                        "relative p-5 border border-[#fbbf24]/30 rounded-xl bg-[#1b1b3a]/30 transition-all duration-300",
                        onQuoteClick && character.id === "aureliano-buendia" ? "cursor-pointer hover:bg-[#fbbf24]/10 hover:border-[#fbbf24]/50 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] group" : ""
                      )}
                      onClick={() => onQuoteClick && onQuoteClick(character.quote!)}
                    >
                      <p className="font-serif text-lg italic text-white/90 leading-relaxed font-medium">
                        "{character.quote}"
                      </p>
                      {onQuoteClick && character.id === "aureliano-buendia" && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Sparkles className="w-4 h-4 text-[#fbbf24] animate-pulse" />
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {character.id === "jose-arcadio-buendia" && onOpenEarth && (
                  <section className="pt-6 mt-6 border-t border-[#fbbf24]/10">
                    <button
                      onClick={onOpenEarth}
                      className="w-full py-4 bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-xl text-[#fbbf24] font-serif text-lg hover:bg-[#fbbf24]/20 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(251,191,36,0.15)] flex items-center justify-center gap-3"
                    >
                      <Globe className="w-5 h-5" />
                      进入全息橘子地球
                    </button>
                  </section>
                )}
                {character.id === "gerineldo-marquez" && onOpenRain && (
                  <section className="pt-6 mt-6 border-t border-[#60a5fa]/10">
                    <button
                      onClick={onOpenRain}
                      className="w-full py-4 bg-[#60a5fa]/10 border border-[#60a5fa]/30 rounded-xl text-[#60a5fa] font-serif text-lg hover:bg-[#60a5fa]/20 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(96,165,250,0.15)] flex items-center justify-center gap-3"
                    >
                      <CloudRain className="w-5 h-5" />
                      进入马孔多的雨季
                    </button>
                  </section>
                )}
                {character.id === "remedios-the-beauty" && onOpenAscension && (
                  <section className="pt-6 mt-6 border-t border-[#fef08a]/10">
                    <button
                      onClick={onOpenAscension}
                      className="w-full py-4 bg-[#fef08a]/10 border border-[#fef08a]/30 rounded-xl text-[#fef08a] font-serif text-lg hover:bg-[#fef08a]/20 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(254,240,138,0.15)] flex items-center justify-center gap-3"
                    >
                      <Wind className="w-5 h-5" />
                      观看升天的床单
                    </button>
                  </section>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
