// app/page.tsx
import InfiniteGameGrid from '@/components/InfiniteGameGrid';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Connect to Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const revalidate = 3600;

export default async function Home({ searchParams }: { searchParams: { q?: string, category?: string } }) {
  // Await search params in next 15
  const params = await searchParams;
  const searchQuery = params?.q || '';
  const categoryFilter = params?.category || '';

  // Fetch games based on filters
  let query = supabase.from('games').select('*');
  
  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`);
  } else if (categoryFilter) {
    query = query.contains('tags', [categoryFilter]);
  }
  
  // Fetch initial 16 games
  const { data: initialGames } = await query.limit(16).order('created_at', { ascending: false });

  // Fetch Affiliate Deals
  const { data: deals } = await supabase
    .from('affiliate_deals')
    .select('*, trending_topics(keyword)')
    .limit(4)
    .order('created_at', { ascending: false });

  return (
    <div className="p-4 md:p-8 space-y-10 max-w-7xl mx-auto w-full">
      
      {/* Dynamic Header based on search */}
      {!searchQuery && !categoryFilter && (
        <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl border border-slate-800">
          <img src="https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1200&q=80" alt="Arcade Banner" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950"></div>
          <div className="relative z-10 text-center space-y-4 px-4">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
              Ready to <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Play?</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 font-medium max-w-lg mx-auto">
              Dive into 10,000+ free games. No installs, just instant fun.
            </p>
          </div>
        </div>
      )}

      {/* Title for the games grid */}
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        {searchQuery ? `🔍 Search results for "${searchQuery}"` : 
         categoryFilter ? `🕹️ ${categoryFilter.toUpperCase()} Games` : 
         '🔥 Trending Now'}
      </h2>
      
      {/* Games Grid (Infinite Scroll) */}
      <InfiniteGameGrid 
        initialGames={initialGames || []} 
        searchQuery={searchQuery} 
        categoryFilter={categoryFilter} 
      />

      {/* Affiliate Deals Section */}
      <div className="space-y-6 pt-10 mt-10 border-t border-slate-800/60">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🛍️ Gamer's Deals <span className="text-xs font-normal text-slate-400 bg-slate-800 px-3 py-1 rounded-full hidden sm:inline-block">AI Selected</span>
          </h2>
          <button className="text-cyan-400 text-sm font-bold hover:text-cyan-300 transition">View all &rarr;</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals?.map((deal: any) => (
            <div key={deal.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500 transition-colors group flex flex-col shadow-lg">
              <div className="h-40 bg-slate-800 overflow-hidden relative">
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-black px-2 py-1 rounded shadow-lg z-10">
                  -{deal.discount_percentage}%
                </span>
                <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
              </div>
              <div className="p-4 space-y-3 flex flex-col flex-grow">
                <span className="text-[10px] font-bold text-purple-400 tracking-wider uppercase">🔥 {deal.trending_topics?.keyword || 'Hot Deal'}</span>
                <h3 className="text-white text-sm font-bold leading-snug line-clamp-2">{deal.title}</h3>
                <div className="flex items-end gap-2 mt-auto">
                  <span className="text-xl font-black text-cyan-400">${deal.discount_price}</span>
                  <span className="text-xs text-slate-500 line-through mb-1">${deal.original_price}</span>
                </div>
                <a href={deal.tracking_link || '#'} target="_blank" rel="noopener noreferrer" className="block w-full mt-4 bg-slate-800 hover:bg-purple-600 text-white font-bold py-2 rounded-lg transition-colors text-center text-sm">
                  Grab Deal &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
