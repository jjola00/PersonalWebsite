"use client";

// Global error handling utilities

class ErrorHandler {
  constructor() {
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    if (typeof window === 'undefined') return;

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.logError({
        type: 'unhandledrejection',
        error: event.reason,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
      
      // Prevent the default browser behavior
      event.preventDefault();
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.logError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        console.error('Resource loading error:', event.target);
        this.logError({
          type: 'resource',
          element: event.target.tagName,
          source: event.target.src || event.target.href,
          timestamp: new Date().toISOString(),
          url: window.location.href
        });
      }
    }, true);
  }

  logError(errorData) {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Global Error Handler');
      console.error('Error Data:', errorData);
      console.groupEnd();
    }

    // In production, send to error reporting service
    // Example: this.sendToErrorService(errorData);
  }

  // Method to manually report errors
  reportError(error, context = {}) {
    this.logError({
      type: 'manual',
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    });
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

export default errorHandler;

// Utility function for async error handling
export const handleAsync = (asyncFn) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      errorHandler.reportError(error, { function: asyncFn.name, args });
      throw error; // Re-throw to allow component-level handling
    }
  };
};

// Utility function for safe async operations with fallback
export const safeAsync = (asyncFn, fallback = null) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      errorHandler.reportError(error, { function: asyncFn.name, args });
      return fallback;
    }
  };
};