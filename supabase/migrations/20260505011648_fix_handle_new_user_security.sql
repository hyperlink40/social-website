/*
  # Fix security issues with handle_new_user function

  1. Changes
    - Set search_path to empty to prevent search path manipulation
    - Revoke EXECUTE from anon and authenticated roles so the function
      can only be called by the database trigger, not via the REST API
    - Re-grant EXECUTE only to the postgres superuser

  2. Security
    - Fixes "Function Search Path Mutable" vulnerability
    - Fixes "Public Can Execute SECURITY DEFINER Function" vulnerability
    - Fixes "Signed-In Users Can Execute SECURITY DEFINER Function" vulnerability
    - Function is now only callable by the trigger, not via /rest/v1/rpc
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', new.email),
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;
