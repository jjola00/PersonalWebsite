import { NextResponse } from 'next/server';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_READ_ACCESS_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('id');
    const appendToResponse = searchParams.get('append_to_response') || 'credits,images,videos';

    if (!movieId) {
      return NextResponse.json(
        { error: 'Movie ID parameter is required' },
        { status: 400 }
      );
    }

    if (!TMDB_API_KEY && !TMDB_READ_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'TMDB API credentials not configured' },
        { status: 500 }
      );
    }

    // Build details URL
    const detailsUrl = new URL(`${TMDB_BASE_URL}/movie/${movieId}`);
    detailsUrl.searchParams.append('append_to_response', appendToResponse);

    // Prepare headers - prefer Read Access Token over API Key
    const headers = {
      'Content-Type': 'application/json',
    };

    if (TMDB_READ_ACCESS_TOKEN) {
      headers['Authorization'] = `Bearer ${TMDB_READ_ACCESS_TOKEN}`;
    } else {
      detailsUrl.searchParams.append('api_key', TMDB_API_KEY);
    }

    // Make request to TMDB
    const response = await fetch(detailsUrl.toString(), {
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
      if (response.status === 404) {
        return NextResponse.json(
          { error: `Movie with ID ${movieId} not found` },
          { status: 404 }
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

    const movie = await response.json();

    // Transform movie details to match our data structure
    const transformedMovie = {
      id: movie.id,
      title: movie.title,
      year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null,
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      posterOriginal: movie.poster_path ? `https://image.tmdb.org/t/p/original${movie.poster_path}` : null,
      backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
      backdropOriginal: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
      overview: movie.overview,
      tagline: movie.tagline,
      runtime: movie.runtime,
      releaseDate: movie.release_date,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      popularity: movie.popularity,
      budget: movie.budget,
      revenue: movie.revenue,
      status: movie.status,
      originalLanguage: movie.original_language,
      originalTitle: movie.original_title,
      adult: movie.adult,
      homepage: movie.homepage,
      imdbId: movie.imdb_id,
      genres: movie.genres,
      productionCompanies: movie.production_companies,
      productionCountries: movie.production_countries,
      spokenLanguages: movie.spoken_languages,
      tmdbId: movie.id,
      source: 'tmdb'
    };

    // Add credits if available
    if (movie.credits) {
      transformedMovie.cast = movie.credits.cast?.slice(0, 10).map(person => ({
        id: person.id,
        name: person.name,
        character: person.character,
        profilePath: person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : null,
        order: person.order
      }));

      transformedMovie.crew = movie.credits.crew?.filter(person => 
        ['Director', 'Producer', 'Writer', 'Screenplay', 'Story'].includes(person.job)
      ).map(person => ({
        id: person.id,
        name: person.name,
        job: person.job,
        department: person.department,
        profilePath: person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : null
      }));
    }

    // Add images if available
    if (movie.images) {
      transformedMovie.images = {
        backdrops: movie.images.backdrops?.slice(0, 5).map(image => ({
          filePath: `https://image.tmdb.org/t/p/w1280${image.file_path}`,
          width: image.width,
          height: image.height,
          aspectRatio: image.aspect_ratio,
          voteAverage: image.vote_average
        })),
        posters: movie.images.posters?.slice(0, 5).map(image => ({
          filePath: `https://image.tmdb.org/t/p/w500${image.file_path}`,
          width: image.width,
          height: image.height,
          aspectRatio: image.aspect_ratio,
          voteAverage: image.vote_average
        }))
      };
    }

    // Add videos if available
    if (movie.videos) {
      transformedMovie.videos = movie.videos.results?.filter(video => 
        video.site === 'YouTube' && ['Trailer', 'Teaser'].includes(video.type)
      ).slice(0, 3).map(video => ({
        id: video.id,
        key: video.key,
        name: video.name,
        site: video.site,
        type: video.type,
        official: video.official,
        publishedAt: video.published_at,
        youtubeUrl: `https://www.youtube.com/watch?v=${video.key}`
      }));
    }

    return NextResponse.json({
      success: true,
      data: transformedMovie,
      metadata: {
        movieId,
        fetchedAt: new Date().toISOString(),
        source: 'tmdb-api'
      }
    });

  } catch (error) {
    console.error('TMDB movie details API error:', error);

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
        error: 'Failed to fetch movie details',
        details: error.message 
      },
      { status: 500 }
    );
  }
}