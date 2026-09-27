import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

// Ensure ISR or dynamic rendering if we want it fresh daily. 
// We'll use revalidate = 3600 (1 hour) so it stays fresh.
export const revalidate = 3600

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // We use service role to bypass RLS for fetching deals if needed, or anon key.
)

export default async function DealsPage() {
  // Lấy tất cả các deal
  const { data: deals, error } = await supabase
    .from('affiliate_deals')
    .select('*, trending_topics(keyword)')
    .order('discount_percentage', { ascending: false })

  if (error) {
    console.error('Lỗi khi lấy deals:', error)
  }

  const allDeals = deals || [];

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center py-10">
          <h1 className="text-4xl md:text-6xl font-black mb-4 flex items-center gap-4 drop-shadow-xl text-center">
            <span className="text-5xl md:text-7xl">🛍️</span> 
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent uppercase tracking-tight">Gamer's Deals</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl text-center">
            Tổng hợp các ưu đãi hot nhất về Game, Thẻ Cào, Phụ Kiện và Dịch vụ dành riêng cho game thủ. Cập nhật mới mỗi ngày!
          </p>
          <Link href="/" className="mt-6 text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-2">
            &larr; Về trang chủ chơi game
          </Link>
        </div>

        {/* Lưới sản phẩm */}
        {allDeals.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
            {allDeals.map((deal: any) => (
              <div key={deal.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-pink-500 transition-colors group flex flex-col shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(236,72,153,0.3)]">
                <div className="h-48 bg-slate-800 overflow-hidden relative">
                  {deal.discount_percentage > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-sm font-black px-3 py-1 rounded-lg shadow-lg z-10">
                      GIẢM {deal.discount_percentage}%
                    </span>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={deal.image_url} 
                    alt={deal.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100 bg-white" 
                  />
                </div>
                <div className="p-4 space-y-3 flex flex-col flex-grow">
                  <span className="text-[10px] font-bold text-pink-400 tracking-wider uppercase bg-pink-500/10 inline-block px-2 py-1 rounded w-max">
                    🏷️ {deal.merchant_name || 'Ưu Đãi Đặc Biệt'}
                  </span>
                  <h3 className="text-white text-sm md:text-base font-bold leading-snug line-clamp-2" title={deal.title}>{deal.title}</h3>
                  <div className="flex flex-col gap-1 mt-auto pt-2 border-t border-slate-800/50">
                    <span className="text-xl md:text-2xl font-black text-cyan-400">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(deal.discount_price)}
                    </span>
                    {deal.original_price > deal.discount_price && (
                      <span className="text-xs md:text-sm text-slate-500 line-through">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(deal.original_price)}
                      </span>
                    )}
                  </div>
                  <a 
                    href={deal.tracking_link || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block w-full mt-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-3 rounded-xl transition-all text-center text-sm uppercase tracking-wide shadow-lg shadow-pink-600/20"
                  >
                    Mua Ngay Giá Hời
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800 mt-10">
            <p className="text-6xl mb-4">😿</p>
            <h2 className="text-2xl text-white font-bold">Chưa có deal nào hôm nay</h2>
            <p className="text-slate-400 mt-2">Hệ thống đang tìm kiếm các thẻ game và ưu đãi giá rẻ. Bạn quay lại sau nhé!</p>
          </div>
        )}

      </div>
    </div>
  )
}
