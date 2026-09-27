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
        setGames(prev => {
          // Lọc bỏ các game bị trùng lặp ID (do phân trang hoặc dữ liệu API)
          const uniqueNewGames = data.games.filter((g: any) => !prev.some(p => p.id === g.id));
          return [...prev, ...uniqueNewGames];
        });
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
        
        {games.map((game, index) => {
          // Generate SEO Slug
          const cleanTitle = game.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const seoSlug = `${cleanTitle}-unblocked-free-${game.md5_hash}`;
          
          return (
            <Link key={`${game.id}-${index}`} href={`/play/${seoSlug}`} className="group block relative overflow-hidden rounded-[2rem] border-4 border-slate-800/80 bg-slate-900 hover:border-yellow-400 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(250,204,21,0.3)] transition-all duration-300">
              <div className="aspect-square bg-slate-800 w-full relative">
                 <img 
                    src={game.thumbnail_url} 
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                 />
                 
                 {/* Play Button Overlay for Kids */}
                 <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 bg-yellow-400 text-black rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_20px_rgba(250,204,21,0.8)]">
                      <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
                    </div>
                 </div>

                 <div className="absolute bottom-0 left-0 p-4 w-full bg-gradient-to-t from-black via-black/80 to-transparent">
                   <h3 className="text-lg font-black text-white leading-tight truncate drop-shadow-md">{game.title}</h3>
                   <p className="text-xs text-yellow-400 font-bold uppercase mt-1 tracking-widest">{game.tags && game.tags[0] ? game.tags[0] : 'Mini Game'}</p>
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
