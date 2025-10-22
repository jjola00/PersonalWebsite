/**
 * ExternalLinks Component
 * Displays prominent links to Letterboxd profile and watchlist
 */

"use client";

import React from 'react';

const ExternalLinks = ({ 
  username, 
  className = "",
  variant = "horizontal" // "horizontal" or "vertical"
}) => {
  if (!username) return null;

  const profileUrl = `https://letterboxd.com/${username}/`;
  const watchlistUrl = `https://letterboxd.com/${username}/watchlist/`;

  const linkBaseClasses = `
    flex items-center justify-center gap-2 px-4 py-3 rounded-lg 
    font-medium text-sm transition-all duration-300 
    touch-target focus:outline-none focus:ring-2 focus:ring-yellow-400/50
  `;

  const watchlistClasses = `
    ${linkBaseClasses}
    bg-yellow-400 text-black hover:bg-yellow-300 
    hover:scale-105 active:scale-95
  `;

  const profileClasses = `
    ${linkBaseClasses}
    bg-white/10 text-white border border-white/20 
    hover:bg-white/20 hover:border-yellow-400/50 hover:text-yellow-400
    hover:scale-105 active:scale-95
  `;

  const containerClasses = variant === "horizontal" 
    ? "flex gap-3 sm:gap-4" 
    : "flex flex-col gap-2 sm:gap-3";

  return (
    <div className={`${containerClasses} ${className}`}>
      {/* Watchlist Link - Primary CTA */}
      <a
        href={watchlistUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={watchlistClasses}
        aria-label={`View ${username}'s watchlist on Letterboxd`}
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
          className="flex-shrink-0"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
        </svg>
        <span>Watchlist</span>
      </a>

      {/* Profile Link - Secondary CTA */}
      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={profileClasses}
        aria-label={`View ${username}'s profile on Letterboxd`}
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
          className="flex-shrink-0"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>My Letterboxd</span>
      </a>
    </div>
  );
};

export default ExternalLinks;