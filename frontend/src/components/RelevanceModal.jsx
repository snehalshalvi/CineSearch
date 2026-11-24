import React from 'react';
import { X, HelpCircle, Sparkles, BarChart2, Tag, CheckCircle } from 'lucide-react';

export default function RelevanceModal({ isOpen, onClose, movie }) {
  if (!isOpen || !movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl glass-panel p-6 shadow-2xl border border-purple-500/30 bg-[#12111d] text-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-900/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-700/40 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Why was this movie retrieved?
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Information Retrieval Relevance Analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 space-y-4">
          {/* Movie Title & Rank info */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/30 border border-purple-900/30">
            <div>
              <span className="text-xs text-purple-300 font-mono block">Selected Document</span>
              <span className="text-sm font-bold text-white">{movie.title}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-purple-300 font-mono block">Rank Position</span>
              <span className="text-sm font-bold text-purple-400">#{movie.rank || 1}</span>
            </div>
          </div>

          {/* Cosine Similarity Score */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-400 flex items-center gap-1">
                <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
                Cosine Similarity Score:
              </span>
              <span className="font-bold text-purple-300 text-sm">
                {movie.relevance_score !== undefined ? movie.relevance_score.toFixed(4) : 'N/A'}
              </span>
            </div>
            {/* Visual meter */}
            <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, (movie.relevance_score || 0) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-500 font-mono">
              Calculated via normalized dot product: sim(q, d) = (q · d) / (||q|| * ||d||)
            </p>
          </div>

          {/* Explanation Text */}
          <div className="p-3 rounded-lg bg-gray-900/60 border border-purple-900/20 text-xs leading-relaxed text-gray-300">
            <p className="font-semibold text-purple-300 mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Engine Explanation:
            </p>
            {movie.explanation || 'Relevant based on topical query overlap.'}
          </div>

          {/* Matched Terms */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-purple-300/80 mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-purple-400" />
              Matched Query Terms in Document
            </h4>
            {movie.matched_terms && movie.matched_terms.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {movie.matched_terms.map((term, i) => {
                  const tf = movie.term_contributions ? movie.term_contributions[term] : null;
                  return (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-xs font-mono bg-purple-950/60 text-purple-200 border border-purple-800/40 flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3 h-3 text-purple-400" />
                      <span>{term}</span>
                      {tf !== null && tf !== undefined && (
                        <span className="text-[10px] text-purple-400/80">({tf}×)</span>
                      )}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No individual exact stemmed token matches recorded.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-purple-900/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
}
