import { useState, useEffect } from "react";
import ReactPlayerModule from "react-player";
const ReactPlayer = (ReactPlayerModule as any).default || ReactPlayerModule;
import { Volume2, VolumeX } from "lucide-react";

interface BackgroundMusicProps {
  play: boolean;
}

export function BackgroundMusic({ play }: BackgroundMusicProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (play && !hasStarted) {
      setHasStarted(true);
    }
  }, [play, hasStarted]);

  return (
    <>
      {/* Hidden Player */}
      <div className="hidden">
        {/* @ts-ignore - react-player types can be tricky */}
        <ReactPlayer
          url="https://www.youtube.com/watch?v=1Vko01DcNzo"
          playing={play && hasStarted}
          loop={true}
          muted={isMuted}
          volume={0.3}
          width="0"
          height="0"
          config={{
            youtube: {
              playerVars: { 
                autoplay: 1, 
                controls: 0,
                showinfo: 0,
                rel: 0
              }
            } as any
          }}
        />
      </div>

      {/* Toggle Button */}
      {play && (
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="fixed bottom-8 left-8 z-40 p-3 bg-[#13111c]/80 border-2 border-[#fbbf24]/30 rounded-full text-[#fbbf24] hover:bg-[#1b1b3a] hover:scale-110 transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)] backdrop-blur-md"
          title={isMuted ? "播放背景音乐" : "暂停背景音乐"}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      )}
    </>
  );
}
