// Responsive Testing Utilities
// Phase 5: Testing utilities for responsive development

import { useState, useEffect } from 'react';

// Breakpoint constants
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  large: 1200,
  xlarge: 1440
};

// Device detection utilities
export const getDeviceType = () => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  
  if (width <= BREAKPOINTS.mobile) return 'mobile';
  if (width <= BREAKPOINTS.tablet) return 'tablet';
  if (width <= BREAKPOINTS.desktop) return 'desktop';
  return 'large';
};

// Media query helpers
export const createMediaQuery = (breakpoint) => {
  return `(max-width: ${breakpoint}px)`;
};

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

// Touch device detection
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Orientation detection
export const getOrientation = () => {
  if (typeof window === 'undefined') return 'landscape';
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
};

// Performance testing utilities
export const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};

// Viewport utilities
export const getViewportSize = () => {
  if (typeof window === 'undefined') return { width: 1200, height: 800 };
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

// Safe area detection for mobile devices
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 };
  
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0')
  };
};

