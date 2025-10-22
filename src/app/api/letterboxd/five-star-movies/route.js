import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

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
      letterboxdUri: movie['Letterboxd URI'],
      posterUrl: movie['Poster URL'],
      tmdbId: movie['TMDB ID'] !== 'null' ? parseInt(movie['TMDB ID']) : null
    };
  });
}

/**
 * Convert CSV movie data to the expected format for StackedCards
 */
function formatMovieForStackedCards(movie, index) {
  return {
    id: `five-star-${movie.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${movie.year}`,
    movie: {
      title: movie.name,
      year: movie.year,
      poster: movie.posterUrl,
      letterboxdUrl: movie.letterboxdUri,
      source: 'five-star-csv'
    },
    watchDate: movie.date,
    rating: 5,
    rewatch: false,
    letterboxdUrl: movie.letterboxdUri,
    tmdbId: movie.tmdbId,
    order: index // Preserve the CSV order
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 12; // Default to all 12 movies

    // Read the CSV file from the project root
    const csvPath = path.join(process.cwd(), 'five-star-movies.csv');
    
    let csvData;
    try {
      csvData = await fs.readFile(csvPath, 'utf-8');
    } catch (error) {
      return NextResponse.json(
        { error: 'Five-star movies CSV file not found. Make sure five-star-movies.csv exists in the project root.' },
        { status: 404 }
      );
    }

    // Parse CSV data
    const movies = parseCSV(csvData);
    
    if (movies.length === 0) {
      return NextResponse.json(
        { error: 'No movies found in five-star movies CSV' },
        { status: 404 }
      );
    }

    // Movies are already in the desired order from CSV, just apply limit
    const moviesToReturn = movies.slice(0, limit);

    // Format movies for StackedCards component
    const formattedMovies = moviesToReturn.map((movie, index) => 
      formatMovieForStackedCards(movie, index)
    );

    return NextResponse.json({
      success: true,
      data: formattedMovies,
      metadata: {
        totalMovies: movies.length,
        returnedMovies: formattedMovies.length,
        limit,
        ordered: true, // Movies are in a specific order
        fetchedAt: new Date().toISOString(),
        source: 'five-star-csv',
        order: 'custom-preference' // Indicates this is a curated order
      }
    });

  } catch (error) {
    console.error('Five-star movies CSV processing error:', error);

    return NextResponse.json(
      { 
        error: 'Failed to process five-star movies',
        details: error.message 
      },
      { status: 500 }
    );
  }
}