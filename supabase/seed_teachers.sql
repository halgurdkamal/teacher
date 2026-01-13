-- Add 20 temporary teachers with Kurdish names for testing
-- Run this in Supabase SQL Editor

-- Insert 20 teachers with various subjects
INSERT INTO teachers (name, subject, school_id) 
SELECT 
  teacher_name,
  subject,
  (SELECT id FROM schools ORDER BY RANDOM() LIMIT 1) as school_id
FROM (
  VALUES 
    ('د. ئەحمەد کەریم', 'بیرکاری'),
    ('م. سارا محەمەد', 'ئینگلیزی'),
    ('د. کاروان عەلی', 'کیمیا'),
    ('م. ژیان رەشید', 'فیزیا'),
    ('د. هیوا حەسەن', 'زیندەوەرزانی'),
    ('م. دلنیا ئیبراهیم', 'مێژوو'),
    ('د. بەختیار یوسف', 'جوگرافیا'),
    ('م. ئاوات ئەمین', 'عەرەبی'),
    ('د. شوان رەحیم', 'ئیسلامیات'),
    ('م. نازدار سەعید', 'هونەر'),
    ('د. رێبوار جەلال', 'وەرزش'),
    ('م. چیا خالید', 'کۆمپیوتەر'),
    ('د. زانا فەرهاد', 'ئەدەبیات'),
    ('م. روژان عومەر', 'موسیقا'),
    ('د. هەڵۆ مستەفا', 'فەلسەفە'),
    ('م. دانا رەزا', 'ژمێریاری'),
    ('د. سامان نەجم', 'ئابووری'),
    ('م. هێمن کەمال', 'کوردی'),
    ('د. بەرزان ئازاد', 'شارستانیەت'),
    ('م. ئاسۆ رەشاد', 'دەرونناسی')
) AS t(teacher_name, subject);

-- Verify the insert
SELECT 
  t.name,
  t.subject,
  s.name as school_name,
  t.avg_rating,
  t.total_reviews
FROM teachers t
LEFT JOIN schools s ON s.id = t.school_id
ORDER BY t.created_at DESC
LIMIT 20;
