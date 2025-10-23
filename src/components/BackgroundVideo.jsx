"use client";

import { useState, useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { useBackground } from './BackgroundManager';
import { getCurrentWallpaper } from '@/utils/wallpaperManager';

const BackgroundVideo = forwardRef((props, ref) => {
  const { mode, customVideoIndex, nextVideo } = useBackground();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef(null);
  const intervalRef = useRef(null);

  const switchToNext = useCallback(() => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      nextVideo();
      setIsTransitioning(false);
    }, 300);
  }, [nextVideo]);

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
      <source src={getCurrentWallpaper(customVideoIndex)} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
});

BackgroundVideo.displayName = 'BackgroundVideo';

export default BackgroundVideo;
