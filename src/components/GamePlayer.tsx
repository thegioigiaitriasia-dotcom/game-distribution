'use client';

import { useEffect, useState, useRef } from 'react';

interface GamePlayerProps {
  gameId: string; // The MD5 hash of the game provided by GameDistribution
  gameTitle?: string;
  gameThumbnail?: string;
}

export default function GamePlayer({ gameId, gameTitle, gameThumbnail }: GamePlayerProps) {
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      const gdUrl = `https://html5.gamedistribution.com/${gameId}/?gd_sdk_referrer_url=${encodeURIComponent(currentUrl)}`;
      setIframeUrl(gdUrl);

      // Save to recently played games in localStorage
      if (gameTitle && gameThumbnail) {
        try {
          const recentStr = localStorage.getItem('recent_games');
          let recentGames = recentStr ? JSON.parse(recentStr) : [];
          
          // Remove if exists to push to front
          recentGames = recentGames.filter((g: any) => g.id !== gameId);
          
          // Add to front
          recentGames.unshift({
            id: gameId,
            title: gameTitle,
            thumbnail: gameThumbnail,
            playedAt: Date.now()
          });

          // Keep only top 5
          if (recentGames.length > 5) recentGames = recentGames.slice(0, 5);
          
          localStorage.setItem('recent_games', JSON.stringify(recentGames));
          // Dispatch custom event so sidebar updates instantly
          window.dispatchEvent(new Event('recent_games_updated'));
        } catch (e) {
          console.error("Could not save to localStorage", e);
        }
      }
    }
  }, [gameId, gameTitle, gameThumbnail]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  if (!iframeUrl) {
    return (
      <div className="w-full h-[600px] bg-slate-900 flex items-center justify-center animate-pulse rounded-xl">
        <span className="text-white text-xl font-bold">Loading Game...</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full relative h-[70vh] md:h-auto md:aspect-[16/9] bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 group">
      <iframe
        src={iframeUrl}
        className="absolute top-0 left-0 w-full h-full"
        frameBorder="0"
        scrolling="none"
        allowFullScreen
      ></iframe>
      
      {/* Fullscreen Button */}
      <button 
        onClick={toggleFullscreen}
        className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/90 text-white p-3 rounded-full opacity-70 group-hover:opacity-100 transition-opacity z-10 shadow-lg border border-slate-700 backdrop-blur-sm"
        title="Fullscreen"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
        </svg>
      </button>
    </div>
  );
}
