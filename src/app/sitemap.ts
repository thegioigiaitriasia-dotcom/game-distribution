import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://your-domain.com';

  // Fetch top 1000 games for sitemap
  const { data: games } = await supabase
    .from('games')
    .select('md5_hash, created_at')
    .limit(1000);

  const gameUrls = games?.map((game) => ({
    url: `${baseUrl}/play/${game.md5_hash}`,
    lastModified: new Date(game.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...gameUrls,
  ];
}
