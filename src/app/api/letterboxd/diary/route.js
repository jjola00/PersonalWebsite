import { NextResponse } from 'next/server';
import { parseDiaryFeed, validateRSSFeed } from '@/utils/rssParser';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || process.env.LETTERBOXD_USERNAME;
    const limit = parseInt(searchParams.get('limit')) || 5;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required. Set LETTERBOXD_USERNAME environment variable or provide username parameter.' },
        { status: 400 }
      );
    }

    // Construct Letterboxd diary RSS URL
    const rssUrl = `https://letterboxd.com/${username}/rss/`;

    // Fetch RSS feed
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Portfolio-Bot/1.0)',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: `Letterboxd user '${username}' not found or diary is private` },
          { status: 404 }
        );
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xmlData = await response.text();

    // Validate RSS feed
    if (!validateRSSFeed(xmlData)) {
      return NextResponse.json(
        { error: 'Invalid RSS feed format received from Letterboxd' },
        { status: 502 }
      );
    }

    // Parse diary entries
    const diaryEntries = parseDiaryFeed(xmlData);

    // Limit results
    const limitedEntries = diaryEntries.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: limitedEntries,
      metadata: {
        username,
        totalEntries: diaryEntries.length,
        returnedEntries: limitedEntries.length,
        limit,
        fetchedAt: new Date().toISOString(),
        source: 'letterboxd-rss'
      }
    });

  } catch (error) {
    console.error('Letterboxd diary RSS fetch error:', error);

    // Handle specific error types
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout - Letterboxd RSS feed took too long to respond' },
        { status: 504 }
      );
    }

    if (error.message.includes('fetch')) {
      return NextResponse.json(
        { error: 'Failed to connect to Letterboxd RSS feed' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch diary entries',
        details: error.message 
      },
      { status: 500 }
    );
  }
}