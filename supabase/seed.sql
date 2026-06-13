-- ============================================
-- SEED DATA
-- FIX 1: profiles no longer takes email/password_hash — uses Supabase Auth
-- FIX 2: exam term changed from 'First Term' to '1st Term' (matches CHECK constraint)
-- FIX 3: exam_type changed from 'CBT' to 'exam' (matches CHECK constraint)
-- FIX 4: correct_option changed from uppercase 'B' to lowercase 'b' (matches CHECK constraint)
-- FIX 5: student inserts no longer include user_id (set when account is created)
-- ============================================

-- Insert default school settings (only one row)
INSERT INTO school_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ADMIN ACCOUNT SETUP INSTRUCTIONS
-- ============================================
-- Do NOT insert admin directly into profiles table via SQL.
-- Supabase Auth manages passwords — seed.sql cannot set them.
--
-- To create your admin account:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. Email: admin@goldenstarschool.edu.ng
-- 4. Password: Admin@1234   (change after first login)
-- 5. Check "Auto Confirm User"
-- 6. Click "Create User"
-- 7. Then run this SQL in SQL Editor:
--
-- UPDATE profiles
-- SET role = 'admin', full_name = 'School Administrator'
-- WHERE email = 'admin@goldenstarschool.edu.ng';
--
-- ============================================

-- Insert sample news
INSERT INTO news (title, description, date)
VALUES
  ('New Academic Session Begins', 'We are excited to welcome all students back for the new 2026 academic session. Registration is now open for all classes.', '2026-05-01'),
  ('First Term CBT Examination Timetable Released', 'The first term CBT examination timetable has been released. All students should log in to their dashboards to view assigned exams.', '2026-04-20'),
  ('Parents Meeting Notice', 'All parents and guardians are invited to the end-of-term parents meeting scheduled for next Friday at 10:00am in the school hall.', '2026-04-10')
ON CONFLICT DO NOTHING;

-- Insert sample exam for JSS 1
-- FIX: term = '1st Term' (was 'First Term'), exam_type = 'exam' (was 'CBT')
INSERT INTO exams (title, subject, class, date, start_time, duration, is_active, exam_type, term, session, max_score)
VALUES (
  'First Term Mathematics Exam',
  'Mathematics',
  'JSS 1',
  '2026-06-15',
  '09:00',
  30,
  true,
  'exam',
  '1st Term',
  '2025/2026',
  100
)
ON CONFLICT DO NOTHING;

-- Insert 5 sample questions for the exam
-- FIX: correct_option uses lowercase 'b' (was uppercase 'B')
DO $$
DECLARE
  v_exam_id UUID;
BEGIN
  SELECT id INTO v_exam_id FROM exams WHERE title = 'First Term Mathematics Exam' LIMIT 1;
  IF v_exam_id IS NOT NULL THEN
    INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option)
    VALUES
      (v_exam_id, 'What is 2 + 2?', '3', '4', '5', '6', 'b'),
      (v_exam_id, 'What is the square root of 16?', '2', '4', '6', '8', 'b'),
      (v_exam_id, 'What is 10 × 5?', '40', '50', '60', '70', 'b'),
      (v_exam_id, 'What is 100 ÷ 4?', '20', '25', '30', '35', 'b'),
      (v_exam_id, 'What is 7 × 8?', '54', '56', '58', '60', 'b')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
