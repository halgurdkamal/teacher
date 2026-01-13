-- Quick diagnostic and fix for missing review count

-- STEP 1: Check if any reviews are hidden
SELECT 
  id,
  user_name,
  rating,
  is_hidden,
  report_count,
  created_at
FROM reviews
WHERE teacher_id = '41d29b0a-55a9-4ffe-9cef-8d309f63448d'
ORDER BY created_at DESC;

-- STEP 2: Count visible vs total reviews
SELECT 
  COUNT(*) FILTER (WHERE is_hidden = FALSE) as visible_reviews,
  COUNT(*) as total_reviews,
  ROUND(AVG(rating) FILTER (WHERE is_hidden = FALSE)::numeric, 2) as avg_rating_visible,
  ROUND(AVG(rating)::numeric, 2) as avg_rating_all
FROM reviews
WHERE teacher_id = '41d29b0a-55a9-4ffe-9cef-8d309f63448d';

-- STEP 3: If a review is incorrectly hidden, unhide it
-- (Only run this if you see is_hidden = TRUE for a review that shouldn't be hidden)
UPDATE reviews
SET is_hidden = FALSE, report_count = 0
WHERE teacher_id = '41d29b0a-55a9-4ffe-9cef-8d309f63448d'
AND is_hidden = TRUE
AND report_count < 3;

-- STEP 4: Manually trigger the rating update
-- This forces the trigger to recalculate by touching a review
-- We'll update the comment to itself (no actual change, just triggers the UPDATE trigger)
UPDATE reviews
SET comment = comment
WHERE id = (
  SELECT id FROM reviews 
  WHERE teacher_id = '41d29b0a-55a9-4ffe-9cef-8d309f63448d'
  LIMIT 1
);

-- STEP 5: Verify the teacher's stats are now correct
SELECT 
  name,
  avg_rating,
  total_reviews
FROM teachers
WHERE id = '41d29b0a-55a9-4ffe-9cef-8d309f63448d';
