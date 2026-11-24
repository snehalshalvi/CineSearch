import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Brain, Compass, Cpu, Film, Flame, ArrowRight, Check } from 'lucide-react';
import { getTrending } from '../services/api';
import MovieCard from '../components/MovieCard';

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isForgottenMode, setIsForgottenMode] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    getTrending(8)
      .then((data) => {
        setTrendingMovies(data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingTrending(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const mode = isForgottenMode ? 'forgotten' : 'natural';
    navigate(`/search?q=${encodeURIComponent(query.trim())}&mode=${mode}`);
  };

  const handleSuggestionClick = (suggestionText) => {
    const mode = isForgottenMode ? 'forgotten' : 'natural';
    navigate(`/search?q=${encodeURIComponent(suggestionText)}&mode=${mode}`);
  };

  const suggestions = [
    {
      text: 'A man trapped inside a dream.',
      category: 'Psychological / Sci-Fi',
    },
    {
      text: 'A psychological thriller with an unexpected ending.',
      category: 'Mystery / Thriller',
    },
    {
      text: 'A lonely person searching for meaning in life.',
      category: 'Drama / Romance',
    },
    {
      text: 'A movie about time travel and alternate realities.',
      category: 'Sci-Fi / Quantum',
    },
    {
      text: 'I want a psychological thriller about a man who slowly discovers that his entire life is a lie.',
      category: 'Paranoia / Reality TV',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-purple-700/20 via-indigo-600/10 to-transparent blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium bg-purple-950/60 border border-purple-800/40 text-purple-300 mb-6 shadow-lg shadow-purple-950/50">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Vector Space Information Retrieval Engine</span>
        </div>

        {/* Main Headings */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          Find the movie you <br className="hidden sm:inline" />
          <span className="gradient-text">can't remember.</span>
        </h1>

        <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Describe a scene, a feeling, or a story. Let CineSearch match your natural language description through vector space TF-IDF and cosine similarity.
        </p>

        {/* Search Bar Container */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="relative flex flex-col gap-3">
            <div className="relative group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  isForgottenMode
                    ? "Describe what you remember: 'There's a man who has dreams within dreams with a spinning top...'"
                    : "I want a psychological thriller about a man who discovers his life is a lie..."
                }
                className="w-full px-5 py-4 sm:py-5 pl-13 sm:pl-14 pr-32 sm:pr-36 rounded-2xl bg-[#13121f]/90 text-white placeholder-gray-500 text-sm sm:text-base border border-purple-800/40 focus:border-purple-500/80 focus:ring-4 focus:ring-purple-900/30 outline-none shadow-2xl transition-all"
              />
              <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-purple-400 group-focus-within:text-purple-300 transition-colors" />

              <button
                type="submit"
                className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md hover:shadow-purple-700/40 flex items-center gap-1.5"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4 hidden sm:inline" />
              </button>
            </div>

            {/* Forgotten Movie Mode Toggle Switch */}
            <div className="flex items-center justify-between px-2 pt-1 text-xs">
              <div
                onClick={() => setIsForgottenMode(!isForgottenMode)}
                className="flex items-center gap-2 cursor-pointer select-none group"
              >
                <div
                  className={`w-9 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                    isForgottenMode ? 'bg-purple-600 justify-end' : 'bg-gray-800 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
                <span
                  className={`font-medium transition-colors ${
                    isForgottenMode ? 'text-purple-300 font-semibold' : 'text-gray-400 group-hover:text-gray-300'
                  }`}
                >
                  I don't remember the movie name (Forgotten Movie Mode)
                </span>
              </div>

              {isForgottenMode && (
                <span className="text-[11px] font-mono text-purple-400 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/30 hidden sm:inline">
                  Plot Scene & Character Memory Mode Active
                </span>
              )}
            </div>
          </form>

          {/* Example Suggestions */}
          <div className="mt-8 text-left">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              Try natural language examples:
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(item.text)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-purple-950/30 hover:bg-purple-900/40 text-gray-300 hover:text-white border border-purple-900/30 hover:border-purple-600/50 transition-all text-left flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 group-hover:scale-125 transition-transform" />
                  <span className="truncate max-w-[280px] sm:max-w-none">{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* IR Lab Teaser Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-20">
        <div className="relative rounded-2xl glass-panel p-6 sm:p-8 border border-purple-700/30 bg-gradient-to-r from-purple-950/40 via-[#131224] to-indigo-950/40 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-purple-900/40 text-purple-300 border border-purple-700/40">
              <Cpu className="w-3.5 h-3.5" />
              Academic Demonstration
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Interactive Information Retrieval Laboratory
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Inspect step-by-step tokenization, stop-word elimination, TF-IDF feature weights, and exact inverted index postings for any natural query.
            </p>
          </div>
          <button
            onClick={() => navigate('/ir-lab')}
            className="shrink-0 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-950/60 flex items-center gap-2"
          >
            <span>Launch IR Lab</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Trending & Popular Movies Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <Flame className="w-6 h-6 text-purple-400" />
              Trending & Indexed Movies
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Top movies currently available in the Information Retrieval database
            </p>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="text-xs sm:text-sm font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loadingTrending ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl bg-gray-900/60 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {trendingMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>

      {/* IR Architecture Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            Pure Information Retrieval Architecture
          </h2>
          <p className="text-sm text-gray-400">
            No generative hallucinations. No external black-box recommendation APIs. Every recommendation is mathematically traceable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-panel border border-purple-900/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-700/40 flex items-center justify-center text-purple-400">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">TF-IDF Vector Space</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Terms are weighted by Term Frequency (TF) and Inverse Document Frequency (IDF) to elevate salient plot keywords over common generic words.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-purple-900/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-700/40 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Inverted Indexing</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              High-speed mapping from vocabulary stems to document IDs and token positions, enabling transparent postings retrieval in milliseconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-purple-900/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-700/40 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Cosine Similarity</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Calculates the multidimensional cosine angle between the normalized query vector and movie document vectors to output ranked relevance scores.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
