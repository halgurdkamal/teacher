-- SIMPLE TEST: Check if triggers are installed in your Supabase database
-- Run this in Supabase SQL Editor

-- 1. Check if the trigger functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('update_teacher_rating', 'auto_hide_reported_reviews', 'update_helpful_count')
ORDER BY routine_name;

-- 2. Check if the triggers are attached to tables
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN ('trigger_update_rating', 'trigger_auto_hide', 'trigger_update_helpful_count')
ORDER BY trigger_name;

-- 3. If both queries return empty results, the triggers are NOT installed
-- You need to run: install_triggers_only.sql

-- 4. If triggers ARE installed, manually recalculate all teacher ratings:
UPDATE teachers t
SET 
  avg_rating = (
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0)
    FROM reviews
    WHERE teacher_id = t.id AND is_hidden = FALSE
  ),
  total_reviews = (
    SELECT COUNT(*)
    FROM reviews
    WHERE teacher_id = t.id AND is_hidden = FALSE
  )
WHERE EXISTS (SELECT 1 FROM reviews WHERE teacher_id = t.id);

-- 5. Verify the results
SELECT 
  t.name,
  t.avg_rating,
  t.total_reviews,
  COUNT(r.id) as actual_reviews,
  ROUND(AVG(r.rating)::numeric, 2) as actual_avg
FROM teachers t
LEFT JOIN reviews r ON r.teacher_id = t.id AND r.is_hidden = FALSE
GROUP BY t.id, t.name, t.avg_rating, t.total_reviews
ORDER BY t.name;
