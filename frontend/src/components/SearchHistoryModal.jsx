import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, History, Trash2, Search, Clock, ArrowRight } from 'lucide-react';
import { getSearchHistory, clearSearchHistory } from '../services/api';

export default function SearchHistoryModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getSearchHistory();
      setHistory(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const handleClear = async () => {
    try {
      await clearSearchHistory();
      setHistory([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectQuery = (query, mode = 'natural') => {
    onClose();
    navigate(`/search?q=${encodeURIComponent(query)}&mode=${mode}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel p-6 shadow-2xl border border-purple-500/30 bg-[#12111d] text-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-900/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-700/40 flex items-center justify-center">
              <History className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Recent Search History</h3>
              <p className="text-xs text-gray-400 font-mono">Saved in SQLite database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 max-h-[60vh] overflow-y-auto space-y-2">
          {loading ? (
            <div className="py-8 text-center text-xs text-gray-400 font-mono">
              Loading past searches...
            </div>
          ) : history.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400 space-y-2">
              <Clock className="w-8 h-8 text-purple-400/50 mx-auto" />
              <p>No search history recorded yet.</p>
              <p className="text-xs text-gray-500">Run a search to build your history log.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectQuery(item.query, item.mode)}
                className="group p-3 rounded-xl bg-purple-950/20 hover:bg-purple-900/40 border border-purple-900/20 hover:border-purple-600/40 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <Search className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-100 group-hover:text-purple-300 transition-colors truncate">
                      {item.query}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 font-mono mt-0.5">
                      <span>{item.result_count} results</span>
                      <span>&bull;</span>
                      <span>{item.execution_time_ms} ms</span>
                      {item.mode === 'forgotten' && (
                        <>
                          <span>&bull;</span>
                          <span className="text-indigo-400 font-semibold">Forgotten Mode</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-purple-900/30 flex items-center justify-between">
          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-4 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
