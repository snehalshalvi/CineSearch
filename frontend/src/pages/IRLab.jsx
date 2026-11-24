import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Cpu,
  Search,
  BarChart2,
  Table as TableIcon,
  Layers,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Database,
  Code,
  BookOpen,
  HelpCircle,
  Filter,
  Sparkles,
} from 'lucide-react';
import { getSearchAnalysis } from '../services/api';

export default function IRLab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQuery = searchParams.get('q') || 'A man trapped inside a dream';
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected term for Inverted Index inspector
  const [selectedTerm, setSelectedTerm] = useState('');

  const fetchAnalysis = (queryToAnalyze) => {
    if (!queryToAnalyze.trim()) return;
    setLoading(true);
    setError(null);

    getSearchAnalysis(queryToAnalyze.trim(), 10)
      .then((data) => {
        setAnalysis(data);
        if (data.inverted_index_lookups && data.inverted_index_lookups.length > 0) {
          setSelectedTerm(data.inverted_index_lookups[0].term);
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to compute IR metrics for this query.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnalysis(activeQuery);
  }, [activeQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    setActiveQuery(queryInput.trim());
    setSearchParams({ q: queryInput.trim() });
  };

  // Find postings for the currently selected term
  const currentPostings =
    analysis?.inverted_index_lookups?.find((item) => item.term === selectedTerm) || null;

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 space-y-10">
      {/* Page Header */}
      <div className="pb-6 border-b border-purple-900/30">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/40 mb-3">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>Interactive Information Retrieval Lab</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Algorithm Inspection & Vector Math Dashboard
        </h1>
        <p className="text-sm text-gray-400 mt-2 max-w-3xl leading-relaxed">
          Evaluate how user queries are processed into vector space representations, matched against inverted index postings, and ranked via Cosine Similarity in real time.
        </p>

        {/* Live Query Tester Bar */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-3xl">
          <div className="relative flex-1">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Test any query (e.g., 'time travel alternate realities')..."
              className="w-full px-4 py-3 pl-11 rounded-xl bg-[#13121f] text-white placeholder-gray-500 text-sm border border-purple-800/40 focus:border-purple-500 outline-none transition-all shadow-inner font-mono"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <span>Analyze Query</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3 font-mono text-purple-400">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Computing TF-IDF matrices and inverted index lookups...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl glass-panel border border-red-900/40 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : !analysis ? null : (
        <div className="space-y-10">
          {/* Section 1: Collection Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl glass-panel border border-purple-900/30">
              <span className="text-[11px] text-gray-400 font-mono block">Collection Docs (N)</span>
              <span className="text-xl font-bold text-white font-mono">
                {analysis.retrieval_metrics?.total_documents}
              </span>
            </div>
            <div className="p-4 rounded-xl glass-panel border border-purple-900/30">
              <span className="text-[11px] text-gray-400 font-mono block">Vocabulary Size</span>
              <span className="text-xl font-bold text-purple-300 font-mono">
                {analysis.retrieval_metrics?.vocabulary_size} terms
              </span>
            </div>
            <div className="p-4 rounded-xl glass-panel border border-purple-900/30">
              <span className="text-[11px] text-gray-400 font-mono block">Matrix Sparsity</span>
              <span className="text-xl font-bold text-indigo-300 font-mono">
                {analysis.retrieval_metrics?.matrix_sparsity_pct}%
              </span>
            </div>
            <div className="p-4 rounded-xl glass-panel border border-purple-900/30">
              <span className="text-[11px] text-gray-400 font-mono block">Avg Doc Length</span>
              <span className="text-xl font-bold text-white font-mono">
                {analysis.retrieval_metrics?.avg_doc_length} tokens
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 p-4 rounded-xl glass-panel border border-purple-900/30">
              <span className="text-[11px] text-gray-400 font-mono block">IR Latency</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {analysis.retrieval_metrics?.execution_time_ms} ms
              </span>
            </div>
          </div>

          {/* Section 2: Step-by-Step Query Preprocessing Pipeline */}
          <div className="p-6 rounded-2xl glass-panel border border-purple-900/30 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-purple-900/20">
              <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-700/40 flex items-center justify-center">
                <Code className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Stage 1: Text Preprocessing Pipeline
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  Cleaning &rarr; Tokenization &rarr; Stop-word Elimination &rarr; Porter Stemming
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Step 1 & 2 */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/30 space-y-2">
                <span className="text-xs font-semibold text-purple-300 font-mono block">
                  1. Raw Query & Normalized
                </span>
                <p className="text-xs text-gray-300 italic">
                  "{analysis.preprocessing?.original_query}"
                </p>
                <div className="pt-2 text-[11px] text-gray-400 font-mono">
                  Cleaned: <span className="text-gray-200">{analysis.preprocessing?.step_2_punctuation_removed}</span>
                </div>
              </div>

              {/* Step 3: Raw Tokens */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/30 space-y-2">
                <span className="text-xs font-semibold text-purple-300 font-mono block">
                  2. Tokenized Words ({analysis.preprocessing?.step_3_raw_tokens?.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {analysis.preprocessing?.step_3_raw_tokens?.map((t, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-white/5 text-gray-300 border border-white/5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Step 4: Stopwords Removed vs Retained */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/30 space-y-2">
                <span className="text-xs font-semibold text-purple-300 font-mono block">
                  3. Stop-Word Removal
                </span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-start gap-1">
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <div className="text-gray-400">
                      Removed: {analysis.preprocessing?.step_4_stopwords_removed?.length > 0 ? (
                        <span className="text-red-300 font-mono">
                          {analysis.preprocessing?.step_4_stopwords_removed?.join(', ')}
                        </span>
                      ) : (
                        <span className="text-gray-500">None</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-gray-400">
                      Retained:{' '}
                      <span className="text-emerald-300 font-mono">
                        {analysis.preprocessing?.step_4_retained_tokens?.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5: Stemmed Terms */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/30 space-y-2">
                <span className="text-xs font-semibold text-purple-300 font-mono block">
                  4. Porter Stems (Normalized)
                </span>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {analysis.preprocessing?.step_5_stemmed_mappings?.map((m, i) => (
                    <div key={i} className="text-[11px] font-mono flex items-center justify-between text-gray-300">
                      <span className="text-gray-400">{m.original}</span>
                      <span className="text-purple-400">&rarr;</span>
                      <span className="text-purple-300 font-semibold">{m.stemmed}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: TF-IDF Vector Information Table */}
          <div className="p-6 rounded-2xl glass-panel border border-purple-900/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-700/40 flex items-center justify-center">
                  <TableIcon className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Stage 2: Query TF-IDF Vector Weights
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    tf(t, q) &times; idf(t) with L2 Unit-Vector Normalization
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-purple-900/30 text-gray-400 bg-purple-950/20">
                    <th className="py-2.5 px-3">Term</th>
                    <th className="py-2.5 px-3">Query TF</th>
                    <th className="py-2.5 px-3">Corpus IDF</th>
                    <th className="py-2.5 px-3">Normalized Vector Weight</th>
                    <th className="py-2.5 px-3">Vocabulary Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/10 text-gray-300">
                  {analysis.query_terms?.map((termInfo, idx) => (
                    <tr key={idx} className="hover:bg-purple-900/10 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-purple-300">{termInfo.term}</td>
                      <td className="py-2.5 px-3">{termInfo.tf}</td>
                      <td className="py-2.5 px-3">{termInfo.idf.toFixed(4)}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-200 border border-purple-800/40 font-bold">
                          {termInfo.tfidf_weight.toFixed(4)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {termInfo.in_vocabulary ? (
                          <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            In Indexed Vocab
                          </span>
                        ) : (
                          <span className="text-gray-500 text-[11px]">Out of Vocab (Ignored)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Inverted Index Postings Explorer */}
          <div className="p-6 rounded-2xl glass-panel border border-purple-900/30 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-700/40 flex items-center justify-center">
                  <Database className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Stage 3: Inverted Index Postings Lookup
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    Inspect which documents contain query stems and their internal term frequencies
                  </p>
                </div>
              </div>
            </div>

            {/* Term Selectors */}
            <div className="flex flex-wrap gap-2">
              {analysis.inverted_index_lookups?.map((lookup, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTerm(lookup.term)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                    selectedTerm === lookup.term
                      ? 'bg-purple-600 text-white font-bold shadow-md'
                      : 'bg-purple-950/30 hover:bg-purple-900/40 text-purple-300 border border-purple-900/30'
                  }`}
                >
                  <span>{lookup.term}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40">
                    df={lookup.df}
                  </span>
                </button>
              ))}
            </div>

            {/* Selected Term Postings Display */}
            {currentPostings && (
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/30 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-purple-300 border-b border-purple-900/30 pb-2">
                  <span>
                    Postings for term: <strong className="text-white">'{currentPostings.term}'</strong>
                  </span>
                  <span>Document Frequency (DF): {currentPostings.df} docs</span>
                </div>

                {currentPostings.postings?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                    {currentPostings.postings.map((p, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-[#141324] border border-purple-900/30 space-y-1 text-xs"
                      >
                        <span className="font-mono text-[10px] text-purple-400 block">Doc #{p.doc_id}</span>
                        <h5 className="font-bold text-gray-200 truncate">{p.title}</h5>
                        <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1">
                          <span>Term Freq (TF):</span>
                          <strong className="text-purple-300 font-bold">{p.tf}&times;</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 font-mono py-2">
                    Term not found in any indexed document.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section 5: Cosine Similarity Scores Bar Chart & Ranking Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Visual Bar Chart */}
            <div className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-purple-900/30 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-purple-900/20">
                  <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-700/40 flex items-center justify-center">
                    <BarChart2 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Stage 4: Cosine Similarity Visualizer
                    </h3>
                    <p className="text-xs text-gray-400 font-mono">
                      Top 10 ranked documents by vector cosine similarity
                    </p>
                  </div>
                </div>

                {/* Bars */}
                <div className="pt-4 space-y-3">
                  {analysis.top_ranked_documents?.map((doc, idx) => {
                    const scorePct = Math.min(100, Math.max(8, doc.cosine_similarity * 100));
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-gray-300 truncate max-w-[220px]">
                            #{doc.rank} {doc.title}
                          </span>
                          <span className="text-purple-300 font-bold">
                            {doc.cosine_similarity.toFixed(4)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-900 rounded-full h-3 overflow-hidden border border-purple-900/20">
                          <div
                            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 h-3 rounded-full transition-all duration-700"
                            style={{ width: `${scorePct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-purple-900/20 text-[11px] text-gray-500 font-mono">
                Range [0.0000, 1.0000]. Only non-zero similarity documents retrieved.
              </div>
            </div>

            {/* Ranked Retrieval Table */}
            <div className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-purple-900/30 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-purple-900/20">
                <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-700/40 flex items-center justify-center">
                  <TableIcon className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Stage 5: Final Ranked Retrieval List
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    Retrieved document vectors sorted in descending order
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-purple-900/30 text-gray-400 bg-purple-950/20">
                      <th className="py-2 px-2.5">Rank</th>
                      <th className="py-2 px-2.5">Title</th>
                      <th className="py-2 px-2.5">Cosine Sim</th>
                      <th className="py-2 px-2.5">Matched Stems</th>
                      <th className="py-2 px-2.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/10 text-gray-300">
                    {analysis.top_ranked_documents?.map((doc, idx) => (
                      <tr key={idx} className="hover:bg-purple-900/10 transition-colors">
                        <td className="py-2.5 px-2.5 font-bold text-purple-400">#{doc.rank}</td>
                        <td className="py-2.5 px-2.5 font-medium text-white max-w-[140px] truncate">
                          {doc.title}
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-purple-300">
                          {doc.cosine_similarity.toFixed(4)}
                        </td>
                        <td className="py-2.5 px-2.5 text-[11px] text-gray-400">
                          {doc.matched_terms?.slice(0, 3).join(', ') || 'topical'}
                        </td>
                        <td className="py-2.5 px-2.5">
                          <button
                            onClick={() => navigate(`/movie/${doc.doc_id}`)}
                            className="text-purple-400 hover:text-purple-200 underline text-[11px]"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 6: Mathematical Formulas Box */}
          <div className="p-6 rounded-2xl glass-panel border border-purple-900/30 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-purple-900/20">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">
                Information Retrieval Mathematical Formulations
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-gray-300">
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/30 space-y-1.5">
                <span className="text-purple-300 font-bold block">1. Sublinear Term Frequency (TF):</span>
                <p className="text-gray-400 text-[11px]">
                  tf(t, d) = 1 + log(count(t, d)) &nbsp;(for count &gt; 0)
                </p>
                <p className="text-[10px] text-gray-500">
                  Prevents single high-frequency terms from overwhelming multi-word relevance.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/30 space-y-1.5">
                <span className="text-purple-300 font-bold block">2. Inverse Document Frequency (IDF):</span>
                <p className="text-gray-400 text-[11px]">
                  idf(t) = log((1 + N) / (1 + df(t))) + 1
                </p>
                <p className="text-[10px] text-gray-500">
                  Penalizes ubiquitous words across the 25-movie corpus and rewards rare keywords.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/30 space-y-1.5">
                <span className="text-purple-300 font-bold block">3. Vector Dot Product & Cosine Similarity:</span>
                <p className="text-gray-400 text-[11px]">
                  sim(q, d) = (q &middot; d) / (||q|| &times; ||d||)
                </p>
                <p className="text-[10px] text-gray-500">
                  Measures vector direction rather than document length, ensuring unbiased matching.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/30 space-y-1.5">
                <span className="text-purple-300 font-bold block">4. Inverted Index Mapping:</span>
                <p className="text-gray-400 text-[11px]">
                  term &rarr; &#123; doc_id: &#123; tf, positions &#125; &#125;
                </p>
                <p className="text-[10px] text-gray-500">
                  Enables rapid candidate selection and transparent term contribution tracing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
