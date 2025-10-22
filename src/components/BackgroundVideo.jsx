"use client";

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useBackground } from './BackgroundManager';

const BackgroundVideo = forwardRef((props, ref) => {
  const { mode, customVideoIndex, nextVideo } = useBackground();
  // Updated wallpapers list (randomized order on mount)
  const wallpapers = [
    '/wallpapers/Haikyuu-Hinata.mp4',
    '/wallpapers/Haikyuu-HinataKageyama.mp4',
    '/wallpapers/DemonSlayer-Kokushibo.mp4',
    '/wallpapers/SilentHill-Maria.mp4',
    '/wallpapers/VinlandSaga-Thorfinn.mp4',
    '/wallpapers/Arcane-JinxEkko.mp4',
    '/wallpapers/Spiderman-Spiderman.mp4',
    '/wallpapers/Sekiro-Sekiro.mp4',
    '/wallpapers/Genshin-Serai.mp4',
    '/wallpapers/Arcane-Jinx.mp4',
    '/wallpapers/EldenRing-Neightreign.mp4',
    '/wallpapers/EldenRing-Demigods.mp4',
    '/wallpapers/EldenRIng-RayaLucaria.mp4',
    '/wallpapers/EldenRing-Malekith.mp4',
    '/wallpapers/SpiderMan.mp4',
    '/wallpapers/KillBill.mp4'
  ];
  const shuffledWallpapersRef = useRef([]);
  if (shuffledWallpapersRef.current.length === 0) {
    // Shuffle once per session
    shuffledWallpapersRef.current = [...wallpapers].sort(() => Math.random() - 0.5);
  }

  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef(null);
  const intervalRef = useRef(null);

  const switchToNext = () => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      nextVideo(); // Use the context function
      setIsTransitioning(false);
    }, 300); // 300ms fade transition
  };

  // Expose switchToNext function to parent component
  useImperativeHandle(ref, () => ({
    switchToNext
  }));

  useEffect(() => {
    // Auto-switch videos every 60 seconds
    intervalRef.current = setInterval(() => {
      switchToNext();
    }, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle video load to ensure smooth playback
  const handleVideoLoad = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  // Only render when in custom mode
  if (mode !== 'custom') {
    return null;
  }

  return (
    <video
      ref={videoRef}
      key={customVideoIndex} // Force re-render when video changes
      className={`
        fixed top-0 left-0 w-full h-full object-cover -z-50
        transition-opacity duration-300 ease-in-out
        ${isTransitioning ? 'opacity-0' : 'opacity-25'}
      `}
      autoPlay
      loop
      muted
      playsInline
      onLoadedData={handleVideoLoad}
      onError={(e) => console.error('Video load error:', e)}
    >
      <source src={shuffledWallpapersRef.current[customVideoIndex % shuffledWallpapersRef.current.length]} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
});

BackgroundVideo.displayName = 'BackgroundVideo';

export default BackgroundVideo;
