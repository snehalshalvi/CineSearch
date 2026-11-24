import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, Sparkles, HelpCircle } from 'lucide-react';
import FallbackPoster from './FallbackPoster';

export default function MovieCard({ movie, onExplain, isSearchResult = false }) {
  const [imageError, setImageError] = useState(false);

  // If poster path is relative TMDB path, format it; else keep or fallback
  const posterUrl = movie.poster_path
    ? movie.poster_path.startsWith('http')
      ? movie.poster_path
      : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden glass-panel glass-panel-hover transition-all duration-300 border border-purple-900/20 hover:border-purple-500/40">
      {/* Poster / Image Section */}
      <Link to={`/movie/${movie.id}`} className="relative aspect-[2/3] w-full overflow-hidden bg-gray-900 block">
        {posterUrl && !imageError ? (
          <img
            src={posterUrl}
            alt={movie.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <FallbackPoster title={movie.title} genres={movie.genres} />
        )}

        {/* Rating Badge Overlay */}
        {movie.rating > 0 && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md backdrop-blur-md bg-black/70 border border-yellow-500/30 text-yellow-400 flex items-center gap-1 text-xs font-semibold shadow-md">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Relevance Score Badge Overlay (For Search Results) */}
        {isSearchResult && movie.relevance_score !== undefined && (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md backdrop-blur-md bg-purple-950/80 border border-purple-500/40 text-purple-200 flex items-center gap-1.5 text-xs font-mono font-bold shadow-lg shadow-purple-950/50">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>{(movie.relevance_score * 100).toFixed(1)}% Match</span>
          </div>
        )}
      </Link>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Release Year and Genres */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-purple-400" />
              {movie.release_year || 'Unknown'}
            </span>
            <span className="truncate max-w-[120px] text-purple-300/80 font-mono">
              {movie.genres && movie.genres.length > 0 ? movie.genres[0] : ''}
            </span>
          </div>

          {/* Title */}
          <Link
            to={`/movie/${movie.id}`}
            className="font-bold text-base text-gray-100 hover:text-purple-300 transition-colors line-clamp-1 mb-2 tracking-tight"
          >
            {movie.title}
          </Link>

          {/* Overview snippet */}
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3">
            {movie.overview || 'No plot summary available.'}
          </p>
        </div>

        {/* Search Results Footer: Matched keywords & Why This Movie? button */}
        {isSearchResult && (
          <div className="pt-2.5 border-t border-purple-900/20 flex items-center justify-between gap-2 mt-auto">
            {/* Matched tokens pills */}
            <div className="flex flex-wrap gap-1 overflow-hidden max-h-5">
              {movie.matched_terms && movie.matched_terms.slice(0, 3).map((term, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-950/50 text-purple-300 border border-purple-800/30"
                >
                  {term}
                </span>
              ))}
            </div>

            {/* Why This Movie Button */}
            {onExplain && (
              <button
                onClick={() => onExplain(movie)}
                className="shrink-0 text-xs text-purple-400 hover:text-purple-200 flex items-center gap-1 font-medium transition-colors bg-purple-950/40 hover:bg-purple-900/40 px-2 py-1 rounded-md border border-purple-700/30"
                title="Explain ranking and matching terms"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why?</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
