/**
 * TMDBService - Handles TMDB API interactions for movie metadata and posters
 * Provides methods for movie search, details, and high-quality poster retrieval
 */

class TMDBService {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    this.rateLimitDelay = 250; // 4 requests per second to respect TMDB limits
    this.lastRequestTime = 0;
  }

  /**
   * Add delay between requests to respect TMDB rate limits
   * @private
   */
  async _rateLimitDelay() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Search for movies by title and year
   * @param {string} title - Movie title to search for
   * @param {number} year - Release year (optional)
   * @param {number} page - Page number for pagination (default: 1)
   * @returns {Promise<Object>} Search results
   */
  async searchMovie(title, year = null, page = 1) {
    try {
      await this._rateLimitDelay();

      const params = new URLSearchParams({
        query: title,
        page: page.toString(),
        ...(year && { year: year.toString() })
      });

      const response = await fetch(`${this.baseUrl}/api/tmdb/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to search movies');
      }

      return {
        success: true,
        data: data.data,
        metadata: data.metadata
      };
    } catch (error) {
      console.error('TMDBService: Failed to search movies:', error);
      return {
        success: false,
        error: error.message,
        data: { results: [], page: 1, totalPages: 0, totalResults: 0 }
      };
    }
  }

  /**
   * Get detailed movie information by TMDB ID
   * @param {number} movieId - TMDB movie ID
   * @param {string} appendToResponse - Additional data to include (default: 'credits,images,videos')
   * @returns {Promise<Object>} Movie details
   */
  async getMovieDetails(movieId, appendToResponse = 'credits,images,videos') {
    try {
      await this._rateLimitDelay();

      const params = new URLSearchParams({
        id: movieId.toString(),
        append_to_response: appendToResponse
      });

      const response = await fetch(`${this.baseUrl}/api/tmdb/movie-details?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch movie details');
      }

      return {
        success: true,
        data: data.data,
        metadata: data.metadata
      };
    } catch (error) {
      console.error('TMDBService: Failed to fetch movie details:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Get high-quality poster URL for a movie
   * @param {number} movieId - TMDB movie ID
   * @param {string} size - Poster size ('w500', 'w780', 'original')
   * @returns {Promise<Object>} Poster URL data
   */
  async getHighQualityPoster(movieId, size = 'w500') {
    try {
      const movieDetails = await this.getMovieDetails(movieId, 'images');
      
      if (!movieDetails.success || !movieDetails.data) {
        throw new Error('Failed to fetch movie details for poster');
      }

      const movie = movieDetails.data;
      
      // Get the best poster URL
      let posterUrl = null;
      
      if (movie.poster) {
        posterUrl = movie.poster; // Already formatted URL from our API
      } else if (movie.images && movie.images.posters && movie.images.posters.length > 0) {
        // Use the highest rated poster from additional images
        const bestPoster = movie.images.posters
          .sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0))[0];
        posterUrl = bestPoster.filePath;
      }

      return {
        success: true,
        data: {
          movieId,
          posterUrl,
          originalPoster: movie.posterOriginal || null,
          alternativePosters: movie.images?.posters || []
        }
      };
    } catch (error) {
      console.error('TMDBService: Failed to get high-quality poster:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Enhance movie data with TMDB information
   * @param {Object} movie - Basic movie data (title, year)
   * @returns {Promise<Object>} Enhanced movie data
   */
  async enhanceMovieData(movie) {
    try {
      if (!movie.title || !movie.year) {
        throw new Error('Movie title and year are required for enhancement');
      }

      // Search for the movie first
      const searchResult = await this.searchMovie(movie.title, movie.year);
      
      if (!searchResult.success || searchResult.data.results.length === 0) {
        return {
          success: false,
          error: 'Movie not found in TMDB',
          data: movie // Return original data
        };
      }

      // Get the best match (first result)
      const tmdbMovie = searchResult.data.results[0];
      
      // Get detailed information
      const detailsResult = await this.getMovieDetails(tmdbMovie.tmdbId);
      
      if (!detailsResult.success) {
        // Return basic enhanced data from search
        return {
          success: true,
          data: {
            ...movie,
            ...tmdbMovie,
            enhanced: true,
            enhancementLevel: 'basic'
          }
        };
      }

      // Return fully enhanced data
      return {
        success: true,
        data: {
          ...movie,
          ...detailsResult.data,
          enhanced: true,
          enhancementLevel: 'full'
        }
      };
    } catch (error) {
      console.error('TMDBService: Failed to enhance movie data:', error);
      return {
        success: false,
        error: error.message,
        data: movie // Return original data on error
      };
    }
  }

  /**
   * Batch enhance multiple movies (with rate limiting)
   * @param {Array} movies - Array of movie objects to enhance
   * @param {number} maxConcurrent - Maximum concurrent requests (default: 3)
   * @returns {Promise<Array>} Array of enhanced movie results
   */
  async batchEnhanceMovies(movies, maxConcurrent = 3) {
    try {
      const results = [];
      
      // Process movies in batches to respect rate limits
      for (let i = 0; i < movies.length; i += maxConcurrent) {
        const batch = movies.slice(i, i + maxConcurrent);
        
        const batchPromises = batch.map(movie => this.enhanceMovieData(movie));
        const batchResults = await Promise.allSettled(batchPromises);
        
        // Process batch results
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            results.push({
              success: false,
              error: result.reason?.message || 'Enhancement failed',
              data: batch[index] // Return original movie data
            });
          }
        });

        // Add delay between batches
        if (i + maxConcurrent < movies.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return results;
    } catch (error) {
      console.error('TMDBService: Failed to batch enhance movies:', error);
      return movies.map(movie => ({
        success: false,
        error: error.message,
        data: movie
      }));
    }
  }

  /**
   * Get service health status
   * @returns {Promise<Object>} Service health information
   */
  async getHealthStatus() {
    try {
      const startTime = Date.now();
      
      // Test with a simple search
      const testResult = await this.searchMovie('The Matrix', 1999);
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: testResult.success,
        responseTime,
        rateLimitDelay: this.rateLimitDelay,
        services: {
          search: testResult.success,
          baseUrl: this.baseUrl
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        services: {
          search: false,
          baseUrl: this.baseUrl
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create and export a singleton instance
const tmdbService = new TMDBService();

export default tmdbService;