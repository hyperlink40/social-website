/*
  # Add image_urls column to posts table

  1. Changes
    - Add `image_urls` column (text array) to posts table
    - Stores multiple image URLs per post
    - Backward compatible: existing `image_url` column remains for first/single image

  2. Security
    - No RLS policy changes needed
    - Column is writable through existing INSERT/UPDATE policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'image_urls'
  ) THEN
    ALTER TABLE posts ADD COLUMN image_urls text[] DEFAULT '{}';
  END IF;
END $$;
