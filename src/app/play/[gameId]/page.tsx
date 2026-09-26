import GamePlayer from '@/components/GamePlayer';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

// Connect to Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const revalidate = 86400; // Cache game pages for 24 hours (ISR)

export async function generateMetadata({ params }: { params: { gameId: string } }) {
  const { gameId } = await params;
  const actualMd5 = gameId.slice(-32); // Extract MD5 from the end of the SEO slug
  const { data: game } = await supabase.from('games').select('title, description, thumbnail_url').eq('md5_hash', actualMd5).single();
  
  if (!game) return { title: 'Game Not Found' };
  
  return {
    title: `Play ${game.title} Unblocked & Free Online - ArcadeHub`,
    description: `Play ${game.title} unblocked at school! ${game.description || 'No download required. Click and play instantly!'}`.substring(0, 160),
    openGraph: {
      title: `${game.title} - Play Free Unblocked`,
      images: [game.thumbnail_url],
    }
  }
}

export default async function PlayGamePage({ params }: { params: { gameId: string } }) {
  // Wait for params in Next.js 15
  const { gameId } = await params;
  const actualMd5 = gameId.slice(-32); // Extract MD5 from the end of the SEO slug

  // Fetch the specific game from Supabase using its md5_hash
  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('md5_hash', actualMd5)
    .single();

  if (!game) {
    notFound(); // Triggers the 404 page if the game doesn't exist
  }

  // Fetch a few random/related games for the bottom section
  const { data: relatedGames } = await supabase
    .from('games')
    .select('*')
    .neq('md5_hash', gameId) // Exclude current game
    .limit(6);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
        <Link href="/" className="hover:text-cyan-400 transition">Games</Link>
        <span>/</span>
        <span className="capitalize">{game.tags && game.tags[0] ? game.tags[0] : 'All'}</span>
        <span>/</span>
        <span className="text-white">{game.title}</span>
      </div>

      {/* Game Title & Player */}
      <main className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{game.title}</h1>
          <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-full transition" title="Add to Favorites">
            ❤️
          </button>
        </div>
        
        <GamePlayer 
          gameId={game.md5_hash} 
          gameTitle={game.title} 
          gameThumbnail={game.thumbnail_url} 
        />
        
        {/* Game Details */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
           <h2 className="text-2xl font-bold text-white">How to play</h2>
           <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
             {game.description || "Just click and enjoy! Use your mouse or tap the screen to play."}
           </p>
           {game.tags && game.tags.length > 0 && (
             <div className="flex flex-wrap gap-2 pt-4">
               {game.tags.map((tag: string) => (
                 <Link key={tag} href={`/?category=${tag}`} className="bg-slate-800 text-cyan-400 px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-slate-700 transition">
                   {tag}
                 </Link>
               ))}
             </div>
           )}
        </div>

        {/* Related Games */}
        <div className="pt-8">
          <h2 className="text-2xl font-bold text-white mb-6">More Games to Play</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {relatedGames?.map((rg) => {
              const cleanTitle = rg.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              const seoSlug = `${cleanTitle}-unblocked-free-${rg.md5_hash}`;
              return (
                <Link key={rg.id} href={`/play/${seoSlug}`} className="group block relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 hover:border-purple-500 transition-all">
                  <div className="aspect-square bg-slate-800 w-full relative">
                     <img 
                        src={rg.thumbnail_url} 
                        alt={rg.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="absolute bottom-0 left-0 p-3 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                       <h3 className="text-sm font-bold text-white truncate">{rg.title}</h3>
                     </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
