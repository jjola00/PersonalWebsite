/**
 * Duplicate Detection and Filtering Utilities
 * Handles deduplication of movie entries while preserving most recent reviews
 */

/**
 * Remove duplicate movies from an array, keeping only the most recent entry for each unique movie
 * @param {Array} movies - Array of movie objects with movie.title, movie.year, and watchDate
 * @param {Object} options - Configuration options
 * @param {string} options.titleKey - Key path for movie title (default: 'movie.title')
 * @param {string} options.yearKey - Key path for movie year (default: 'movie.year')
 * @param {string} options.dateKey - Key path for watch date (default: 'watchDate')
 * @returns {Array} Deduplicated array of movies
 */
export function removeDuplicateMovies(movies, options = {}) {
  if (!Array.isArray(movies) || movies.length === 0) {
    return movies;
  }

  const {
    titleKey = 'movie.title',
    yearKey = 'movie.year',
    dateKey = 'watchDate'
  } = options;

  // Helper function to get nested property value
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Create a map to track the most recent entry for each unique movie
  const movieMap = new Map();

  movies.forEach(entry => {
    const title = getNestedValue(entry, titleKey);
    const year = getNestedValue(entry, yearKey);
    const watchDate = getNestedValue(entry, dateKey);

    // Skip entries without required data
    if (!title || !watchDate) {
      return;
    }

    // Create unique key combining title and year (year is optional)
    const movieKey = `${title.toLowerCase().trim()}${year ? `_${year}` : ''}`;

    // Convert watchDate to Date object for comparison
    const currentDate = new Date(watchDate);
    
    // Check if we already have this movie
    const existingEntry = movieMap.get(movieKey);
    
    if (!existingEntry) {
      // First time seeing this movie, add it
      movieMap.set(movieKey, entry);
    } else {
      // Compare dates and keep the more recent one
      const existingDate = new Date(getNestedValue(existingEntry, dateKey));
      
      if (currentDate > existingDate) {
        // Current entry is more recent, replace the existing one
        movieMap.set(movieKey, entry);
      }
      // If existing entry is more recent or equal, keep it (do nothing)
    }
  });

  // Convert map values back to array and sort by most recent watch date
  return Array.from(movieMap.values())
    .sort((a, b) => {
      const dateA = new Date(getNestedValue(a, dateKey));
      const dateB = new Date(getNestedValue(b, dateKey));
      return dateB - dateA; // Most recent first
    });
}

/**
 * Get duplicate statistics for a movie array
 * @param {Array} movies - Array of movie objects
 * @param {Object} options - Configuration options (same as removeDuplicateMovies)
 * @returns {Object} Statistics about duplicates
 */
export function getDuplicateStats(movies, options = {}) {
  if (!Array.isArray(movies) || movies.length === 0) {
    return {
      totalEntries: 0,
      uniqueMovies: 0,
      duplicateEntries: 0,
      duplicateMovies: []
    };
  }

  const {
    titleKey = 'movie.title',
    yearKey = 'movie.year'
  } = options;

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Count occurrences of each movie
  const movieCounts = new Map();
  const duplicateMovies = [];

  movies.forEach(entry => {
    const title = getNestedValue(entry, titleKey);
    const year = getNestedValue(entry, yearKey);

    if (!title) return;

    const movieKey = `${title.toLowerCase().trim()}${year ? `_${year}` : ''}`;
    const count = movieCounts.get(movieKey) || 0;
    movieCounts.set(movieKey, count + 1);

    // Track which movies have duplicates
    if (count === 1) { // Second occurrence
      duplicateMovies.push({
        title,
        year,
        occurrences: count + 1
      });
    } else if (count > 1) {
      // Update occurrence count for existing duplicate
      const existing = duplicateMovies.find(d => 
        d.title.toLowerCase() === title.toLowerCase() && d.year === year
      );
      if (existing) {
        existing.occurrences = count + 1;
      }
    }
  });

  const uniqueMovies = movieCounts.size;
  const duplicateEntries = movies.length - uniqueMovies;

  return {
    totalEntries: movies.length,
    uniqueMovies,
    duplicateEntries,
    duplicateMovies: duplicateMovies.sort((a, b) => b.occurrences - a.occurrences)
  };
}

/**
 * Filter movies to show only duplicates (for debugging/analysis)
 * @param {Array} movies - Array of movie objects
 * @param {Object} options - Configuration options
 * @returns {Array} Array containing only movies that have duplicates
 */
export function getOnlyDuplicates(movies, options = {}) {
  const stats = getDuplicateStats(movies, options);
  const duplicateMovieKeys = new Set(
    stats.duplicateMovies.map(d => `${d.title.toLowerCase().trim()}${d.year ? `_${d.year}` : ''}`)
  );

  const {
    titleKey = 'movie.title',
    yearKey = 'movie.year'
  } = options;

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  return movies.filter(entry => {
    const title = getNestedValue(entry, titleKey);
    const year = getNestedValue(entry, yearKey);
    
    if (!title) return false;
    
    const movieKey = `${title.toLowerCase().trim()}${year ? `_${year}` : ''}`;
    return duplicateMovieKeys.has(movieKey);
  });
}