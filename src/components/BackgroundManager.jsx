"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const BackgroundContext = createContext();

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

export const BackgroundProvider = ({ children }) => {
  const [mode, setMode] = useState('ambient'); // 'ambient' or 'custom'
  const [ambientEffect, setAmbientEffect] = useState('pipeline'); // 'aurora', 'swirl', 'shift', 'coalesce', 'pipeline'
  const [customVideoIndex, setCustomVideoIndex] = useState(0);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('backgroundMode');
      const savedEffect = localStorage.getItem('ambientEffect');
      const savedVideoIndex = localStorage.getItem('customVideoIndex');

      // Always default to ambient mode with Coalesce effect if no saved preferences
      setMode(savedMode || 'ambient');
      setAmbientEffect(savedEffect || 'coalesce');
      setCustomVideoIndex(savedVideoIndex ? parseInt(savedVideoIndex) : 0);
    } catch (error) {
      console.error('Error loading background preferences:', error);
      // Fallback to defaults
      setMode('ambient');
      setAmbientEffect('coalesce');
      setCustomVideoIndex(0);
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('backgroundMode', mode);
    } catch (error) {
      console.error('Error saving background mode:', error);
    }
  }, [mode]);

  useEffect(() => {
    try {
      localStorage.setItem('ambientEffect', ambientEffect);
    } catch (error) {
      console.error('Error saving ambient effect:', error);
    }
  }, [ambientEffect]);

  useEffect(() => {
    try {
      localStorage.setItem('customVideoIndex', customVideoIndex.toString());
    } catch (error) {
      console.error('Error saving custom video index:', error);
    }
  }, [customVideoIndex]);

  const switchToCustom = () => setMode('custom');
  const switchToAmbient = () => setMode('ambient');
  const setEffect = (effect) => setAmbientEffect(effect);
  // Advance to next video; actual wrap is handled where videos are read (by list length)
  const nextVideo = () => setCustomVideoIndex(prev => prev + 1);

  const value = {
    mode,
    ambientEffect,
    customVideoIndex,
    switchToCustom,
    switchToAmbient,
    setEffect,
    nextVideo
  };

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
};
