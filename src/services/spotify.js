// Client-side accessor for Spotify data. Credentials and every Spotify API call
// stay on the server in src/app/api/spotify/route.js.

const EMPTY = { currentTrack: null, profile: null, topArtists: [], topTracks: [] };

export const getSpotifyMusicData = async () => {
  try {
    const response = await fetch('/api/spotify');
    if (!response.ok) {
      throw new Error(`Spotify route failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching Spotify data:', error);
    return EMPTY;
  }
};
