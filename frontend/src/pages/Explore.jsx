import React, { useState, useEffect } from 'react';
import { Compass, Filter, ArrowUpDown, Film, Search } from 'lucide-react';
import { getMovies, getFilters } from '../services/api';
import MovieCard from '../components/MovieCard';

export default function Explore() {
  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    getFilters()
      .then((data) => setGenres(data.genres || []))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    getMovies({
      page: page,
      limit: 12,
      genre: selectedGenre || undefined,
      sort_by: sortBy,
    })
      .then((data) => {
        setMovies(data.movies || []);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [page, selectedGenre, sortBy]);

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-900/30">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-7 h-7 text-purple-400" />
            Explore Movie Catalog
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Browse indexed films in the database ({total} total movies available)
          </p>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedGenre}
            onChange={(e) => {
              setSelectedGenre(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-[#141324] text-xs text-gray-200 border border-purple-900/40 focus:border-purple-500 outline-none"
          >
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#141324] text-xs text-gray-200 border border-purple-900/40 focus:border-purple-500 outline-none"
          >
            <option value="rating">Top Rated</option>
            <option value="popularity">Most Popular</option>
            <option value="year">Newest First</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl bg-gray-900/40 animate-pulse border border-purple-900/20" />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="p-12 rounded-2xl glass-panel text-center text-gray-400">
          No movies found matching the selected genre.
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-purple-950/40 text-purple-300 disabled:opacity-40 border border-purple-800/30"
              >
                Previous
              </button>
              <span className="text-xs font-mono text-gray-400 px-3">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-purple-950/40 text-purple-300 disabled:opacity-40 border border-purple-800/30"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
