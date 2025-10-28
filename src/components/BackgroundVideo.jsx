"use client";

import { useState, useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { useBackground } from './BackgroundManager';
import { getCurrentWallpaper, getWallpaperCount } from '@/utils/wallpaperManager';

const BackgroundVideo = forwardRef((props, ref) => {
  const { mode, customVideoIndex, nextVideo } = useBackground();
  const [activeVideo, setActiveVideo] = useState(0); // 0 or 1 for dual videos
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const intervalRef = useRef(null);
  const preloadedVideos = useRef(new Set());

  // Get current and next video URLs
  const currentVideoUrl = getCurrentWallpaper(customVideoIndex);
  const nextVideoUrl = getCurrentWallpaper((customVideoIndex + 1) % getWallpaperCount());

  // Preload video function
  const preloadVideo = useCallback((videoElement, url) => {
    if (!videoElement || preloadedVideos.current.has(url)) return;
    
    videoElement.src = url;
    videoElement.load();
    
    // Mark as preloaded when enough data is buffered
    const handleCanPlay = () => {
      preloadedVideos.current.add(url);
      videoElement.removeEventListener('canplaythrough', handleCanPlay);
    };
    
    videoElement.addEventListener('canplaythrough', handleCanPlay);
  }, []);

  // Smooth transition between videos
  const switchToNext = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    const nextActiveVideo = activeVideo === 0 ? 1 : 0;
    const nextVideoElement = nextActiveVideo === 0 ? video1Ref.current : video2Ref.current;
    
    // Ensure next video is ready
    if (nextVideoElement && nextVideoElement.readyState >= 3) {
      // Start playing the next video
      nextVideoElement.play().catch(console.error);
      
      // Crossfade transition
      setTimeout(() => {
        setActiveVideo(nextActiveVideo);
        nextVideo();
        
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 50);
    } else {
      // Fallback to immediate switch if preload failed
      nextVideo();
      setIsTransitioning(false);
    }
  }, [activeVideo, nextVideo, isTransitioning]);

  // Expose switchToNext function to parent component
  useImperativeHandle(ref, () => ({
    switchToNext
  }));

  // Setup auto-switching
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      switchToNext();
    }, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [switchToNext]);

  // Preload and setup videos when index changes
  useEffect(() => {
    if (mode !== 'custom') return;

    const currentVideoElement = activeVideo === 0 ? video1Ref.current : video2Ref.current;
    const nextVideoElement = activeVideo === 0 ? video2Ref.current : video1Ref.current;

    // Setup current video
    if (currentVideoElement) {
      currentVideoElement.src = currentVideoUrl;
      currentVideoElement.load();
      currentVideoElement.play().catch(console.error);
    }

    // Preload next video
    if (nextVideoElement) {
      preloadVideo(nextVideoElement, nextVideoUrl);
    }
  }, [customVideoIndex, activeVideo, mode, currentVideoUrl, nextVideoUrl, preloadVideo]);

  // Preload additional videos for smoother experience
  useEffect(() => {
    if (mode !== 'custom') return;

    // Preload next 2-3 videos in background
    const preloadQueue = [];
    for (let i = 1; i <= 3; i++) {
      const futureIndex = (customVideoIndex + i) % getWallpaperCount();
      const futureUrl = getCurrentWallpaper(futureIndex);
      if (!preloadedVideos.current.has(futureUrl)) {
        preloadQueue.push(futureUrl);
      }
    }

    // Stagger preloading to avoid overwhelming the network
    preloadQueue.forEach((url, index) => {
      setTimeout(() => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'video';
        link.href = url;
        document.head.appendChild(link);
      }, index * 1000);
    });
  }, [customVideoIndex, mode]);

  // Only render when in custom mode
  if (mode !== 'custom') {
    return null;
  }

  return (
    <>
      {/* Video 1 */}
      <video
        ref={video1Ref}
        className={`
          fixed top-0 left-0 w-full h-full object-cover -z-50
          transition-opacity duration-300 ease-in-out
          ${activeVideo === 0 && !isTransitioning ? 'opacity-25' : 'opacity-0'}
        `}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onError={(e) => console.error('Video 1 load error:', e)}
      />
      
      {/* Video 2 */}
      <video
        ref={video2Ref}
        className={`
          fixed top-0 left-0 w-full h-full object-cover -z-50
          transition-opacity duration-300 ease-in-out
          ${activeVideo === 1 && !isTransitioning ? 'opacity-25' : 'opacity-0'}
        `}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onError={(e) => console.error('Video 2 load error:', e)}
      />
    </>
  );
});

BackgroundVideo.displayName = 'BackgroundVideo';

export default BackgroundVideo;
