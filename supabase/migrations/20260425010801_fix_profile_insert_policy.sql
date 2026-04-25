/*
  # Fix Profile Insert Policy

  1. Changes
    - Add service role policy to allow profile creation during signup

  2. Security
    - Service role is used only by backend code
    - Profiles still protected by RLS for authenticated users
*/

DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);
