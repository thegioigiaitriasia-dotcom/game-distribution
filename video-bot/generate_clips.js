require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const googleTTS = require('google-tts-api');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in ../.env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateVideos() {
  const clipsDir = path.join(__dirname, 'clips');
  if (!fs.existsSync(clipsDir)) {
    fs.mkdirSync(clipsDir);
  }

  console.log("Fetching 10 random games from Supabase...");
  // Fetch 10 games randomly (or you can use a viewed logic, we'll just pick latest trending for now)
  const { data: games, error } = await supabase
    .from('games')
    .select('title, thumbnail_url, md5_hash')
    .limit(10)
    .order('created_at', { ascending: false }); // To randomize, we can just grab latest

  if (error || !games) {
    console.error("Failed to fetch games:", error);
    return;
  }

  console.log(`Found ${games.length} games. Starting Remotion rendering...`);

  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    
    // Clean filename
    const safeTitle = game.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const outputPath = path.join(clipsDir, `${safeTitle}_tiktok.mp4`);

    if (fs.existsSync(outputPath)) {
      console.log(`Skip: Video for ${game.title} already exists.`);
      continue;
    }

    console.log(`[${i+1}/${games.length}] Rendering: ${game.title}`);
    
    // Generate TTS
    let description = game.description || `Play ${game.title} for free on ArcadeHubFree! It's super fun and exciting.`;
    if (description.length > 200) description = description.substring(0, 197) + '...';
    const ttsFileName = `tts_${safeTitle}.mp3`;
    const ttsPath = path.join(__dirname, 'public', ttsFileName);
    try {
      const base64AudioArray = await googleTTS.getAllAudioBase64(description, {
        lang: 'en',
        slow: false,
        host: 'https://translate.google.com',
        splitPunct: ',.?'
      });
      const audioBuffer = Buffer.concat(base64AudioArray.map(a => Buffer.from(a.base64, 'base64')));
      fs.writeFileSync(ttsPath, audioBuffer);
    } catch(e) {
      console.error("TTS failed for", game.title, e.message);
    }

    const props = JSON.stringify({
      title: game.title,
      thumbnail: game.thumbnail_url,
      domain: process.env.SITE_DOMAIN || 'arcadehubfree.asia',
      description: description,
      ttsFile: ttsFileName
    });

    try {
      // Viết props ra file json để tránh lỗi escape dấu ngoặc kép trên Windows CMD
      const propsPath = path.join(clipsDir, 'props.json');
      fs.writeFileSync(propsPath, props);

      // Dùng cổng động (thay đổi theo mỗi video) để tránh lỗi kẹt cổng (port is not available)
      const port = 3333 + i;
      execSync(`npx remotion render src/index.ts GamePromo "${outputPath}" --props="${propsPath}" --port=${port}`, { stdio: 'inherit' });
      console.log(`✅ Success: ${outputPath}`);
    } catch (err) {
      console.error(`❌ Failed to render ${game.title}:`, err.message);
    }
  }

  console.log("All videos generated successfully!");
}

generateVideos();
