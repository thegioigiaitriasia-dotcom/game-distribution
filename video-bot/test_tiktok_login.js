require('dotenv').config({ path: '../.env.local' });
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');

puppeteer.use(StealthPlugin());

// Dùng 1 thư mục hoàn toàn độc lập riêng cho Bot để không bao giờ bị đụng độ với Chrome của bạn
const BOT_PROFILE_DIR = path.join(__dirname, 'bot-profile');

// Đường dẫn file ảnh Avatar vừa được AI tạo ra
const AVATAR_PATH = 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\2bdede4d-bbb6-4a46-b931-b4b51f0acc5b\\arcade_avatar_1790405130784.png';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testTikTokLogin() {
    console.log("🚀 Bắt đầu khởi động Bot với Profile Độc Lập...");

    const browser = await puppeteer.launch({
        headless: false, 
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        userDataDir: BOT_PROFILE_DIR,
        args: [
            '--disable-blink-features=AutomationControlled'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    try {
        console.log("🌐 Truy cập trang cá nhân TikTok...");
        // Bỏ networkidle2 vì TikTok load rất nhiều script ngầm, chuyển sang domcontentloaded và tăng timeout
        await page.goto('https://www.tiktok.com/@arcadehubfree', { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        console.log("✅ Đã truy cập thành công. Vui lòng kiểm tra trên màn hình xem tài khoản đã được đăng nhập đúng chưa.");
        
        // Cố gắng tự động bấm nút "Sửa hồ sơ" / "Edit profile"
        console.log("🔍 Đang tìm nút 'Sửa hồ sơ'...");
        await delay(3000);
        
        const editProfileBtn = await page.$$('::-p-xpath(//button[contains(., "Edit profile") or contains(., "Sửa hồ sơ")])');
        if (editProfileBtn.length > 0) {
            console.log("🖱️ Tìm thấy nút Sửa Hồ Sơ, đang click...");
            await editProfileBtn[0].click();
            await delay(3000);

            // Cố gắng tìm ô Upload ảnh
            const fileInputs = await page.$$('input[type="file"]');
            if (fileInputs.length > 0) {
                console.log("🖼️ Đang tải ảnh Avatar lên...");
                await fileInputs[0].uploadFile(AVATAR_PATH);
                console.log("⏳ Vui lòng chờ 3 phút (180 giây) để bạn tự ĐĂNG NHẬP (nếu chưa) và tự bấm Lưu (Save) trên giao diện...");
                await delay(180000); 
            } else {
                console.log("⚠️ Không tìm thấy ô tải ảnh. TikTok có thể đã đổi giao diện. Bạn hãy tự up ảnh trên trình duyệt đang mở nhé.");
                await delay(180000);
            }
        } else {
            console.log("⚠️ Không tìm thấy nút Sửa Hồ Sơ. Bạn hãy tự click trên trình duyệt đang mở nhé (Bot sẽ giữ trình duyệt 3 phút).");
            await delay(180000);
        }

    } catch (err) {
        console.error("❌ Lỗi:", err.message);
    } finally {
        console.log("🛑 Kết thúc Test. Đóng trình duyệt...");
        await browser.close();
    }
}

testTikTokLogin();
