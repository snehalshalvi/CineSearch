import React from 'react';
import { Film, Cpu, BookOpen, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-[#07070d] border-t border-purple-950/40 mt-20 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">
                Cine<span className="text-purple-400">Search</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Natural-Language Movie Search Engine demonstrating real Information Retrieval algorithms with high-dimensional vector space modeling.
            </p>
          </div>

          {/* IR Algorithms */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              IR Algorithms
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-400 font-mono">
              <li>TF-IDF Vectorization</li>
              <li>Inverted Indexing & Postings</li>
              <li>Cosine Vector Similarity</li>
              <li>Stop-word & Stemming Pipeline</li>
              <li>Weighted Field Document Models</li>
            </ul>
          </div>

          {/* Pages */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              Navigation
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/" className="hover:text-purple-300 transition-colors">Home Search</Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-purple-300 transition-colors">Explore All Movies</Link>
              </li>
              <li>
                <Link to="/ir-lab" className="hover:text-purple-300 transition-colors font-semibold text-purple-400">IR Lab Live Dashboard</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-purple-300 transition-colors">Project Architecture</Link>
              </li>
            </ul>
          </div>

          {/* Academic info */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              Academic Micro-Project
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Fifth-Semester Information Retrieval (IR) Academic Project. Powered by TMDB 5000 Movie Dataset, Scikit-learn, NLTK, FastAPI & React.
            </p>
            <div className="pt-2 text-[11px] text-gray-500">
              Zero external paid search APIs used. 100% deterministic local vector space retrieval.
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-purple-950/30 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} CineSearch. Information Retrieval Academic Project.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px] text-purple-400/70">
            Cosine Similarity &bull; Inverted Index &bull; TF-IDF
          </p>
        </div>
      </div>
    </footer>
  );
}
