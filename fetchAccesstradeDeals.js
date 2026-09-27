require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ACCESSTRADE_API_KEY = process.env.ACCESSTRADE_API_KEY;

async function fetchAccesstradeDeals() {
  console.log('Fetching live gaming deals from Accesstrade...');
  
  // Các từ khóa hot dành cho game thủ
  const keywords = ['chuột', 'bàn phím', 'tai nghe', 'garena', 'steam', 'robux'];
  let allDeals = [];

  for (const kw of keywords) {
    // Tăng limit để lấy nhiều rồi lọc lại
    const url = `https://api.accesstrade.vn/v1/datafeeds?keyword=${encodeURIComponent(kw)}&limit=10`;
    
    try {
      const res = await fetch(url, {
        headers: {
          'Authorization': `Token ${ACCESSTRADE_API_KEY}`
        }
      });
      const json = await res.json();
      
      if (json && json.data && json.data.length > 0) {
        json.data.forEach(item => {
          // Bắt buộc tên sản phẩm phải chứa từ khóa (để tránh rác như sữa rửa mặt)
          const nameLower = item.name.toLowerCase();
          const kwParts = kw.split(' ');
          const isMatch = kwParts.some(part => nameLower.includes(part));
          
          if (!isMatch) return; // Bỏ qua nếu không liên quan

          // Tính phần trăm giảm giá
          let original_price = item.price || 0;
          let discount_price = item.discount || original_price;
          
          let discount_percentage = 0;
          if (original_price > discount_price && original_price > 0) {
            discount_percentage = Math.round(((original_price - discount_price) / original_price) * 100);
          } else if (item.discount_rate) {
            discount_percentage = item.discount_rate;
          }

          // Fake a UUID for trend_id (or null if it accepts null)
          // Since we need to insert, let's just leave trend_id as null if possible, or fetch a real one.
          // In the DB schema, trend_id might be nullable.
          
          allDeals.push({
            title: item.name,
            image_url: item.image,
            tracking_link: item.aff_link,
            original_price: original_price,
            discount_price: discount_price,
            discount_percentage: discount_percentage,
            merchant_name: item.merchant || 'Shopee/Lazada',
            is_active: true
          });
        });
      }
    } catch (e) {
      console.error(`Error fetching for keyword ${kw}:`, e.message);
    }
  }

  console.log(`Found ${allDeals.length} deals. Pushing to Supabase...`);

  if (allDeals.length > 0) {
    // Để giữ cho section Deals luôn mới và sạch sẽ, ta có thể xóa các deals cũ không có trend_id (hoặc xóa hết) rồi chèn mới.
    // Xóa các deals do Accesstrade sinh ra (merchant_name != 'Amazon / Commission Factory')
    await supabase.from('affiliate_deals').delete().neq('merchant_name', 'Amazon / Commission Factory');

    const { error } = await supabase.from('affiliate_deals').insert(allDeals);
    if (error) {
      console.error('Error inserting deals to DB:', error);
    } else {
      console.log('Successfully pushed live Accesstrade deals to the homepage!');
    }
  }
}

fetchAccesstradeDeals();
