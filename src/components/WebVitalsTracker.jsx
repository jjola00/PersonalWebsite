"use client";

import { useEffect } from 'react';
import { trackWebVitals, observePerformance, logBundleInfo } from '@/utils/webVitals';

const WebVitalsTracker = () => {
  useEffect(() => {
    // Track Web Vitals
    trackWebVitals();
    
    // Observe performance metrics
    observePerformance();
    
    // Log bundle information in development
    if (process.env.NODE_ENV === 'development') {
      logBundleInfo();
    }
  }, []);

  // This component doesn't render anything
  return null;
};

export default WebVitalsTracker;