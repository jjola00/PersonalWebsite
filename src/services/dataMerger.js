/**
 * DataMerger - Handles merging and fallback logic between different data sources
 * Combines Letterboxd RSS data with TMDB enhancements and provides fallback mechanisms
 */

import tmdbService from './tmdbService.js';

class DataMerger {
  constructor() {
    this.fallbackAttempts = 0;
    this.maxFallbackAttempts = 3;
  }

  /**
   * Enhance movie data by merging Letterboxd and TMDB information
   * @param {Object} letterboxdData - Movie data from Letterboxd RSS
   * @param {boolean} forceEnhancement - Force TMDB enhancement even if poster exists
   * @returns {Promise<Object>} Enhanced movie data
   */
  async enhanceMovieData(letterboxdData, forceEnhancement = false) {
    try {
      // If movie already has good poster and we're not forcing enhancement, return as-is
      if (!forceEnhancement && letterboxdData.movie?.poster && letterboxdData.movie.poster.includes('ltrbxd.com')) {
        return {
          success: true,
          data: letterboxdData,
          enhanced: false,
          source: 'letterboxd-only'
        };
      }

      // Extract movie info for TMDB search
      const movieInfo = letterboxdData.movie || letterboxdData;
      
      if (!movieInfo.title || !movieInfo.year) {
        return {
          success: true,
          data: letterboxdData,
          enhanced: false,
          source: 'letterboxd-only',
          warning: 'Missing title or year for TMDB enhancement'
        };
      }

      // Enhance with TMDB data
      const enhancementResult = await tmdbService.enhanceMovieData({
        title: movieInfo.title,
        year: movieInfo.year
      });

      if (!enhancementResult.success) {
        return {
          success: true,
          data: letterboxdData,
          enhanced: false,
          source: 'letterboxd-only',
          enhancementError: enhancementResult.error
        };
      }

      // Merge the data, prioritizing Letterboxd data for user-specific info
      const mergedData = this._mergeMovieData(letterboxdData, enhancementResult.data);

      return {
        success: true,
        data: mergedData,
        enhanced: true,
        source: 'letterboxd-tmdb-merged',
        enhancementLevel: enhancementResult.data.enhancementLevel
      };

    } catch (error) {
      console.error('DataMerger: Failed to enhance movie data:', error);
      return {
        success: true,
        data: letterboxdData,
        enhanced: false,
        source: 'letterboxd-only',
        error: error.message
      };
    }
  }

  /**
   * Fallback to TMDB when Letterboxd RSS fails
   * @param {string} movieTitle - Movie title to search for
   * @param {number} movieYear - Movie release year
   * @returns {Promise<Object>} Fallback movie data
   */
  async fallbackToTMDB(movieTitle, movieYear) {
    try {
      this.fallbackAttempts++;

      if (this.fallbackAttempts > this.maxFallbackAttempts) {
        throw new Error('Maximum fallback attempts exceeded');
      }

      console.warn(`DataMerger: Falling back to TMDB for ${movieTitle} (${movieYear})`);

      const searchResult = await tmdbService.searchMovie(movieTitle, movieYear);

      if (!searchResult.success || searchResult.data.results.length === 0) {
        throw new Error('Movie not found in TMDB fallback');
      }

      const tmdbMovie = searchResult.data.results[0];

      // Get detailed information
      const detailsResult = await tmdbService.getMovieDetails(tmdbMovie.tmdbId);

      const movieData = detailsResult.success ? detailsResult.data : tmdbMovie;

      // Format as Letterboxd-style data structure
      const fallbackData = {
        id: `tmdb-fallback-${movieData.tmdbId}`,
        movie: {
          title: movieData.title,
          year: movieData.year,
          poster: movieData.poster,
          posterOriginal: movieData.posterOriginal,
          letterboxdUrl: null, // No Letterboxd URL available
          source: 'tmdb-fallback',
          tmdbId: movieData.tmdbId,
          overview: movieData.overview,
          voteAverage: movieData.voteAverage,
          genres: movieData.genres
        },
        source: 'tmdb-fallback',
        fallbackReason: 'letterboxd-rss-unavailable'
      };

      return {
        success: true,
        data: fallbackData,
        source: 'tmdb-fallback',
        fallbackAttempt: this.fallbackAttempts
      };

    } catch (error) {
      console.error('DataMerger: TMDB fallback failed:', error);
      return {
        success: false,
        error: error.message,
        data: null,
        fallbackAttempt: this.fallbackAttempts
      };
    }
  }

