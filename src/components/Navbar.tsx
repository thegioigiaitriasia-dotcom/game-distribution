'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if(searchQuery.trim()) {
      window.location.href = `/?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 h-16 flex items-center justify-between gap-4">
      <div className="flex-1 md:hidden">
        {/* Mobile Logo */}
        <Link href="/" className="text-xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          🕹️ ArcadeHub
        </Link>
      </div>
      
      <div className="flex-1 max-w-xl mx-auto hidden sm:block">
        <form onSubmit={handleSearch} className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            🔍
          </span>
          <input 
            type="text" 
            placeholder="Search 10,000+ games..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
          />
        </form>
      </div>

      <div className="flex-1 flex justify-end gap-3">
         <button className="md:hidden text-slate-300 text-xl">🔍</button>
         <button className="hidden md:block text-slate-300 hover:text-white font-medium transition text-sm">Random Game</button>
         <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-full text-sm font-bold border border-slate-700 transition">Log in</button>
      </div>
    </header>
  );
}
