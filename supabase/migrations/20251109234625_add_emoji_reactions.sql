/*
  # Add Emoji Reactions

  1. New Tables
    - `post_reactions`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `user_id` (uuid, references profiles)
      - `emoji` (text, single emoji)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on post_reactions table
    - Users can view all reactions
    - Users can add their own reactions
    - Users can delete their own reactions

  3. Important Notes
    - Unique constraint prevents duplicate reactions (one emoji per user per post)
    - Indexes added for performance
*/

CREATE TABLE IF NOT EXISTS post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id, emoji)
);

ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view post reactions"
  ON post_reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add reactions"
  ON post_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their reactions"
  ON post_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS post_reactions_post_id_idx ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS post_reactions_user_id_idx ON post_reactions(user_id);
CREATE INDEX IF NOT EXISTS post_reactions_emoji_idx ON post_reactions(emoji);