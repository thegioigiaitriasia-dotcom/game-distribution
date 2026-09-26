require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client with Service Role (Admin bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fetchAndPushGames() {
  console.log('Fetching top 50 games from GameDistribution...');
  // The official GameDistribution Catalog API endpoint
  const url = 'https://catalog.api.gamedistribution.com/api/v2.0/rss/All/?collection=all&categories=All&type=all&subType=all&amount=50&page=1&format=json';
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data || !data.length) {
      console.error('No games found in the response.');
      return;
    }

    console.log(`Found ${data.length} games. Pushing to Supabase...`);

    // Map GD data to our DB schema
    const gamesToInsert = data.map(game => ({
      title: game.Title,
      md5_hash: game.Md5,
      // Some games have multiple assets, we pick the first one which is usually 512x512
      thumbnail_url: game.Asset && game.Asset.length > 0 ? game.Asset[0] : null,
      description: game.Description,
      tags: game.Tag ? game.Tag.map(t => t.toLowerCase().trim()) : [],
      is_active: true
    }));

    // Upsert into Supabase (if md5 already exists, update it)
    const { error } = await supabase
      .from('games')
      .upsert(gamesToInsert, { onConflict: 'md5_hash' });

    if (error) {
      console.error('Error inserting games to Supabase:', error);
    } else {
      console.log('Successfully inserted 50 games to Supabase!');
      console.log('You can now see them in your Supabase Table Editor.');
    }
    
  } catch (err) {
    console.error('Error fetching or processing games:', err);
  }
}

fetchAndPushGames();
