import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { characters, familyTreeEdges, Character } from "../data/characters";
import { calculateTreeLayout, NodePosition } from "../lib/layout";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { useMemo, useState, useEffect } from "react";

interface FamilyTreeProps {
  onSelectCharacter: (char: Character) => void;
  selectedId: string | null;
  currentGeneration: number;
}

const GenerationCenterer = ({ currentGeneration, positions }: { currentGeneration: number, positions: NodePosition[] }) => {
  const { setTransform } = useControls();
  
  useEffect(() => {
    const genPositions = positions.filter(p => characters[p.id]?.generation === currentGeneration);
    if (genPositions.length === 0) return;

    // Find bounding box to center perfectly
    const minX = Math.min(...genPositions.map(p => p.x));
    const maxX = Math.max(...genPositions.map(p => p.x));
    const minY = Math.min(...genPositions.map(p => p.y));
    const maxY = Math.max(...genPositions.map(p => p.y));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scale = 0.8;
    
    // The nodes are inside a div with left: 2000
    const targetX = 2000 + centerX;
    const targetY = centerY;
    
    const x = (viewportWidth / 2) - (targetX * scale);
    const y = (viewportHeight / 2) - (targetY * scale);
    
    setTransform(x, y, scale, 800, "easeInOutCubic");
  }, [currentGeneration, positions, setTransform]);
  
  return null;
};

