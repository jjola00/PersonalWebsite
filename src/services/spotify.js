// Spotify Web API service for fetching music data

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// Token management
let accessToken = null;
let tokenExpiry = null;

// Get access token using refresh token via API route
const getAccessToken = async () => {
  // If we have a valid token, use it
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await fetch('/api/spotify/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute early

    return accessToken;
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    throw error;
  }
};

// Helper function to make authenticated Spotify API requests
const fetchSpotifyData = async (endpoint) => {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Handle 204 No Content (no currently playing track) BEFORE checking ok
    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, clear it and retry once
        accessToken = null;
        tokenExpiry = null;
        const newToken = await getAccessToken();
        
        const retryResponse = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Handle 204 on retry too
        if (retryResponse.status === 204) {
          return null;
        }
        
        if (!retryResponse.ok) {
          throw new Error(`Spotify API error: ${retryResponse.status}`);
        }
        
        return await retryResponse.json();
      }
      
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Spotify API Error:', error);
    throw error;
  }
};

// Get currently playing track
export const getCurrentlyPlaying = async () => {
  try {
    const data = await fetchSpotifyData('/me/player/currently-playing');
    
    if (!data || !data.item) return null;

    return {
      name: data.item.name,
      artist: data.item.artists.map(artist => artist.name).join(', '),
      album: data.item.album.name,
      image: data.item.album.images[0]?.url || null,
      isPlaying: data.is_playing,
      progress: data.progress_ms,
      duration: data.item.duration_ms,
      progressPercent: (data.progress_ms / data.item.duration_ms) * 100,
      device: data.device?.name || 'Unknown Device',
      url: data.item.external_urls?.spotify || null
    };
  } catch (error) {
    console.error('Error fetching currently playing:', error);
    return null;
  }
};

// Get top artists for different time periods
export const getTopArtists = async (timeRange = 'short_term', limit = 9) => {
  try {
    const data = await fetchSpotifyData(`/me/top/artists?time_range=${timeRange}&limit=${limit}`);
    
    if (!data || !data.items) return [];

    return data.items.map((artist, index) => ({
      name: artist.name,
      genres: artist.genres.slice(0, 3), // Top 3 genres
      popularity: artist.popularity,
      followers: artist.followers.total,
      rank: index + 1,
      image: artist.images[0]?.url || null,
      url: artist.external_urls?.spotify || null
    }));
  } catch (error) {
    console.error('Error fetching top artists:', error);
    return [];
  }
};

