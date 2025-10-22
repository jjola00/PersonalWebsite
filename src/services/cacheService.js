/**
 * CacheService - Handles caching for movie data with different TTL strategies
 * Provides localStorage caching for RSS feeds and TMDB API responses
 */

class CacheService {
  constructor() {
    this.isClient = typeof window !== 'undefined';
    this.memoryCache = new Map(); // Fallback for server-side or when localStorage unavailable
    
    // Cache TTL configurations (in milliseconds)
    this.ttlConfig = {
      rss: 15 * 60 * 1000,      // 15 minutes for RSS feeds
      tmdb: 60 * 60 * 1000,     // 1 hour for TMDB API responses
      watchlist: 24 * 60 * 60 * 1000, // 24 hours for watchlist (rarely changes)
      lists: 6 * 60 * 60 * 1000, // 6 hours for movie lists metadata
      default: 30 * 60 * 1000    // 30 minutes default
    };

    // Cache key prefixes
    this.keyPrefixes = {
      diary: 'letterboxd_diary_',
      fivestar: 'letterboxd_fivestar_',
      watchlist: 'letterboxd_watchlist_',
      lists: 'letterboxd_lists_',
      tmdb_search: 'tmdb_search_',
      tmdb_details: 'tmdb_details_',
      enhanced: 'enhanced_movie_'
    };
  }

  /**
   * Generate cache key with prefix and parameters
   * @private
   * @param {string} prefix - Cache key prefix
   * @param {string|Object} params - Parameters to include in key
   * @returns {string} Generated cache key
   */
  _generateKey(prefix, params) {
    if (typeof params === 'object') {
      params = JSON.stringify(params);
    }
    return `${prefix}${params}`;
  }

  /**
   * Get item from cache
   * @param {string} key - Cache key
   * @returns {Object|null} Cached data or null if not found/expired
   */
  get(key) {
    try {
      // Try localStorage first (client-side)
      if (this.isClient && window.localStorage) {
        const cached = localStorage.getItem(key);
        if (cached) {
          const parsedData = JSON.parse(cached);
          
          // Check if expired
          if (Date.now() > parsedData.expiresAt) {
            localStorage.removeItem(key);
            return null;
          }
          
          return parsedData.data;
        }
      }

      // Fallback to memory cache
      if (this.memoryCache.has(key)) {
        const cached = this.memoryCache.get(key);
        
        // Check if expired
        if (Date.now() > cached.expiresAt) {
          this.memoryCache.delete(key);
          return null;
        }
        
        return cached.data;
      }

      return null;
    } catch (error) {
      console.warn('CacheService: Failed to get cached item:', error);
      return null;
    }
  }

  /**
   * Set item in cache with TTL
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set(key, data, ttl = null) {
    try {
      const expiresAt = Date.now() + (ttl || this.ttlConfig.default);
      const cacheItem = {
        data,
        expiresAt,
        cachedAt: Date.now()
      };

      // Try localStorage first (client-side)
      if (this.isClient && window.localStorage) {
        try {
          localStorage.setItem(key, JSON.stringify(cacheItem));
          return;
        } catch (localStorageError) {
          // localStorage might be full or unavailable, fall back to memory
          console.warn('CacheService: localStorage unavailable, using memory cache');
        }
      }

      // Fallback to memory cache
      this.memoryCache.set(key, cacheItem);

      // Limit memory cache size to prevent memory leaks
      if (this.memoryCache.size > 100) {
        const firstKey = this.memoryCache.keys().next().value;
        this.memoryCache.delete(firstKey);
      }

    } catch (error) {
      console.warn('CacheService: Failed to set cached item:', error);
    }
  }

  /**
   * Cache diary entries
   * @param {string} username - Letterboxd username
   * @param {number} limit - Number of entries
   * @param {*} data - Diary data to cache
   */
  cacheDiaryEntries(username, limit, data) {
    const key = this._generateKey(this.keyPrefixes.diary, `${username}_${limit}`);
    this.set(key, data, this.ttlConfig.rss);
  }

  /**
   * Get cached diary entries
   * @param {string} username - Letterboxd username
   * @param {number} limit - Number of entries
   * @returns {*} Cached diary data or null
   */
  getCachedDiaryEntries(username, limit) {
    const key = this._generateKey(this.keyPrefixes.diary, `${username}_${limit}`);
    return this.get(key);
  }

  /**
   * Cache five-star movies
   * @param {string} username - Letterboxd username
   * @param {number} limit - Number of movies
   * @param {*} data - Five-star movies data to cache
   */
  cacheFiveStarMovies(username, limit, data) {
    const key = this._generateKey(this.keyPrefixes.fivestar, `${username}_${limit}`);
    this.set(key, data, this.ttlConfig.rss);
  }

  /**
   * Get cached five-star movies
   * @param {string} username - Letterboxd username
   * @param {number} limit - Number of movies
   * @returns {*} Cached five-star movies data or null
   */
  getCachedFiveStarMovies(username, limit) {
    const key = this._generateKey(this.keyPrefixes.fivestar, `${username}_${limit}`);
    return this.get(key);
  }

