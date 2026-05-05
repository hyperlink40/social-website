/*
  # Update profile trigger to capture username

  1. Changes
    - Modified trigger function to extract username from user metadata
    - Falls back to email if username not provided
    - Creates profile with all initial data from auth signup

  2. Security
    - Trigger is database-level, bypasses RLS
    - Automatically called on auth.users insert
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', new.email),
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
