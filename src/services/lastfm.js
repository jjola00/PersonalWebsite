// Last.fm API service for fetching music data

const LASTFM_API_BASE = 'https://ws.audioscrobbler.com/2.0/';
const API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY;

// Helper function to make API requests
export const fetchLastFmData = async (method, params = {}) => {
  const url = new URL(LASTFM_API_BASE);
  url.searchParams.append('method', method);
  url.searchParams.append('api_key', API_KEY);
  url.searchParams.append('format', 'json');
  
  // Add additional parameters
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]);
  });

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Check for Last.fm API errors
    if (data.error) {
      throw new Error(`Last.fm API Error: ${data.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Last.fm API Error:', error);
    throw error;
  }
};

// Get top artists for different time periods
export const getTopArtists = async (username, period = '1month', limit = 10) => {
  try {
    const data = await fetchLastFmData('user.gettopartists', {
      user: username,
      period: period,
      limit: limit
    });
    
    const artists = data.topartists?.artist || [];
    
    return artists.map(artist => {
      // Last.fm provides multiple image sizes, try to get the best one
      let image = null;
      if (artist.image && Array.isArray(artist.image)) {
        // Try different sizes in order of preference: extralarge, large, medium, small
        const imageObj = artist.image.find(img => img.size === 'extralarge') ||
                        artist.image.find(img => img.size === 'large') ||
                        artist.image.find(img => img.size === 'medium') ||
                        artist.image.find(img => img.size === 'small');
        image = imageObj?.['#text'] || null;
        // Only filter out completely empty images, keep placeholder images  
        if (image === '') {
          image = null;
        }
      }
      
      return {
        name: artist.name,
        playcount: parseInt(artist.playcount),
        rank: parseInt(artist['@attr']?.rank || 0),
        image: image,
        url: artist.url,
        mbid: artist.mbid // Music Brainz ID for additional data if needed
      };
    });
  } catch (error) {
    console.error('Error fetching top artists:', error);
    return [];
  }
};

// Get top albums for different time periods
export const getTopAlbums = async (username, period = '1month', limit = 6) => {
  try {
    const data = await fetchLastFmData('user.gettopalbums', {
      user: username,
      period: period,
      limit: limit
    });
    
    const albums = data.topalbums?.album || [];
    
    return albums.map(album => ({
      name: album.name,
      artist: album.artist?.name || album.artist,
      playcount: parseInt(album.playcount),
      rank: parseInt(album['@attr']?.rank || 0),
      image: album.image?.find(img => img.size === 'large')?.['#text'] || null,
      url: album.url
    }));
  } catch (error) {
    console.error('Error fetching top albums:', error);
    return [];
  }
};

// Get user profile information and stats
export const getUserInfo = async (username) => {
  try {
    const data = await fetchLastFmData('user.getinfo', {
      user: username
    });
    
    const user = data.user;
    if (!user) return null;
    
    return {
      name: user.name,
      realname: user.realname,
      playcount: parseInt(user.playcount),
      artistcount: parseInt(user.artist_count),
      trackcount: parseInt(user.track_count),
      albumcount: parseInt(user.album_count),
      image: user.image?.find(img => img.size === 'large')?.['#text'] || null,
      registered: user.registered?.unixtime ? parseInt(user.registered.unixtime) * 1000 : null,
      country: user.country,
      url: user.url
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
};

// Get top tracks for different time periods  
export const getTopTracks = async (username, period = '1month', limit = 10) => {
  try {
    const data = await fetchLastFmData('user.gettoptracks', {
      user: username,
      period: period,
      limit: limit
    });
    
    const tracks = data.toptracks?.track || [];
    
    return tracks.map(track => {
      // Handle track images
      let image = null;
      if (track.image && Array.isArray(track.image)) {
        const imageObj = track.image.find(img => img.size === 'extralarge') ||
                        track.image.find(img => img.size === 'large') ||
                        track.image.find(img => img.size === 'medium') ||
                        track.image.find(img => img.size === 'small');
        image = imageObj?.['#text'] || null;
        // Only filter out completely empty images, keep placeholder images
        if (image === '') {
          image = null;
        }
      }
      
      return {
        name: track.name,
        artist: track.artist?.name || track.artist?.['#text'] || track.artist,
        playcount: parseInt(track.playcount),
        rank: parseInt(track['@attr']?.rank || 0),
        image: image,
        url: track.url,
        mbid: track.mbid,
        album: track.album?.['#text'] || null
      };
    });
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    return [];
  }
};

// Get current track (now playing or recently played)
export const getCurrentTrack = async (username) => {
  try {
    const data = await fetchLastFmData('user.getrecenttracks', {
      user: username,
      limit: 1
    });
    
    const tracks = data.recenttracks?.track;
    if (!tracks || tracks.length === 0) return null;
    
    const track = Array.isArray(tracks) ? tracks[0] : tracks;
    
    // Handle track images
    let image = null;
    if (track.image && Array.isArray(track.image)) {
      const imageObj = track.image.find(img => img.size === 'extralarge') ||
                      track.image.find(img => img.size === 'large') ||
                      track.image.find(img => img.size === 'medium') ||
                      track.image.find(img => img.size === 'small');
      image = imageObj?.['#text'] || null;
      if (image === '' || image === 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png') {
        image = null;
      }
    }
    
    return {
      name: track.name,
      artist: track.artist?.name || track.artist?.['#text'] || track.artist,
      album: track.album?.['#text'] || null,
      image: image,
      isPlaying: track['@attr']?.nowplaying === 'true',
      url: track.url,
      timestamp: track.date?.uts ? parseInt(track.date.uts) * 1000 : null
    };
  } catch (error) {
    console.error('Error fetching current track:', error);
    return null;
  }
};

// Get monthly stats (top artist and album for current month)
export const getMonthlyStats = async (username) => {
  try {
    const [topArtists, topAlbums] = await Promise.all([
      getTopArtists(username, '1month', 1),
      getTopAlbums(username, '1month', 1)
    ]);
    
    return {
      topArtist: topArtists[0] || null,
      topAlbum: topAlbums[0] || null,
      period: '1month'
    };
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    return null;
  }
};

// Test function to verify all API calls work
export const testLastFmAPI = async (username) => {
  console.log('🎵 Testing Last.fm API calls...');
  
  try {
    console.log('1. Testing getCurrentTrack...');
    const currentTrack = await getCurrentTrack(username);
    console.log('Current/Recent Track:', currentTrack);
    
    console.log('2. Testing getUserInfo...');
    const userInfo = await getUserInfo(username);
    console.log('User Info:', userInfo);
    
    console.log('3. Testing getTopArtists (1month)...');
    const topArtists = await getTopArtists(username, '1month', 5);
    console.log('Top Artists:', topArtists);
    
    console.log('4. Testing getTopAlbums (1month)...');
    const topAlbums = await getTopAlbums(username, '1month', 3);
    console.log('Top Albums:', topAlbums);
    
    console.log('5. Testing getMonthlyStats...');
    const monthlyStats = await getMonthlyStats(username);
    console.log('Monthly Stats:', monthlyStats);
    
    console.log('✅ All Last.fm API tests completed!');
    
    return {
      success: true,
      data: {
        currentTrack,
        userInfo,
        topArtists,
        topAlbums,
        monthlyStats
      }
    };
  } catch (error) {
    console.error('❌ Last.fm API test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Available time periods for charts
export const TIME_PERIODS = {
  '7day': 'Last 7 Days',
  '1month': 'Last Month',
  '3month': 'Last 3 Months',
  '6month': 'Last 6 Months',
  '12month': 'Last Year',
  'overall': 'All Time'
};
