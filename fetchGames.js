require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client with Service Role (Admin bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fetchAndPushGames(startPage = 6, endPage = 30) {
  console.log(`Starting to fetch games from GameDistribution (Pages ${startPage} to ${endPage})...`);
  
  let totalInserted = 0;

  for (let page = startPage; page <= endPage; page++) {
    // GameDistribution API sometimes truncates large payloads. Reducing amount to 40.
    const url = `https://catalog.api.gamedistribution.com/api/v2.0/rss/All/?collection=all&categories=All&type=all&subType=all&amount=40&page=${page}&format=json`;
    console.log(`[Page ${page}/${endPage}] Fetching...`);
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data || !data.length) {
        console.error(`No games found on page ${page}. Stopping.`);
        break;
      }

      // Map GD data to our DB schema
      const gamesToInsert = data.map(game => ({
        title: game.Title,
        md5_hash: game.Md5,
        thumbnail_url: game.Asset && game.Asset.length > 0 ? game.Asset[0] : null,
        description: game.Description,
        tags: game.Tag ? game.Tag.map(t => t.toLowerCase().trim()) : [],
        is_active: true
      }));

      // Upsert into Supabase
      const { error } = await supabase
        .from('games')
        .upsert(gamesToInsert, { onConflict: 'md5_hash' });

      if (error) {
        console.error(`Error inserting page ${page}:`, error);
      } else {
        totalInserted += gamesToInsert.length;
        console.log(`-> Successfully upserted ${gamesToInsert.length} games.`);
      }
      
      // Small delay to avoid API rate limits
      await new Promise(r => setTimeout(r, 1000));
      
    } catch (err) {
      console.error(`Error fetching page ${page}:`, err);
    }
  }
  
  console.log(`\n🎉 DONE! Total Top/Hot games processed in this run: ${totalInserted}`);

  // Get total count in DB
  const { count, error } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true });
    
  if (!error) {
    console.log(`\n========================================`);
    console.log(`📊 TOTAL GAMES IN DATABASE: ${count}`);
    console.log(`========================================\n`);
  }
}

fetchAndPushGames(51, 150); // Fetch next 100 pages (4000 games) to massively boost SEO
