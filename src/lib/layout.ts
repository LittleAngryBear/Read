import { characters, familyTreeEdges } from "../data/characters";

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

export function calculateTreeLayout(): NodePosition[] {
  const positions: Record<string, {x: number, y: number}> = {
    // Gen 1
    "jose-arcadio-buendia": { x: -200, y: 100 },
    "ursula-iguaran": { x: 200, y: 100 },
    "pilar-ternera": { x: -600, y: 100 },
    
    // Gen 2
    "rebeca": { x: -800, y: 350 },
    "jose-arcadio": { x: -400, y: 350 },
    "aureliano-buendia": { x: 0, y: 350 },
    "remedios-moscote": { x: 400, y: 350 },
    "amaranta": { x: 800, y: 350 },
    "pietro-crespi": { x: 1200, y: 350 },
    "gerineldo-marquez": { x: 800, y: 600 },
    
    // Gen 3
    "santa-sofia-de-la-piedad": { x: -800, y: 600 },
    "arcadio": { x: -400, y: 600 },
    "aureliano-jose": { x: 0, y: 600 },
    "seventeen-aurelianitos": { x: 400, y: 600 },
    
    // Gen 4
    "remedios-the-beauty": { x: -800, y: 850 },
    "jose-arcadio-segundo": { x: -400, y: 850 },
    "aureliano-segundo": { x: 0, y: 850 },
    "fernanda-del-carpio": { x: 400, y: 850 },
    "petra-cotes": { x: -400, y: 1100 },
    
    // Gen 5
    "mauricio-babilonia": { x: -800, y: 1100 },
    "meme": { x: -400, y: 1100 },
    "jose-arcadio-ii": { x: 0, y: 1100 },
    "amaranta-ursula": { x: 400, y: 1100 },
    "gaston": { x: 800, y: 1100 },
    
    // Gen 6
    "aureliano-babilonia": { x: -200, y: 1350 },
    
    // Gen 7
    "aureliano-last": { x: 0, y: 1600 },
  };
  
  return Object.entries(positions).map(([id, pos]) => ({ id, ...pos }));
}
