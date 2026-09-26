'use client';
import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';

interface Game {
  id: string;
  md5_hash: string;
  title: string;
  thumbnail_url: string;
  tags: string[];
}

interface InfiniteGameGridProps {
  initialGames: Game[];
  searchQuery?: string;
  categoryFilter?: string;
}

export default function InfiniteGameGrid({ initialGames, searchQuery = '', categoryFilter = '' }: InfiniteGameGridProps) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(initialGames.length >= 16);
  const [loading, setLoading] = useState(false);
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px', // Trigger fetch slightly before reaching bottom
  });

  useEffect(() => {
    // Reset state if search or category changes (this component receives new initialGames)
    setGames(initialGames);
    setPage(2);
    setHasMore(initialGames.length >= 16);
  }, [initialGames, searchQuery, categoryFilter]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMoreGames();
    }
  }, [inView, hasMore]);

  const loadMoreGames = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/games?page=${page}&limit=16&q=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(categoryFilter)}`);
      const data = await res.json();
      
      if (data.games && data.games.length > 0) {
        setGames(prev => [...prev, ...data.games]);
        setPage(prev => prev + 1);
        if (data.games.length < 16) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more games', err);
      setHasMore(false);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {games.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No games found. Try a different search!
          </div>
        )}
        
        {games.map((game) => {
          // Generate SEO Slug
          const cleanTitle = game.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const seoSlug = `${cleanTitle}-unblocked-free-${game.md5_hash}`;
          
          return (
            <Link key={game.id} href={`/play/${seoSlug}`} className="group block relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 hover:border-cyan-500 transition-all shadow-lg hover:shadow-cyan-500/20">
              <div className="aspect-square bg-slate-800 w-full relative">
                 <img 
                    src={game.thumbnail_url} 
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                 <div className="absolute bottom-0 left-0 p-4 w-full">
                   <h3 className="text-base font-bold text-white leading-tight truncate">{game.title}</h3>
                   <p className="text-xs text-cyan-400 font-medium capitalize mt-1">{game.tags && game.tags[0] ? game.tags[0] : 'Game'}</p>
                 </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Loading trigger element */}
      {hasMore && (
        <div ref={ref} className="w-full py-8 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {!hasMore && games.length > 0 && (
        <div className="w-full py-8 text-center text-slate-500 font-medium">
          You've reached the end of the catalog!
        </div>
      )}
    </>
  );
}
