import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({ error: `Spotify OAuth error: ${error}` }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/spotify/callback`
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      return NextResponse.json({ error: `Token exchange failed: ${errorData}` }, { status: 400 });
    }

    const tokens = await tokenResponse.json();

    // Return success page with tokens
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spotify Authentication Success</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              background: #191414; 
              color: #1DB954; 
              padding: 40px; 
              text-align: center; 
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #282828;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            }
            .success { color: #1DB954; font-size: 24px; margin-bottom: 20px; }
            .token-box { 
              background: #121212; 
              padding: 15px; 
              border-radius: 8px; 
              margin: 15px 0; 
              border-left: 4px solid #1DB954;
            }
            .token-label { color: #B3B3B3; font-size: 14px; margin-bottom: 5px; }
            .token-value { 
              color: #FFFFFF; 
              font-family: monospace; 
              font-size: 12px; 
              word-break: break-all; 
              background: #000;
              padding: 8px;
              border-radius: 4px;
            }
            .instructions {
              color: #B3B3B3;
              margin-top: 30px;
              text-align: left;
              background: #121212;
              padding: 20px;
              border-radius: 8px;
            }
            .step { margin: 10px 0; }
            button {
              background: #1DB954;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 25px;
              cursor: pointer;
              margin: 5px;
              font-size: 14px;
            }
            button:hover { background: #1ed760; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">🎉 Spotify Authentication Successful!</div>
            
            <div class="token-box">
              <div class="token-label">Refresh Token (COPY THIS):</div>
              <div class="token-value" id="refreshToken">${tokens.refresh_token}</div>
              <button onclick="copyToClipboard('refreshToken')">Copy Refresh Token</button>
            </div>

            <div class="token-box">
              <div class="token-label">Access Token (expires in ${tokens.expires_in} seconds):</div>
              <div class="token-value" id="accessToken">${tokens.access_token}</div>
              <button onclick="copyToClipboard('accessToken')">Copy Access Token</button>
            </div>

            <div class="instructions">
              <h3>📝 Next Steps:</h3>
              <div class="step">1. Copy the <strong>Refresh Token</strong> above</div>
              <div class="step">2. Add it to your <code>.env</code> file:</div>
              <div class="step" style="background: #000; padding: 10px; border-radius: 4px; margin: 10px 0;">
                <code>SPOTIFY_REFRESH_TOKEN=${tokens.refresh_token}</code>
              </div>
              <div class="step">3. Restart your development server</div>
              <div class="step">4. Test the Spotify API at <a href="/test-spotify" style="color: #1DB954;">/test-spotify</a></div>
            </div>

            <div style="margin-top: 30px;">
              <button onclick="window.close()">Close Window</button>
              <button onclick="window.location.href='/test-spotify'">Go to Spotify Test</button>
            </div>
          </div>

          <script>
            function copyToClipboard(elementId) {
              const element = document.getElementById(elementId);
              navigator.clipboard.writeText(element.textContent).then(() => {
                alert('Copied to clipboard!');
              });
            }
          </script>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Spotify OAuth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
