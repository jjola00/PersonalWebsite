"use client";

import { useState, useEffect } from 'react';
import { getCurrentlyPlaying, getUserProfile, getTopArtists as getSpotifyTopArtists, getTopTracks as getSpotifyTopTracks } from '@/services/spotify';
import { getCurrentTrack, getTopArtists as getLastfmTopArtists, getTopTracks as getLastfmTopTracks, fetchLastFmData } from '@/services/lastfm';
import { useMobileNavigation } from '@/contexts/MobileNavigationContext';

const TIME_PERIODS = {
  '7day': 'Last 7 Days',
  '1month': 'Last Month', 
  '3month': 'Last 3 Months',
  '6month': 'Last 6 Months',
  '12month': 'Last Year',
  'overall': 'All Time'
};

const MusicSection = () => {
  const { isMobileMenuOpen } = useMobileNavigation();
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
        @keyframes scrollUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        @keyframes scrollDown {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }
        .animate-scroll-up {
          animation: scrollUp 20s linear infinite;
        }
        .animate-scroll-down {
          animation: scrollDown 20s linear infinite;
        }
      `}</style>
      
      {/* TOP ROW - RESTORE ORIGINAL HEIGHT + LAYOUT FIXES */}
      <div className="flex items-stretch h-96 md:h-[500px] mb-8 gap-0">
        {/* LEFT - Top Artists - INFINITE SCROLL WITH SMALLER MOBILE ITEMS */}
        <div className="absolute left-0 top-0 w-[22%] md:w-[20%] h-full overflow-hidden z-20">
          <div className="h-full">
            <div className="animate-scroll-up" style={{ height: '300%' }}>
              {[...topArtists, ...topArtists, ...topArtists].map((artist, index) => (
                <div key={`${artist.name}-${index}`} className="flex flex-col items-center p-1 mb-1 md:mb-1 rounded-lg hover:bg-white/5 transition-colors">
                  <img 
                    src={artist.image} 
                    alt={artist.name} 
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full mb-1 object-cover" 
                  />
                  <span className="text-[10px] sm:text-xs md:text-sm text-white text-center truncate w-full px-1 leading-tight">
                    {artist.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER - Profile Top-Left (Mobile & Desktop), Vinyl Centered */}
        <div className={`flex-1 flex flex-col items-center justify-center relative transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {/* Profile - MOBILE: More Right, DESKTOP: Top Left */}
          <div className="flex flex-col items-center absolute top-4 left-16 sm:left-20 md:left-4">
            <a 
              href={userProfile?.url || 'https://open.spotify.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 rounded-full overflow-hidden bg-background/30 hover:opacity-80 transition-opacity">
                {userProfile?.image ? (
                  <img src={userProfile.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm sm:text-lg md:text-3xl">👤</div>
                )}
              </div>
            </a>
          </div>

          {/* Now Playing - PERFECTLY CENTERED */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-52 md:h-52 lg:w-60 lg:h-60">
              {currentTrack?.image ? (
                <div className={`w-full h-full rounded-full border-4 border-[#FEFE5B]/50 overflow-hidden ${currentTrack.isPlaying ? 'animate-spin' : ''}`} style={{animationDuration: '3s'}}>
                  <img 
                    src={currentTrack.image} 
                    alt="Album art" 
                    className="w-full h-full object-cover"
                  />
                  {/* Vinyl record center */}
                  <div className="absolute top-1/2 left-1/2 w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-black rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-gray-600">
                    <div className="absolute top-1/2 left-1/2 w-2 h-2 sm:w-3 sm:h-3 md:w-5 md:h-5 lg:w-6 lg:h-6 bg-gray-800 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full rounded-full border-4 border-[#FEFE5B]/50 bg-gradient-to-br from-[#FEFE5B]/20 to-[#FEFE5B]/40 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl md:text-6xl lg:text-7xl">🎵</span>
                </div>
              )}
            </div>
            
            {/* Now Playing Info - BACK TO ORIGINAL SIZE */}
            <div className="text-center mt-4 max-w-full px-2">
              <p className="text-xs sm:text-sm md:text-base" style={{color: '#FEFE5B'}}>
                {currentTrack?.isPlaying ? 'Now Playing' : 'Last Played'}
              </p>
              <p className="text-sm sm:text-base md:text-lg font-semibold text-white truncate max-w-[180px] sm:max-w-[250px] mx-auto">
                {currentTrack?.name || 'No track available'}
              </p>
              <p className="text-xs sm:text-sm md:text-base text-gray-300 truncate max-w-[180px] sm:max-w-[250px] mx-auto">
                {currentTrack?.artist || ''}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT - Top Tracks - INFINITE SCROLL WITH SMALLER MOBILE ITEMS */}
        <div className="absolute right-0 top-0 w-[22%] md:w-[20%] h-full overflow-hidden z-20">
          <div className="h-full">
            <div className="animate-scroll-down" style={{ height: '300%' }}>
              {[...topTracks, ...topTracks, ...topTracks].map((track, index) => (
                <div key={`${track.name}-${index}`} className="flex flex-col items-center p-1 mb-1 md:mb-1 rounded-lg hover:bg-white/5 transition-colors">
                  <img 
                    src={track.image} 
                    alt={track.name} 
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded mb-1 object-cover" 
                  />
                  <div className="text-center w-full px-1">
                    <p className="text-[10px] sm:text-xs md:text-sm text-white truncate leading-tight">{track.name}</p>
                    <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-400 truncate leading-tight">{track.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW - Stats & Controls - FLOW UP INTO FREED SPACE */}
      <div className="flex flex-col items-center justify-center mt-4 md:mt-8">
        
        {/* Stats Row - MORE COMPACT ON MOBILE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 md:gap-12 text-center items-center mb-4 md:mb-6 w-full max-w-4xl">
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

        {/* Time Period Selector - CENTERED & NO TRAILING SPACE */}
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:px-6 sm:py-3 shadow-2xl max-w-4xl mx-auto">
          <div className="flex gap-2 items-center justify-center flex-wrap">
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