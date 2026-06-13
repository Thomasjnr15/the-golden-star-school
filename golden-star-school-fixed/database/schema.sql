-- ============================================
-- GOLDEN STAR SCHOOL - SUPABASE DATABASE SCHEMA
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- 1. ADMINS TABLE
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  class TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SCHOOL SETTINGS TABLE
CREATE TABLE IF NOT EXISTS school_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  school_name TEXT DEFAULT 'Golden Star School',
  tagline TEXT DEFAULT 'Excellence in Primary and Secondary Education',
  logo TEXT,
  hero_heading TEXT DEFAULT 'Welcome to Golden Star School',
  hero_subheading TEXT DEFAULT 'Excellence in Primary and Secondary Education',
  hero_image TEXT,
  about_text TEXT DEFAULT 'Golden Star School is committed to providing world-class education for primary and secondary students.',
  admission_text TEXT DEFAULT 'Join Golden Star School and give your child the best foundation for a bright future.',
  admission_image TEXT,
  contact_email TEXT DEFAULT 'info@goldenstarschool.edu.ng',
  contact_phone TEXT DEFAULT '+234 800 000 0000',
  contact_address TEXT DEFAULT '12 School Road, Lagos, Nigeria',
  map_embed TEXT,
  bank_name TEXT DEFAULT 'First Bank of Nigeria',
  account_number TEXT DEFAULT '1234567890',
  account_name TEXT DEFAULT 'Golden Star School',
  fees_table TEXT DEFAULT '[{"class":"Primary 1 - 3","amount":"₦25,000"},{"class":"Primary 4 - 6","amount":"₦30,000"},{"class":"JSS 1 - 3","amount":"₦40,000"},{"class":"SSS 1 - 3","amount":"₦50,000"}]',
  primary_color TEXT DEFAULT '#FFD700',
  secondary_color TEXT DEFAULT '#001F54',
  bg_light TEXT DEFAULT '#FFF8E1',
  bg_dark TEXT DEFAULT '#F1F5F9',
  facebook TEXT,
  twitter TEXT,
  instagram TEXT,
  whatsapp TEXT,
  youtube TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. NEWS TABLE
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EXAMS TABLE
CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  class TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('a','b','c','d')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. STUDENT ANSWERS TABLE
CREATE TABLE IF NOT EXISTS student_answers (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  selected_option TEXT CHECK (selected_option IN ('a','b','c','d')),
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, exam_id, question_id)
);

-- 8. EXAM RESULTS TABLE
CREATE TABLE IF NOT EXISTS exam_results (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, exam_id)
);

-- 9. EXAM SESSIONS TABLE (tracks when student first opens each exam)
CREATE TABLE IF NOT EXISTS exam_sessions (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, exam_id)
);

-- 10. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  date_paid DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid','pending')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. REGISTRATION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS registration_requests (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  class_applying TEXT NOT NULL,
  previous_school TEXT,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT,
  home_address TEXT,
  additional_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  assigned_registration_number TEXT,
  assigned_class TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ
);

-- 12. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SEED DATA - Run after creating tables
-- ============================================

-- Insert default school settings (only one row)
INSERT INTO school_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Insert default admin account
-- Email: admin@goldenstarschool.edu.ng
-- Password: Admin@1234 (change this after first login!)
INSERT INTO admins (email, password_hash)
VALUES (
  'admin@goldenstarschool.edu.ng',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
)
ON CONFLICT (email) DO NOTHING;

-- NOTE: The password hash above is for 'Admin@1234'
-- Change it immediately after your first login!

-- Insert 3 sample students
-- Passwords are: Student@123
INSERT INTO students (full_name, registration_number, class, password_hash)
VALUES
  ('Amara Johnson', 'GSS/2026/001', 'JSS 1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
  ('Emeka Williams', 'GSS/2026/002', 'JSS 1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
  ('Fatima Okafor', 'GSS/2026/003', 'Primary 4', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (registration_number) DO NOTHING;

-- Insert sample news
INSERT INTO news (title, description, date)
VALUES
  ('New Academic Session Begins', 'We are excited to welcome all students back for the new 2026 academic session. Registration is now open for all classes.', '2026-05-01'),
  ('First Term CBT Examination Timetable Released', 'The first term CBT examination timetable has been released. All students should log in to their dashboards to view assigned exams.', '2026-04-20'),
  ('Parents Meeting Notice', 'All parents and guardians are invited to the end-of-term parents meeting scheduled for next Friday at 10:00am in the school hall.', '2026-04-10')
ON CONFLICT DO NOTHING;

-- Insert sample exam for JSS 1
INSERT INTO exams (title, subject, class, date, start_time, duration)
VALUES ('First Term Mathematics Exam', 'Mathematics', 'JSS 1', '2026-06-01', '09:00', 30)
ON CONFLICT DO NOTHING;

-- Insert 5 sample questions for the exam
DO $$
DECLARE exam_id INTEGER;
BEGIN
  SELECT id INTO exam_id FROM exams WHERE title = 'First Term Mathematics Exam' LIMIT 1;
  IF exam_id IS NOT NULL THEN
    INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option)
    VALUES
      (exam_id, 'What is 15 + 27?', '40', '42', '38', '45', 'b'),
      (exam_id, 'What is 8 × 7?', '54', '56', '48', '63', 'b'),
      (exam_id, 'What is the value of 2³?', '6', '9', '8', '12', 'c'),
      (exam_id, 'What is 144 ÷ 12?', '10', '11', '13', '12', 'd'),
      (exam_id, 'What is 25% of 200?', '40', '50', '25', '75', 'b')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================
-- ROW LEVEL SECURITY (Optional but recommended)
-- ============================================
-- Disable RLS for now (using JWT auth in backend)
-- You can enable it later for extra security

ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE news DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions DISABLE ROW LEVEL SECURITY;