  /**
   * Cache random watchlist movie
   * @param {*} data - Random movie data to cache
   */
  cacheRandomWatchlistMovie(data) {
    const key = this._generateKey(this.keyPrefixes.watchlist, 'random');
    // Short TTL for random movies to ensure variety
    this.set(key, data, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Get cached random watchlist movie
   * @returns {*} Cached random movie data or null
   */
  getCachedRandomWatchlistMovie() {
    const key = this._generateKey(this.keyPrefixes.watchlist, 'random');
    return this.get(key);
  }

  /**
   * Cache movie lists
   * @param {boolean} featured - Whether featured lists
   * @param {number} limit - Number of lists
   * @param {*} data - Lists data to cache
   */
  cacheMovieLists(featured, limit, data) {
    const key = this._generateKey(this.keyPrefixes.lists, `${featured}_${limit}`);
    this.set(key, data, this.ttlConfig.lists);
  }

  /**
   * Get cached movie lists
   * @param {boolean} featured - Whether featured lists
   * @param {number} limit - Number of lists
   * @returns {*} Cached lists data or null
   */
  getCachedMovieLists(featured, limit) {
    const key = this._generateKey(this.keyPrefixes.lists, `${featured}_${limit}`);
    return this.get(key);
  }

  /**
   * Cache TMDB search results
   * @param {string} title - Movie title
   * @param {number} year - Movie year
   * @param {*} data - Search results to cache
   */
  cacheTMDBSearch(title, year, data) {
    const key = this._generateKey(this.keyPrefixes.tmdb_search, `${title}_${year}`);
    this.set(key, data, this.ttlConfig.tmdb);
  }

  /**
   * Get cached TMDB search results
   * @param {string} title - Movie title
   * @param {number} year - Movie year
   * @returns {*} Cached search results or null
   */
  getCachedTMDBSearch(title, year) {
    const key = this._generateKey(this.keyPrefixes.tmdb_search, `${title}_${year}`);
    return this.get(key);
  }

  /**
   * Cache TMDB movie details
   * @param {number} movieId - TMDB movie ID
   * @param {*} data - Movie details to cache
   */
  cacheTMDBDetails(movieId, data) {
    const key = this._generateKey(this.keyPrefixes.tmdb_details, movieId.toString());
    this.set(key, data, this.ttlConfig.tmdb);
  }

  /**
   * Get cached TMDB movie details
   * @param {number} movieId - TMDB movie ID
   * @returns {*} Cached movie details or null
   */
  getCachedTMDBDetails(movieId) {
    const key = this._generateKey(this.keyPrefixes.tmdb_details, movieId.toString());
    return this.get(key);
  }

  /**
   * Cache enhanced movie data
   * @param {string} movieTitle - Movie title
   * @param {number} movieYear - Movie year
   * @param {*} data - Enhanced movie data to cache
   */
  cacheEnhancedMovie(movieTitle, movieYear, data) {
    const key = this._generateKey(this.keyPrefixes.enhanced, `${movieTitle}_${movieYear}`);
    this.set(key, data, this.ttlConfig.tmdb);
  }

  /**
   * Get cached enhanced movie data
   * @param {string} movieTitle - Movie title
   * @param {number} movieYear - Movie year
   * @returns {*} Cached enhanced movie data or null
   */
  getCachedEnhancedMovie(movieTitle, movieYear) {
    const key = this._generateKey(this.keyPrefixes.enhanced, `${movieTitle}_${movieYear}`);
    return this.get(key);
  }

  /**
   * Clear all cache
   */
  clearAll() {
    try {
      // Clear localStorage
      if (this.isClient && window.localStorage) {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && Object.values(this.keyPrefixes).some(prefix => key.startsWith(prefix))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }

      // Clear memory cache
      this.memoryCache.clear();

    } catch (error) {
      console.warn('CacheService: Failed to clear cache:', error);
    }
  }

  /**
   * Clear expired cache entries
   */
  clearExpired() {
    try {
      const now = Date.now();

      // Clear expired localStorage entries
      if (this.isClient && window.localStorage) {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && Object.values(this.keyPrefixes).some(prefix => key.startsWith(prefix))) {
            try {
              const cached = JSON.parse(localStorage.getItem(key));
              if (now > cached.expiresAt) {
                keysToRemove.push(key);
              }
            } catch (error) {
              // Invalid JSON, remove it
              keysToRemove.push(key);
            }
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }

      // Clear expired memory cache entries
      for (const [key, cached] of this.memoryCache.entries()) {
        if (now > cached.expiresAt) {
          this.memoryCache.delete(key);
        }
      }

    } catch (error) {
      console.warn('CacheService: Failed to clear expired cache:', error);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    let localStorageCount = 0;
    let localStorageSize = 0;

    try {
      if (this.isClient && window.localStorage) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && Object.values(this.keyPrefixes).some(prefix => key.startsWith(prefix))) {
            localStorageCount++;
            localStorageSize += localStorage.getItem(key).length;
          }
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return {
      localStorage: {
        available: this.isClient && !!window.localStorage,
        itemCount: localStorageCount,
        estimatedSize: localStorageSize
      },
      memoryCache: {
        itemCount: this.memoryCache.size,
        maxSize: 100
      },
      ttlConfig: this.ttlConfig,
      timestamp: new Date().toISOString()
    };
  }
}

// Create and export a singleton instance
const cacheService = new CacheService();

export default cacheService;