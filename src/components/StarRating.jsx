/**
 * Enhanced StarRating Component
 * Supports full, half, and empty stars for fractional ratings
 * Accessible with proper ARIA labels
 */

import React from 'react';

const StarRating = ({ 
  rating, 
  maxStars = 5, 
  showHalfStars = true,
  size = 'medium',
  className = '' 
}) => {
  // Handle null/undefined ratings
  if (!rating || rating <= 0) return null;

  // Ensure rating is within bounds
  const normalizedRating = Math.min(Math.max(rating, 0), maxStars);
  
  // Calculate full stars, half stars, and empty stars
  const fullStars = Math.floor(normalizedRating);
  const hasHalfStar = showHalfStars && (normalizedRating % 1) >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  // Size classes for responsive design
  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-xs sm:text-sm lg:text-base',
    large: 'text-2xl sm:text-3xl lg:text-4xl'
  };

  const starSize = sizeClasses[size] || sizeClasses.medium;

  // Generate accessibility label
  const ariaLabel = `Rating: ${rating} out of ${maxStars} stars`;

  return (
    <div 
      className={`flex items-center gap-0.5 sm:gap-1 ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      {/* Full Stars */}
      {[...Array(fullStars)].map((_, i) => (
        <span 
          key={`full-${i}`} 
          className={`${starSize} text-yellow-400`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
      
      {/* Half Star */}
      {hasHalfStar && (
        <span 
          key="half" 
          className={`${starSize} relative text-gray-600`}
          aria-hidden="true"
        >
          <span className="absolute inset-0 overflow-hidden w-1/2 text-yellow-400">
            ★
          </span>
          ★
        </span>
      )}
      
      {/* Empty Stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <span 
          key={`empty-${i}`} 
          className={`${starSize} text-gray-600`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;