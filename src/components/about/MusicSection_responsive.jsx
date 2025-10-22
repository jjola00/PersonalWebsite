"use client";

import { useState, useEffect } from 'react';
import { getCurrentlyPlaying, getUserProfile, getTopArtists as getSpotifyTopArtists, getTopTracks as getSpotifyTopTracks } from '@/services/spotify';
import { getCurrentTrack, getTopArtists as getLastfmTopArtists, getTopTracks as getLastfmTopTracks, fetchLastFmData } from '@/services/lastfm';

const TIME_PERIODS = {
  '7day': 'Last 7 Days',
  '1month': 'Last Month', 
  '3month': 'Last 3 Months',
  '6month': 'Last 6 Months',
  '12month': 'Last Year',
  'overall': 'All Time'
};

const MusicSection = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [lastfmStats, setLastfmStats] = useState({ topArtist: null, topTrack: null, topAlbum: null });
  const [selectedPeriod, setSelectedPeriod] = useState('overall');
  const [loading, setLoading] = useState(false);

  const LASTFM_USERNAME = 'jjola0';

  useEffect(() => {
    loadMusicData();
  }, []);

  useEffect(() => {
    loadLastfmStats();
  }, [selectedPeriod]);

  const loadMusicData = async () => {
    setLoading(true);
    try {
      const [spotifyTrack, profile, spotifyArtists, spotifyTracks] = await Promise.all([
        getCurrentlyPlaying(),
        getUserProfile(), 
        getSpotifyTopArtists('medium_term', 15),
        getSpotifyTopTracks('medium_term', 15)
      ]);

      let displayTrack = spotifyTrack;
      if (!spotifyTrack) {
        const lastfmTrack = await getCurrentTrack(LASTFM_USERNAME);
        displayTrack = lastfmTrack;
      }

      setCurrentTrack(displayTrack);
      setUserProfile(profile);

      let displayArtists = spotifyArtists || [];
      let displayTracks = spotifyTracks || [];

      if (!spotifyArtists || spotifyArtists.length === 0) {
        const lastfmArtists = await getLastfmTopArtists(LASTFM_USERNAME, selectedPeriod, 15);
        displayArtists = lastfmArtists;
      }

      if (!spotifyTracks || spotifyTracks.length === 0) {
        const lastfmTracks = await getLastfmTopTracks(LASTFM_USERNAME, selectedPeriod, 15);
        displayTracks = lastfmTracks;
      }

      setTopArtists(displayArtists);
      setTopTracks(displayTracks);
    } catch (error) {
      console.error('Error loading music data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLastfmStats = async () => {
    try {
      const [artistsData, tracksData, albumsData] = await Promise.all([
        fetchLastFmData('user.getTopArtists', { user: LASTFM_USERNAME, period: selectedPeriod, limit: 1 }),
        fetchLastFmData('user.getTopTracks', { user: LASTFM_USERNAME, period: selectedPeriod, limit: 1 }),
        fetchLastFmData('user.getTopAlbums', { user: LASTFM_USERNAME, period: selectedPeriod, limit: 1 })
      ]);

      let topArtist = null;
      if (artistsData?.topartists?.artist?.length > 0) {
        const artist = artistsData.topartists.artist[0];
        topArtist = {
          name: artist.name,
          playcount: parseInt(artist.playcount),
          url: artist.url
        };
      }

      let topTrack = null;
      if (tracksData?.toptracks?.track?.length > 0) {
        const track = tracksData.toptracks.track[0];
        topTrack = {
          name: track.name,
          artist: track.artist.name,
          playcount: parseInt(track.playcount),
          url: track.url
        };
      }

      let topAlbum = null;
      try {
        if (albumsData?.topalbums?.album?.length > 0) {
          const album = albumsData.topalbums.album[0];
          const image = album.image?.find(img => img.size === 'large')?.['#text'] || 
                      album.image?.find(img => img.size === 'medium')?.['#text'] || 
                      album.image?.[0]?.['#text'] || '';
          
          topAlbum = {
            name: album.name,
            artist: album.artist.name,
            playcount: parseInt(album.playcount),
            image: image,
            url: album.url
          };
        }
      } catch (albumError) {
        console.error('Error fetching top albums:', albumError);
      }

      setLastfmStats({ topArtist, topTrack, topAlbum });
    } catch (err) {
      console.error('Error loading Last.fm stats:', err);
    }
  };

  return (
    <div className="w-full h-auto container">
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
      
      {/* TOP ROW - Now Playing & Profile */}
      <div className="flex-responsive mb-8">
        
        {/* Now Playing - Rotating Vinyl */}
        <div className="flex flex-col items-center justify-center flex-1 min-w-0">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56">
            {currentTrack?.image ? (
              <div className={`w-full h-full rounded-full border-4 border-[#FEFE5B]/50 overflow-hidden ${currentTrack.isPlaying ? 'animate-spin' : ''}`} style={{animationDuration: '3s'}}>
                <img 
                  src={currentTrack.image} 
                  alt="Album art" 
                  className="w-full h-full object-cover"
                />
                {/* Vinyl record center */}
                <div className="absolute top-1/2 left-1/2 w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 bg-black rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-gray-600">
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-gray-800 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full rounded-full border-4 border-[#FEFE5B]/50 bg-gradient-to-br from-[#FEFE5B]/20 to-[#FEFE5B]/40 flex items-center justify-center">
                <span className="text-2xl sm:text-4xl md:text-6xl">🎵</span>
              </div>
            )}
          </div>
          
          {/* Now Playing Info - Mobile Optimized */}
          <div className="text-center mt-4 max-w-full px-2">
            <p className="text-responsive-sm" style={{color: '#FEFE5B'}}>
              {currentTrack?.isPlaying ? 'Now Playing' : 'Last Played'}
            </p>
            <p className="text-responsive-md font-semibold text-white truncate max-w-[200px] sm:max-w-[300px] mx-auto">
              {currentTrack?.name || 'No track available'}
            </p>
            <p className="text-responsive-sm text-gray-300 truncate max-w-[200px] sm:max-w-[300px] mx-auto">
              {currentTrack?.artist || ''}
            </p>
          </div>
        </div>

        {/* Top Artists & Tracks - Mobile Optimized */}
        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Artists */}
          <div className="h-60 sm:h-80">
            <h3 className="text-responsive-lg mb-4 font-semibold text-center md:text-left" style={{color: '#FEFE5B'}}>Top Artists</h3>
            <div className="h-48 sm:h-64 overflow-hidden relative">
              <div className="animate-scroll glass-scrollbar">
                {topArtists.map((artist, index) => (
                  <div key={index} className="flex items-center p-2 mb-2 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="text-responsive-sm font-bold mr-3 min-w-[24px]" style={{color: '#FEFE5B'}}>{index + 1}</span>
                    <img src={artist.image} alt={artist.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-3 object-cover" />
                    <span className="text-responsive-sm text-white truncate">{artist.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Tracks */}
          <div className="h-60 sm:h-80">
            <h3 className="text-responsive-lg mb-4 font-semibold text-center md:text-left" style={{color: '#FEFE5B'}}>Top Tracks</h3>
            <div className="h-48 sm:h-64 overflow-hidden relative">
              <div className="animate-scroll glass-scrollbar">
                {topTracks.map((track, index) => (
                  <div key={index} className="flex items-center p-2 mb-2 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="text-responsive-sm font-bold mr-3 min-w-[24px]" style={{color: '#FEFE5B'}}>{index + 1}</span>
                    <img src={track.image} alt={track.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded mr-3 object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-responsive-sm text-white truncate">{track.name}</p>
                      <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Profile - Mobile Optimized */}
        <div className="flex flex-col items-center justify-center flex-1 min-w-0">
          <div className="text-center mb-6">
            <a 
              href={userProfile?.url || 'https://open.spotify.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto mb-3 rounded-full overflow-hidden bg-background/30 hover:opacity-80 transition-opacity">
                {userProfile?.image ? (
                  <img src={userProfile.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl sm:text-3xl">👤</div>
                )}
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW - Stats & Controls */}
      <div className="flex flex-col items-center justify-center mt-8">
        
        {/* Stats Row - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12 text-center items-center mb-6 w-full max-w-4xl">
          {/* Top Song */}
          <div className="order-2 sm:order-1">
            <p className="text-responsive-lg font-semibold" style={{color: '#FEFE5B'}}>Top Song</p>
            <p className="text-responsive-md text-white truncate max-w-[200px] mx-auto">{lastfmStats.topTrack?.name || 'N/A'}</p>
            <p className="text-responsive-sm" style={{color: '#FEFE5B'}}>{lastfmStats.topTrack?.playcount || 0} plays</p>
          </div>
          
          {/* Album - Featured in center */}
          <div className="flex flex-col items-center order-1 sm:order-2">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded overflow-hidden bg-background/30 mb-3">
              {lastfmStats.topAlbum?.image ? (
                <img src={lastfmStats.topAlbum.image} alt="Album" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl sm:text-4xl">💿</div>
              )}
            </div>
            <p className="text-responsive-lg font-semibold" style={{color: '#FEFE5B'}}>Album</p>
            <p className="text-responsive-md text-white truncate max-w-[200px] mx-auto">{lastfmStats.topAlbum?.name || 'N/A'}</p>
            <p className="text-responsive-sm" style={{color: '#FEFE5B'}}>{lastfmStats.topAlbum?.playcount || 0} plays</p>
          </div>

          {/* Top Artist */}
          <div className="order-3">
            <p className="text-responsive-lg font-semibold" style={{color: '#FEFE5B'}}>Top Artist</p>
            <p className="text-responsive-md text-white truncate max-w-[200px] mx-auto">{lastfmStats.topArtist?.name || 'N/A'}</p>
            <p className="text-responsive-sm" style={{color: '#FEFE5B'}}>{lastfmStats.topArtist?.playcount || 0} plays</p>
          </div>
        </div>

        {/* Time Period Selector - Mobile Optimized */}
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:px-6 sm:py-3 shadow-2xl w-full max-w-4xl overflow-x-auto">
          <div className="flex gap-2 items-center min-w-max">
            {Object.entries(TIME_PERIODS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedPeriod(key)}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ease-out whitespace-nowrap ${
                  selectedPeriod === key
                    ? 'bg-[#FEFE5B] text-black shadow-lg transform scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicSection;