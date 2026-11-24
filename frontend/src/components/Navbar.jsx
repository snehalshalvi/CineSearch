import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, Search, Cpu, History, Compass, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { getHealth } from '../services/api';
import SearchHistoryModal from './SearchHistoryModal';

export default function Navbar() {
  const location = useLocation();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [engineStatus, setEngineStatus] = useState({ online: false, count: 0 });

  useEffect(() => {
    getHealth()
      .then((data) => {
        setEngineStatus({
          online: data.status === 'healthy',
          count: data.indexed_documents || 0,
        });
      })
      .catch(() => {
        setEngineStatus({ online: false, count: 0 });
      });
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'IR Lab', path: '/ir-lab', highlight: true },
    { name: 'About', path: '/about' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0b0b12]/85 border-b border-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-950/50 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Cine<span className="text-purple-400">Search</span>
              </span>
              <span className="hidden sm:block text-[10px] tracking-wider uppercase text-purple-300/70 font-mono -mt-1">
                IR Engine v1.0
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  } ${link.highlight && !isActive ? 'text-indigo-400 hover:text-indigo-300' : ''}`}
                >
                  {link.name === 'IR Lab' && <Cpu className="w-4 h-4 text-purple-400" />}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Engine Status pill */}
            <div
              title={engineStatus.online ? `Retrieval Engine Online (${engineStatus.count} docs)` : 'Engine Offline'}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-purple-950/40 border border-purple-800/30 text-purple-300"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  engineStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}
              />
              <span>{engineStatus.online ? `${engineStatus.count} Docs` : 'Offline'}</span>
            </div>

            {/* History Button */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-purple-800/30"
              title="Search History"
              aria-label="Search History"
            >
              <History className="w-5 h-5 text-purple-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Search History Modal */}
      <SearchHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </>
  );
}
