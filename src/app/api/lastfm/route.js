import { NextResponse } from 'next/server';

// Proxies the few Last.fm calls the About page makes so the API key stays
// server-side. Locked to one user and a fixed set of read-only methods, so it
// can't be used as a general-purpose Last.fm proxy.

const LASTFM_API_BASE = 'https://ws.audioscrobbler.com/2.0/';
const LASTFM_USERNAME = 'jjola0';
const ALLOWED_METHODS = new Set([
  'user.getrecenttracks',
  'user.gettopartists',
  'user.gettoptracks',
  'user.gettopalbums',
]);
const ALLOWED_PERIODS = new Set(['overall', '7day', '1month', '3month', '6month', '12month']);
const MAX_LIMIT = 50;

export async function GET(request) {
  // LASTFM_API_KEY is the intended name; the NEXT_PUBLIC_ one is the old
  // client-side name, still read so existing deployments keep working.
  const apiKey = process.env.LASTFM_API_KEY || process.env.NEXT_PUBLIC_LASTFM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Last.fm is not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const method = (searchParams.get('method') || '').toLowerCase();
  if (!ALLOWED_METHODS.has(method)) {
    return NextResponse.json({ error: 'Unsupported method' }, { status: 400 });
  }

  const url = new URL(LASTFM_API_BASE);
  url.searchParams.set('method', method);
  url.searchParams.set('user', LASTFM_USERNAME);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('format', 'json');

  const period = searchParams.get('period');
  if (period && ALLOWED_PERIODS.has(period)) url.searchParams.set('period', period);

  const limit = parseInt(searchParams.get('limit'), 10);
  if (limit > 0) url.searchParams.set('limit', String(Math.min(limit, MAX_LIMIT)));

  try {
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok || data.error) {
      return NextResponse.json(
        { error: data.message || `Last.fm returned ${response.status}` },
        { status: 502 }
      );
    }
    return NextResponse.json(data, {
      // Short CDN cache: "now playing" should stay roughly current
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' },
    });
  } catch (error) {
    console.error('Last.fm request failed:', error);
    return NextResponse.json({ error: 'Last.fm request failed' }, { status: 502 });
  }
}
