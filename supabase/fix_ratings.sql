-- Fix for existing reviews not updating teacher ratings
-- Run this in Supabase SQL Editor if triggers aren't working

-- First, manually update all teacher ratings based on existing reviews
UPDATE teachers t
SET 
  avg_rating = (
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0)
    FROM reviews
    WHERE teacher_id = t.id
    AND is_hidden = FALSE
  ),
  total_reviews = (
    SELECT COUNT(*)
    FROM reviews
    WHERE teacher_id = t.id
    AND is_hidden = FALSE
  ),
  updated_at = NOW()
WHERE id IN (
  SELECT DISTINCT teacher_id FROM reviews
);

-- Verify the update worked
SELECT 
  t.id,
  t.name,
  t.avg_rating,
  t.total_reviews,
  COUNT(r.id) as actual_review_count,
  ROUND(AVG(r.rating)::numeric, 2) as actual_avg_rating
FROM teachers t
LEFT JOIN reviews r ON r.teacher_id = t.id AND r.is_hidden = FALSE
GROUP BY t.id, t.name, t.avg_rating, t.total_reviews
ORDER BY t.name;

-- Check if the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_rating';
