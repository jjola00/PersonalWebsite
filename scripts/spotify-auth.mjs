#!/usr/bin/env node
// Re-authorize Spotify and write a fresh SPOTIFY_REFRESH_TOKEN into .env
//
//   node scripts/spotify-auth.mjs
//
// Requires this redirect URI registered in the Spotify dashboard:
//   http://127.0.0.1:3000/api/auth/spotify/callback
//
// Refresh tokens on this app expire after 180 days, so expect to re-run it.

import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const PORT = Number(process.env.PORT || 3000);
const REDIRECT_URI = `http://127.0.0.1:${PORT}/api/auth/spotify/callback`;
const ENV_PATH = new URL('../.env', import.meta.url);

const SCOPES = [
  'user-read-currently-playing',
  'user-top-read',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state'
].join(' ');

const envText = await readFile(ENV_PATH, 'utf8');
const readEnv = (key) =>
  envText.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1]?.trim();

const CLIENT_ID = readEnv('NEXT_PUBLIC_SPOTIFY_CLIENT_ID');
const CLIENT_SECRET = readEnv('SPOTIFY_CLIENT_SECRET');

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing NEXT_PUBLIC_SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env');
  process.exit(1);
}

const state = Math.random().toString(36).slice(2);
const authURL = `https://accounts.spotify.com/authorize?${new URLSearchParams({
  client_id: CLIENT_ID,
  response_type: 'code',
  redirect_uri: REDIRECT_URI,
  scope: SCOPES,
  state,
  show_dialog: 'true'
})}`;

const exchange = async (code) => {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI
    })
  });

  const body = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(body)}`);
  return body;
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname !== '/api/auth/spotify/callback') {
    res.writeHead(404).end('not here');
    return;
  }

  const error = url.searchParams.get('error');
  const code = url.searchParams.get('code');

  if (error || !code) {
    res.writeHead(400, { 'Content-Type': 'text/plain' })
      .end(`Spotify returned: ${error || 'no code'}`);
    console.error(`\n✗ Authorization failed: ${error || 'no code returned'}`);
    server.close();
    process.exitCode = 1;
    return;
  }

  if (url.searchParams.get('state') !== state) {
    res.writeHead(400, { 'Content-Type': 'text/plain' }).end('state mismatch');
    console.error('\n✗ State mismatch — aborting.');
    server.close();
    process.exitCode = 1;
    return;
  }

  try {
    const tokens = await exchange(code);
    const updated = envText.includes('SPOTIFY_REFRESH_TOKEN=')
      ? envText.replace(/^SPOTIFY_REFRESH_TOKEN=.*$/m, `SPOTIFY_REFRESH_TOKEN=${tokens.refresh_token}`)
      : `${envText.replace(/\n*$/, '\n')}SPOTIFY_REFRESH_TOKEN=${tokens.refresh_token}\n`;
    await writeFile(ENV_PATH, updated);

    res.writeHead(200, { 'Content-Type': 'text/html' }).end(
      '<body style="font-family:system-ui;background:#191414;color:#1DB954;padding:60px;text-align:center">' +
      '<h1>Done — refresh token written to .env</h1><p>You can close this tab.</p></body>'
    );

    console.log('\n✓ New refresh token written to .env:\n');
    console.log(`  SPOTIFY_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    console.log('Update SPOTIFY_REFRESH_TOKEN in your Vercel project env vars, then redeploy.\n');
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' }).end(String(err));
    console.error(`\n✗ Token exchange failed: ${err.message}`);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\nListening on ${REDIRECT_URI}`);
  console.log('\nOpen this URL and approve:\n');
  console.log(authURL + '\n');
  spawn('xdg-open', [authURL], { stdio: 'ignore', detached: true }).unref();
});
