import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 6;
    const featured = searchParams.get('featured') === 'true'; // Get only featured lists (with topstats tag)

    // Read the lists metadata file
    const metadataPath = path.join(process.cwd(), 'lists-metadata.json');
    
    let metadataData;
    try {
      metadataData = await fs.readFile(metadataPath, 'utf-8');
    } catch (error) {
      return NextResponse.json(
        { error: 'Lists metadata file not found. Make sure lists-metadata.json exists in the project root.' },
        { status: 404 }
      );
    }

    // Parse metadata
    const allLists = JSON.parse(metadataData);
    
    if (allLists.length === 0) {
      return NextResponse.json(
        { error: 'No lists found in metadata' },
        { status: 404 }
      );
    }

    // Filter lists if featured is requested
    let listsToReturn = allLists;
    if (featured) {
      listsToReturn = allLists.filter(list => 
        list.tags && list.tags.includes('topstats')
      );
    }

    // Sort by date (most recent first) and limit
    const sortedLists = listsToReturn
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    // Transform for frontend use
    const transformedLists = sortedLists.map(list => ({
      id: list.id,
      name: list.name,
      description: list.description,
      url: list.url,
      tags: list.tags,
      lastUpdated: list.date,
      letterboxdUrl: list.url,
      source: 'letterboxd-metadata'
    }));

    return NextResponse.json({
      success: true,
      data: transformedLists,
      metadata: {
        totalLists: allLists.length,
        returnedLists: transformedLists.length,
        featured: featured,
        limit,
        fetchedAt: new Date().toISOString(),
        source: 'letterboxd-metadata'
      }
    });

  } catch (error) {
    console.error('Lists metadata error:', error);

    return NextResponse.json(
      { 
        error: 'Failed to fetch lists metadata',
        details: error.message 
      },
      { status: 500 }
    );
  }
}