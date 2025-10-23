/**
 * StackedCards Component
 * Displays movie posters in a stacked card format where one card is prominent
 * and others peek out behind it, creating a layered effect
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import StarRating from './StarRating';


const StackedCards = ({
  items = [],
  maxVisibleCards = 4,
  onCardClick,
  className = "",
  cardClassName = "",
  autoRotate = false,
  autoRotateInterval = 3000,
  posterSize = "medium", // "small", "medium", "large"
  titleSize = "medium", // "small", "medium", "large"
  onCurrentMovieChange // callback to notify parent of current movie
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Notify parent when current movie changes
  useEffect(() => {
    if (onCurrentMovieChange && items.length > 0) {
      onCurrentMovieChange(items[currentIndex]);
    }
  }, [currentIndex, items, onCurrentMovieChange]);

  // Auto-rotate functionality
  useEffect(() => {
    if (!autoRotate || items.length <= 1) return;

    const interval = setInterval(() => {
      nextCard();
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, autoRotateInterval, items.length, nextCard]);

  // Navigate to next card
  const nextCard = useCallback(() => {
    if (isAnimating || items.length <= 1) return;

    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % items.length);

    setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating, items.length]);

  // Navigate to previous card
  const previousCard = () => {
    if (isAnimating || items.length <= 1) return;

    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

    setTimeout(() => setIsAnimating(false), 300);
  };

  // Navigate to specific card
  const goToCard = (index) => {
    if (isAnimating || index === currentIndex) return;

    setIsAnimating(true);
    setCurrentIndex(index);

    setTimeout(() => setIsAnimating(false), 300);
  };

  // Handle card click
  const handleCardClick = (item, index) => {
    if (index === currentIndex) {
      // If clicking the front card, trigger the click handler
      if (onCardClick) {
        onCardClick(item, index);
      }
    } else {
      // If clicking a background card, bring it to front
      goToCard(index);
    }
  };

  // Get visible cards based on current index
  const getVisibleCards = () => {
    if (items.length === 0) return [];

    const visibleCards = [];
    const totalVisible = Math.min(maxVisibleCards, items.length);

    for (let i = 0; i < totalVisible; i++) {
      const itemIndex = (currentIndex + i) % items.length;
      visibleCards.push({
        item: items[itemIndex],
        originalIndex: itemIndex,
        stackIndex: i
      });
    }

    return visibleCards;
  };

  const visibleCards = getVisibleCards();

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center h-48 ${className}`}>
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">🎬</div>
          <p className="text-sm">No movies available</p>
        </div>
      </div>
    );
  }

  // Get poster dimensions based on size prop
  const getPosterDimensions = () => {
    switch (posterSize) {
      case 'large':
        return {
          containerHeight: 'h-[420px] sm:h-[450px] lg:h-[480px]',
          posterWidth: '240px',
          posterHeight: '360px',
          responsiveWidth: 'clamp(220px, 16vw, 260px)',
          responsiveHeight: 'clamp(330px, 24vw, 390px)'
        };
      case 'small':
        return {
          containerHeight: 'h-56 sm:h-64 lg:h-72',
          posterWidth: '144px',
          posterHeight: '216px',
          responsiveWidth: 'clamp(130px, 10vw, 160px)',
          responsiveHeight: 'clamp(195px, 15vw, 240px)'
        };
      case 'medium':
      default:
        return {
          containerHeight: 'h-80 sm:h-90 lg:h-100',
          posterWidth: '200px',
          posterHeight: '300px',
          responsiveWidth: '200px',
          responsiveHeight: '300px'
        };
    }
  };

  const { containerHeight, posterWidth, posterHeight, responsiveWidth, responsiveHeight } = getPosterDimensions();

  return (
    <div className={`relative ${className}`}>
      {/* Stacked Cards Container - Dynamic height based on poster size */}
      <div className={`relative ${containerHeight} w-full flex items-center justify-center`}>
        {visibleCards.map(({ item, originalIndex, stackIndex }) => {
          const isMainCard = stackIndex === 0;
          const zIndex = maxVisibleCards - stackIndex;

          // Calculate positioning for stacked effect
          const translateX = stackIndex * 8; // Offset each card slightly to the right
          const translateY = stackIndex * 4; // Offset each card slightly down
          const scale = 1 - (stackIndex * 0.05); // Scale down background cards slightly
          const opacity = 1 - (stackIndex * 0.15); // Fade background cards slightly
          const rotation = stackIndex * 2; // Slight rotation for depth

          return (
            <div
              key={`${originalIndex}-${stackIndex}`}
              className={`
                absolute cursor-pointer transition-all duration-300 ease-out
                ${isMainCard ? 'hover:scale-105' : 'hover:scale-102'}
                ${isAnimating ? 'transition-all duration-300' : ''}
                ${cardClassName}
              `}
              style={{
                zIndex,
                transform: `
                  translateX(${translateX}px) 
                  translateY(${translateY}px) 
                  scale(${scale}) 
                  rotate(${rotation}deg)
                `,
                opacity
              }}
              onClick={() => handleCardClick(item, originalIndex)}
            >
              {/* Movie Poster Card */}
              <div className="relative group">
                {item.movie?.poster || item.poster ? (
                  <Image
                    src={item.movie?.poster || item.poster}
                    alt={item.movie?.title || item.title || 'Movie poster'}
                    width={parseInt(responsiveWidth) || parseInt(posterWidth)}
                    height={parseInt(responsiveHeight) || parseInt(posterHeight)}
                    className={`
                      rounded-lg shadow-lg
                      ${isMainCard ? 'shadow-2xl border-2 border-yellow-400/30' : 'shadow-xl'}
                      transition-all duration-300
                    `}
                    style={{
                      width: responsiveWidth || posterWidth,
                      height: responsiveHeight || posterHeight,
                      objectFit: 'cover' // Maintain aspect ratio while filling container
                    }}
                  />
                ) : (
                  <div
                    className={`
                      bg-gray-700 rounded-lg flex items-center justify-center shadow-lg
                      ${isMainCard ? 'shadow-2xl border-2 border-yellow-400/30' : 'shadow-xl'}
                    `}
                    style={{
                      width: responsiveWidth || posterWidth,
                      height: responsiveHeight || posterHeight
                    }}
                  >
                    <span className="text-3xl">🎬</span>
                  </div>
                )}

                {/* Ranking Number - Only show for main card and if item has order property */}
                {isMainCard && typeof item.order === 'number' && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-yellow-400 text-sm font-bold px-2 py-1 rounded-md">
                    {item.order + 1}
                  </div>
                )}

                {/* Card Overlay for Main Card */}
                {isMainCard && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-2 left-2 right-2">
                      <h4 className="text-white text-sm font-medium truncate">
                        {item.movie?.title || item.title || 'Unknown'}
                      </h4>
                      {(item.movie?.year || item.year) && (
                        <p className="text-gray-300 text-xs">
                          {item.movie?.year || item.year}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Stack Indicator for Background Cards */}
                {!isMainCard && (
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full">
                    +{stackIndex}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Side Navigation Arrows - Positioned relative to poster container */}
        {items.length > 1 && (
          <>
            {/* Left Arrow */}
            <button
              onClick={previousCard}
              disabled={isAnimating}
              className="
                absolute -left-16 top-1/2 -translate-y-1/2 z-20
                sm:-left-16 left-12 sm:top-1/2 top-34
                w-12 h-12 text-white flex items-center justify-center
                bg-black/40 hover:bg-yellow-400 hover:text-black
                transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-yellow-400/50
                rounded-full
              "
              aria-label="Previous movie"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
            </button>

            {/* Right Arrow */}
            <button
              onClick={nextCard}
              disabled={isAnimating}
              className="
                absolute -right-16 top-1/2 -translate-y-1/2 z-20
                sm:-right-16 right-12 sm:top-1/2 top-34
                w-12 h-12 text-white flex items-center justify-center
                bg-black/40 hover:bg-yellow-400 hover:text-black
                transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-yellow-400/50
                rounded-full
              "
              aria-label="Next movie"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Current Movie Info */}
      {items.length > 0 && (
        <div className="text-center mt-10 sm:mt-2 flex flex-col items-center">
          <h4 className={`text-white font-semibold truncate max-w-[300px] mx-auto text-center ${titleSize === 'large' ? 'text-xl sm:text-2xl lg:text-3xl' :
            titleSize === 'medium' ? 'text-lg sm:text-xl lg:text-2xl' :
              'text-sm sm:text-base lg:text-lg'
            }`}>
            {items[currentIndex]?.movie?.title || items[currentIndex]?.title || 'Unknown Movie'}
          </h4>
          {(items[currentIndex]?.movie?.year || items[currentIndex]?.year) && (
            <p className={`text-gray-400 ${titleSize === 'large' ? 'text-sm sm:text-base' :
              titleSize === 'medium' ? 'text-xs sm:text-sm' :
                'text-xs'
              }`}>
              {items[currentIndex]?.movie?.year || items[currentIndex]?.year}
            </p>
          )}
          {items[currentIndex]?.rating && (
            <div className="flex justify-center mt-2">
              <StarRating rating={items[currentIndex].rating} size="large" />
            </div>
          )}
          {items[currentIndex]?.review && (
            <div className="mt-3 max-w-[280px] mx-auto">
              <p className={`text-gray-300 text-center italic leading-relaxed overflow-hidden ${titleSize === 'large' ? 'text-sm sm:text-base max-h-16' :
                titleSize === 'medium' ? 'text-xs sm:text-sm max-h-12' :
                  'text-xs max-h-10'
                }`}
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: titleSize === 'large' ? 4 : titleSize === 'medium' ? 3 : 2,
                  WebkitBoxOrient: 'vertical',
                  textOverflow: 'ellipsis'
                }}>
                &ldquo;{items[currentIndex].review}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      {/* Touch Gesture Hint for Mobile */}
      <div className="text-center mt-2 sm:hidden">
        <p className="text-xs text-gray-500">Tap cards to navigate</p>
      </div>
    </div>
  );
};

export default StackedCards;