"use client";

import React from "react";
import { useResponsive } from "@/hooks/useResponsive";

/**
 * ResponsiveProvider - Consolidated responsive component
 * Provides responsive data through render props pattern
 * Replaces the old ResponsiveComponent with enhanced functionality
 */
const ResponsiveProvider = ({ children }) => {
  const responsive = useResponsive();

  // Support both function children and regular children
  if (typeof children === 'function') {
    return children(responsive);
  }

  return <>{children}</>;
};

export default ResponsiveProvider;