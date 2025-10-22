import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_READ_ACCESS_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN;

/**
 * Parse CSV data into movie objects
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const movie = {};
    
    headers.forEach((header, index) => {
      movie[header.trim()] = values[index]?.trim() || '';
    });
    
    return {
      date: movie.Date,
      name: movie.Name,
      year: parseInt(movie.Year),
      letterboxdUri: movie['Letterboxd URI']
    };
  });
}

/**
 * Search TMDB for movie details
 */
async function searchTMDB(movieName, year) {
  try {
    const searchUrl = new URL(`${TMDB_BASE_URL}/search/movie`);
    searchUrl.searchParams.append('query', movieName);
    if (year) {
      searchUrl.searchParams.append('year', year.toString());
    }

    const headers = {
      'Content-Type': 'application/json',
    };

    if (TMDB_READ_ACCESS_TOKEN) {
      headers['Authorization'] = `Bearer ${TMDB_READ_ACCESS_TOKEN}`;
    } else if (TMDB_API_KEY) {
      searchUrl.searchParams.append('api_key', TMDB_API_KEY);
    } else {
      throw new Error('TMDB API credentials not configured');
    }

    const response = await fetch(searchUrl.toString(), { headers });
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results?.[0] || null;
  } catch (error) {
    console.warn(`Failed to fetch TMDB data for ${movieName} (${year}):`, error.message);
    return null;
  }
}

/**
 * Enrich watchlist movies with TMDB poster data
 */
async function enrichWatchlistWithPosters(movies, limit = null) {
  const moviesToProcess = limit ? movies.slice(0, limit) : movies;
  
  const enrichedMovies = await Promise.all(
    moviesToProcess.map(async (movie) => {
      try {
        // Search TMDB for this movie
        const tmdbResult = await searchTMDB(movie.name, movie.year);
        
        return {
          id: `watchlist-${movie.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${movie.year}`,
          date: movie.date,
          name: movie.name,
          year: movie.year,
          letterboxdUri: movie.letterboxdUri,
          posterUrl: tmdbResult?.poster_path 
            ? `https://image.tmdb.org/t/p/w500${tmdbResult.poster_path}`
            : null,
          posterOriginal: tmdbResult?.poster_path 
            ? `https://image.tmdb.org/t/p/original${tmdbResult.poster_path}`
            : null,
          backdropUrl: tmdbResult?.backdrop_path 
            ? `https://image.tmdb.org/t/p/w1280${tmdbResult.backdrop_path}`
            : null,
          overview: tmdbResult?.overview || null,
          tmdbId: tmdbResult?.id || null,
          voteAverage: tmdbResult?.vote_average || null,
          releaseDate: tmdbResult?.release_date || null,
          source: 'watchlist-csv'
        };
      } catch (error) {
        console.warn(`Failed to enrich movie ${movie.name}:`, error.message);
        return {
          id: `watchlist-${movie.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${movie.year}`,
          date: movie.date,
          name: movie.name,
          year: movie.year,
          letterboxdUri: movie.letterboxdUri,
          posterUrl: null,
          source: 'watchlist-csv'
        };
      }
    })
  );

  return enrichedMovies;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 8;
    const random = searchParams.get('random') === 'true';

    // Read the CSV file from the project root
    const csvPath = path.join(process.cwd(), 'watchlist.csv');
    
    let csvData;
    try {
      csvData = await fs.readFile(csvPath, 'utf-8');
    } catch (error) {
      return NextResponse.json(
        { error: 'Watchlist CSV file not found. Make sure watchlist.csv exists in the project root.' },
        { status: 404 }
      );
    }

    // Parse CSV data
    const movies = parseCSV(csvData);
    
    if (movies.length === 0) {
      return NextResponse.json(
        { error: 'No movies found in watchlist CSV' },
        { status: 404 }
      );
    }

    // If random is requested, shuffle the array first
    let moviesToProcess = movies;
    if (random) {
      moviesToProcess = [...movies].sort(() => Math.random() - 0.5);
    }

    // Enrich movies with TMDB poster data
    const enrichedMovies = await enrichWatchlistWithPosters(moviesToProcess, limit);

    return NextResponse.json({
      success: true,
      data: enrichedMovies,
      metadata: {
        totalMovies: movies.length,
        returnedMovies: enrichedMovies.length,
        limit,
        random,
        fetchedAt: new Date().toISOString(),
        source: 'watchlist-csv-tmdb'
      }
    });

  } catch (error) {
    console.error('Watchlist enrichment error:', error);

    return NextResponse.json(
      { 
        error: 'Failed to process watchlist',
        details: error.message 
      },
      { status: 500 }
    );
  }
}