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
  const loadedSrcs = useRef([null, null]); // Track what URL is loaded on each slot
  const preloadCache = useRef(new Set()); // URLs already preloaded into browser cache

  const currentVideoUrl = getCurrentWallpaper(customVideoIndex);
  const nextVideoUrl = getCurrentWallpaper((customVideoIndex + 1) % getWallpaperCount());

  // Preload a video into browser cache via a temporary video element
  const preloadIntoCache = useCallback((url) => {
    if (preloadCache.current.has(url)) return;
    preloadCache.current.add(url); // Mark immediately to avoid duplicate requests

    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.src = url;
    video.load();

    const onReady = () => {
      video.removeEventListener('canplaythrough', onReady);
      video.src = '';
      video.load(); // Release element memory, data stays in browser cache
    };
    video.addEventListener('canplaythrough', onReady);
  }, []);

  // Load a URL onto a video element only if it doesn't already have it
  const loadOnElement = useCallback((element, slot, url) => {
    if (!element || loadedSrcs.current[slot] === url) return;
    element.src = url;
    element.load();
    loadedSrcs.current[slot] = url;
  }, []);

  // Smooth transition between videos
  const switchToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const nextSlot = activeVideo === 0 ? 1 : 0;
    const nextEl = nextSlot === 0 ? video1Ref.current : video2Ref.current;

    const doSwitch = () => {
      if (nextEl) nextEl.play().catch(() => {});
      setActiveVideo(nextSlot);
      nextVideo();
      setTimeout(() => setIsTransitioning(false), 300);
    };

    if (nextEl && nextEl.readyState >= 3) {
      // Next video is buffered, switch immediately
      doSwitch();
    } else if (nextEl) {
      // Wait for it to buffer, with a timeout fallback
      const onReady = () => {
        clearTimeout(timeout);
        doSwitch();
      };
      nextEl.addEventListener('canplay', onReady, { once: true });

      // Make sure it's actually loading
      loadOnElement(nextEl, nextSlot, nextVideoUrl);

      const timeout = setTimeout(() => {
        nextEl.removeEventListener('canplay', onReady);
        doSwitch();
      }, 5000);
    } else {
      nextVideo();
      setIsTransitioning(false);
    }
  }, [activeVideo, nextVideo, isTransitioning, nextVideoUrl, loadOnElement]);

  useImperativeHandle(ref, () => ({ switchToNext }));

  // Auto-switch interval (only when in custom mode)
  useEffect(() => {
    if (mode !== 'custom') return;
    intervalRef.current = setInterval(switchToNext, 60000);
    return () => clearInterval(intervalRef.current);
  }, [switchToNext, mode]);

  // Load current video + preload next when entering custom mode or index changes
  useEffect(() => {
    if (mode !== 'custom') return;

    const currentEl = activeVideo === 0 ? video1Ref.current : video2Ref.current;
    const nextEl = activeVideo === 0 ? video2Ref.current : video1Ref.current;
    const nextSlot = activeVideo === 0 ? 1 : 0;

    // Load current video (skips if already loaded with this URL)
    loadOnElement(currentEl, activeVideo, currentVideoUrl);
    if (currentEl) currentEl.play().catch(() => {});

    // Preload next video onto the inactive element
    loadOnElement(nextEl, nextSlot, nextVideoUrl);
  }, [customVideoIndex, activeVideo, mode, currentVideoUrl, nextVideoUrl, loadOnElement]);

  // Preload 2-3 videos ahead via hidden temporary elements
  useEffect(() => {
    if (mode !== 'custom') return;

    for (let i = 2; i <= 3; i++) {
      const idx = (customVideoIndex + i) % getWallpaperCount();
      preloadIntoCache(getCurrentWallpaper(idx));
    }
  }, [customVideoIndex, mode, preloadIntoCache]);

  // When in ambient mode, preload the first wallpaper so switching to custom is instant
  useEffect(() => {
    if (mode === 'custom') return;

    // Preload into browser cache
    preloadIntoCache(currentVideoUrl);

    // Also load directly onto video1 element so it's ready to play immediately
    const el = video1Ref.current;
    if (el) loadOnElement(el, 0, currentVideoUrl);
  }, [mode, currentVideoUrl, preloadIntoCache, loadOnElement]);

  // Pause videos when leaving custom mode to save resources
  useEffect(() => {
    if (mode !== 'custom') {
      video1Ref.current?.pause();
      video2Ref.current?.pause();
    }
  }, [mode]);

  const isCustom = mode === 'custom';

  // Always render video elements (never unmount) so they retain buffered data
  return (
    <>
      <video
        ref={video1Ref}
        className={`
          fixed top-0 left-0 w-full h-full object-cover xl:left-1/2 xl:-translate-x-1/2 xl:w-auto xl:aspect-video -z-50
          transition-opacity duration-300 ease-in-out
          ${isCustom && activeVideo === 0 && !isTransitioning ? 'opacity-25' : 'opacity-0'}
        `}
        loop
        muted
        playsInline
        preload="auto"
      />
      <video
        ref={video2Ref}
        className={`
          fixed top-0 left-0 w-full h-full object-cover xl:left-1/2 xl:-translate-x-1/2 xl:w-auto xl:aspect-video -z-50
          transition-opacity duration-300 ease-in-out
          ${isCustom && activeVideo === 1 && !isTransitioning ? 'opacity-25' : 'opacity-0'}
        `}
        loop
        muted
        playsInline
        preload="auto"
      />
    </>
  );
});

BackgroundVideo.displayName = 'BackgroundVideo';

export default BackgroundVideo;
