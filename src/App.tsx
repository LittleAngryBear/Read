import { useState, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { LandingScreen } from "./components/LandingScreen";
import { FamilyTree } from "./components/FamilyTree";
import { CharacterModal } from "./components/CharacterModal";
import { Atmosphere } from "./components/Atmosphere";
import { Character } from "./data/characters";
import { HurricaneEnding } from "./components/HurricaneEnding";
import { CharacterEffects } from "./components/CharacterEffects";
import { MelquiadesChat } from "./components/MelquiadesChat";
import { TimeSlider } from "./components/TimeSlider";
import { IceShatterEffect } from "./components/IceShatterEffect";
import { BackgroundMusic } from "./components/BackgroundMusic";
import { StandaloneEarthView } from "./components/StandaloneEarthView";
import { StandaloneRainView } from "./components/StandaloneRainView";
import { StandaloneAscensionView } from "./components/StandaloneAscensionView";

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [modalCharacter, setModalCharacter] = useState<Character | null>(null);
  const [currentGeneration, setCurrentGeneration] = useState(1);
  const [showHurricane, setShowHurricane] = useState(false);
  const [activeEffect, setActiveEffect] = useState<'ice-shatter' | null>(null);
  const [showEarthView, setShowEarthView] = useState(false);
  const [showRainView, setShowRainView] = useState(false);
  const [showAscensionView, setShowAscensionView] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSelectCharacter = (char: Character) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set the selected character immediately to trigger the resonance effect
    setSelectedCharacter(char);
    
    // Hide the modal if it's currently open
    setModalCharacter(null);

    // Wait 3 seconds before showing the modal
    timeoutRef.current = setTimeout(() => {
      setModalCharacter(char);
      
      if (char.id === "aureliano-last") {
        // Trigger hurricane ending when the last Aureliano is viewed
        setTimeout(() => {
          setShowHurricane(true);
        }, 5000); // Wait 5 seconds before the hurricane starts
      }
    }, 3000);
  };

  const handleCloseModal = () => {
    setModalCharacter(null);
    setSelectedCharacter(null);
  };

  const handleQuoteClick = (quote: string) => {
    if (quote.includes("冰块")) {
      setActiveEffect('ice-shatter');
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#050510] overflow-hidden">
      <Atmosphere />
      <BackgroundMusic play={hasEntered} />

      <AnimatePresence mode="wait">
        {!hasEntered ? (
          <LandingScreen key="landing" onEnter={() => setHasEntered(true)} />
        ) : (
          <div key="app" className="absolute inset-0 z-10">
            <header className="absolute top-0 left-0 right-0 p-6 z-30 pointer-events-none flex justify-between items-start">
              <div>
                <h1 className="font-serif text-3xl text-[#fbbf24] font-bold tracking-wider mb-1 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                  马孔多
                </h1>
                <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#fef08a] font-semibold opacity-80">
                  布恩迪亚家族图谱
                </p>
              </div>
              <div className="text-right">
                <p className="font-sans text-xs tracking-widest uppercase text-[#fbbf24] bg-[#13111c]/80 px-3 py-1 rounded-full border border-[#fbbf24]/30 backdrop-blur-sm pointer-events-auto shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                  滚动鼠标缩放，拖拽平移画布
                </p>
              </div>
            </header>

            <FamilyTree
              onSelectCharacter={handleSelectCharacter}
              selectedId={selectedCharacter?.id || null}
              currentGeneration={currentGeneration}
            />

            <CharacterEffects character={selectedCharacter} />

            <CharacterModal
              character={modalCharacter}
              onClose={handleCloseModal}
              onQuoteClick={handleQuoteClick}
              onOpenEarth={() => setShowEarthView(true)}
              onOpenRain={() => setShowRainView(true)}
              onOpenAscension={() => setShowAscensionView(true)}
            />

            {/* Time Slider */}
            <div className="absolute bottom-8 left-0 right-0 z-30 px-4">
              <TimeSlider 
                currentGeneration={currentGeneration} 
                onChange={setCurrentGeneration} 
              />
            </div>

            <MelquiadesChat />

            {/* Hurricane Ending */}
            {showHurricane && <HurricaneEnding />}

            {/* Interactive Effects */}
            {activeEffect === 'ice-shatter' && (
              <IceShatterEffect onClose={() => setActiveEffect(null)} />
            )}

            <AnimatePresence>
              {showEarthView && (
                <StandaloneEarthView onClose={() => setShowEarthView(false)} />
              )}
              {showRainView && (
                <StandaloneRainView onClose={() => setShowRainView(false)} />
              )}
              {showAscensionView && (
                <StandaloneAscensionView onClose={() => setShowAscensionView(false)} />
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
