"use client";

import { useState, useEffect } from 'react';
import { useMobileNavigation } from '@/contexts/MobileNavigationContext';
import StackedCards from '@/components/StackedCards';
import { cleanMovieData, cleanTitle } from '@/utils/titleCleaner';

const MovieSection = () => {
  const { isMobileMenuOpen } = useMobileNavigation();
  const [movieData, setMovieData] = useState({
    diary: { success: false, data: [] },
    fiveStarMovies: { success: false, data: [] },
    randomMovie: { success: false, data: null },
    lists: { success: false, data: [] }
  });
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationMovie, setAnimationMovie] = useState(null);
  const [watchlistMovies, setWatchlistMovies] = useState([]);

  useEffect(() => {
    loadMovieData();
    loadWatchlistMovies();
  }, []);

  const loadWatchlistMovies = async () => {
    try {
      const response = await fetch('/api/letterboxd/watchlist?limit=50');
      const watchlistData = await response.json();
      if (watchlistData.success) {
        setWatchlistMovies(watchlistData.data);
      }
    } catch (err) {
      console.error('Error loading watchlist movies:', err);
    }
  };

  const loadMovieData = async () => {
    setLoading(true);

    try {
      // Fetch data with higher limits
      const [diaryRes, fiveStarRes, randomRes, listsRes] = await Promise.all([
        fetch('/api/letterboxd/diary?limit=10'),
        fetch('/api/letterboxd/five-star-movies?limit=15'), // Get all five-star movies
        fetch('/api/letterboxd/watchlist-random'),
        fetch('/api/letterboxd/lists')
      ]);

      const [diary, fiveStarMovies, randomMovie, lists] = await Promise.all([
        diaryRes.json(),
        fiveStarRes.json(),
        randomRes.json(),
        listsRes.json()
      ]);

      const movieDataObject = {
        diary,
        fiveStarMovies,
        randomMovie,
        lists
      };

      // Apply title cleaning to all movie data
      const cleanedMovieData = cleanMovieData(movieDataObject);



      setMovieData(cleanedMovieData);
    } catch (err) {
      console.error('Error loading movie data:', err);
    } finally {
      setLoading(false);
    }
  };

  const cycleWatchlistMovies = async () => {
    if (watchlistMovies.length === 0) return;

    const shuffledMovies = [...watchlistMovies].sort(() => Math.random() - 0.5);
    const cycleDuration = 2000; // 2 seconds total
    const totalCycles = 15; // Number of movies to cycle through

    for (let i = 0; i < totalCycles; i++) {
      const movie = shuffledMovies[i % shuffledMovies.length];

      // Convert watchlist movie to random movie format
      const formattedMovie = {
        posterUrl: movie.posterUrl,
        name: movie.name,
        title: movie.name,
        year: movie.year,
        letterboxdUri: movie.letterboxdUri
      };

      setAnimationMovie(formattedMovie);

      // Calculate delay - starts fast, gets slower
      const progress = i / (totalCycles - 1);
      const delay = 50 + (progress * progress * 300); // Exponential slowdown

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  };

  const refreshRandomMovie = async () => {
    if (isAnimating) return; // Prevent multiple animations

    try {
      setIsAnimating(true);

      // Start the cycling animation
      await cycleWatchlistMovies();

      // Fetch the actual random movie
      const response = await fetch('/api/letterboxd/watchlist-random');
      const newRandomMovie = await response.json();

      // Apply title cleaning to the new random movie data
      const cleanedRandomMovie = {
        ...newRandomMovie,
        data: newRandomMovie.data ? {
          ...newRandomMovie.data,
          name: cleanTitle(newRandomMovie.data.name),
          title: cleanTitle(newRandomMovie.data.title)
        } : newRandomMovie.data
      };

      setMovieData(prev => ({
        ...prev,
        randomMovie: cleanedRandomMovie
      }));

      setAnimationMovie(null); // Clear animation movie
    } catch (err) {
      console.error('Error refreshing random movie:', err);
    } finally {
      setIsAnimating(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-96 container flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎬</div>
          <p className="text-gray-400">Loading movie data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-auto">
      {/* MY LETTERBOXD BUTTON - TOP RIGHT */}
      <div className="absolute top-0 right-0 z-10">
        <a
          href="https://letterboxd.com/jjola00/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:bg-white/20 hover:border-yellow-400/50 hover:text-yellow-400 transition-all duration-300 text-sm font-medium"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          My Letterboxd
        </a>
      </div>

      {/* MAIN CONTENT PADDING FOR TOP BUTTON */}
      <div className="w-full h-auto pt-12">
        {/* MAIN CONTENT - DESKTOP: 3 COLUMNS, MOBILE: STACKED */}
        <div className={`transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

          {/* MOBILE LAYOUT */}
          <div className="block lg:hidden space-y-6">
            {/* My Diary */}
            <div className="text-center">
              <h3 className="text-responsive-lg font-semibold mb-6" style={{ color: '#FEFE5B' }}>
                My Diary
              </h3>
              <StackedCards
                items={movieData.diary.data || []}
                maxVisibleCards={4}
                autoRotate={false}
                onCardClick={(item) => {
                  if (item.movie?.letterboxdUrl || item.letterboxdUrl) {
                    window.open(item.movie?.letterboxdUrl || item.letterboxdUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                posterSize="small"
                titleSize="small"
              />
            </div>

            {/* My 5 Star Movies */}
            <div className="text-center">
              <h3 className="text-responsive-lg font-semibold mb-6" style={{ color: '#FEFE5B' }}>
                My 5 Star Movies
              </h3>
              <StackedCards
                items={movieData.fiveStarMovies.data || []}
                maxVisibleCards={6}
                autoRotate={true}
                autoRotateInterval={4000}
                onCardClick={(item) => {
                  if (item.movie?.letterboxdUrl || item.letterboxdUrl) {
                    window.open(item.movie?.letterboxdUrl || item.letterboxdUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                posterSize="small"
                titleSize="small"
              />
            </div>

            {/* Watch a Movie */}
            <div className="text-center">
              <h3 className="text-responsive-lg font-semibold mb-6" style={{ color: '#FEFE5B' }}>
                Watch a Movie
              </h3>
              {(movieData.randomMovie.success && movieData.randomMovie.data) || animationMovie ? (
                <div>
                  <StackedCards
                    items={[{
                      movie: {
                        poster: animationMovie?.posterUrl || movieData.randomMovie.data?.posterUrl,
                        title: animationMovie?.name || movieData.randomMovie.data?.name,
                        year: animationMovie?.year || movieData.randomMovie.data?.year,
                        letterboxdUrl: animationMovie?.letterboxdUri || movieData.randomMovie.data?.letterboxdUri
                      }
                    }]}
                    maxVisibleCards={1}
                    autoRotate={false}
                    onCardClick={() => {
                      const url = animationMovie?.letterboxdUri || movieData.randomMovie.data?.letterboxdUri;
                      if (url && !isAnimating) {
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    posterSize="small"
                    titleSize="small"
                    className={isAnimating ? 'animate-pulse' : ''}
                  />

                  {/* Action buttons below the poster */}
                  <div className="flex flex-col gap-2 mt-4 w-full max-w-[160px] mx-auto">
                    <button
                      onClick={refreshRandomMovie}
                      disabled={isAnimating}
                      className={`w-full py-2 px-4 rounded-lg transition-all duration-300 font-medium text-sm ${isAnimating
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-yellow-400 text-black hover:bg-yellow-300'
                        }`}
                    >
                      {isAnimating ? 'Picking...' : 'Again!'}
                    </button>

                    <a
                      href="https://letterboxd.com/jjola00/watchlist/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-4 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 font-medium text-sm text-center"
                    >
                      My Watchlist
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-3xl mb-2">🎲</div>
                  <p>No watchlist movies available</p>
                </div>
              )}

              {/* My Lists */}
              <div className="mt-8">
                <h4 className="text-responsive-md font-semibold mb-4" style={{ color: '#FEFE5B' }}>
                  My Lists
                </h4>
                <div className="flex flex-wrap justify-center gap-2">
                  {(movieData.lists.data || []).slice(0, 5).map((list, index) => (
                    <a
                      key={list.id || index}
                      href={list.letterboxdUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-white/10 text-white rounded-full text-sm hover:bg-yellow-400 hover:text-black transition-all duration-300"
                    >
                      {list.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* DESKTOP LAYOUT - MOVIES ON TOP, LISTS AT BOTTOM */}
          <div className="hidden lg:block">
            {/* Movie Sections - Horizontal Layout */}
            <div className="flex justify-between items-start mb-2">
              {/* My Diary */}
              <div className="flex flex-col items-center flex-1">
                {/* Title */}
                <div className="h-8 flex items-end mb-4">
                  <h3 className="text-responsive-md font-semibold" style={{ color: '#FEFE5B' }}>
                    My Diary
                  </h3>
                </div>

                {/* Poster container */}
                <div className="flex justify-center">
                  <div className="w-[200px]">
                    <StackedCards
                      items={movieData.diary.data || []}
                      maxVisibleCards={4}
                      autoRotate={false}
                      onCardClick={(item) => {
                        if (item.movie?.letterboxdUrl || item.letterboxdUrl) {
                          window.open(item.movie?.letterboxdUrl || item.letterboxdUrl, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      posterSize="medium"
                      titleSize="medium"
                    />
                  </div>
                </div>
              </div>

              {/* My 5 Star Movies */}
              <div className="flex flex-col items-center flex-1">
                {/* Title */}
                <div className="h-8 flex items-end mb-4">
                  <h3 className="text-responsive-md font-semibold" style={{ color: '#FEFE5B' }}>
                    My 5 Star Movies
                  </h3>
                </div>

                {/* Poster container */}
                <div className="flex justify-center">
                  <div className="w-[200px]">
                    <StackedCards
                      items={movieData.fiveStarMovies.data || []}
                      maxVisibleCards={8}
                      autoRotate={true}
                      autoRotateInterval={4000}
                      onCardClick={(item) => {
                        if (item.movie?.letterboxdUrl || item.letterboxdUrl) {
                          window.open(item.movie?.letterboxdUrl || item.letterboxdUrl, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      posterSize="medium"
                      titleSize="medium"
                    />
                  </div>
                </div>
              </div>

              {/* Watch a Movie */}
              <div className="flex flex-col items-center flex-1">
                {/* Title */}
                <div className="h-8 flex items-end mb-4">
                  <h3 className="text-responsive-md font-semibold" style={{ color: '#FEFE5B' }}>
                    Watch a Movie
                  </h3>
                </div>

                {/* Poster container */}
                <div className="flex justify-center">
                  <div className="w-[200px]">
                    {(movieData.randomMovie.success && movieData.randomMovie.data) || animationMovie ? (
                      <div>
                        <StackedCards
                          items={[{
                            movie: {
                              poster: animationMovie?.posterUrl || movieData.randomMovie.data?.posterUrl,
                              title: animationMovie?.name || movieData.randomMovie.data?.name,
                              year: animationMovie?.year || movieData.randomMovie.data?.year,
                              letterboxdUrl: animationMovie?.letterboxdUri || movieData.randomMovie.data?.letterboxdUri
                            }
                          }]}
                          maxVisibleCards={1}
                          autoRotate={false}
                          onCardClick={() => {
                            const url = animationMovie?.letterboxdUri || movieData.randomMovie.data?.letterboxdUri;
                            if (url && !isAnimating) {
                              window.open(url, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          posterSize="medium"
                          titleSize="medium"
                          className={isAnimating ? 'animate-pulse' : ''}
                        />

                        {/* Action buttons below the poster */}
                        <div className="flex flex-col gap-2 mt-4 w-full max-w-[160px] mx-auto">
                          <button
                            onClick={refreshRandomMovie}
                            disabled={isAnimating}
                            className={`w-full py-2 px-4 rounded-lg transition-all duration-300 font-medium text-sm ${isAnimating
                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                              : 'bg-yellow-400 text-black hover:bg-yellow-300'
                              }`}
                          >
                            {isAnimating ? 'Picking...' : 'Again!'}
                          </button>

                          <a
                            href="https://letterboxd.com/jjola00/watchlist/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 px-4 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 font-medium text-sm text-center"
                          >
                            My Watchlist
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <div className="text-3xl mb-2">🎲</div>
                        <p>No watchlist movies available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* My Lists - BOTTOM SECTION */}
            <div className="text-center">
              <div className="mb-6">
                <h3 className="text-responsive-md font-semibold" style={{ color: '#FEFE5B' }}>
                  My Lists
                </h3>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-6xl mx-auto">
                {(movieData.lists.data || []).map((list, index) => (
                  <a
                    key={list.id || index}
                    href={list.letterboxdUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-sm hover:bg-yellow-400 hover:text-black transition-all duration-300 whitespace-nowrap"
                  >
                    {list.name}
                  </a>
                ))}
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};



export default MovieSection;