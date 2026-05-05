/*
  # Auto-create profiles on signup

  1. Changes
    - Add trigger function to automatically create user profiles when they sign up
    - Profile is created with auth.uid() as the id
    - Trigger fires on insert to auth.users table

  2. Security
    - Uses database trigger which bypasses RLS
    - Called automatically by Supabase auth system
    - Profile inherits user id from auth.users table
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
