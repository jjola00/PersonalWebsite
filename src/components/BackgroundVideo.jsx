"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useBackground } from './BackgroundManager';
import { getCurrentWallpaper, markWallpaperBroken } from '@/utils/wallpaperManager';

// --- Wallpaper brightness -----------------------------------------------
// The video composites over the near-black page background (--background:
// 27 27 27), so opacity is effectively a dimmer: 0 is fully dark, 1 is the
// video at full strength. BRIGHTNESS lifts the video's own pixels before
// that blend. Raise either to make wallpapers brighter.
// Past ~0.6 opacity the nav icons and profile image start losing contrast.
const WALLPAPER_OPACITY = 0.45;
const WALLPAPER_BRIGHTNESS = 1.15;
// ------------------------------------------------------------------------

const ROTATE_INTERVAL_MS = 60000;

// Only mounted in custom (wallpaper) mode; SiteBackground swaps it out for the
// ambient effect otherwise. Two <video> slots crossfade: one plays the current
// wallpaper while the other buffers the next. Nothing further ahead is
// preloaded — the files are several MB each and rotate once a minute.
const BackgroundVideo = () => {
  const { customVideoIndex, nextVideo } = useBackground();
  const [activeVideo, setActiveVideo] = useState(0); // 0 or 1 for dual videos
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Bumped when a broken wallpaper is dropped, to re-read the list below
  const [, setBrokenCount] = useState(0);

  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const loadedSrcs = useRef([null, null]); // Track what URL is loaded on each slot

  const currentVideoUrl = getCurrentWallpaper(customVideoIndex);
  const nextVideoUrl = getCurrentWallpaper(customVideoIndex + 1);

  // Load a URL onto a video element only if it doesn't already have it
  const loadOnElement = useCallback((element, slot, url) => {
    if (!element || !url || loadedSrcs.current[slot] === url) return;
    element.src = url;
    element.load();
    loadedSrcs.current[slot] = url;
  }, []);

  // A missing or corrupt file would otherwise leave a blank background until
  // the next rotation. Drop it and let the load effect pick the next wallpaper.
  const handleError = useCallback((slot) => {
    const url = loadedSrcs.current[slot];
    if (!url) return;
    console.warn(`Wallpaper failed to load, skipping it: ${url}`);
    loadedSrcs.current[slot] = null;
    markWallpaperBroken(url);
    setBrokenCount((count) => count + 1);
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

  // Auto-switch interval
  useEffect(() => {
    const interval = setInterval(switchToNext, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [switchToNext]);

  // Load current video + buffer the next whenever the index changes
  useEffect(() => {
    const currentEl = activeVideo === 0 ? video1Ref.current : video2Ref.current;
    const nextEl = activeVideo === 0 ? video2Ref.current : video1Ref.current;
    const nextSlot = activeVideo === 0 ? 1 : 0;

    // Load current video (skips if already loaded with this URL)
    loadOnElement(currentEl, activeVideo, currentVideoUrl);
    if (currentEl) currentEl.play().catch(() => {});

    // Buffer the next video on the inactive element
    loadOnElement(nextEl, nextSlot, nextVideoUrl);
  }, [activeVideo, currentVideoUrl, nextVideoUrl, loadOnElement]);

  const videoClassName = `
    fixed top-0 left-0 w-full h-full object-cover xl:left-1/2 xl:-translate-x-1/2 xl:w-auto xl:aspect-video -z-50
    transition-opacity duration-300 ease-in-out
  `;

  return (
    <>
      {[video1Ref, video2Ref].map((videoRef, slot) => (
        <video
          key={slot}
          ref={videoRef}
          className={videoClassName}
          style={{
            opacity: activeVideo === slot && !isTransitioning ? WALLPAPER_OPACITY : 0,
            filter: `brightness(${WALLPAPER_BRIGHTNESS})`,
          }}
          onError={() => handleError(slot)}
          loop
          muted
          playsInline
          preload="auto"
        />
      ))}
    </>
  );
};

export default BackgroundVideo;
