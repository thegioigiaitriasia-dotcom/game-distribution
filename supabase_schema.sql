-- Bảng 1: Lưu trữ thông tin Game
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  md5_hash TEXT UNIQUE NOT NULL,
  thumbnail_url TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  play_count BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Bảng 2: Phân loại theo Tâm trạng/Trend (Collections)
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  emoji TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Bảng 3: Nối Game vào Collections (Quan hệ nhiều - nhiều)
CREATE TABLE game_collections (
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (game_id, collection_id)
);

-- Bảng 4: Hồ sơ người chơi (Hỗ trợ nặc danh hoặc đăng nhập)
CREATE TABLE profiles (
  id UUID PRIMARY KEY, -- Trùng với ID của Supabase Auth
  username TEXT UNIQUE,
  avatar_url TEXT,
  xp_points INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng 5: Yêu thích (Giữ chân user)
CREATE TABLE user_favorites (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, game_id)
);

-- Bảng 6: Phân tích hành vi & AI (Vũ khí bí mật)
CREATE TABLE play_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Có thể null nếu user chưa tạo profile
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  duration_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes để truy vấn siêu tốc (SEO và Load trang)
CREATE INDEX idx_games_md5 ON games(md5_hash);
CREATE INDEX idx_play_sessions_user ON play_sessions(user_id);
CREATE INDEX idx_play_sessions_game ON play_sessions(game_id);
