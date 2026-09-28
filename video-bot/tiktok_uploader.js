require('dotenv').config({ path: '../.env.local' });
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Enable stealth plugin
puppeteer.use(StealthPlugin());

// --- CONFIGURATION TỪ .ENV ---
// Dùng thư mục profile độc lập để không bao giờ đụng độ với Chrome thật của user
const BOT_PROFILE_DIR = path.join(__dirname, 'bot-profile');
const SITE_DOMAIN = process.env.SITE_DOMAIN || 'arcadehubfree.asia';
const CLIPS_DIR = path.join(__dirname, 'clips');

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadToTikTok() {
    console.log("🚀 Đang khởi động Bot TikTok (Stealth Mode)...");

    // Lấy video đầu tiên trong thư mục
    const files = fs.readdirSync(CLIPS_DIR).filter(f => f.endsWith('.mp4'));
    if (files.length === 0) {
        console.log("❌ Không còn video nào trong thư mục clips/. Hãy chạy generate_clips.js trước!");
        return;
    }

    const videoToUpload = files[0];
    const videoPath = path.join(CLIPS_DIR, videoToUpload);
    const gameName = videoToUpload.replace('_tiktok.mp4', '').replace(/_/g, ' ').toUpperCase();
    
    console.log(`🎬 Chuẩn bị đăng video: ${videoToUpload}`);

    // Mở trình duyệt với Profile độc lập
    const browser = await puppeteer.launch({
        headless: false, // Phải mở có giao diện (false) để TikTok không nghi ngờ
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Dùng Chrome thật thay vì Chromium
        userDataDir: BOT_PROFILE_DIR,
        args: [
            '--disable-blink-features=AutomationControlled'
        ]
    });

    const page = await browser.newPage();
    // Chỉnh kích thước màn hình ngẫu nhiên như người dùng laptop
    await page.setViewport({ width: 1366, height: 768 });

    try {
        console.log("🌐 Đang truy cập TikTok Creator Center...");
        await page.goto('https://www.tiktok.com/creator-center/upload', { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        await delay(5000); // Chờ load trang hoàn toàn

        // Bước 1: Tìm nút Upload Video và tải file lên
        console.log("📂 Đang tải video lên...");
        // TikTok thường dùng thẻ iframe cho trang upload, nếu có ta phải nhảy vào iframe
        let uploadFrame = page;
        const iframeElement = await page.$('iframe[data-tt-log-name="creator_center_upload"]');
        if (iframeElement) {
            uploadFrame = await iframeElement.contentFrame();
        }

        const fileInput = await uploadFrame.$('input[type="file"]');
        if (!fileInput) {
            throw new Error("Không tìm thấy nút Upload (Có thể TikTok đã đổi giao diện hoặc bạn chưa đăng nhập).");
        }
        await fileInput.uploadFile(videoPath);

        // Chờ video tải lên xong (Khoảng 15-30 giây)
        console.log("⏳ Chờ video xử lý xong trên máy chủ TikTok...");
        await delay(20000); 

        // Bước 2: Gõ Caption
        console.log("✍️ Đang viết Caption...");
        const captionEditor = await uploadFrame.$('.public-DraftEditor-content, [contenteditable="true"]');
        if (captionEditor) {
            await captionEditor.click();
            await delay(1000);
            // THÊM DELAY: Gõ từng chữ giống hệt con người (100ms/ký tự) để lách thuật toán theo dõi bàn phím của TikTok
            await uploadFrame.keyboard.type(`Play ${gameName} FREE at ${SITE_DOMAIN}! 🎮🔥 #freegames #unblockedgames #gaming #${gameName.replace(/ /g, '')}`, { delay: 100 });
            await delay(2000);
        } else {
            console.log("⚠️ Không tìm thấy ô nhập Caption, bỏ qua bước này.");
        }

        // Bước 3: Bấm nút ĐĂNG (Post)
        console.log("🚀 Bấm Đăng Video...");
        // Tìm nút Post (Nó thường là nút có chữ Post hoặc Đăng)
        const postButton = await uploadFrame.$x("//button[contains(., 'Post') or contains(., 'Đăng')]");
        if (postButton.length > 0) {
            await postButton[0].click();
            console.log("✅ Đã bấm nút Đăng! Chờ xác nhận...");
            await delay(10000); // Chờ load sang trang báo thành công
        } else {
            console.log("⚠️ Không tìm thấy nút Đăng. Bạn có thể tự bấm bằng tay.");
        }

        console.log("🎉 Hoàn tất quy trình đăng TikTok!");

        // Bước 4: Xóa file video sau khi đăng để giải phóng ổ cứng
        fs.unlinkSync(videoPath);
        console.log(`🗑️ Đã xóa video: ${videoToUpload}`);

    } catch (err) {
        console.error("❌ Lỗi trong quá trình đăng:", err.message);
    } finally {
        console.log("Đang đóng trình duyệt...");
        await delay(3000);
        await browser.close();
    }
}

uploadToTikTok();
