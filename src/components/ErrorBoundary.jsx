"use client";

import React from 'react';

// Error logging utility
const logError = (error, errorInfo, componentName) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    componentName
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component:', componentName);
    console.groupEnd();
  }

  // In production, you could send to error reporting service
  // Example: errorReportingService.report(errorData);
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Enhanced error logging
    logError(error, errorInfo, this.props.componentName || 'Unknown Component');
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback component if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default fallback UI
      return (
        <div className="flex items-center justify-center min-h-[200px] p-4 border border-red-200/20 rounded-lg bg-red-900/10">
          <div className="text-center max-w-md">
            <div className="text-red-400 mb-3">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-red-400 mb-2">
              {this.props.title || 'Something went wrong'}
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              {this.props.fallbackMessage || 'An error occurred while rendering this component.'}
            </p>
            
            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-4 p-3 bg-gray-800 rounded text-xs">
                <summary className="cursor-pointer text-gray-300 mb-2">Error Details</summary>
                <pre className="text-red-300 whitespace-pre-wrap break-words">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            
            <div className="flex gap-2 justify-center">
              {this.props.showRetry && (
                <button
                  onClick={this.handleRetry}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
              )}
              {this.props.showReload && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Reload Page
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;