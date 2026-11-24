import React from 'react';
import { Film } from 'lucide-react';

export default function FallbackPoster({ title, genres = [], className = '' }) {
  const primaryGenre = genres.length > 0 ? genres[0] : 'Cinema';

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#1b1928] via-[#12111c] to-[#0d0c14] border border-purple-900/30 select-none overflow-hidden ${className}`}
    >
      {/* Background geometric accents */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-700/40 flex items-center justify-center mb-3 shadow-inner">
        <Film className="w-6 h-6 text-purple-400" />
      </div>

      <h4 className="font-bold text-sm text-gray-100 line-clamp-2 px-2 tracking-tight">
        {title}
      </h4>

      <span className="mt-2 text-[11px] uppercase tracking-wider font-semibold text-purple-400/90 px-2 py-0.5 rounded-full bg-purple-950/50 border border-purple-800/40">
        {primaryGenre}
      </span>
    </div>
  );
}
