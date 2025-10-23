/**
 * Performance Configuration
 * Defines performance budgets and monitoring thresholds
 */

module.exports = {
  // Performance budgets
  budgets: {
    // Bundle size limits (in bytes)
    bundleSize: {
      total: 500 * 1024, // 500KB total JavaScript
      vendor: 300 * 1024, // 300KB vendor chunks
      app: 200 * 1024, // 200KB app code
    },
    
    // Asset size limits
    assets: {
      images: 2 * 1024 * 1024, // 2MB total images
      fonts: 100 * 1024, // 100KB fonts
      css: 50 * 1024, // 50KB CSS
    },
    
    // Performance metrics thresholds
    metrics: {
      // Core Web Vitals
      lcp: 2500, // Largest Contentful Paint (ms)
      fid: 100,  // First Input Delay (ms)
      cls: 0.1,  // Cumulative Layout Shift
      
      // Other metrics
      fcp: 1800, // First Contentful Paint (ms)
      ttfb: 600, // Time to First Byte (ms)
      tti: 3800, // Time to Interactive (ms)
    },
    
    // Build performance
    build: {
      maxDuration: 10 * 60 * 1000, // 10 minutes max build time
      maxMemory: 4 * 1024 * 1024 * 1024, // 4GB max memory usage
    }
  },
  
  // Monitoring configuration
  monitoring: {
    // Enable different types of monitoring
    webVitals: true,
    bundleAnalysis: true,
    buildMetrics: true,
    
    // Reporting thresholds
    reportThresholds: {
      // Report if metrics exceed these percentages of budget
      warning: 80, // 80% of budget
      error: 100,  // 100% of budget (exceeded)
    },
    
    // Sampling rates for production monitoring
    sampling: {
      webVitals: 0.1, // 10% of users
      errors: 1.0,    // 100% of errors
    }
  },
  
  // Optimization hints
  optimizations: {
    // Code splitting strategies
    codeSplitting: {
      vendor: true,
      pages: true,
      components: ['AmbientBackground', 'BackgroundVideo'],
    },
    
    // Image optimization
    images: {
      formats: ['webp', 'avif'],
      quality: 85,
      sizes: [640, 750, 828, 1080, 1200, 1920],
    },
    
    // Caching strategies
    caching: {
      static: '1y',      // 1 year for static assets
      dynamic: '1h',     // 1 hour for dynamic content
      api: 'no-cache',   // No cache for API routes
    }
  },
  
  // Development vs Production settings
  environments: {
    development: {
      // Relaxed budgets for development
      budgets: {
        bundleSize: {
          total: 1000 * 1024, // 1MB in development
        }
      },
      monitoring: {
        webVitals: false, // Disable in development
      }
    },
    
    production: {
      // Strict budgets for production
      budgets: {
        bundleSize: {
          total: 500 * 1024, // 500KB in production
        }
      },
      monitoring: {
        webVitals: true, // Enable in production
      }
    }
  }
};