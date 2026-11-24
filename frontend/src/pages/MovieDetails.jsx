import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  User,
  Film,
  Sparkles,
  Tag,
  Share2,
} from 'lucide-react';
import { getMovieDetail } from '../services/api';
import FallbackPoster from '../components/FallbackPoster';
import MovieCard from '../components/MovieCard';

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [backdropError, setBackdropError] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMovieDetail(id)
      .then((data) => {
        setMovie(data);
        setImageError(false);
        setBackdropError(false);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3 font-mono text-purple-400">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Loading movie document from database...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Movie Not Found</h2>
        <p className="text-sm text-gray-400">
          The requested movie record could not be found in the database.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const posterUrl = movie.poster_path
    ? movie.poster_path.startsWith('http')
      ? movie.poster_path
      : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const backdropUrl = movie.backdrop_path
    ? movie.backdrop_path.startsWith('http')
      ? movie.backdrop_path
      : `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : null;

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Backdrop Banner */}
      <div className="relative w-full h-[360px] sm:h-[460px] overflow-hidden bg-gray-950">
        {backdropUrl && !backdropError ? (
          <img
            src={backdropUrl}
            alt={movie.title}
            onError={() => setBackdropError(true)}
            className="w-full h-full object-cover opacity-35 filter blur-xs"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-950/30 via-[#0e0d16] to-[#07070d]" />
        )}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b12] via-[#0b0b12]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b12] via-transparent to-[#0b0b12]/60" />

        {/* Top Back Button */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <button
            onClick={() => navigate(-1)}
            className="px-3.5 py-2 rounded-xl backdrop-blur-md bg-black/60 hover:bg-black/80 text-gray-200 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Results</span>
          </button>
        </div>
      </div>

      {/* Main Content Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Movie Poster */}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="aspect-[2/3] w-full max-w-[280px] mx-auto md:max-w-none rounded-2xl overflow-hidden shadow-2xl border border-purple-500/20 bg-gray-900">
              {posterUrl && !imageError ? (
                <img
                  src={posterUrl}
                  alt={movie.title}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FallbackPoster title={movie.title} genres={movie.genres} />
              )}
            </div>
          </div>

          {/* Right Column: Metadata & Overview */}
          <div className="md:col-span-8 lg:col-span-9 space-y-6">
            <div>
              {/* Release date & Runtime & Rating pills */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-300 mb-2">
                {movie.rating > 0 && (
                  <span className="px-2.5 py-1 rounded-md bg-yellow-950/40 border border-yellow-500/40 text-yellow-400 font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" />
                    <span>{movie.rating.toFixed(1)} / 10</span>
                  </span>
                )}

                {movie.release_date && (
                  <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-md border border-white/10 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    {movie.release_date}
                  </span>
                )}

                {movie.runtime > 0 && (
                  <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-md border border-white/10 font-mono">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    {movie.runtime} min
                  </span>
                )}

                {movie.language && (
                  <span className="uppercase font-mono text-[11px] bg-purple-950/50 px-2 py-1 rounded-md text-purple-300 border border-purple-800/40">
                    {movie.language}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {movie.title}
              </h1>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {movie.genres.map((g, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-950/60 text-purple-300 border border-purple-800/40"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Overview */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-400 font-mono">
                Plot Overview
              </h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-light">
                {movie.overview || 'No plot summary available.'}
              </p>
            </div>

            {/* Director & Cast */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-purple-900/20">
              {movie.director && (
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 font-mono block">Director</span>
                  <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <User className="w-4 h-4 text-purple-400" />
                    {movie.director}
                  </span>
                </div>
              )}

              {movie.cast && movie.cast.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 font-mono block">Principal Cast</span>
                  <div className="flex flex-wrap gap-1.5">
                    {movie.cast.map((actor, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-medium text-gray-200 bg-white/5 px-2 py-0.5 rounded border border-white/5"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Keywords */}
            {movie.keywords && movie.keywords.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-purple-900/20">
                <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-purple-400" />
                  Indexed Plot Keywords:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {movie.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-950/30 text-purple-300/90 border border-purple-900/30"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Movies Section (Content-Based IR via TF-IDF Cosine Similarity) */}
        {movie.similar_movies && movie.similar_movies.length > 0 && (
          <div className="mt-20 pt-12 border-t border-purple-900/30">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Similar Movies (Content-Based IR)
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Calculated by computing cosine similarity between this movie's document vector and all indexed films
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {movie.similar_movies.map((similar) => (
                <div key={similar.id} className="relative group">
                  <MovieCard movie={similar} />
                  {similar.similarity_score !== undefined && (
                    <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-purple-300 border border-purple-500/40">
                      {(similar.similarity_score * 100).toFixed(0)}% Sim
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