export function FamilyTree({ onSelectCharacter, selectedId, currentGeneration }: FamilyTreeProps) {
  const positions = useMemo(() => calculateTreeLayout(), []);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [vibratingBaseName, setVibratingBaseName] = useState<string | null>(null);

  const getPosition = (id: string) =>
    positions.find((p) => p.id === id) || { x: 0, y: 0 };

  // Helper to check if a character is "alive" in the current generation
  const isAlive = (char: Character) => currentGeneration >= char.birthGen && currentGeneration <= char.deathGen;
  const isBorn = (char: Character) => currentGeneration >= char.birthGen;

  // Helper to check if a character shares the same base name as the selected one
  const getBaseName = (name: string) => {
    if (name.includes("奥雷里亚诺")) return "奥雷里亚诺";
    if (name.includes("阿尔卡蒂奥")) return "阿尔卡蒂奥";
    if (name.includes("乌尔苏拉")) return "乌尔苏拉";
    if (name.includes("阿玛兰妲")) return "阿玛兰妲";
    if (name.includes("蕾梅黛丝")) return "蕾梅黛丝";
    return name;
  };

  const selectedChar = selectedId ? characters[selectedId] : null;
  const selectedBaseName = selectedChar ? getBaseName(selectedChar.name) : null;

  // Handle hover vibration effect
  useEffect(() => {
    if (hoveredId) {
      const char = characters[hoveredId];
      if (char) {
        const baseName = getBaseName(char.name);
        if (baseName !== char.name) { // Only vibrate if it's a cyclical name
          setVibratingBaseName(baseName);
          const timer = setTimeout(() => {
            setVibratingBaseName(null);
          }, 3000);
          return () => clearTimeout(timer);
        }
      }
    }
    setVibratingBaseName(null);
  }, [hoveredId]);

  return (
    <div className="w-full h-screen overflow-hidden bg-transparent">
      <TransformWrapper
        minScale={0.2}
        maxScale={2}
        wheel={{ step: 0.1 }}
      >
        <GenerationCenterer currentGeneration={currentGeneration} positions={positions} />
        <TransformComponent
          wrapperClass="!w-full !h-full"
          contentClass="!w-[4000px] !h-[3000px]"
        >
          <div
            className="relative w-full h-full"
            style={{ left: 2000, top: 0 }}
          >
            {/* Edges (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {familyTreeEdges.map((edge, i) => {
                const sourceChar = characters[edge.source];
                const targetChar = characters[edge.target];
                if (!sourceChar || !targetChar) return null;

                // Only show edge if both characters are born
                if (!isBorn(sourceChar) || !isBorn(targetChar)) return null;

                const source = getPosition(edge.source);
                const target = getPosition(edge.target);
                
                const isSpouse = edge.type === "spouse";
                const isTaboo = edge.type === "taboo";
                const isFriend = edge.type === "friend";
                const isDirectLine = isSpouse || isTaboo || isFriend;

                // Connect exactly to the center of the nodes
                const sx = source.x;
                const sy = source.y;
                const tx = target.x;
                const ty = target.y;

                // Path calculation
                const path = isDirectLine
                  ? `M ${sx} ${sy} L ${tx} ${ty}`
                  : `M ${sx} ${sy} L ${sx} ${(sy + ty) / 2} L ${tx} ${(sy + ty) / 2} L ${tx} ${ty}`;

                // Check if this edge connects two highlighted characters
                const isHighlightedEdge = selectedBaseName && 
                  getBaseName(sourceChar.name) === selectedBaseName && 
                  getBaseName(targetChar.name) === selectedBaseName;

                let strokeColor = "#fbbf24"; // default gold
                let strokeWidth = 2;
                let strokeDasharray = "none";
                let opacity = 0.3;

                if (isHighlightedEdge) {
                  strokeColor = "#fef08a"; // bright yellow
                  strokeWidth = 3;
                  opacity = 1;
                } else if (isTaboo) {
                  strokeColor = "#e11d48"; // bright red for taboo
                  strokeWidth = 2;
                  opacity = 0.8;
                } else if (isFriend || isSpouse) {
                  strokeColor = "#fcd34d";
                  strokeWidth = 1.5;
                  strokeDasharray = "5,5";
                  opacity = 0.5;
                }

                return (
                  <motion.path
                    key={`${edge.source}-${edge.target}-${i}`}
                    d={path}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    opacity={opacity}
                    filter="url(#glow)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: i * 0.1 }}
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {positions.map((pos) => {
              const char = characters[pos.id];
              if (!char) return null;
              if (!isBorn(char)) return null;
              
              const isSelected = selectedId === pos.id;
              const charBaseName = getBaseName(char.name);
              const isSameName = selectedBaseName && charBaseName === selectedBaseName;
              const isVibrating = vibratingBaseName && charBaseName === vibratingBaseName;
              const alive = isAlive(char);

              return (
                <motion.div
                  key={pos.id}
                  className={cn(
                    "absolute w-max min-w-[14rem] max-w-[20rem] px-6 py-4 -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-[#13111c]/95 backdrop-blur-md cursor-pointer transition-all duration-500 group shadow-2xl",
                    isSelected
                      ? "border-[#fbbf24] shadow-[0_0_30px_rgba(251,191,36,0.5)] scale-110 z-20"
                      : isSameName 
                        ? "border-[#fbbf24]/60 shadow-[0_0_20px_rgba(251,191,36,0.3)] scale-105 z-15"
                        : "border-[#fbbf24]/20 hover:border-[#fbbf24]/50 hover:scale-105 z-10",
                    !alive && !isSelected && !isSameName && "opacity-40 grayscale"
                  )}
                  style={{ left: pos.x, top: pos.y }}
                  onClick={() => onSelectCharacter(char)}
                  onMouseEnter={() => setHoveredId(pos.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: alive || isSelected || isSameName ? 1 : 0.4, 
                    scale: isSelected ? 1.1 : (isSameName ? 1.05 : 1),
                    x: isVibrating ? ["-50%", "calc(-50% - 4px)", "calc(-50% + 4px)", "-50%"] : "-50%",
                    y: "-50%"
                  }}
                  transition={{ 
                    duration: isVibrating ? 0.15 : 0.5,
                    repeat: isVibrating ? Infinity : 0,
                  }}
                >
                  <div className="flex flex-col items-center text-center">
                    <span className="font-sans text-[10px] tracking-widest uppercase text-[#fbbf24]/70 mb-1">
                      第 {char.generation} 代
                    </span>
                    <h3 className={cn(
                      "font-serif text-lg leading-tight transition-colors",
                      isSameName ? "text-[#fef08a]" : "text-[#fcd34d] group-hover:text-[#fef08a]"
                    )}>
                      {char.name}
                    </h3>

                    {/* Cyclical Fate Indicator */}
                    {(char.name.includes("奥雷里亚诺") ||
                      char.name.includes("阿尔卡蒂奥") ||
                      char.name.includes("乌尔苏拉") ||
                      char.name.includes("阿玛兰妲")) && (
                      <div
                        className="absolute -top-2 -right-2 w-4 h-4 rounded-full border border-[#fbbf24]/50 flex items-center justify-center bg-[#13111c]"
                        title="宿命轮回"
                      >
                        <div className={cn(
                          "w-1 h-1 rounded-full animate-pulse",
                          isSameName ? "bg-[#fef08a] shadow-[0_0_5px_#fef08a]" : "bg-[#fbbf24]"
                        )} />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
