"use client";

import React from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Higher-order component that wraps a component with an ErrorBoundary
 * @param {React.Component} WrappedComponent - Component to wrap
 * @param {Object} errorBoundaryProps - Props to pass to ErrorBoundary
 * @returns {React.Component} - Wrapped component with error boundary
 */
const withErrorBoundary = (WrappedComponent, errorBoundaryProps = {}) => {
  const WithErrorBoundaryComponent = (props) => {
    return (
      <ErrorBoundary
        componentName={WrappedComponent.displayName || WrappedComponent.name}
        showRetry={true}
        {...errorBoundaryProps}
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
};

export default withErrorBoundary;