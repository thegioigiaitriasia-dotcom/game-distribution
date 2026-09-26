'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const [recentGames, setRecentGames] = useState<any[]>([]);

  const loadRecentGames = () => {
    try {
      const stored = localStorage.getItem('recent_games');
      if (stored) {
        setRecentGames(JSON.parse(stored));
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadRecentGames();
    // Listen for custom event when a new game is played
    window.addEventListener('recent_games_updated', loadRecentGames);
    return () => window.removeEventListener('recent_games_updated', loadRecentGames);
  }, []);

  const categories = [
    { name: '🔥 Trending', icon: '🔥' },
    { name: 'Action', icon: '⚔️' },
    { name: 'Puzzle', icon: '🧩' },
    { name: 'Racing', icon: '🏎️' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Girls', icon: '👗' },
    { name: 'Multiplayer', icon: '🌐' },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col bg-slate-900 border-r border-slate-800 p-4 h-screen sticky top-0 overflow-y-auto">
      <Link href="/" className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-8 pl-2 shrink-0">
        🕹️ ArcadeHub
      </Link>
      
      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pl-2 shrink-0">Menu</div>
      <nav className="flex flex-col gap-2 shrink-0">
        {categories.map(cat => (
          <Link key={cat.name} href={`/?category=${cat.name.replace(/[^\w\s]/gi, '').trim().toLowerCase()}`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition font-medium">
            <span className="text-xl">{cat.icon}</span>
            {cat.name}
          </Link>
        ))}
      </nav>

      {/* Recently Played Section */}
      {recentGames.length > 0 && (
        <div className="mt-8 shrink-0">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pl-2">Recently Played</div>
          <div className="flex flex-col gap-3">
            {recentGames.map((game) => (
              <Link key={game.id} href={`/play/${game.id}`} className="flex items-center gap-3 group p-2 rounded-lg hover:bg-slate-800 transition">
                <img src={game.thumbnail} alt={game.title} className="w-10 h-10 rounded-md object-cover border border-slate-700 group-hover:border-cyan-500 transition" />
                <span className="text-sm font-bold text-slate-300 group-hover:text-white truncate">{game.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto pt-8 shrink-0">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
          <h4 className="text-white font-bold mb-1">ArcadeHub VIP</h4>
          <p className="text-xs text-slate-400 mb-3">Save your favorite games entirely on your device. No login needed!</p>
        </div>
      </div>
    </aside>
  );
}
