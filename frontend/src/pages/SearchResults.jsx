import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Clock,
  Sparkles,
  ArrowUpDown,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Tag,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { searchMovies, getFilters } from '../services/api';
import MovieCard from '../components/MovieCard';
import RelevanceModal from '../components/RelevanceModal';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryParam = searchParams.get('q') || '';
  const modeParam = searchParams.get('mode') || 'natural';

  const [inputQuery, setInputQuery] = useState(queryParam);
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [executionTime, setExecutionTime] = useState(0);
  const [processedQuery, setProcessedQuery] = useState('');
  const [tokens, setTokens] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState({
    genres: [],
    languages: [],
    year_min: 1970,
    year_max: 2026,
    rating_min: 0,
    rating_max: 10,
  });

  // Selected filters
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedYearMin, setSelectedYearMin] = useState('');
  const [selectedYearMax, setSelectedYearMax] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');
  const [limit, setLimit] = useState(12);

  // Modal for "Why this movie?"
  const [selectedMovieForExplanation, setSelectedMovieForExplanation] = useState(null);

  // Load filter options on mount
  useEffect(() => {
    getFilters()
      .then((data) => {
        setFilterOptions(data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Execute search when queryParam, modeParam, or filters change
  useEffect(() => {
    setInputQuery(queryParam);
    if (!queryParam.trim()) {
      setResults([]);
      setTotalResults(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      query: queryParam,
      limit: limit,
      offset: 0,
      sort_by: sortBy,
      mode: modeParam,
      filters: {
        genre: selectedGenre || null,
        year_min: selectedYearMin ? parseInt(selectedYearMin) : null,
        year_max: selectedYearMax ? parseInt(selectedYearMax) : null,
        language: selectedLanguage || null,
        min_rating: minRating > 0 ? parseFloat(minRating) : null,
      },
    };

    searchMovies(payload)
      .then((data) => {
        setResults(data.results || []);
        setTotalResults(data.total_results || 0);
        setExecutionTime(data.execution_time_ms || 0);
        setProcessedQuery(data.processed_query || '');
        setTokens(data.tokens || []);
        setSuggestions(data.suggestions || []);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to retrieve search results. Please check your query or connection.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    queryParam,
    modeParam,
    selectedGenre,
    selectedLanguage,
    selectedYearMin,
    selectedYearMax,
    minRating,
    sortBy,
    limit,
  ]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    setSearchParams({ q: inputQuery.trim(), mode: modeParam });
  };

  const handleResetFilters = () => {
    setSelectedGenre('');
    setSelectedLanguage('');
    setSelectedYearMin('');
    setSelectedYearMax('');
    setMinRating(0);
    setSortBy('relevance');
  };

  const hasActiveFilters =
    Boolean(selectedGenre) ||
    Boolean(selectedLanguage) ||
    Boolean(selectedYearMin) ||
    Boolean(selectedYearMax) ||
    minRating > 0 ||
    sortBy !== 'relevance';

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      {/* Top Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSearchSubmit} className="relative flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Search by plot, scene, mood, character..."
              className="w-full px-5 py-3.5 pl-12 rounded-xl bg-[#13121f] text-white placeholder-gray-500 text-sm border border-purple-800/40 focus:border-purple-500/80 outline-none transition-all shadow-lg"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-purple-900/30 mb-8">
        <div>
          {modeParam === 'forgotten' ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-700/40 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Movies that match your memory</span>
            </div>
          ) : (
            <span className="text-xs text-purple-400 font-mono block mb-1">
              Natural Language Information Retrieval
            </span>
          )}

          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Results for: <span className="text-purple-300 font-medium">"{queryParam}"</span>
          </h1>

          {/* Tokens breakdown preview */}
          {tokens.length > 0 && (
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 font-mono">
              <span className="text-gray-500">Query Stems:</span>
              <div className="flex flex-wrap gap-1">
                {tokens.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 text-[11px] border border-purple-800/30"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats & Quick IR Lab Link */}
        <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
          <div className="flex items-center gap-1.5 bg-[#12111d] px-3 py-1.5 rounded-lg border border-purple-900/30">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>
              <strong className="text-white">{totalResults}</strong> movies retrieved
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#12111d] px-3 py-1.5 rounded-lg border border-purple-900/30">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>
              <strong className="text-white">{executionTime}</strong> ms
            </span>
          </div>

          <button
            onClick={() => navigate(`/ir-lab?q=${encodeURIComponent(queryParam)}`)}
            className="px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-700/40 hover:border-purple-500 font-semibold transition-all flex items-center gap-1"
            title="Inspect deep IR calculations in IR Lab"
          >
            <span>Inspect in IR Lab</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="p-5 rounded-2xl glass-panel border border-purple-900/30 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                Refine Results
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#181628] text-xs text-gray-200 border border-purple-900/40 focus:border-purple-500 outline-none"
              >
                <option value="relevance">Cosine Relevance (Descending)</option>
                <option value="rating">Rating (Highest First)</option>
                <option value="year">Release Year (Newest First)</option>
              </select>
            </div>

            {/* Genre Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Genre</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#181628] text-xs text-gray-200 border border-purple-900/40 focus:border-purple-500 outline-none"
              >
                <option value="">All Genres</option>
                {filterOptions.genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Rating Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-gray-300">Minimum Rating:</span>
                <span className="font-mono text-purple-400">{minRating > 0 ? `${minRating.toFixed(1)} ★` : 'Any'}</span>
              </div>
              <input
                type="range"
                min="0"
                max="9.5"
                step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Year Range */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Release Year</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="From (e.g. 1990)"
                  value={selectedYearMin}
                  onChange={(e) => setSelectedYearMin(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#181628] text-xs text-gray-200 border border-purple-900/40 focus:border-purple-500 outline-none font-mono"
                />
                <input
                  type="number"
                  placeholder="To (e.g. 2024)"
                  value={selectedYearMax}
                  onChange={(e) => setSelectedYearMax(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#181628] text-xs text-gray-200 border border-purple-900/40 focus:border-purple-500 outline-none font-mono"
                />
              </div>
            </div>

            {/* Language Filter */}
            {filterOptions.languages.length > 1 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#181628] text-xs text-gray-200 border border-purple-900/40 focus:border-purple-500 outline-none"
                >
                  <option value="">All Languages</option>
                  {filterOptions.languages.map((l) => (
                    <option key={l} value={l}>
                      {l.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </aside>

        {/* Results Grid Container */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl bg-gray-900/40 aspect-[2/3] animate-pulse border border-purple-900/20" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 rounded-2xl glass-panel border border-red-900/40 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Retrieval Notice</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">{error}</p>
            </div>
          ) : results.length === 0 ? (
            /* Empty State */
            <div className="p-12 rounded-2xl glass-panel border border-purple-900/30 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-purple-400/60 mx-auto" />
              <h3 className="text-xl font-bold text-white">No Matching Movies Found</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                The Information Retrieval engine found zero document vectors with positive cosine similarity for your search terms.
              </p>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="pt-4 max-w-md mx-auto">
                  <p className="text-xs font-semibold uppercase text-purple-300 mb-2">
                    Try searching for related indexed keywords:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputQuery(s);
                          setSearchParams({ q: s, mode: modeParam });
                        }}
                        className="px-3 py-1 rounded-md text-xs font-mono bg-purple-950/60 hover:bg-purple-900 text-purple-200 border border-purple-800/40 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
                >
                  Clear Filters & Try Again
                </button>
              </div>
            </div>
          ) : (
            /* Movie Cards Grid */
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {results.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isSearchResult={true}
                    onExplain={(m) => setSelectedMovieForExplanation(m)}
                  />
                ))}
              </div>

              {/* Load more if totalResults > results.length */}
              {totalResults > results.length && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setLimit((prev) => prev + 12)}
                    className="px-6 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 font-semibold text-xs border border-purple-700/40 transition-colors"
                  >
                    Load More Movies
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* "Why this movie?" Modal */}
      <RelevanceModal
        isOpen={Boolean(selectedMovieForExplanation)}
        onClose={() => setSelectedMovieForExplanation(null)}
        movie={selectedMovieForExplanation}
      />
    </div>
  );
}
