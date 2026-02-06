"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const InfiniteCarousel = ({ items, direction = 'left', speed = 20 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const [isInView, setIsInView] = useState(false);
  const carouselRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (carouselRef.current) observer.observe(carouselRef.current);
    return () => observer.disconnect();
  }, []);

  const extendedItems = [...items, ...items];
  
  const animationClass = direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right';
  const animationDuration = `${speed}s`;

  const handleLogoClick = (itemName) => {
    setShowTooltip(itemName);
    setTimeout(() => setShowTooltip(null), 2000); // Hide after 2 seconds
  };

  return (
    <div
      ref={carouselRef}
      className="w-full overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex items-center gap-4 sm:gap-6 md:gap-8 ${animationClass} ${isHovered || !isInView ? 'paused' : ''}`}
        style={{
          animationDuration,
          width: 'fit-content'
        }}
      >
        {/* Render extended items - no dashes, just logos */}
        {extendedItems.map((item, index) => (
          <Image
            key={`logo-${index}`}
            src={item.logo}
            alt={item.alt}
            title={item.name}
            width={80}
            height={80}
            onClick={() => handleLogoClick(item.name)}
            className="
              w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20
              object-cover object-center
              filter grayscale hover:grayscale-0
              transition-all duration-300 ease-in-out
              hover:scale-110
              cursor-pointer
              rounded-lg
              flex-shrink-0
            "
          />
        ))}
      </div>

      {/* Mobile tooltip */}
      {showTooltip && (
        <div className="
          fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50
          bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg
          text-sm font-medium
          animate-fade-in-out
          sm:hidden
        ">
          {showTooltip}
        </div>
      )}


    </div>
  );
};

export default InfiniteCarousel;
