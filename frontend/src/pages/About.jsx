import React from 'react';
import { BookOpen, Cpu, Database, CheckCircle2, Layers, Sparkles, Terminal } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 space-y-12">
      {/* Header */}
      <div className="pb-6 border-b border-purple-900/30">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/40 mb-3">
          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
          <span>Academic Project Documentation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          CineSearch: Information Retrieval Architecture
        </h1>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
          Fifth-Semester Information Retrieval academic micro-project demonstrating text preprocessing, inverted indexing, vector space modeling, and ranked retrieval using Scikit-learn and NLTK.
        </p>
      </div>

      {/* Methodology Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          The Information Retrieval Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl glass-panel border border-purple-900/30 space-y-3">
            <h3 className="text-sm font-bold text-purple-300">1. Text Preprocessing</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Every query and movie document undergoes normalization:
            </p>
            <ul className="space-y-1.5 text-xs text-gray-400 font-mono">
              <li>&bull; Lowercasing & regex punctuation removal</li>
              <li>&bull; Alphanumeric word tokenization</li>
              <li>&bull; English stop-word filtering (NLTK + custom query stops)</li>
              <li>&bull; Porter stemming to root morphological forms</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-purple-900/30 space-y-3">
            <h3 className="text-sm font-bold text-purple-300">2. Inverted Indexing</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              A high-performance inverted index maps each vocabulary stem to document postings:
            </p>
            <div className="p-2.5 rounded-lg bg-black/40 font-mono text-[11px] text-purple-300">
              term &rarr; &#123; doc_id: &#123; tf, positions &#125; &#125;
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Used for instantaneous document frequency calculations and candidate matching.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-purple-900/30 space-y-3">
            <h3 className="text-sm font-bold text-purple-300">3. TF-IDF Vector Space Model</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Documents are transformed into a high-dimensional sparse matrix:
            </p>
            <ul className="space-y-1 text-xs text-gray-400 font-mono">
              <li>&bull; Sublinear TF: tf(t, d) = 1 + log(count)</li>
              <li>&bull; Smooth IDF: idf(t) = log((1 + N)/(1 + df)) + 1</li>
              <li>&bull; L2 vector normalization (unit Euclidean length)</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-purple-900/30 space-y-3">
            <h3 className="text-sm font-bold text-purple-300">4. Cosine Similarity & Ranking</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Measures the geometric angle between the query vector and document vectors:
            </p>
            <div className="p-2.5 rounded-lg bg-black/40 font-mono text-[11px] text-purple-300">
              sim(q, d) = (q &middot; d) / (||q|| &times; ||d||)
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Ensures movie descriptions with comprehensive relevance rank first without document-length bias.
            </p>
          </div>
        </div>
      </section>

      {/* Dataset & Tech Stack */}
      <section className="p-6 rounded-2xl glass-panel border border-purple-900/30 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-400" />
          Dataset & Implementation Stack
        </h3>
        <p className="text-xs text-gray-300 leading-relaxed">
          The engine operates on the <strong>TMDB 5000 Movie Dataset</strong>, incorporating movie overviews, genres, keywords, cast members, and directors. A curated sample dataset is pre-packaged for instant offline evaluation, with full automated support for ingesting the full 4,800+ movies dataset.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
          <div className="p-3 rounded-lg bg-white/5 border border-white/5">
            <span className="text-gray-400 block text-[10px]">Backend Framework</span>
            <span className="text-purple-300 font-bold">FastAPI + Uvicorn</span>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/5">
            <span className="text-gray-400 block text-[10px]">IR & Math Libraries</span>
            <span className="text-purple-300 font-bold">Scikit-learn + NLTK + NumPy</span>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/5">
            <span className="text-gray-400 block text-[10px]">Database</span>
            <span className="text-purple-300 font-bold">SQLite + SQLAlchemy</span>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/5">
            <span className="text-gray-400 block text-[10px]">Frontend UI</span>
            <span className="text-purple-300 font-bold">React + Vite + Tailwind CSS</span>
          </div>
        </div>
      </section>
    </div>
  );
}
