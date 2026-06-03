/*
  # Fix Link Previews RLS Security

  1. Security Changes
    - Remove public INSERT policy that allows unrestricted writes
    - Add authenticated-only INSERT policy
    - Keep SELECT policy public (read-only access for viewing previews)
    - Unauthenticated users can still view link previews in posts

  2. Rationale
    - Link previews should only be created by authenticated users
    - Public SELECT remains because users need to view previews in posts
    - This prevents anonymous spam/malicious link creation
*/

DROP POLICY IF EXISTS "Anyone can insert link previews" ON link_previews;

CREATE POLICY "Authenticated users can create link previews"
  ON link_previews FOR INSERT
  TO authenticated
  WITH CHECK (true);
