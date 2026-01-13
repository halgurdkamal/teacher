-- Fix RLS policies to allow admin operations
-- Run this in Supabase SQL Editor

-- Update teachers policy to allow admin delete
DROP POLICY IF EXISTS "admin_write_teachers" ON teachers;

CREATE POLICY "admin_write_teachers" ON teachers
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Update reviews policy to allow admin delete
DROP POLICY IF EXISTS "admin_manage_reviews" ON reviews;
DROP POLICY IF EXISTS "admin_delete_reviews" ON reviews;

CREATE POLICY "admin_manage_reviews" ON reviews
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Verify policies
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('teachers', 'reviews')
ORDER BY tablename, policyname;
