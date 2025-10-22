import { NextResponse } from 'next/server';

export async function POST() {
  const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

  // Check if we have the required environment variables
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    console.error('Missing Spotify environment variables:', {
      CLIENT_ID: !!CLIENT_ID,
      CLIENT_SECRET: !!CLIENT_SECRET,
      REFRESH_TOKEN: !!REFRESH_TOKEN
    });
    
    return NextResponse.json({ 
      error: 'Missing Spotify credentials. Please check your environment variables.' 
    }, { status: 500 });
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: REFRESH_TOKEN
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Spotify token refresh failed:', errorText);
      return NextResponse.json({ 
        error: `Token refresh failed: ${response.status}` 
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({
      access_token: data.access_token,
      expires_in: data.expires_in
    });

  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    return NextResponse.json({ 
      error: 'Internal server error during token refresh' 
    }, { status: 500 });
  }
}