// Get top tracks for different time periods
export const getTopTracks = async (timeRange = 'short_term', limit = 10) => {
  try {
    const data = await fetchSpotifyData(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
    
    if (!data || !data.items) return [];

    return data.items.map((track, index) => ({
      name: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      popularity: track.popularity,
      duration: track.duration_ms,
      rank: index + 1,
      image: track.album.images[0]?.url || null,
      url: track.external_urls?.spotify || null,
      preview: track.preview_url
    }));
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    return [];
  }
};

// Get user's playlists (sorted by follower count for "top listened to")
export const getUserPlaylists = async (limit = 5) => {
  try {
    const data = await fetchSpotifyData(`/me/playlists?limit=50`); // Get more to sort
    
    if (!data || !data.items) return [];

    // Filter out non-user playlists and sort by follower count
    const userPlaylists = data.items
      .filter(playlist => playlist.owner?.display_name) // Has owner info
      .sort((a, b) => (b.followers?.total || 0) - (a.followers?.total || 0)) // Sort by followers (with fallback)
      .slice(0, limit); // Take top N

    return userPlaylists.map(playlist => ({
      name: playlist.name,
      description: playlist.description,
      trackCount: playlist.tracks?.total || 0,
      followers: playlist.followers?.total || 0,
      isPublic: playlist.public,
      image: playlist.images?.[0]?.url || null,
      url: playlist.external_urls?.spotify || null,
      owner: playlist.owner?.display_name || 'Unknown'
    }));
  } catch (error) {
    console.error('Error fetching user playlists:', error);
    return [];
  }
};

// Get user profile information
export const getUserProfile = async () => {
  try {
    const [profileData, savedCount] = await Promise.all([
      fetchSpotifyData('/me'),
      getSavedTracksCount()
    ]);
    
    if (!profileData) return null;

    return {
      displayName: profileData.display_name,
      email: profileData.email,
      followers: profileData.followers.total,
      country: profileData.country,
      product: profileData.product, // free, premium
      image: profileData.images[0]?.url || null,
      url: profileData.external_urls?.spotify || null,
      savedCount: savedCount
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Get saved tracks count (liked songs)
export const getSavedTracksCount = async () => {
  try {
    const data = await fetchSpotifyData('/me/tracks?limit=1');
    return data?.total || 0;
  } catch (error) {
    console.error('Error fetching saved tracks count:', error);
    return 0;
  }
};

// Get audio features for current track (bonus feature)
export const getCurrentTrackFeatures = async () => {
  try {
    const currentTrack = await getCurrentlyPlaying();
    if (!currentTrack || !currentTrack.url) return null;

    // Extract track ID from Spotify URL
    const trackId = currentTrack.url.split('/').pop().split('?')[0];
    
    const data = await fetchSpotifyData(`/audio-features/${trackId}`);
    
    if (!data) return null;

    return {
      danceability: Math.round(data.danceability * 100),
      energy: Math.round(data.energy * 100),
      valence: Math.round(data.valence * 100), // Musical positivity
      tempo: Math.round(data.tempo),
      acousticness: Math.round(data.acousticness * 100),
      instrumentalness: Math.round(data.instrumentalness * 100)
    };
  } catch (error) {
    // Audio features require premium subscription and special permissions
    // Don't log error if it's a 403 (forbidden) - just return null gracefully
    if (error.message?.includes('403')) {
      console.warn('Audio features not available (requires premium subscription or additional permissions)');
    } else {
      console.error('Error fetching track features:', error);
    }
    return null;
  }
};

// Test function to verify all API calls work
export const testSpotifyAPI = async () => {
  console.log('🎧 Testing Spotify API calls...');
  
  try {
    console.log('1. Testing getCurrentlyPlaying...');
    const currentTrack = await getCurrentlyPlaying();
    console.log('Currently Playing:', currentTrack);
    
    console.log('2. Testing getUserProfile...');
    const userProfile = await getUserProfile();
    console.log('User Profile:', userProfile);
    
    console.log('3. Testing getTopArtists (short_term)...');
    const topArtists = await getTopArtists('short_term', 5);
    console.log('Top Artists:', topArtists);
    
    console.log('4. Testing getTopTracks (short_term)...');
    const topTracks = await getTopTracks('short_term', 5);
    console.log('Top Tracks:', topTracks);
    
    console.log('5. Testing getUserPlaylists...');
    const playlists = await getUserPlaylists(5);
    console.log('User Playlists:', playlists);
    
    console.log('6. Testing getSavedTracksCount...');
    const savedCount = await getSavedTracksCount();
    console.log('Saved Tracks Count:', savedCount);
    
    console.log('7. Testing getCurrentTrackFeatures...');
    const trackFeatures = await getCurrentTrackFeatures();
    console.log('Current Track Features:', trackFeatures);
    
    console.log('✅ All Spotify API tests completed!');
    
    return {
      success: true,
      data: {
        currentTrack,
        userProfile,
        topArtists,
        topTracks,
        playlists,
        savedCount,
        trackFeatures
      }
    };
  } catch (error) {
    console.error('❌ Spotify API test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Available time ranges for Spotify
export const TIME_RANGES = {
  'short_term': 'Last 4 Weeks',
  'medium_term': 'Last 6 Months', 
  'long_term': 'Several Years'
};

// Generate OAuth URL for initial authentication (you'll need this once)
export const getAuthURL = () => {
  const scopes = [
    'user-read-currently-playing',
    'user-top-read',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-library-read',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state'
  ].join(' ');

  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: 'http://localhost:3000/api/auth/spotify/callback',
    scope: scopes,
    show_dialog: 'true'
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};
