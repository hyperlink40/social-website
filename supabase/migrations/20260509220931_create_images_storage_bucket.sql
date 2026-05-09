/*
  # Create images storage bucket with RLS policies

  1. New Storage Bucket
    - `images` bucket (public, 5MB file size limit)
    - Allows authenticated users to upload images for posts

  2. Storage Policies
    - Authenticated users can upload images to their own folder (`user_id/`)
    - Anyone can view images (public bucket)
    - Users can delete only their own images
    - Users can update only their own images

  3. Security
    - Upload path restricted to `auth.uid()/` prefix so users can only upload to their own folder
    - Delete/update restricted to files in the user's own folder
    - Public read access since images are displayed in the feed
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'images');

CREATE POLICY "Users can update own images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'images' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'images' AND (storage.foldername(name))[1] = auth.uid()::text);
