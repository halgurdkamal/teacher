-- ============================================
-- INSTALL TRIGGERS ONLY (Run this if tables already exist)
-- ============================================
-- This script installs only the triggers and functions
-- Use this if you already created the tables manually

-- ============================================
-- STEP 1: CREATE FUNCTIONS
-- ============================================

-- Function: Auto-update teacher rating when reviews change
CREATE OR REPLACE FUNCTION update_teacher_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE teachers
  SET 
    avg_rating = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0)
      FROM reviews
      WHERE teacher_id = COALESCE(NEW.teacher_id, OLD.teacher_id)
      AND is_hidden = FALSE
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE teacher_id = COALESCE(NEW.teacher_id, OLD.teacher_id)
      AND is_hidden = FALSE
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.teacher_id, OLD.teacher_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-hide reviews with 3+ reports
CREATE OR REPLACE FUNCTION auto_hide_reported_reviews()
RETURNS TRIGGER AS $$
DECLARE
  report_total INTEGER;
BEGIN
  -- Count total reports for this review
  SELECT COUNT(*) INTO report_total
  FROM review_reports
  WHERE review_id = NEW.review_id;
  
  -- Update report count and hide if >= 3
  UPDATE reviews
  SET 
    report_count = report_total,
    is_hidden = CASE WHEN report_total >= 3 THEN TRUE ELSE is_hidden END
  WHERE id = NEW.review_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update helpful_count when votes are added/removed
CREATE OR REPLACE FUNCTION update_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reviews
  SET helpful_count = (
    SELECT COUNT(*)
    FROM review_helpful_votes
    WHERE review_id = COALESCE(NEW.review_id, OLD.review_id)
  )
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 2: CREATE TRIGGERS
-- ============================================

-- Drop existing triggers if they exist (to avoid errors)
DROP TRIGGER IF EXISTS trigger_update_rating ON reviews;
DROP TRIGGER IF EXISTS trigger_auto_hide ON review_reports;
DROP TRIGGER IF EXISTS trigger_update_helpful_count ON review_helpful_votes;

-- Trigger: Update teacher rating on review insert/update/delete
CREATE TRIGGER trigger_update_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_teacher_rating();

-- Trigger: Auto-hide reviews with 3+ reports
CREATE TRIGGER trigger_auto_hide
AFTER INSERT ON review_reports
FOR EACH ROW
EXECUTE FUNCTION auto_hide_reported_reviews();

-- Trigger: Update helpful count on vote insert/delete
CREATE TRIGGER trigger_update_helpful_count
AFTER INSERT OR DELETE ON review_helpful_votes
FOR EACH ROW
EXECUTE FUNCTION update_helpful_count();

-- ============================================
-- STEP 3: FIX EXISTING DATA
-- ============================================

-- Update all existing teachers with correct ratings
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
WHERE EXISTS (
  SELECT 1 FROM reviews WHERE teacher_id = t.id
);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check if triggers were created successfully
SELECT 
  trigger_name,
  event_object_table as table_name,
  action_timing,
  event_manipulation as event
FROM information_schema.triggers
WHERE trigger_name IN ('trigger_update_rating', 'trigger_auto_hide', 'trigger_update_helpful_count')
ORDER BY trigger_name;

-- Verify teacher ratings are correct
SELECT 
  t.id,
  t.name,
  t.avg_rating as current_rating,
  t.total_reviews as current_count,
  ROUND(AVG(r.rating)::numeric, 2) as calculated_rating,
  COUNT(r.id) as calculated_count
FROM teachers t
LEFT JOIN reviews r ON r.teacher_id = t.id AND r.is_hidden = FALSE
GROUP BY t.id, t.name, t.avg_rating, t.total_reviews
HAVING COUNT(r.id) > 0
ORDER BY t.name;
