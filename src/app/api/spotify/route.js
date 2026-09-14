import { NextResponse } from 'next/server';

// All Spotify access happens here, server-side. The browser never sees a token —
// only the handful of public fields the About page renders.

export const dynamic = 'force-dynamic';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const TOP_TIME_RANGE = 'medium_term';
const TOP_LIMIT = 15;

// Cached per function instance; Vercel reuses warm instances, so most requests
// skip the refresh round-trip.
let cachedToken = null;
let cachedTokenExpiry = 0;

async function getAccessToken({ forceRefresh = false } = {}) {
  if (!forceRefresh && cachedToken && Date.now() < cachedTokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Spotify credentials');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Spotify token refresh failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  cachedTokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // refresh a minute early
  return cachedToken;
}

async function spotifyGet(endpoint) {
  const request = (token) =>
    fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

  let response = await request(await getAccessToken());
  if (response.status === 401) {
    response = await request(await getAccessToken({ forceRefresh: true }));
  }

  if (response.status === 204) return null; // e.g. nothing currently playing
  if (!response.ok) {
    throw new Error(`Spotify ${endpoint} failed: ${response.status}`);
  }
  return response.json();
}

const firstImage = (images) => images?.[0]?.url || null;
const joinArtists = (artists) => artists.map((artist) => artist.name).join(', ');

const toCurrentTrack = (data) =>
  data?.item
    ? {
        name: data.item.name,
        artist: joinArtists(data.item.artists),
        image: firstImage(data.item.album?.images),
        isPlaying: data.is_playing,
        url: data.item.external_urls?.spotify || null,
      }
    : null;

const toProfile = (data) =>
  data
    ? {
        image: firstImage(data.images),
        url: data.external_urls?.spotify || null,
      }
    : null;

const toArtist = (artist) => ({
  name: artist.name,
  image: firstImage(artist.images),
  url: artist.external_urls?.spotify || null,
});

const toTrack = (track) => ({
  name: track.name,
  artist: joinArtists(track.artists),
  image: firstImage(track.album?.images),
  url: track.external_urls?.spotify || null,
});

export async function GET() {
  try {
    await getAccessToken();
  } catch (error) {
    console.error('Spotify unavailable:', error.message);
    return NextResponse.json({ error: 'Spotify unavailable' }, { status: 503 });
  }

  // Settle independently so one failing endpoint doesn't blank the others.
  const [current, profile, artists, tracks] = await Promise.allSettled([
    spotifyGet('/me/player/currently-playing'),
    spotifyGet('/me'),
    spotifyGet(`/me/top/artists?time_range=${TOP_TIME_RANGE}&limit=${TOP_LIMIT}`),
    spotifyGet(`/me/top/tracks?time_range=${TOP_TIME_RANGE}&limit=${TOP_LIMIT}`),
  ]);

  const valueOf = (result) => {
    if (result.status === 'fulfilled') return result.value;
    console.error(result.reason?.message || result.reason);
    return null;
  };

  return NextResponse.json(
    {
      currentTrack: toCurrentTrack(valueOf(current)),
      profile: toProfile(valueOf(profile)),
      topArtists: (valueOf(artists)?.items || []).map(toArtist),
      topTracks: (valueOf(tracks)?.items || []).map(toTrack),
    },
    {
      // Short CDN cache: "now playing" stays fresh, and repeat visits don't hit Spotify.
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    }
  );
}
