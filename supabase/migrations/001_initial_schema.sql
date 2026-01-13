-- Teacher Review Platform - Initial Database Schema
-- Kurdish Language Support, Device Fingerprinting, Crowd Moderation

-- ============================================
-- TABLES
-- ============================================

-- Schools Table (for autocomplete)
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  city TEXT DEFAULT 'سلێمانی', -- Sulaymaniyah in Kurdish
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_schools_name ON schools(name);

-- Teachers Table
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  image_url TEXT,
  avg_rating DECIMAL(3,2) DEFAULT 0 CHECK (avg_rating >= 0 AND avg_rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_teachers_name ON teachers(name);
CREATE INDEX idx_teachers_school_id ON teachers(school_id);
CREATE INDEX idx_teachers_avg_rating ON teachers(avg_rating DESC);

-- Reviews Table (with device fingerprinting and crowd moderation)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  device_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL CHECK (char_length(comment) >= 10 AND char_length(comment) <= 500),
  is_hidden BOOLEAN DEFAULT FALSE,
  report_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate reviews (phone OR device)
  CONSTRAINT unique_phone_per_teacher UNIQUE (teacher_id, user_phone),
  CONSTRAINT unique_device_per_teacher UNIQUE (teacher_id, device_id)
);

CREATE INDEX idx_reviews_teacher_id ON reviews(teacher_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_is_hidden ON reviews(is_hidden) WHERE is_hidden = FALSE;
CREATE INDEX idx_reviews_device_id ON reviews(device_id);

-- Review Reports Table
CREATE TABLE review_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  reporter_device_id TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent same device from reporting multiple times
  CONSTRAINT unique_device_report UNIQUE (review_id, reporter_device_id)
);

CREATE INDEX idx_reports_review_id ON review_reports(review_id);

-- Review Helpful Votes Table (crowd moderation)
CREATE TABLE review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  voter_device_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent same device from voting multiple times
  CONSTRAINT unique_device_helpful_vote UNIQUE (review_id, voter_device_id)
);

CREATE INDEX idx_helpful_votes_review_id ON review_helpful_votes(review_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update teacher rating when reviews change
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

CREATE TRIGGER trigger_update_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_teacher_rating();

-- Auto-hide reviews with 3+ reports
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

CREATE TRIGGER trigger_auto_hide
AFTER INSERT ON review_reports
FOR EACH ROW
EXECUTE FUNCTION auto_hide_reported_reviews();

-- Update helpful_count when votes are added/removed
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

CREATE TRIGGER trigger_update_helpful_count
AFTER INSERT OR DELETE ON review_helpful_votes
FOR EACH ROW
EXECUTE FUNCTION update_helpful_count();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- Schools: Public read, admin write
CREATE POLICY "public_read_schools" ON schools
  FOR SELECT USING (true);

CREATE POLICY "admin_write_schools" ON schools
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Teachers: Public read, admin write
CREATE POLICY "public_read_teachers" ON teachers
  FOR SELECT USING (true);

CREATE POLICY "admin_write_teachers" ON teachers
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Reviews: Public read non-hidden, public insert, admin update/delete
CREATE POLICY "public_read_reviews" ON reviews
  FOR SELECT USING (is_hidden = FALSE);

CREATE POLICY "public_insert_reviews" ON reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admin_manage_reviews" ON reviews
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_delete_reviews" ON reviews
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Review Reports: Public insert, admin read
CREATE POLICY "public_report_reviews" ON review_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admin_read_reports" ON review_reports
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Review Helpful Votes: Public insert/delete (for their own votes)
CREATE POLICY "public_vote_helpful" ON review_helpful_votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public_unvote_helpful" ON review_helpful_votes
  FOR DELETE USING (true);

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Insert sample schools
INSERT INTO schools (name, city) VALUES
  ('قوتابخانەی ئاوات', 'سلێمانی'),
  ('قوتابخانەی زانکۆ', 'سلێمانی'),
  ('قوتابخانەی سەردەم', 'سلێمانی');

-- Insert sample teachers
INSERT INTO teachers (name, subject, school_id) 
SELECT 
  'د. ئەحمەد محەمەد',
  'بیرکاری',
  id
FROM schools WHERE name = 'قوتابخانەی ئاوات'
LIMIT 1;

INSERT INTO teachers (name, subject, school_id)
SELECT 
  'م. سارا عەلی',
  'ئینگلیزی',
  id
FROM schools WHERE name = 'قوتابخانەی زانکۆ'
LIMIT 1;
