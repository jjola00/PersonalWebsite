/**
 * Title Cleaning Utilities
 * Handles removal of trailing commas and whitespace from movie titles
 */

/**
 * Remove trailing commas and whitespace from a title string
 * @param {string} title - The title string to clean
 * @returns {string} Cleaned title string
 */
export function cleanTitle(title) {
  // Handle edge cases: null, undefined, or non-string values
  if (title == null || typeof title !== 'string') {
    return title;
  }

  // Handle empty string
  if (title.trim() === '') {
    return title;
  }

  // Remove trailing commas and whitespace using regex
  // This pattern matches trailing commas, spaces, and comma-space combinations at the end
  return title.replace(/(?:,\s*)+$/, '').trim();
}

/**
 * Clean movie data by applying title cleaning to all relevant title fields
 * @param {Object} movieData - Movie data object containing various movie collections
 * @returns {Object} Movie data with cleaned titles
 */
export function cleanMovieData(movieData) {
  if (!movieData || typeof movieData !== 'object') {
    return movieData;
  }

  const cleanedData = { ...movieData };

  // Clean diary entries
  if (cleanedData.diary?.data) {
    cleanedData.diary = {
      ...cleanedData.diary,
      data: cleanedData.diary.data.map(item => ({
        ...item,
        movie: item.movie ? {
          ...item.movie,
          name: cleanTitle(item.movie.name),
          title: cleanTitle(item.movie.title)
        } : item.movie,
        name: cleanTitle(item.name),
        title: cleanTitle(item.title)
      }))
    };
  }

  // Clean five-star movies
  if (cleanedData.fiveStarMovies?.data) {
    cleanedData.fiveStarMovies = {
      ...cleanedData.fiveStarMovies,
      data: cleanedData.fiveStarMovies.data.map(item => ({
        ...item,
        movie: item.movie ? {
          ...item.movie,
          name: cleanTitle(item.movie.name),
          title: cleanTitle(item.movie.title)
        } : item.movie,
        name: cleanTitle(item.name),
        title: cleanTitle(item.title)
      }))
    };
  }

  // Clean random movie
  if (cleanedData.randomMovie?.data) {
    cleanedData.randomMovie = {
      ...cleanedData.randomMovie,
      data: {
        ...cleanedData.randomMovie.data,
        name: cleanTitle(cleanedData.randomMovie.data.name),
        title: cleanTitle(cleanedData.randomMovie.data.title),
        movie: cleanedData.randomMovie.data.movie ? {
          ...cleanedData.randomMovie.data.movie,
          name: cleanTitle(cleanedData.randomMovie.data.movie.name),
          title: cleanTitle(cleanedData.randomMovie.data.movie.title)
        } : cleanedData.randomMovie.data.movie
      }
    };
  }

  // Clean lists
  if (cleanedData.lists?.data) {
    cleanedData.lists = {
      ...cleanedData.lists,
      data: cleanedData.lists.data.map(list => ({
        ...list,
        name: cleanTitle(list.name),
        title: cleanTitle(list.title)
      }))
    };
  }

  return cleanedData;
}