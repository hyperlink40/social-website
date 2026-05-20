/*
  # Add Sports Groups Feature

  1. New Tables
    - `sports_groups`
      - `id` (uuid, primary key)
      - `name` (text, unique) - sport name from RapidAPI
      - `description` (text) - sport description
      - `icon` (text) - emoji or icon for the sport
      - `created_at` (timestamp)
    
    - `group_members`
      - `id` (uuid, primary key)
      - `group_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `joined_at` (timestamp)
    
    - `group_posts`
      - `id` (uuid, primary key)
      - `group_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `content` (text)
      - `image_url` (text, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Policies for group viewing and membership
    - User-specific post management

  3. Data
    - Insert popular sports from RapidAPI
*/

CREATE TABLE IF NOT EXISTS sports_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text DEFAULT '⚽',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sports_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sports groups"
  ON sports_groups FOR SELECT
  TO public
  USING (true);

CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES sports_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can join groups"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON group_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS group_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES sports_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view group posts"
  ON group_posts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create group posts"
  ON group_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own group posts"
  ON group_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own group posts"
  ON group_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

INSERT INTO sports_groups (name, description, icon) VALUES
  ('Football', 'American Football', '🏈'),
  ('Basketball', 'NBA & Basketball', '🏀'),
  ('Baseball', 'Major League Baseball', '⚾'),
  ('Soccer', 'Football/Soccer', '⚽'),
  ('Ice Hockey', 'NHL & Hockey', '🏒'),
  ('Tennis', 'Professional Tennis', '🎾'),
  ('Golf', 'Professional Golf', '⛳'),
  ('Boxing', 'Boxing & Combat', '🥊'),
  ('UFC/MMA', 'Ultimate Fighting Championship', '🥋'),
  ('Cricket', 'Cricket', '🏏')
ON CONFLICT (name) DO NOTHING;