  /**
   * Merge Letterboxd and TMDB movie data, prioritizing user-specific Letterboxd info
   * @private
   * @param {Object} letterboxdData - Original Letterboxd data
   * @param {Object} tmdbData - Enhanced TMDB data
   * @returns {Object} Merged movie data
   */
  _mergeMovieData(letterboxdData, tmdbData) {
    const originalMovie = letterboxdData.movie || letterboxdData;
    
    // Create merged movie object
    const mergedMovie = {
      // Letterboxd data takes priority for user-specific info
      ...originalMovie,
      
      // TMDB enhancements (only if not already present or better quality)
      poster: this._chooseBestPoster(originalMovie.poster, tmdbData.poster),
      posterOriginal: tmdbData.posterOriginal || originalMovie.posterOriginal,
      backdrop: tmdbData.backdrop || originalMovie.backdrop,
      overview: tmdbData.overview || originalMovie.overview,
      tmdbId: tmdbData.tmdbId || originalMovie.tmdbId,
      voteAverage: tmdbData.voteAverage || originalMovie.voteAverage,
      genres: tmdbData.genres || originalMovie.genres,
      runtime: tmdbData.runtime || originalMovie.runtime,
      cast: tmdbData.cast || originalMovie.cast,
      crew: tmdbData.crew || originalMovie.crew,
      
      // Mark as enhanced
      enhanced: true,
      sources: ['letterboxd', 'tmdb']
    };

    // Return the same structure as input, but with enhanced movie data
    if (letterboxdData.movie) {
      return {
        ...letterboxdData,
        movie: mergedMovie
      };
    } else {
      return mergedMovie;
    }
  }

  /**
   * Choose the best poster between Letterboxd and TMDB
   * @private
   * @param {string} letterboxdPoster - Letterboxd poster URL
   * @param {string} tmdbPoster - TMDB poster URL
   * @returns {string} Best poster URL
   */
  _chooseBestPoster(letterboxdPoster, tmdbPoster) {
    // If no TMDB poster, use Letterboxd
    if (!tmdbPoster) return letterboxdPoster;
    
    // If no Letterboxd poster, use TMDB
    if (!letterboxdPoster) return tmdbPoster;
    
    // If Letterboxd poster is low quality (resized), prefer TMDB
    if (letterboxdPoster.includes('resized') && tmdbPoster.includes('w500')) {
      return tmdbPoster;
    }
    
    // Otherwise, keep Letterboxd poster (user's preference)
    return letterboxdPoster;
  }

  /**
   * Validate and sanitize movie data
   * @param {Object} movieData - Movie data to validate
   * @returns {Object} Validated and sanitized movie data
   */
  validateMovieData(movieData) {
    try {
      const movie = movieData.movie || movieData;
      
      // Required fields validation
      const requiredFields = ['title', 'year'];
      const missingFields = requiredFields.filter(field => !movie[field]);
      
      if (missingFields.length > 0) {
        return {
          valid: false,
          errors: [`Missing required fields: ${missingFields.join(', ')}`],
          data: movieData
        };
      }

      // Data sanitization
      const sanitizedMovie = {
        ...movie,
        title: this._sanitizeString(movie.title),
        year: parseInt(movie.year) || null,
        rating: movie.rating ? Math.max(0, Math.min(5, parseInt(movie.rating))) : null,
        poster: this._sanitizeUrl(movie.poster),
        letterboxdUrl: this._sanitizeUrl(movie.letterboxdUrl),
        overview: this._sanitizeString(movie.overview, 1000), // Limit overview length
      };

      // Return sanitized data in same structure
      const sanitizedData = movieData.movie 
        ? { ...movieData, movie: sanitizedMovie }
        : sanitizedMovie;

      return {
        valid: true,
        errors: [],
        data: sanitizedData
      };

    } catch (error) {
      return {
        valid: false,
        errors: [`Validation error: ${error.message}`],
        data: movieData
      };
    }
  }

  /**
   * Sanitize string input
   * @private
   * @param {string} str - String to sanitize
   * @param {number} maxLength - Maximum length (optional)
   * @returns {string} Sanitized string
   */
  _sanitizeString(str, maxLength = null) {
    if (!str || typeof str !== 'string') return '';
    
    let sanitized = str.trim();
    
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength).trim() + '...';
    }
    
    return sanitized;
  }

  /**
   * Sanitize URL input
   * @private
   * @param {string} url - URL to sanitize
   * @returns {string|null} Sanitized URL or null
   */
  _sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return null;
    
    try {
      const sanitized = url.trim();
      // Basic URL validation
      if (sanitized.startsWith('http://') || sanitized.startsWith('https://')) {
        return sanitized;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Reset fallback attempt counter
   */
  resetFallbackAttempts() {
    this.fallbackAttempts = 0;
  }

  /**
   * Get merger statistics
   * @returns {Object} Merger statistics
   */
  getStats() {
    return {
      fallbackAttempts: this.fallbackAttempts,
      maxFallbackAttempts: this.maxFallbackAttempts,
      timestamp: new Date().toISOString()
    };
  }
}

// Create and export a singleton instance
const dataMerger = new DataMerger();

export default dataMerger;