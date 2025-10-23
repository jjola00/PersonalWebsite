import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

// Function to send metrics to analytics (can be customized)
function sendToAnalytics(metric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric);
  }
  
  // In production, you could send to your analytics service
  // Example: analytics.track('Web Vital', metric);
}

// Track all Web Vitals
export function trackWebVitals() {
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics); // INP replaced FID in newer versions
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

// Performance observer for custom metrics
export function observePerformance() {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    // Observe long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn('Long task detected:', entry.duration + 'ms');
        }
      }
    });
    
    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Long task API not supported
    }
    
    // Observe layout shifts
    const layoutShiftObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput && entry.value > 0.1) {
          console.warn('Layout shift detected:', entry.value);
        }
      }
    });
    
    try {
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Layout shift API not supported
    }
  }
}

// Bundle size monitoring
export function logBundleInfo() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Log initial bundle size info
    const scripts = document.querySelectorAll('script[src*="_next/static"]');
    let totalSize = 0;
    
    scripts.forEach(script => {
      if (script.src) {
        fetch(script.src, { method: 'HEAD' })
          .then(response => {
            const size = response.headers.get('content-length');
            if (size) {
              totalSize += parseInt(size);
              console.log(`Script: ${script.src.split('/').pop()} - ${(size / 1024).toFixed(2)}KB`);
            }
          })
          .catch(() => {
            // Ignore errors for cross-origin scripts
          });
      }
    });
  }
}