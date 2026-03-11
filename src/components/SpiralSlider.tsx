import { motion } from "motion/react";

interface SpiralSliderProps {
  currentGeneration: number;
  onChange: (gen: number) => void;
}

export function SpiralSlider({ currentGeneration, onChange }: SpiralSliderProps) {
  // Generate 7 points in a spiral
  const points = Array.from({ length: 7 }).map((_, i) => {
    const angle = i * 1.4; // 1.4 radians per step
    const radius = 25 + i * 18;
    return {
      gen: i + 1,
      x: 150 + radius * Math.cos(angle),
      y: 160 + radius * Math.sin(angle)
    };
  });

  // Generate a smooth path through the points
  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    // Control points for a smooth spiral curve
    const cp1x = prev.x + (pt.x - prev.x) * 0.5 - (pt.y - prev.y) * 0.3;
    const cp1y = prev.y + (pt.y - prev.y) * 0.5 + (pt.x - prev.x) * 0.3;
    return `${acc} Q ${cp1x} ${cp1y} ${pt.x} ${pt.y}`;
  }, "");

  return (
    <div className="relative w-[300px] h-[300px] bg-[#0b0f19]/80 backdrop-blur-md rounded-full border border-[#fbbf24]/20 shadow-[0_0_40px_rgba(251,191,36,0.15)] flex items-center justify-center">
      <div className="absolute top-8 text-center w-full">
        <span className="font-serif text-xs tracking-[0.3em] text-[#fbbf24] font-bold drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">宿命轮回</span>
      </div>
      <svg viewBox="0 0 300 300" className="w-full h-full absolute inset-0">
        <path d={pathD} fill="none" stroke="#fbbf24" strokeWidth="2" strokeOpacity="0.3" filter="url(#glow-spiral)" />
        <defs>
          <filter id="glow-spiral" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {points.map((p) => (
          <g key={p.gen} onClick={() => onChange(p.gen)} className="cursor-pointer group">
            <circle 
              cx={p.x} 
              cy={p.y} 
              r={currentGeneration === p.gen ? "14" : "10"} 
              fill={currentGeneration >= p.gen ? "#fbbf24" : "#13111c"} 
              stroke="#fbbf24"
              strokeWidth="2"
              className="transition-all duration-300 group-hover:fill-[#fef08a]"
              filter={currentGeneration === p.gen ? "url(#glow-spiral)" : ""}
            />
            <text 
              x={p.x} 
              y={p.y + 4} 
              textAnchor="middle" 
              fill={currentGeneration >= p.gen ? "#13111c" : "#fbbf24"} 
              fontSize="12" 
              fontWeight="bold"
              className="pointer-events-none transition-colors duration-300 font-sans"
            >
              {p.gen}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
