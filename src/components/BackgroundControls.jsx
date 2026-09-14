"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useBackground } from './BackgroundManager';
import { useScreenSize } from '@/hooks/useResponsive';

// Shared with the bottom effect picker so both control clusters read the same
// against any wallpaper — neutral glass instead of per-button accent colours.
const PANEL_CLASSES = `
  bg-black/20 backdrop-blur-md border border-white/10
  rounded-2xl shadow-2xl
  flex gap-2 items-center
`;

const CONTROL_CLASSES = `
  px-4 py-2 rounded-lg text-sm font-medium
  text-white/70 hover:text-white hover:bg-white/10
  border border-transparent
  active:scale-95
  transition-all duration-300 ease-out
  accessible-touch-target
`;

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

  // Sub pages render HomeBtn at `top-4 left-4` (see (sub pages)/layout.js), so the
  // controls shift right of it there. On the home page nothing else occupies the corner.
  const isHomePage = usePathname() === '/';

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

  const wallpaperIcon = (
    <svg
      className="w-4 h-4 mr-2 inline-block"
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
  );

  return (
    <>
      {/* Top-left controls */}
      <div
        className={`fixed top-4 ${isHomePage ? 'left-4' : 'left-20'} z-40 flex flex-col sm:flex-row gap-2`}
      >
        {mode === 'ambient' ? (
          // Hide "My Wallpapers" button on mobile devices (≤768px)
          !isMobile && (
            <div className={`${PANEL_CLASSES} p-2`}>
              <button
                onClick={switchToCustom}
                className={CONTROL_CLASSES}
                title="Use Custom Wallpapers"
              >
                {wallpaperIcon}
                <span>My Wallpapers</span>
              </button>
            </div>
          )
        ) : (
          <div className={`${PANEL_CLASSES} p-2`}>
            <button
              onClick={switchToAmbient}
              className={CONTROL_CLASSES}
              title="Back to Ambient"
            >
              <svg
                className="w-4 h-4 mr-2 inline-block"
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
              className={CONTROL_CLASSES}
              title="Change Video"
            >
              {wallpaperIcon}
              <span className="hidden sm:inline tabular-nums">{`Change Wallpaper ${secondsLeft}s`}</span>
              <span className="sm:hidden tabular-nums">{`Change ${secondsLeft}s`}</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom ambient effect controls - only show in ambient mode */}
      {mode === 'ambient' && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`${PANEL_CLASSES} px-6 py-3`}>
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
    </>
  );
};

export default BackgroundControls;
