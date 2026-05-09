/*
  # Revoke GraphQL Schema Visibility from anon and authenticated roles

  1. Security Changes
    - Revoke SELECT from `anon` role on all public tables to prevent unauthenticated discovery
    - Revoke SELECT from `authenticated` role on sensitive tables (direct_messages, friend_requests, notifications, group_members, group_posts)
    - Keep `authenticated` SELECT on tables that all signed-in users can view (profiles, posts, likes, comments, follows, groups)

  2. Important Notes
    - RLS policies still control actual data access; these revocations only affect GraphQL schema visibility
    - Tables where authenticated users need SELECT per RLS policies (profiles, posts, likes, comments, follows, groups) retain authenticated SELECT
    - Sensitive tables (direct_messages, friend_requests, notifications, group_members, group_posts) have authenticated SELECT revoked since access is restricted by RLS to specific users
*/

-- Revoke anon SELECT on all tables
REVOKE SELECT ON TABLE public.profiles FROM anon;
REVOKE SELECT ON TABLE public.posts FROM anon;
REVOKE SELECT ON TABLE public.likes FROM anon;
REVOKE SELECT ON TABLE public.comments FROM anon;
REVOKE SELECT ON TABLE public.follows FROM anon;
REVOKE SELECT ON TABLE public.friend_requests FROM anon;
REVOKE SELECT ON TABLE public.direct_messages FROM anon;
REVOKE SELECT ON TABLE public.notifications FROM anon;
REVOKE SELECT ON TABLE public.groups FROM anon;
REVOKE SELECT ON TABLE public.group_members FROM anon;
REVOKE SELECT ON TABLE public.group_posts FROM anon;

-- Revoke authenticated SELECT on sensitive tables (access controlled by RLS to specific users only)
REVOKE SELECT ON TABLE public.direct_messages FROM authenticated;
REVOKE SELECT ON TABLE public.friend_requests FROM authenticated;
REVOKE SELECT ON TABLE public.notifications FROM authenticated;
REVOKE SELECT ON TABLE public.group_members FROM authenticated;
REVOKE SELECT ON TABLE public.group_posts FROM authenticated;

-- Re-grant authenticated SELECT on tables where all signed-in users can view data (matching RLS policies)
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.posts TO authenticated;
GRANT SELECT ON TABLE public.likes TO authenticated;
GRANT SELECT ON TABLE public.comments TO authenticated;
GRANT SELECT ON TABLE public.follows TO authenticated;
GRANT SELECT ON TABLE public.groups TO authenticated;