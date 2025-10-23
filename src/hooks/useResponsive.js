"use client";

import { useState, useEffect, useCallback } from 'react';

// Breakpoint constants
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  large: 1200,
  xlarge: 1440
};

// Device type detection
const getDeviceType = (width) => {
  if (width <= BREAKPOINTS.mobile) return 'mobile';
  if (width <= BREAKPOINTS.tablet) return 'tablet';
  if (width <= BREAKPOINTS.desktop) return 'desktop';
  return 'large';
};

// Main responsive hook
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: 1200, // Default to desktop width for SSR
    height: 800,
    deviceType: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    orientation: 'landscape'
  });

  const updateScreenSize = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const deviceType = getDeviceType(width);
    
    setScreenSize({
      width,
      height,
      deviceType,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop' || deviceType === 'large',
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      orientation: height > width ? 'portrait' : 'landscape'
    });
  }, []);

  useEffect(() => {
    updateScreenSize();
    
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateScreenSize, 100); // Debounce resize events
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [updateScreenSize]);

  return screenSize;
};

// Simplified hook for just screen width (backward compatibility)
export const useScreenSize = () => {
  const { width } = useResponsive();
  return width;
};

// Media query helpers
export const createMediaQuery = (breakpoint) => {
  return `(max-width: ${breakpoint}px)`;
};

// Utility functions
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= BREAKPOINTS.mobile;
};

export const isTablet = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth > BREAKPOINTS.mobile && window.innerWidth <= BREAKPOINTS.tablet;
};

export const isDesktop = () => {
  if (typeof window === 'undefined') return true;
  return window.innerWidth > BREAKPOINTS.tablet;
};

export const getViewportSize = () => {
  if (typeof window === 'undefined') return { width: 1200, height: 800 };
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

export default useResponsive;