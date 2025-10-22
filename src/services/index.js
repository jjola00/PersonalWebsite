/**
 * Movie Services Index
 * Exports all movie-related services for easy importing
 */

export { default as letterboxdService } from './letterboxdService.js';
export { default as tmdbService } from './tmdbService.js';
export { default as dataMerger } from './dataMerger.js';
export { default as cacheService } from './cacheService.js';

// Re-export for convenience
import letterboxdService from './letterboxdService.js';
import tmdbService from './tmdbService.js';
import dataMerger from './dataMerger.js';
import cacheService from './cacheService.js';

/**
 * Movie Services Manager - Provides a unified interface to all movie services
 */
export class MovieServicesManager {
  constructor() {
    this.letterboxd = letterboxdService;
    this.tmdb = tmdbService;
    this.dataMerger = dataMerger;
    this.cache = cacheService;
  }

  /**
   * Get all movie data with caching and enhancement
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} Complete movie data
   */
  async getAllMovieData(options = {}) {
    const {
      useCache = true,
      enhanceWithTMDB = false,
      clearExpiredCache = true
    } = options;

    try {
      // Clear expired cache entries
      if (clearExpiredCache) {
        this.cache.clearExpired();
      }

      // Check cache first if enabled
      if (useCache) {
        const cachedData = this._getCachedAllMovieData();
        if (cachedData) {
          return {
            ...cachedData,
            fromCache: true,
            timestamp: new Date().toISOString()
          };
        }
      }

      // Fetch fresh data
      const movieData = await this.letterboxd.getAllMovieData();

      // Enhance with TMDB if requested
      if (enhanceWithTMDB && movieData.diary.success) {
        try {
          const enhancedDiary = await this._enhanceDiaryEntries(movieData.diary.data);
          movieData.diary.data = enhancedDiary;
          movieData.diary.enhanced = true;
        } catch (error) {
          console.warn('MovieServicesManager: Failed to enhance diary entries:', error);
        }
      }

      // Cache the results
      if (useCache) {
        this._cacheAllMovieData(movieData);
      }

      return {
        ...movieData,
        fromCache: false,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('MovieServicesManager: Failed to get all movie data:', error);
      return {
        diary: { success: false, data: [], error: error.message },
        fiveStarMovies: { success: false, data: [], error: error.message },
        randomMovie: { success: false, data: null, error: error.message },
        lists: { success: false, data: [], error: error.message },
        fromCache: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get cached all movie data
   * @private
   * @returns {Object|null} Cached movie data or null
   */
  _getCachedAllMovieData() {
    // For now, we'll cache individual components
    // In the future, we could cache the entire result
    return null;
  }

  /**
   * Cache all movie data
   * @private
   * @param {Object} movieData - Movie data to cache
   */
  _cacheAllMovieData(movieData) {
    // Cache individual components
    if (movieData.diary.success) {
      this.cache.cacheDiaryEntries('jjola00', 5, movieData.diary);
    }
    if (movieData.fiveStarMovies.success) {
      this.cache.cacheFiveStarMovies('jjola00', 15, movieData.fiveStarMovies);
    }
    if (movieData.randomMovie.success) {
      this.cache.cacheRandomWatchlistMovie(movieData.randomMovie);
    }
    if (movieData.lists.success) {
      this.cache.cacheMovieLists(false, 3, movieData.lists);
    }
  }

  /**
   * Enhance diary entries with TMDB data
   * @private
   * @param {Array} diaryEntries - Diary entries to enhance
   * @returns {Promise<Array>} Enhanced diary entries
   */
  async _enhanceDiaryEntries(diaryEntries) {
    const enhanced = [];
    
    for (const entry of diaryEntries.slice(0, 3)) { // Limit to first 3 for performance
      try {
        const enhancementResult = await this.dataMerger.enhanceMovieData(entry);
        enhanced.push(enhancementResult.success ? enhancementResult.data : entry);
      } catch (error) {
        console.warn('Failed to enhance diary entry:', error);
        enhanced.push(entry);
      }
    }

    // Add remaining entries without enhancement
    enhanced.push(...diaryEntries.slice(3));
    
    return enhanced;
  }

  /**
   * Get service health status
   * @returns {Promise<Object>} Health status of all services
   */
  async getHealthStatus() {
    try {
      const [letterboxdHealth, tmdbHealth] = await Promise.allSettled([
        this.letterboxd.getHealthStatus(),
        this.tmdb.getHealthStatus()
      ]);

      const cacheStats = this.cache.getStats();
      const dataMergerStats = this.dataMerger.getStats();

      return {
        healthy: letterboxdHealth.status === 'fulfilled' && letterboxdHealth.value.healthy,
        services: {
          letterboxd: letterboxdHealth.status === 'fulfilled' ? letterboxdHealth.value : { healthy: false, error: letterboxdHealth.reason?.message },
          tmdb: tmdbHealth.status === 'fulfilled' ? tmdbHealth.value : { healthy: false, error: tmdbHealth.reason?.message },
          cache: { healthy: true, ...cacheStats },
          dataMerger: { healthy: true, ...dataMergerStats }
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Clear all caches
   */
  clearAllCaches() {
    this.cache.clearAll();
    this.dataMerger.resetFallbackAttempts();
  }
}

// Create and export a singleton instance
export const movieServices = new MovieServicesManager();

export default movieServices;