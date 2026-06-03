/*
  # Add Link Preview System

  1. New Tables
    - `link_previews` - Cache for extracted URL metadata
      - `id` (uuid, primary key)
      - `url` (text, unique) - Full URL
      - `title` (text) - Page title
      - `description` (text) - Page description
      - `image_url` (text) - Preview image
      - `favicon_url` (text) - Site favicon
      - `domain` (text) - Extracted domain for display
      - `created_at` (timestamptz)
    
    - `post_links` - Association between posts and URLs
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to posts)
      - `link_preview_id` (uuid, foreign key to link_previews)
      - `position` (integer) - Order in post
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Policies for public read access
    - Users can only add links to their own posts

  3. Performance
    - Index on link_previews(url) for fast lookup
    - Index on post_links(post_id) for post queries
*/

CREATE TABLE IF NOT EXISTS link_previews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text UNIQUE NOT NULL,
  title text,
  description text,
  image_url text,
  favicon_url text,
  domain text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_link_previews_url ON link_previews(url);

ALTER TABLE link_previews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view link previews"
  ON link_previews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert link previews"
  ON link_previews FOR INSERT
  TO public
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS post_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  link_preview_id uuid NOT NULL REFERENCES link_previews(id) ON DELETE CASCADE,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, link_preview_id)
);

CREATE INDEX IF NOT EXISTS idx_post_links_post_id ON post_links(post_id);
CREATE INDEX IF NOT EXISTS idx_post_links_link_preview_id ON post_links(link_preview_id);

ALTER TABLE post_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view post links"
  ON post_links FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can add links to posts"
  ON post_links FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts WHERE posts.id = post_id AND posts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete links from own posts"
  ON post_links FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts WHERE posts.id = post_id AND posts.user_id = auth.uid()
    )
  );
