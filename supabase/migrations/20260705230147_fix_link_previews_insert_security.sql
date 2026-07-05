/*
  # Fix Link Previews RLS Security

  1. Security Issue
    - Current INSERT policy uses `WITH CHECK (true)` which allows any auth user to insert
    - This is a shared cache table for URL metadata, should be managed by edge functions

  2. Security Changes
    - Remove public INSERT access - link previews should be created by edge functions
    - Add policy for service_role to manage link previews
    - Keep SELECT public since URL metadata is non-sensitive
*/

-- Remove the permissive INSERT policy for authenticated users
DROP POLICY IF EXISTS "Authenticated users can create link previews" ON link_previews;

-- Service role (edge functions) can manage all link previews
CREATE POLICY "Service role can manage link previews"
  ON link_previews FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
