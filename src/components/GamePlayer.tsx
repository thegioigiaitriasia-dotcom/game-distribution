'use client';

import { useEffect, useState } from 'react';

interface GamePlayerProps {
  gameId: string; // The MD5 hash of the game provided by GameDistribution
  gameTitle?: string;
  gameThumbnail?: string;
}

export default function GamePlayer({ gameId, gameTitle, gameThumbnail }: GamePlayerProps) {
  const [iframeUrl, setIframeUrl] = useState<string>('');

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

  if (!iframeUrl) {
    return (
      <div className="w-full h-[600px] bg-slate-900 flex items-center justify-center animate-pulse rounded-xl">
        <span className="text-white text-xl font-bold">Loading Game...</span>
      </div>
    );
  }

  return (
    <div className="w-full relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800">
      <iframe
        src={iframeUrl}
        className="absolute top-0 left-0 w-full h-full"
        frameBorder="0"
        scrolling="none"
        allowFullScreen
      ></iframe>
    </div>
  );
}
