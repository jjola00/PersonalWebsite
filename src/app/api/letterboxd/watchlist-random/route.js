import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Parse enriched CSV data into movie objects
 */
function parseEnrichedCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    // Handle quoted values properly
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add the last value
    
    const movie = {};
    headers.forEach((header, index) => {
      movie[header] = values[index] || '';
    });
    
    return {
      id: `watchlist-${movie.Name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${movie.Year}`,
      date: movie.Date,
      name: movie.Name,
      year: parseInt(movie.Year),
      letterboxdUri: movie['Letterboxd URI'],
      posterUrl: movie['Poster URL'] || null,
      tmdbId: movie['TMDB ID'] ? parseInt(movie['TMDB ID']) : null,
      source: 'watchlist-csv'
    };
  });
}

export async function GET() {
  try {
    // Read the enriched CSV file from the project root
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

    // Parse enriched CSV data
    const movies = parseEnrichedCSV(csvData);
    
    if (movies.length === 0) {
      return NextResponse.json(
        { error: 'No movies found in watchlist CSV' },
        { status: 404 }
      );
    }

    // Get a random movie
    const randomIndex = Math.floor(Math.random() * movies.length);
    const randomMovie = movies[randomIndex];

    return NextResponse.json({
      success: true,
      data: randomMovie,
      metadata: {
        totalMoviesInWatchlist: movies.length,
        selectedIndex: randomIndex,
        fetchedAt: new Date().toISOString(),
        source: 'watchlist-csv-preloaded'
      }
    });

  } catch (error) {
    console.error('Random watchlist movie error:', error);

    return NextResponse.json(
      { 
        error: 'Failed to get random watchlist movie',
        details: error.message 
      },
      { status: 500 }
    );
  }
}