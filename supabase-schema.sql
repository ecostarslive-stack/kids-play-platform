-- Hebrew Kids Learning Games — Supabase Database Schema

-- Profiles: child profiles (parent-managed, no auth for kids)
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  avatar text DEFAULT 'bear',
  created_at timestamptz DEFAULT now()
);

-- Game Progress: per child per game
CREATE TABLE game_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  game_slug text NOT NULL,
  current_level int DEFAULT 1,
  high_score int DEFAULT 0,
  stars_earned int DEFAULT 0,
  completed boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, game_slug)
);

-- Game Sessions: analytics per play session
CREATE TABLE game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  game_slug text NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  score int DEFAULT 0,
  correct_answers int DEFAULT 0,
  wrong_answers int DEFAULT 0
);

-- Game Content: CMS-managed content
CREATE TABLE game_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_slug text NOT NULL,
  content_type text NOT NULL,
  data jsonb DEFAULT '{}',
  audio_url text,
  image_url text,
  display_order int DEFAULT 0,
  is_active boolean DEFAULT true
);

-- Indexes
CREATE INDEX idx_game_progress_profile ON game_progress(profile_id);
CREATE INDEX idx_game_sessions_profile ON game_sessions(profile_id);
CREATE INDEX idx_game_content_slug ON game_content(game_slug);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_content ENABLE ROW LEVEL SECURITY;

-- Public read access for game content
CREATE POLICY "Game content is publicly readable"
  ON game_content FOR SELECT
  USING (is_active = true);

-- For now, allow all operations (tighten when adding auth)
CREATE POLICY "Allow all profile operations"
  ON profiles FOR ALL
  USING (true);

CREATE POLICY "Allow all game_progress operations"
  ON game_progress FOR ALL
  USING (true);

CREATE POLICY "Allow all game_sessions operations"
  ON game_sessions FOR ALL
  USING (true);
