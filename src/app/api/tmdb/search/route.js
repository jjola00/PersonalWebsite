import { NextResponse } from 'next/server';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_READ_ACCESS_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const year = searchParams.get('year');
    const page = parseInt(searchParams.get('page')) || 1;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    if (!TMDB_API_KEY && !TMDB_READ_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'TMDB API credentials not configured' },
        { status: 500 }
      );
    }

    // Build search URL
    const searchUrl = new URL(`${TMDB_BASE_URL}/search/movie`);
    searchUrl.searchParams.append('query', query);
    searchUrl.searchParams.append('page', page.toString());
    
    if (year) {
      searchUrl.searchParams.append('year', year);
    }

    // Prepare headers - prefer Read Access Token over API Key
    const headers = {
      'Content-Type': 'application/json',
    };

    if (TMDB_READ_ACCESS_TOKEN) {
      headers['Authorization'] = `Bearer ${TMDB_READ_ACCESS_TOKEN}`;
    } else {
      searchUrl.searchParams.append('api_key', TMDB_API_KEY);
    }

    // Make request to TMDB
    const response = await fetch(searchUrl.toString(), {
      headers,
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid TMDB API credentials' },
          { status: 401 }
        );
      }
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'TMDB API rate limit exceeded' },
          { status: 429 }
        );
      }
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform results to match our movie data structure
    const transformedResults = data.results.map(movie => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null,
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      posterOriginal: movie.poster_path ? `https://image.tmdb.org/t/p/original${movie.poster_path}` : null,
      overview: movie.overview,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      popularity: movie.popularity,
      adult: movie.adult,
      originalLanguage: movie.original_language,
      originalTitle: movie.original_title,
      releaseDate: movie.release_date,
      backdropPath: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
      genreIds: movie.genre_ids,
      tmdbId: movie.id,
      source: 'tmdb'
    }));

    return NextResponse.json({
      success: true,
      data: {
        results: transformedResults,
        page: data.page,
        totalPages: data.total_pages,
        totalResults: data.total_results
      },
      metadata: {
        query,
        year,
        page,
        fetchedAt: new Date().toISOString(),
        source: 'tmdb-api'
      }
    });

  } catch (error) {
    console.error('TMDB search API error:', error);

    // Handle specific error types
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout - TMDB API took too long to respond' },
        { status: 504 }
      );
    }

    if (error.message.includes('fetch')) {
      return NextResponse.json(
        { error: 'Failed to connect to TMDB API' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to search movies',
        details: error.message 
      },
      { status: 500 }
    );
  }
}