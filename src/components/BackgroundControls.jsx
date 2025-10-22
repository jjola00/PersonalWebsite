"use client";

import React from 'react';
import { useBackground } from './BackgroundManager';
import useScreenSize from './hooks/useScreenSize';

const BackgroundControls = () => {
  const { 
    mode, 
    ambientEffect, 
    switchToCustom, 
    switchToAmbient, 
    setEffect, 
    nextVideo 
  } = useBackground();
  
  const screenWidth = useScreenSize();
  const isMobile = screenWidth <= 768; // Hide wallpapers on mobile devices (≤768px)

  // Countdown timer for next wallpaper while in custom mode
  const [secondsLeft, setSecondsLeft] = React.useState(60);
  React.useEffect(() => {
    if (mode !== 'custom') return;
    setSecondsLeft(60);
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) return 60;
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mode]);

  const effects = [
    { id: 'pipeline', name: 'Pipeline' },
    { id: 'swirl', name: 'Swirl' },
    { id: 'shift', name: 'Shift' },
    { id: 'aurora', name: 'Aurora' },
    { id: 'coalesce', name: 'Coalesce' }
  ];

  return (
    <>
      {/* Top-left controls - moved from top-right to avoid blocking mobile navigation */}
      <div className="fixed top-4 left-4 md:top-6 md:left-6 z-40 flex flex-col sm:flex-row gap-2">
        {mode === 'ambient' ? (
          // Hide "My Wallpapers" button on mobile devices (≤768px)
          !isMobile && (
            <button
            onClick={switchToCustom}
            className="
              bg-black/30 backdrop-blur-sm border border-purple-500/30
              text-purple-300 text-xs sm:text-sm font-medium
              px-3 py-2 sm:px-4 sm:py-2 rounded-lg
              hover:bg-purple-500/20 hover:border-purple-400/50 hover:text-purple-200
              hover:shadow-lg hover:shadow-purple-500/25
              active:scale-95
              transition-all duration-300 ease-out
              hover:animate-pulse
              glow-effect
              accessible-touch-target
            "
            title="Use Custom Wallpapers"
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 inline-block"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="hidden sm:inline">My Wallpapers</span>
            <span className="sm:hidden">My Wallpapers</span>
          </button>
          )
        ) : (
          <>
            <button
              onClick={switchToAmbient}
              className="
                bg-black/30 backdrop-blur-sm border border-blue-500/30
                text-blue-300 text-xs sm:text-sm font-medium
                px-3 py-2 sm:px-4 sm:py-2 rounded-lg
                hover:bg-blue-500/20 hover:border-blue-400/50 hover:text-blue-200
                hover:shadow-lg hover:shadow-blue-500/25
                active:scale-95
                transition-all duration-300 ease-out
                hover:animate-pulse
                glow-effect-blue
                accessible-touch-target
              "
              title="Back to Ambient"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 inline-block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="hidden sm:inline">Back to Ambient</span>
              <span className="sm:hidden">Ambient</span>
            </button>
            <button
              onClick={nextVideo}
              className="
                bg-black/30 backdrop-blur-sm border border-purple-500/30
                text-purple-300 text-xs sm:text-sm font-medium
                px-3 py-2 sm:px-4 sm:py-2 rounded-lg
                hover:bg-purple-500/20 hover:border-purple-400/50 hover:text-purple-200
                hover:shadow-lg hover:shadow-purple-500/25
                active:scale-95
                transition-all duration-300 ease-out
                hover:animate-pulse
                glow-effect
                accessible-touch-target
              "
              title="Change Video"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 inline-block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="hidden sm:inline">{`Change Wallpaper ${secondsLeft}s`}</span>
              <span className="sm:hidden">{`Change ${secondsLeft}s`}</span>
            </button>
          </>
        )}
      </div>

      {/* Bottom ambient effect controls - only show in ambient mode */}
      {mode === 'ambient' && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="
            bg-black/20 backdrop-blur-md border border-white/10
            rounded-2xl px-6 py-3
            flex gap-2 items-center
            shadow-2xl
          ">
            {effects.map((effect) => (
              <button
                key={effect.id}
                onClick={() => setEffect(effect.id)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-300 ease-out
                  ${ambientEffect === effect.id
                    ? 'bg-white/20 text-white border border-white/30 shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                  }
                `}
              >
                {effect.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .glow-effect {
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.3);
        }
        .glow-effect:hover {
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
        }
        .glow-effect-blue {
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
        }
        .glow-effect-blue:hover {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </>
  );
};

export default BackgroundControls;
