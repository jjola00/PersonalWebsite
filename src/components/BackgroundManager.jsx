"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const BackgroundContext = createContext();

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

// Default background settings
const DEFAULT_SETTINGS = {
  mode: 'ambient',
  ambientEffect: 'coalesce',
  customVideoIndex: 0
};

// Consolidated localStorage operations
const backgroundStorage = {
  load: () => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    
    try {
      return {
        mode: localStorage.getItem('backgroundMode') || DEFAULT_SETTINGS.mode,
        ambientEffect: localStorage.getItem('ambientEffect') || DEFAULT_SETTINGS.ambientEffect,
        customVideoIndex: parseInt(localStorage.getItem('customVideoIndex') || '0')
      };
    } catch (error) {
      console.error('Error loading background preferences:', error);
      return DEFAULT_SETTINGS;
    }
  },
  
  save: (key, value) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, value.toString());
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  }
};

export const BackgroundProvider = ({ children }) => {
  const [backgroundState, setBackgroundState] = useState(DEFAULT_SETTINGS);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedSettings = backgroundStorage.load();
    setBackgroundState(savedSettings);
  }, []);

  // Consolidated localStorage save effect
  useEffect(() => {
    backgroundStorage.save('backgroundMode', backgroundState.mode);
    backgroundStorage.save('ambientEffect', backgroundState.ambientEffect);
    backgroundStorage.save('customVideoIndex', backgroundState.customVideoIndex);
  }, [backgroundState]);

  // Memoized action functions to prevent unnecessary re-renders
  const actions = useMemo(() => ({
    switchToCustom: () => setBackgroundState(prev => ({ ...prev, mode: 'custom' })),
    switchToAmbient: () => setBackgroundState(prev => ({ ...prev, mode: 'ambient' })),
    setEffect: (effect) => setBackgroundState(prev => ({ ...prev, ambientEffect: effect })),
    nextVideo: () => setBackgroundState(prev => ({ ...prev, customVideoIndex: prev.customVideoIndex + 1 }))
  }), []);

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    ...backgroundState,
    ...actions
  }), [backgroundState, actions]);

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
};
