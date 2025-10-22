/**
 * LetterboxdService - Handles all Letterboxd data fetching and processing
 * Provides methods for diary entries, five-star movies, random watchlist, and movie lists
 */

class LetterboxdService {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    this.username = process.env.LETTERBOXD_USERNAME || 'jjola00';
  }

  /**
   * Get diary entries from Letterboxd RSS feed
   * @param {number} limit - Number of entries to return (default: 5)
   * @returns {Promise<Object>} Diary entries data
   */
  async getDiaryEntries(limit = 5) {
    try {
      const response = await fetch(`${this.baseUrl}/api/letterboxd/diary?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch diary entries');
      }

      return {
        success: true,
        data: data.data,
        metadata: data.metadata
      };
    } catch (error) {
      console.error('LetterboxdService: Failed to fetch diary entries:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get five-star rated movies from Letterboxd (filtered from diary)
   * @param {number} limit - Number of movies to return (default: 15)
   * @returns {Promise<Object>} Five-star movies data
   */
  async getFiveStarMovies(limit = 15) {
    try {
      const response = await fetch(`${this.baseUrl}/api/letterboxd/five-star-movies?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch five-star movies');
      }

      return {
        success: true,
        data: data.data,
        metadata: data.metadata
      };
    } catch (error) {
      console.error('LetterboxdService: Failed to fetch five-star movies:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get a random movie from the watchlist (CSV-based, super fast)
   * @returns {Promise<Object>} Random watchlist movie data
   */
  async getRandomWatchlistMovie() {
    try {
      const response = await fetch(`${this.baseUrl}/api/letterboxd/watchlist-random`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch random watchlist movie');
      }

      return {
        success: true,
        data: data.data,
        metadata: data.metadata
      };
    } catch (error) {
      console.error('LetterboxdService: Failed to fetch random watchlist movie:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Get movie lists metadata
   * @param {boolean} featured - Get only featured lists (with topstats tag)
   * @param {number} limit - Number of lists to return (default: 3)
   * @returns {Promise<Object>} Movie lists data
   */
  async getMovieLists(featured = false, limit = 3) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(featured && { featured: 'true' })
      });

      const response = await fetch(`${this.baseUrl}/api/letterboxd/lists?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch movie lists');
      }

      return {
        success: true,
        data: data.data,
        metadata: data.metadata
      };
    } catch (error) {
      console.error('LetterboxdService: Failed to fetch movie lists:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get all movie data for the movie section
   * @returns {Promise<Object>} Combined movie data
   */
  async getAllMovieData() {
    try {
      // Fetch all data in parallel for better performance
      const [diaryResult, fiveStarResult, randomMovieResult, listsResult] = await Promise.allSettled([
        this.getDiaryEntries(5),
        this.getFiveStarMovies(15),
        this.getRandomWatchlistMovie(),
        this.getMovieLists(false, 3)
      ]);

      return {
        diary: diaryResult.status === 'fulfilled' ? diaryResult.value : { success: false, data: [], error: diaryResult.reason?.message },
        fiveStarMovies: fiveStarResult.status === 'fulfilled' ? fiveStarResult.value : { success: false, data: [], error: fiveStarResult.reason?.message },
        randomMovie: randomMovieResult.status === 'fulfilled' ? randomMovieResult.value : { success: false, data: null, error: randomMovieResult.reason?.message },
        lists: listsResult.status === 'fulfilled' ? listsResult.value : { success: false, data: [], error: listsResult.reason?.message },
        fetchedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('LetterboxdService: Failed to fetch all movie data:', error);
      return {
        diary: { success: false, data: [], error: 'Failed to fetch diary entries' },
        fiveStarMovies: { success: false, data: [], error: 'Failed to fetch five-star movies' },
        randomMovie: { success: false, data: null, error: 'Failed to fetch random movie' },
        lists: { success: false, data: [], error: 'Failed to fetch movie lists' },
        fetchedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Refresh random watchlist movie (for "Pick Another" functionality)
   * @returns {Promise<Object>} New random movie data
   */
  async refreshRandomMovie() {
    return this.getRandomWatchlistMovie();
  }

  /**
   * Get service health status
   * @returns {Promise<Object>} Service health information
   */
  async getHealthStatus() {
    try {
      const startTime = Date.now();
      
      // Test the fastest endpoint (random movie)
      const testResult = await this.getRandomWatchlistMovie();
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: testResult.success,
        responseTime,
        services: {
          randomMovie: testResult.success,
          baseUrl: this.baseUrl,
          username: this.username
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        services: {
          randomMovie: false,
          baseUrl: this.baseUrl,
          username: this.username
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create and export a singleton instance
const letterboxdService = new LetterboxdService();

export default letterboxdService;