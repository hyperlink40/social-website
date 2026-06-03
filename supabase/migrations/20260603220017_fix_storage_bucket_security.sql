/*
  # Fix Storage Bucket Security

  1. Security Changes
    - Remove public SELECT policy on storage.objects for images bucket
    - This prevents unauthorized listing/enumeration of all files
    - Direct URL access to images still works (doesn't require SELECT policy)
    - Authenticated users can still upload/manage their own images

  2. Rationale
    - Public SELECT policy allows listing all files in bucket
    - This exposes more data than necessary
    - Signed URLs or public object URLs work without SELECT policy
    - Prevents enumeration attacks and data exposure
*/

DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
