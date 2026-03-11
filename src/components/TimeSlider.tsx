import { motion } from "motion/react";

interface TimeSliderProps {
  currentGeneration: number;
  onChange: (gen: number) => void;
}

export function TimeSlider({ currentGeneration, onChange }: TimeSliderProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-8 py-4 bg-[#13111c]/90 backdrop-blur-md border border-[#fbbf24]/30 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.15)] flex items-center gap-6">
      <span className="font-serif text-sm tracking-widest uppercase text-[#fbbf24] whitespace-nowrap font-bold">
        第 {currentGeneration} 代
      </span>
      <div className="relative flex-1 h-1.5 bg-[#1b1b3a] rounded-full">
        <div 
          className="absolute top-0 left-0 h-full bg-[#fbbf24] rounded-full transition-all duration-300 shadow-[0_0_10px_#fbbf24]"
          style={{ width: `${((currentGeneration - 1) / 6) * 100}%` }}
        />
        <input 
          type="range" 
          min="1" 
          max="7" 
          value={currentGeneration} 
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {/* Markers */}
        <div className="absolute inset-0 w-full h-full flex justify-between items-center pointer-events-none px-[1px]">
          {[1, 2, 3, 4, 5, 6, 7].map(gen => (
            <div 
              key={gen} 
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${currentGeneration >= gen ? 'bg-[#fbbf24] shadow-[0_0_5px_#fbbf24]' : 'bg-[#1b1b3a]'}`}
            />
          ))}
        </div>
      </div>
      <span className="font-serif text-sm tracking-widest uppercase text-[#fbbf24]/50 whitespace-nowrap font-bold">
        第 7 代
      </span>
    </div>
  );
}
