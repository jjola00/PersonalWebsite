"use client";

import { useState, useRef, useEffect, useCallback } from 'react';

const HorizontalScroller = ({ 
  children, 
  itemWidth = 200, 
  showArrows = true, 
  showEdgePreviews = true,
  edgePreviewWidth = 60, // Width of edge preview in pixels
  onScroll,
  className = "",
  arrowClassName = "",
  containerClassName = ""
}) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showScrollIndicators, setShowScrollIndicators] = useState(false);
  const [screenSize, setScreenSize] = useState('desktop');
  
  // Touch and gesture state
  const [isTouching, setIsTouching] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [lastTouchX, setLastTouchX] = useState(0);
  const [touchVelocity, setTouchVelocity] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [momentumAnimation, setMomentumAnimation] = useState(null);

  // Get responsive edge preview width
  const getEdgePreviewWidth = () => {
    if (typeof window === 'undefined') return edgePreviewWidth;
    
    const width = window.innerWidth;
    if (width < 640) return Math.max(30, edgePreviewWidth * 0.5); // Mobile: smaller preview
    if (width < 1024) return Math.max(40, edgePreviewWidth * 0.7); // Tablet: medium preview
    return edgePreviewWidth; // Desktop: full preview
  };

  // Update screen size on resize
  useEffect(() => {
    const updateScreenSize = () => {
      if (typeof window === 'undefined') return;
      
      const width = window.innerWidth;
      if (width < 640) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Check scroll position and update arrow states
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < maxScrollLeft - 1); // -1 for rounding errors
    
    // Show scroll indicators if content is scrollable
    setShowScrollIndicators(maxScrollLeft > 0);
  };

  // Initialize scroll position check
  useEffect(() => {
    checkScrollPosition();
    
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      
      // Check on resize
      const resizeObserver = new ResizeObserver(checkScrollPosition);
      resizeObserver.observe(container);
      
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        resizeObserver.disconnect();
      };
    }
  }, [children]);

  // Scroll to previous items
  const scrollToPrevious = () => {
    if (!scrollContainerRef.current || !canScrollLeft) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = itemWidth * 2; // Scroll by 2 items
    
    setIsScrolling(true);
    container.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
    
    // Reset scrolling state after animation
    setTimeout(() => setIsScrolling(false), 300);
  };

  // Scroll to next items
  const scrollToNext = () => {
    if (!scrollContainerRef.current || !canScrollRight) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = itemWidth * 2; // Scroll by 2 items
    
    setIsScrolling(true);
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
    
    // Reset scrolling state after animation
    setTimeout(() => setIsScrolling(false), 300);
  };

  // Handle scroll events
  const handleScroll = (e) => {
    checkScrollPosition();
    if (onScroll) {
      onScroll(e);
    }
  };

  // Touch event handlers for swipe navigation
  const handleTouchStart = useCallback((e) => {
    if (!scrollContainerRef.current) return;
    
    const touch = e.touches[0];
    setIsTouching(true);
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
    setTouchStartTime(Date.now());
    setLastTouchX(touch.clientX);
    setTouchVelocity(0);
    setIsDragging(false);
    
    // Cancel any ongoing momentum animation
    if (momentumAnimation) {
      cancelAnimationFrame(momentumAnimation);
      setMomentumAnimation(null);
    }
    
    // Disable smooth scrolling during touch
    scrollContainerRef.current.style.scrollBehavior = 'auto';
  }, [momentumAnimation]);

  const handleTouchMove = useCallback((e) => {
    if (!isTouching || !scrollContainerRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = touchStartX - touch.clientX;
    const deltaY = touchStartY - touch.clientY;
    
    // Determine if this is a horizontal swipe
    if (!isDragging && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      setIsDragging(true);
      e.preventDefault(); // Prevent vertical scrolling
    }
    
    if (isDragging) {
      e.preventDefault();
      
      // Calculate velocity for momentum scrolling
      const currentTime = Date.now();
      const timeDelta = currentTime - touchStartTime;
      const velocity = (touch.clientX - lastTouchX) / Math.max(timeDelta, 1);
      setTouchVelocity(velocity);
      setLastTouchX(touch.clientX);
      
      // Apply scroll with resistance at edges
      const container = scrollContainerRef.current;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      const currentScroll = container.scrollLeft;
      
      let newScrollLeft = currentScroll + deltaX * 0.8; // Add some resistance
      
      // Add rubber band effect at edges
      if (newScrollLeft < 0) {
        newScrollLeft = newScrollLeft * 0.3; // Resistance when over-scrolling left
      } else if (newScrollLeft > maxScrollLeft) {
        const overScroll = newScrollLeft - maxScrollLeft;
        newScrollLeft = maxScrollLeft + overScroll * 0.3; // Resistance when over-scrolling right
      }
      
      container.scrollLeft = Math.max(0, Math.min(maxScrollLeft, newScrollLeft));
      
      // Update touch start position for next calculation
      setTouchStartX(touch.clientX);
    }
  }, [isTouching, touchStartX, touchStartY, isDragging, touchStartTime, lastTouchX]);

  const handleTouchEnd = useCallback((e) => {
    if (!isTouching || !scrollContainerRef.current) return;
    
    setIsTouching(false);
    setIsDragging(false);
    
    const container = scrollContainerRef.current;
    
    // Re-enable smooth scrolling
    container.style.scrollBehavior = 'smooth';
    
    // Apply momentum scrolling if there's sufficient velocity
    if (Math.abs(touchVelocity) > 0.5) {
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      const currentScroll = container.scrollLeft;
      
      // Calculate momentum distance (with decay)
      let momentumDistance = touchVelocity * -300; // Negative because we want opposite direction
      const targetScroll = Math.max(0, Math.min(maxScrollLeft, currentScroll + momentumDistance));
      
      // Animate momentum scrolling
      const startScroll = currentScroll;
      const scrollDistance = targetScroll - startScroll;
      const duration = Math.min(800, Math.abs(scrollDistance) * 2); // Max 800ms
      const startTime = Date.now();
      
      const animateMomentum = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for natural deceleration
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const newScroll = startScroll + scrollDistance * easeOut;
        
        container.scrollLeft = newScroll;
        
        if (progress < 1) {
          const animationId = requestAnimationFrame(animateMomentum);
          setMomentumAnimation(animationId);
        } else {
          setMomentumAnimation(null);
          // Snap to nearest item if close
          snapToNearestItem();
        }
      };
      
      const animationId = requestAnimationFrame(animateMomentum);
      setMomentumAnimation(animationId);
    } else {
      // Snap to nearest item for small movements
      snapToNearestItem();
    }
  }, [isTouching, touchVelocity]);

  // Snap to nearest item for better UX
  const snapToNearestItem = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const itemWidthWithGap = itemWidth + 24; // Item width + gap
    
    // Find nearest item position
    const nearestItemIndex = Math.round(scrollLeft / itemWidthWithGap);
    const targetScroll = nearestItemIndex * itemWidthWithGap;
    
    // Only snap if we're close to an item boundary
    if (Math.abs(scrollLeft - targetScroll) < itemWidthWithGap * 0.3) {
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  }, [itemWidth]);

  // Clean up momentum animation on unmount
  useEffect(() => {
    return () => {
      if (momentumAnimation) {
        cancelAnimationFrame(momentumAnimation);
      }
    };
  }, [momentumAnimation]);

  return (
    <div className={`relative ${className} ${isDragging ? 'select-none' : ''}`}>
      {/* Left Arrow */}
      {showArrows && (
        <button
          onClick={scrollToPrevious}
          disabled={!canScrollLeft || isScrolling}
          className={`
            absolute left-0 top-1/2 -translate-y-1/2 z-10
            w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12
            bg-black/60 backdrop-blur-sm border border-white/20
            text-white rounded-full
            flex items-center justify-center
            transition-all duration-300 ease-out
            hover:bg-black/80 hover:border-yellow-400/50 hover:text-yellow-400
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black/60
            disabled:hover:border-white/20 disabled:hover:text-white
            focus:outline-none focus:ring-2 focus:ring-yellow-400/50
            ${arrowClassName}
          `}
          aria-label="Scroll to previous items"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5"
          >
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>
      )}

      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className={`
          flex overflow-x-auto gap-3 sm:gap-4 lg:gap-6
          scrollbar-hide scroll-smooth
          ${isTouching ? 'cursor-grabbing' : 'cursor-grab'}
          ${isDragging ? 'select-none' : ''}
          transition-all duration-200
          ${containerClassName}
        `}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          // Add padding for arrows and edge previews
          paddingLeft: showArrows ? '48px' : (showEdgePreviews ? `${getEdgePreviewWidth()}px` : '0'),
          paddingRight: showArrows ? '48px' : (showEdgePreviews ? `${getEdgePreviewWidth()}px` : '0'),
          // Create edge preview effect with mask
          ...(showEdgePreviews && {
            maskImage: `linear-gradient(
              to right,
              transparent 0%,
              black ${getEdgePreviewWidth()}px,
              black calc(100% - ${getEdgePreviewWidth()}px),
              transparent 100%
            )`,
            WebkitMaskImage: `linear-gradient(
              to right,
              transparent 0%,
              black ${getEdgePreviewWidth()}px,
              black calc(100% - ${getEdgePreviewWidth()}px),
              transparent 100%
            )`
          })
        }}
      >
        {children}
      </div>

      {/* Edge Preview Overlays */}
      {showEdgePreviews && showScrollIndicators && (
        <>
          {/* Left Edge Preview Indicator */}
          {canScrollLeft && (
            <div 
              className="absolute left-0 top-0 bottom-0 pointer-events-none z-5"
              style={{ width: `${getEdgePreviewWidth()}px` }}
            >
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent flex items-center justify-start pl-1 sm:pl-2">
                <div className={`bg-white/20 rounded-full animate-pulse ${
                  screenSize === 'mobile' ? 'w-0.5 h-4' : 
                  screenSize === 'tablet' ? 'w-0.5 h-6' : 
                  'w-1 h-8'
                }`}></div>
              </div>
            </div>
          )}
          
          {/* Right Edge Preview Indicator */}
          {canScrollRight && (
            <div 
              className="absolute right-0 top-0 bottom-0 pointer-events-none z-5"
              style={{ width: `${getEdgePreviewWidth()}px` }}
            >
              <div className="w-full h-full bg-gradient-to-l from-transparent via-white/5 to-transparent flex items-center justify-end pr-1 sm:pr-2">
                <div className={`bg-white/20 rounded-full animate-pulse ${
                  screenSize === 'mobile' ? 'w-0.5 h-4' : 
                  screenSize === 'tablet' ? 'w-0.5 h-6' : 
                  'w-1 h-8'
                }`}></div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Right Arrow */}
      {showArrows && (
        <button
          onClick={scrollToNext}
          disabled={!canScrollRight || isScrolling}
          className={`
            absolute right-0 top-1/2 -translate-y-1/2 z-10
            w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12
            bg-black/60 backdrop-blur-sm border border-white/20
            text-white rounded-full
            flex items-center justify-center
            transition-all duration-300 ease-out
            hover:bg-black/80 hover:border-yellow-400/50 hover:text-yellow-400
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black/60
            disabled:hover:border-white/20 disabled:hover:text-white
            focus:outline-none focus:ring-2 focus:ring-yellow-400/50
            ${arrowClassName}
          `}
          aria-label="Scroll to next items"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5"
          >
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      )}

      {/* Touch Feedback Overlay */}
      {isTouching && isDragging && (
        <div className="absolute inset-0 bg-yellow-400/5 pointer-events-none z-20 rounded-lg transition-opacity duration-150" />
      )}

      {/* Scroll Indicators for Mobile */}
      {showScrollIndicators && !showArrows && (
        <div className="flex justify-center mt-2 gap-1 sm:hidden">
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
            canScrollLeft ? 'bg-white/40' : 'bg-white/20'
          }`}></div>
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
            canScrollRight ? 'bg-white/40' : 'bg-white/20'
          }`}></div>
        </div>
      )}

      {/* Touch Gesture Hint for Mobile */}
      {screenSize === 'mobile' && !isTouching && showScrollIndicators && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/60 pointer-events-none animate-pulse">
          Swipe to scroll
        </div>
      )}

      {/* Enhanced Edge Preview Shadows */}
      {showEdgePreviews && showScrollIndicators && (
        <>
          {/* Left Shadow Gradient */}
          {canScrollLeft && (
            <div 
              className="absolute left-0 top-0 bottom-0 pointer-events-none z-4"
              style={{ 
                width: `${getEdgePreviewWidth() * 1.5}px`,
                background: `linear-gradient(to right, 
                  rgba(0,0,0,0.3) 0%, 
                  rgba(0,0,0,0.1) 50%, 
                  transparent 100%
                )`
              }}
            />
          )}
          
          {/* Right Shadow Gradient */}
          {canScrollRight && (
            <div 
              className="absolute right-0 top-0 bottom-0 pointer-events-none z-4"
              style={{ 
                width: `${getEdgePreviewWidth() * 1.5}px`,
                background: `linear-gradient(to left, 
                  rgba(0,0,0,0.3) 0%, 
                  rgba(0,0,0,0.1) 50%, 
                  transparent 100%
                )`
              }}
            />
          )}
        </>
      )}

      {/* CSS Styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Touch-specific styles */
        .cursor-grab {
          cursor: grab;
        }
        .cursor-grabbing {
          cursor: grabbing;
        }
        
        /* Improve touch responsiveness */
        @media (hover: none) and (pointer: coarse) {
          .cursor-grab, .cursor-grabbing {
            cursor: default;
          }
        }
        
        /* Responsive edge preview adjustments */
        @media (max-width: 640px) {
          .edge-preview-mobile {
            width: 40px !important;
          }
        }
        
        @media (min-width: 641px) and (max-width: 1024px) {
          .edge-preview-tablet {
            width: 50px !important;
          }
        }
        
        /* Enhanced touch targets for mobile */
        @media (max-width: 640px) {
          .touch-target {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </div>
  );
};

export default HorizontalScroller;