"use client";

import { useState } from "react";
import AmbientBackground from "@/components/AmbientBackground";
import BackgroundVideo from "@/components/BackgroundVideo";
import BackgroundControls from "@/components/BackgroundControls";
import { useBackground } from "@/components/BackgroundManager";
import HorizontalScroller from "@/components/HorizontalScroller";

export default function TestMoviesPage() {
  const { mode, ambientEffect } = useBackground();
  const [activeTab, setActiveTab] = useState('rss');

  const tabs = [
    { id: 'rss', label: 'RSS Testing', description: 'Test Letterboxd RSS feeds' },
    { id: 'tmdb', label: 'TMDB Testing', description: 'Test TMDB API endpoints' },
    { id: 'integration', label: 'Integration Testing', description: 'Test data merging and fallbacks' },
    { id: 'scroller', label: 'Scroller Testing', description: 'Test HorizontalScroller edge previews' }
  ];

  return (
    <>
      {/* Dynamic Background System */}
      {mode === 'ambient' ? (
        <AmbientBackground effect={ambientEffect} />
      ) : (
        <BackgroundVideo />
      )}

      {/* Background Controls */}
      <BackgroundControls />

      <article className="relative w-full flex flex-col items-center justify-center py-8 space-y-8 min-h-screen">
        <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-6xl px-4">
          <h1 className="text-blue-200 font-semibold text-center text-4xl capitalize">
            Movie Data Testing
          </h1>
          <p className="text-center font-light text-sm xs:text-base text-gray-300">
            Test and validate Letterboxd RSS feeds and TMDB API endpoints before frontend implementation
          </p>

          {/* Tab Navigation */}
          <div className="w-full max-w-4xl">
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-yellow-400 text-black shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                  }`}
                >
                  <div className="text-sm font-semibold">{tab.label}</div>
                  <div className="text-xs opacity-80">{tab.description}</div>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              {activeTab === 'rss' && <RSSTestingSection />}
              {activeTab === 'tmdb' && <TMDBTestingSection />}
              {activeTab === 'integration' && <IntegrationTestingSection />}
              {activeTab === 'scroller' && <ScrollerTestingSection />}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

// RSS Testing Section Component
function RSSTestingSection() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState({});

  const rssEndpoints = [
    { 
      id: 'diary', 
      label: 'Diary Entries', 
      endpoint: '/api/letterboxd/diary',
      description: 'All movie diary entries with ratings and reviews',
      status: 'working'
    },
    { 
      id: 'five-star', 
      label: 'Five-Star Movies', 
      endpoint: '/api/letterboxd/five-star-movies',
      description: 'Movies rated 5 stars (filtered from diary)',
      status: 'working'
    },
    { 
      id: 'watchlist', 
      label: 'Watchlist (CSV + TMDB)', 
      endpoint: '/api/letterboxd/watchlist',
      description: 'Movies from watchlist.csv enriched with TMDB posters',
      status: 'working'
    },
    { 
      id: 'watchlist-random', 
      label: 'Random Watchlist Movie', 
      endpoint: '/api/letterboxd/watchlist-random',
      description: 'Get a random movie from pre-loaded CSV (super fast!)',
      status: 'working'
    },
    { 
      id: 'lists', 
      label: 'Movie Lists (Metadata)', 
      endpoint: '/api/letterboxd/lists',
      description: 'List titles and links to Letterboxd (no RSS needed)',
      status: 'working'
    },
    { 
      id: 'lists-featured', 
      label: 'Featured Lists', 
      endpoint: '/api/letterboxd/lists?featured=true',
      description: 'Lists tagged with "topstats" for main display',
      status: 'working'
    }
  ];

  const testEndpoint = async (endpoint) => {
    const endpointId = endpoint.id;
    setLoading(prev => ({ ...prev, [endpointId]: true }));
    
    try {
      const response = await fetch(endpoint.endpoint);
      const data = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        [endpointId]: {
          success: response.ok,
          status: response.status,
          data: data,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [endpointId]: {
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [endpointId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Letterboxd RSS Feed Testing</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rssEndpoints.map((endpoint) => (
          <div key={endpoint.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  {endpoint.label}
                  {endpoint.status === 'working' && <span className="text-green-400 text-sm">✓ Working</span>}
                  {endpoint.status === 'may-be-private' && <span className="text-yellow-400 text-sm">⚠ May be private</span>}
                  {endpoint.status === 'needs-list-name' && <span className="text-blue-400 text-sm">ℹ Needs parameter</span>}
                  {endpoint.status === 'not-available' && <span className="text-red-400 text-sm">✗ Not available</span>}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{endpoint.description}</p>
              </div>
              <button
                onClick={() => testEndpoint(endpoint)}
                disabled={loading[endpoint.id]}
                className="px-4 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading[endpoint.id] ? 'Testing...' : 'Test'}
              </button>
            </div>
            
            <div className="text-sm text-gray-400 mb-2">
              Endpoint: <code className="bg-black/30 px-2 py-1 rounded">{endpoint.endpoint}</code>
            </div>

            {testResults[endpoint.id] && (
              <div className="mt-3 p-3 bg-black/30 rounded border-l-4 border-l-yellow-400">
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-medium ${testResults[endpoint.id].success ? 'text-green-400' : 'text-red-400'}`}>
                    {testResults[endpoint.id].success ? '✓ Success' : '✗ Failed'}
                  </span>
                  <span className="text-xs text-gray-400">{testResults[endpoint.id].timestamp}</span>
                </div>
                
                {testResults[endpoint.id].status && (
                  <div className="text-sm text-gray-300 mb-2">
                    Status: {testResults[endpoint.id].status}
                  </div>
                )}

                {testResults[endpoint.id].error && (
                  <div className="text-sm text-red-400 mb-2">
                    Error: {testResults[endpoint.id].error}
                  </div>
                )}

                {testResults[endpoint.id].data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-yellow-400 hover:text-yellow-300">
                      View Response Data
                    </summary>
                    <pre className="mt-2 text-xs bg-black/50 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(testResults[endpoint.id].data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// TMDB Testing Section Component
function TMDBTestingSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchYear, setSearchYear] = useState('');
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState({});

  const tmdbEndpoints = [
    { id: 'search', label: 'Movie Search', endpoint: '/api/tmdb/search' },
    { id: 'details', label: 'Movie Details', endpoint: '/api/tmdb/movie-details' }
  ];

  const testSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(prev => ({ ...prev, search: true }));
    
    try {
      const params = new URLSearchParams({ 
        query: searchQuery,
        ...(searchYear && { year: searchYear })
      });
      
      const response = await fetch(`/api/tmdb/search?${params}`);
      const data = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        search: {
          success: response.ok,
          status: response.status,
          data: data,
          timestamp: new Date().toLocaleTimeString(),
          query: searchQuery,
          year: searchYear
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        search: {
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString(),
          query: searchQuery,
          year: searchYear
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  };

  const testMovieDetails = async (movieId) => {
    if (!movieId) return;
    
    setLoading(prev => ({ ...prev, details: true }));
    
    try {
      const response = await fetch(`/api/tmdb/movie-details?id=${movieId}`);
      const data = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        details: {
          success: response.ok,
          status: response.status,
          data: data,
          timestamp: new Date().toLocaleTimeString(),
          movieId: movieId
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        details: {
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString(),
          movieId: movieId
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, details: false }));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-yellow-400 mb-4">TMDB API Testing</h2>
      
      {/* Movie Search Testing */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h3 className="text-lg font-medium text-white mb-3">Movie Search</h3>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Enter movie title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 bg-black/30 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
            onKeyPress={(e) => e.key === 'Enter' && testSearch()}
          />
          <input
            type="number"
            placeholder="Year (optional)"
            value={searchYear}
            onChange={(e) => setSearchYear(e.target.value)}
            className="w-32 px-3 py-2 bg-black/30 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
          />
          <button
            onClick={testSearch}
            disabled={loading.search || !searchQuery.trim()}
            className="px-6 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading.search ? 'Searching...' : 'Search'}
          </button>
        </div>

        {testResults.search && (
          <div className="p-3 bg-black/30 rounded border-l-4 border-l-yellow-400">
            <div className="flex justify-between items-center mb-2">
              <span className={`font-medium ${testResults.search.success ? 'text-green-400' : 'text-red-400'}`}>
                {testResults.search.success ? '✓ Success' : '✗ Failed'}
              </span>
              <span className="text-xs text-gray-400">{testResults.search.timestamp}</span>
            </div>
            
            <div className="text-sm text-gray-300 mb-2">
              Query: &quot;{testResults.search.query}&quot; {testResults.search.year && `(${testResults.search.year})`}
            </div>

            {testResults.search.error && (
              <div className="text-sm text-red-400 mb-2">
                Error: {testResults.search.error}
              </div>
            )}

            {testResults.search.data && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-yellow-400 hover:text-yellow-300">
                  View Search Results ({testResults.search.data.results?.length || 0} movies)
                </summary>
                <div className="mt-2 space-y-2 max-h-60 overflow-auto">
                  {testResults.search.data.results?.slice(0, 5).map((movie, index) => (
                    <div key={movie.id} className="bg-black/50 p-2 rounded text-xs">
                      <div className="font-medium text-white">{movie.title} ({movie.release_date?.split('-')[0]})</div>
                      <div className="text-gray-400">ID: {movie.id}</div>
                      <button
                        onClick={() => testMovieDetails(movie.id)}
                        className="mt-1 px-2 py-1 bg-yellow-400 text-black rounded text-xs hover:bg-yellow-300"
                      >
                        Test Details
                      </button>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      {/* Movie Details Testing */}
      {testResults.details && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="text-lg font-medium text-white mb-3">Movie Details</h3>
          
          <div className="p-3 bg-black/30 rounded border-l-4 border-l-yellow-400">
            <div className="flex justify-between items-center mb-2">
              <span className={`font-medium ${testResults.details.success ? 'text-green-400' : 'text-red-400'}`}>
                {testResults.details.success ? '✓ Success' : '✗ Failed'}
              </span>
              <span className="text-xs text-gray-400">{testResults.details.timestamp}</span>
            </div>
            
            <div className="text-sm text-gray-300 mb-2">
              Movie ID: {testResults.details.movieId}
            </div>

            {testResults.details.error && (
              <div className="text-sm text-red-400 mb-2">
                Error: {testResults.details.error}
              </div>
            )}

            {testResults.details.data && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-yellow-400 hover:text-yellow-300">
                  View Movie Details
                </summary>
                <pre className="mt-2 text-xs bg-black/50 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(testResults.details.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Integration Testing Section Component
function IntegrationTestingSection() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runIntegrationTest = async () => {
    setLoading(true);
    setTestResults({});
    
    try {
      // Test data merging and fallback mechanisms
      const tests = [
        { name: 'RSS + TMDB Integration', endpoint: '/api/test/integration' },
        { name: 'Fallback Mechanism', endpoint: '/api/test/fallback' },
        { name: 'Performance Metrics', endpoint: '/api/test/performance' }
      ];

      const results = {};
      
      for (const test of tests) {
        try {
          const response = await fetch(test.endpoint);
          const data = await response.json();
          
          results[test.name] = {
            success: response.ok,
            status: response.status,
            data: data,
            timestamp: new Date().toLocaleTimeString()
          };
        } catch (error) {
          results[test.name] = {
            success: false,
            error: error.message,
            timestamp: new Date().toLocaleTimeString()
          };
        }
      }
      
      setTestResults(results);
    } catch (error) {
      setTestResults({
        error: {
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Integration Testing</h2>
      
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Data Integration & Fallback Testing</h3>
          <button
            onClick={runIntegrationTest}
            disabled={loading}
            className="px-6 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Running Tests...' : 'Run Integration Tests'}
          </button>
        </div>
        
        <p className="text-sm text-gray-400 mb-4">
          Test data merging between Letterboxd RSS and TMDB API, validate fallback mechanisms, and measure performance.
        </p>

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-3">
            {Object.entries(testResults).map(([testName, result]) => (
              <div key={testName} className="p-3 bg-black/30 rounded border-l-4 border-l-yellow-400">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-white">{testName}</span>
                  <span className={`text-sm font-medium ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                    {result.success ? '✓ Passed' : '✗ Failed'}
                  </span>
                </div>
                
                <div className="text-xs text-gray-400 mb-2">
                  {result.timestamp}
                </div>

                {result.error && (
                  <div className="text-sm text-red-400 mb-2">
                    Error: {result.error}
                  </div>
                )}

                {result.data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-yellow-400 hover:text-yellow-300">
                      View Test Results
                    </summary>
                    <pre className="mt-2 text-xs bg-black/50 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Scroller Testing Section Component
function ScrollerTestingSection() {
  const [showArrows, setShowArrows] = useState(true);
  const [showEdgePreviews, setShowEdgePreviews] = useState(true);
  const [edgePreviewWidth, setEdgePreviewWidth] = useState(60);

  // Sample movie data for testing
  const sampleMovies = [
    { id: 1, title: "The Godfather", year: 1972, poster: "https://image.tmdb.org/t/p/w300/3bhkrj58Vtu7enYsRolD1fZdja1.jpg" },
    { id: 2, title: "Pulp Fiction", year: 1994, poster: "https://image.tmdb.org/t/p/w300/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg" },
    { id: 3, title: "The Dark Knight", year: 2008, poster: "https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
    { id: 4, title: "Schindler's List", year: 1993, poster: "https://image.tmdb.org/t/p/w300/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg" },
    { id: 5, title: "Forrest Gump", year: 1994, poster: "https://image.tmdb.org/t/p/w300/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg" },
    { id: 6, title: "Inception", year: 2010, poster: "https://image.tmdb.org/t/p/w300/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg" },
    { id: 7, title: "Fight Club", year: 1999, poster: "https://image.tmdb.org/t/p/w300/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg" },
    { id: 8, title: "Goodfellas", year: 1990, poster: "https://image.tmdb.org/t/p/w300/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg" },
    { id: 9, title: "The Matrix", year: 1999, poster: "https://image.tmdb.org/t/p/w300/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg" },
    { id: 10, title: "Interstellar", year: 2014, poster: "https://image.tmdb.org/t/p/w300/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-yellow-400 mb-4">HorizontalScroller Edge Preview Testing</h2>
      
      {/* Controls */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h3 className="text-lg font-medium text-white mb-3">Scroller Configuration</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showArrows}
              onChange={(e) => setShowArrows(e.target.checked)}
              className="rounded"
            />
            <span className="text-white">Show Arrows</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showEdgePreviews}
              onChange={(e) => setShowEdgePreviews(e.target.checked)}
              className="rounded"
            />
            <span className="text-white">Show Edge Previews</span>
          </label>
          
          <div className="flex items-center space-x-2">
            <label className="text-white">Edge Width:</label>
            <input
              type="range"
              min="30"
              max="100"
              value={edgePreviewWidth}
              onChange={(e) => setEdgePreviewWidth(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-white text-sm">{edgePreviewWidth}px</span>
          </div>
        </div>
      </div>

      {/* Test Scroller */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h3 className="text-lg font-medium text-white mb-3">Movie Poster Scroller</h3>
        <p className="text-sm text-gray-400 mb-4">
          Test the edge preview functionality with movie posters. The edge previews should show partial visibility of next/previous items.
        </p>
        
        <HorizontalScroller
          showArrows={showArrows}
          showEdgePreviews={showEdgePreviews}
          edgePreviewWidth={edgePreviewWidth}
          itemWidth={150}
          className="mb-4"
        >
          {sampleMovies.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-32 sm:w-36 lg:w-40">
              <div className="bg-white/10 rounded-lg p-2 hover:bg-white/20 transition-all duration-300">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-40 sm:h-48 lg:h-56 object-cover rounded-md mb-2"
                  loading="lazy"
                />
                <h4 className="text-white text-sm font-medium truncate">{movie.title}</h4>
                <p className="text-gray-400 text-xs">{movie.year}</p>
              </div>
            </div>
          ))}
        </HorizontalScroller>
      </div>

      {/* Responsive Test */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h3 className="text-lg font-medium text-white mb-3">Responsive Edge Preview Test</h3>
        <p className="text-sm text-gray-400 mb-4">
          Test how edge previews adapt to different screen sizes. Resize your browser window to see the responsive behavior.
        </p>
        
        <div className="space-y-4">
          {/* Mobile simulation */}
          <div className="max-w-sm mx-auto">
            <h4 className="text-white text-sm mb-2">Mobile Simulation (max-width: 384px)</h4>
            <HorizontalScroller
              showArrows={false}
              showEdgePreviews={true}
              edgePreviewWidth={30}
              itemWidth={120}
            >
              {sampleMovies.slice(0, 6).map((movie) => (
                <div key={movie.id} className="flex-shrink-0 w-24">
                  <div className="bg-white/10 rounded p-1">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-32 object-cover rounded mb-1"
                      loading="lazy"
                    />
                    <p className="text-white text-xs truncate">{movie.title}</p>
                  </div>
                </div>
              ))}
            </HorizontalScroller>
          </div>

          {/* Tablet simulation */}
          <div className="max-w-2xl mx-auto">
            <h4 className="text-white text-sm mb-2">Tablet Simulation (max-width: 768px)</h4>
            <HorizontalScroller
              showArrows={true}
              showEdgePreviews={true}
              edgePreviewWidth={40}
              itemWidth={140}
            >
              {sampleMovies.slice(0, 8).map((movie) => (
                <div key={movie.id} className="flex-shrink-0 w-28">
                  <div className="bg-white/10 rounded p-2">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-36 object-cover rounded mb-1"
                      loading="lazy"
                    />
                    <p className="text-white text-xs truncate">{movie.title}</p>
                  </div>
                </div>
              ))}
            </HorizontalScroller>
          </div>
        </div>
      </div>

      {/* Edge Preview Indicators Test */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h3 className="text-lg font-medium text-white mb-3">Edge Preview Indicators</h3>
        <p className="text-sm text-gray-400 mb-4">
          Test the visual indicators that show when content is scrollable. The indicators should appear when there&apos;s more content to scroll.
        </p>
        
        <HorizontalScroller
          showArrows={false}
          showEdgePreviews={true}
          edgePreviewWidth={50}
          itemWidth={200}
        >
          {sampleMovies.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-48">
              <div className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-lg p-3 border border-yellow-400/30">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-64 object-cover rounded mb-2"
                  loading="lazy"
                />
                <h4 className="text-white font-medium truncate">{movie.title}</h4>
                <p className="text-yellow-400 text-sm">{movie.year}</p>
              </div>
            </div>
          ))}
        </HorizontalScroller>
      </div>
    </div>
  );
}