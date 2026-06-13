-- ============================================
-- GOLDEN STAR SCHOOL PLATFORM
-- Complete Supabase Schema with RLS
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================
-- TABLE 2: STUDENTS
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  class TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_registration_number ON students(registration_number);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);

-- ============================================
-- TABLE 3: SCHOOL_SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS school_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  school_name TEXT DEFAULT 'Golden Star School',
  tagline TEXT DEFAULT 'Excellence in Education',
  logo TEXT,
  hero_heading TEXT DEFAULT 'Welcome to Golden Star School',
  hero_subheading TEXT DEFAULT 'Nurturing Tomorrow\'s Leaders Today',
  hero_image TEXT,
  about_text TEXT,
  admission_text TEXT,
  admission_image TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_address TEXT,
  map_embed TEXT,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  fees_table JSONB DEFAULT '[]'::jsonb,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#1E40AF',
  facebook TEXT,
  twitter TEXT,
  instagram TEXT,
  whatsapp TEXT,
  youtube TEXT,
  students_count TEXT DEFAULT '',
  teachers_count TEXT DEFAULT '',
  years_count TEXT DEFAULT '',
  founded_year TEXT DEFAULT '',
  school_hours TEXT DEFAULT '',
  pass_rate TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT id_check CHECK (id = 1)
);

-- ============================================
-- TABLE 4: NEWS
-- ============================================
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_date ON news(date DESC);

-- ============================================
-- TABLE 5: EXAMS
-- ============================================
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  class TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration INTEGER NOT NULL,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('ca', 'ppt', 'exam')),
  term TEXT NOT NULL CHECK (term IN ('1st Term', '2nd Term', '3rd Term')),
  session TEXT NOT NULL,
  max_score INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exams_class ON exams(class);
CREATE INDEX IF NOT EXISTS idx_exams_subject ON exams(subject);
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(date);
CREATE INDEX IF NOT EXISTS idx_exams_is_active ON exams(is_active);

-- ============================================
-- TABLE 6: QUESTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('a', 'b', 'c', 'd')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON questions(exam_id);

-- ============================================
-- TABLE 7: EXAM_SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS exam_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  question_order UUID[] NOT NULL,
  UNIQUE(student_id, exam_id)
);

CREATE INDEX IF NOT EXISTS idx_exam_sessions_student_id ON exam_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_exam_id ON exam_sessions(exam_id);

-- ============================================
-- TABLE 8: STUDENT_ANSWERS
-- ============================================
CREATE TABLE IF NOT EXISTS student_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option TEXT CHECK (selected_option IN ('a', 'b', 'c', 'd')),
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, exam_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_student_answers_student_id ON student_answers(student_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_exam_id ON student_answers(exam_id);

-- ============================================
-- TABLE 9: EXAM_RESULTS
-- ============================================
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  percentage NUMERIC GENERATED ALWAYS AS (ROUND((score::NUMERIC / total) * 100, 2)) STORED,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, exam_id)
);

CREATE INDEX IF NOT EXISTS idx_exam_results_student_id ON exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_id ON exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_is_published ON exam_results(is_published);

-- ============================================
-- TABLE 10: SCORE_COMPONENTS
-- ============================================
CREATE TABLE IF NOT EXISTS score_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  class TEXT NOT NULL,
  term TEXT NOT NULL CHECK (term IN ('1st Term', '2nd Term', '3rd Term')),
  session TEXT NOT NULL,
  ca_label TEXT DEFAULT 'CA',
  ca_max INTEGER DEFAULT 20,
  ca_score NUMERIC,
  ppt_label TEXT DEFAULT 'PPT',
  ppt_max INTEGER DEFAULT 30,
  ppt_score NUMERIC,
  exam_label TEXT DEFAULT 'Exam',
  exam_max INTEGER DEFAULT 50,
  exam_score NUMERIC,
  exam_auto_filled BOOLEAN DEFAULT FALSE,
  total_score NUMERIC GENERATED ALWAYS AS (COALESCE(ca_score, 0) + COALESCE(ppt_score, 0) + COALESCE(exam_score, 0)) STORED,
  max_total INTEGER GENERATED ALWAYS AS (ca_max + ppt_max + exam_max) STORED,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  entered_by UUID REFERENCES auth.users(id),
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject, term, session)
);

CREATE INDEX IF NOT EXISTS idx_score_components_student_id ON score_components(student_id);
CREATE INDEX IF NOT EXISTS idx_score_components_subject ON score_components(subject);
CREATE INDEX IF NOT EXISTS idx_score_components_term ON score_components(term);
CREATE INDEX IF NOT EXISTS idx_score_components_is_approved ON score_components(is_approved);

-- ============================================
-- TABLE 11: REPORT_CARDS
-- ============================================
CREATE TABLE IF NOT EXISTS report_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  term TEXT NOT NULL CHECK (term IN ('1st Term', '2nd Term', '3rd Term')),
  session TEXT NOT NULL,
  class TEXT NOT NULL,
  subjects_data JSONB NOT NULL,
  total_score NUMERIC,
  average_score NUMERIC,
  overall_grade TEXT,
  position_in_class INTEGER,
  total_students_in_class INTEGER,
  teacher_remark TEXT,
  head_teacher_remark TEXT,
  next_term_begins DATE,
  days_present INTEGER,
  days_absent INTEGER,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  pdf_url TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, term, session)
);

CREATE INDEX IF NOT EXISTS idx_report_cards_student_id ON report_cards(student_id);
CREATE INDEX IF NOT EXISTS idx_report_cards_term ON report_cards(term);
CREATE INDEX IF NOT EXISTS idx_report_cards_is_published ON report_cards(is_published);

-- ============================================
-- TABLE 12: PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  date_paid DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ============================================
-- TABLE 13: REGISTRATION_REQUESTS
-- ============================================
CREATE TABLE IF NOT EXISTS registration_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female')),
  class_applying TEXT NOT NULL,
  previous_school TEXT,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  home_address TEXT,
  additional_info TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  assigned_registration_number TEXT,
  assigned_class TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_registration_requests_status ON registration_requests(status);

-- ============================================
-- TABLE 14: CONTACT_MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON contact_messages(is_read);

-- ============================================
-- POSTGRES FUNCTIONS
-- ============================================

-- Function: is_admin()
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: my_student_id()
CREATE OR REPLACE FUNCTION my_student_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM students
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: submit_exam(p_student_id UUID, p_exam_id UUID)
CREATE OR REPLACE FUNCTION submit_exam(p_student_id UUID, p_exam_id UUID)
RETURNS JSON AS $$
DECLARE
  v_score INTEGER := 0;
  v_total INTEGER;
  v_percentage NUMERIC;
  v_grade TEXT;
BEGIN
  -- Get total questions for exam
  SELECT COUNT(*) INTO v_total FROM questions WHERE exam_id = p_exam_id;
  
  IF v_total = 0 THEN
    RETURN json_build_object('error', 'No questions found for this exam');
  END IF;
  
  -- Calculate score by counting correct answers
  SELECT COUNT(*) INTO v_score
  FROM student_answers sa
  JOIN questions q ON sa.question_id = q.id
  WHERE sa.student_id = p_student_id
    AND sa.exam_id = p_exam_id
    AND sa.selected_option = q.correct_option;
  
  v_percentage := ROUND((v_score::NUMERIC / v_total) * 100, 2);
  
  -- Assign grade based on percentage
  v_grade := CASE
    WHEN v_percentage >= 70 THEN 'A'
    WHEN v_percentage >= 60 THEN 'B'
    WHEN v_percentage >= 50 THEN 'C'
    WHEN v_percentage >= 40 THEN 'D'
    ELSE 'F'
  END;
  
  -- Insert or update exam result (idempotent)
  INSERT INTO exam_results (student_id, exam_id, score, total, is_published, submitted_at)
  VALUES (p_student_id, p_exam_id, v_score, v_total, FALSE, NOW())
  ON CONFLICT (student_id, exam_id) DO UPDATE SET
    score = v_score,
    total = v_total,
    submitted_at = NOW();
  
  -- Mark exam session as submitted
  UPDATE exam_sessions
  SET submitted_at = NOW()
  WHERE student_id = p_student_id AND exam_id = p_exam_id;
  
  RETURN json_build_object(
    'success', TRUE,
    'score', v_score,
    'total', v_total,
    'percentage', v_percentage,
    'grade', v_grade,
    'message', 'Exam submitted successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: approve_registration(p_request_id UUID, p_registration_number TEXT, p_class TEXT)
-- NOTE: This function only updates the DB records.
-- The actual auth user creation must be done via Supabase Admin API (service role key)
-- from the frontend admin panel BEFORE calling this function.
CREATE OR REPLACE FUNCTION approve_registration(
  p_request_id UUID,
  p_registration_number TEXT,
  p_class TEXT,
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_request registration_requests%ROWTYPE;
  v_student_id UUID;
BEGIN
  -- Get the registration request
  SELECT * INTO v_request FROM registration_requests WHERE id = p_request_id;

  IF v_request IS NULL THEN
    RETURN json_build_object('error', 'Registration request not found');
  END IF;

  -- Create student record linked to the already-created auth user
  INSERT INTO students (user_id, full_name, registration_number, class)
  VALUES (p_user_id, v_request.full_name, p_registration_number, p_class)
  RETURNING id INTO v_student_id;

  -- Update registration request
  UPDATE registration_requests
  SET status = 'approved',
      assigned_registration_number = p_registration_number,
      assigned_class = p_class,
      reviewed_at = NOW()
  WHERE id = p_request_id;

  RETURN json_build_object(
    'success', TRUE,
    'student_id', v_student_id,
    'registration_number', p_registration_number,
    'message', 'Student record created successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: calculate_class_positions(p_term TEXT, p_session TEXT, p_class TEXT)
CREATE OR REPLACE FUNCTION calculate_class_positions(p_term TEXT, p_session TEXT, p_class TEXT)
RETURNS VOID AS $$
DECLARE
  v_total_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT student_id) INTO v_total_count
  FROM report_cards
  WHERE term = p_term AND session = p_session AND class = p_class;

  WITH ranked_students AS (
    SELECT
      rc.student_id,
      ROW_NUMBER() OVER (ORDER BY rc.average_score DESC NULLS LAST) AS pos
    FROM report_cards rc
    WHERE rc.term = p_term
      AND rc.session = p_session
      AND rc.class = p_class
  )
  UPDATE report_cards rc
  SET position_in_class = rs.pos,
      total_students_in_class = v_total_count
  FROM ranked_students rs
  WHERE rc.student_id = rs.student_id
    AND rc.term = p_term
    AND rc.session = p_session
    AND rc.class = p_class;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION my_student_id() TO authenticated;
GRANT EXECUTE ON FUNCTION submit_exam(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_class_positions(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_registration(UUID, TEXT, TEXT, UUID) TO authenticated;

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- Fires when a new user is created in Supabase Auth
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- MIGRATION PATCH — Run this if you already ran schema.sql
-- Adds new columns added during the UI/UX audit fixes
-- Safe to run multiple times (uses IF NOT EXISTS via DO block)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='students_count') THEN
    ALTER TABLE school_settings ADD COLUMN students_count TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='teachers_count') THEN
    ALTER TABLE school_settings ADD COLUMN teachers_count TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='years_count') THEN
    ALTER TABLE school_settings ADD COLUMN years_count TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='founded_year') THEN
    ALTER TABLE school_settings ADD COLUMN founded_year TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='school_hours') THEN
    ALTER TABLE school_settings ADD COLUMN school_hours TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='pass_rate') THEN
    ALTER TABLE school_settings ADD COLUMN pass_rate TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='academic_session') THEN
    ALTER TABLE school_settings ADD COLUMN academic_session TEXT DEFAULT '';
  END IF;
END $$;

-- ============================================
-- MIGRATION: New editable public-page fields
-- ============================================
DO $$
BEGIN
  -- Hero extras
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='hero_image_2') THEN
    ALTER TABLE school_settings ADD COLUMN hero_image_2 TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='hero_cta_label') THEN
    ALTER TABLE school_settings ADD COLUMN hero_cta_label TEXT DEFAULT 'Apply for Admission';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='hero_cta_label2') THEN
    ALTER TABLE school_settings ADD COLUMN hero_cta_label2 TEXT DEFAULT 'Learn More';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='awards_count') THEN
    ALTER TABLE school_settings ADD COLUMN awards_count TEXT DEFAULT '';
  END IF;
  -- About / Why Choose Us
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='about_mission') THEN
    ALTER TABLE school_settings ADD COLUMN about_mission TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='about_vision') THEN
    ALTER TABLE school_settings ADD COLUMN about_vision TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='about_image') THEN
    ALTER TABLE school_settings ADD COLUMN about_image TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='why_quality_title') THEN
    ALTER TABLE school_settings ADD COLUMN why_quality_title TEXT DEFAULT 'Quality Education';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='why_quality_text') THEN
    ALTER TABLE school_settings ADD COLUMN why_quality_text TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='why_teachers_title') THEN
    ALTER TABLE school_settings ADD COLUMN why_teachers_title TEXT DEFAULT 'Experienced Teachers';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='why_teachers_text') THEN
    ALTER TABLE school_settings ADD COLUMN why_teachers_text TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='why_facilities_title') THEN
    ALTER TABLE school_settings ADD COLUMN why_facilities_title TEXT DEFAULT 'Modern Facilities';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='why_facilities_text') THEN
    ALTER TABLE school_settings ADD COLUMN why_facilities_text TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='why_character_title') THEN
    ALTER TABLE school_settings ADD COLUMN why_character_title TEXT DEFAULT 'Character Building';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='why_character_text') THEN
    ALTER TABLE school_settings ADD COLUMN why_character_text TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='why_holistic_title') THEN
    ALTER TABLE school_settings ADD COLUMN why_holistic_title TEXT DEFAULT 'Holistic Development';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='why_holistic_text') THEN
    ALTER TABLE school_settings ADD COLUMN why_holistic_text TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='why_results_title') THEN
    ALTER TABLE school_settings ADD COLUMN why_results_title TEXT DEFAULT 'Proven Results';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='why_results_text') THEN
    ALTER TABLE school_settings ADD COLUMN why_results_text TEXT;
  END IF;
  -- Programs
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='programs_heading') THEN
    ALTER TABLE school_settings ADD COLUMN programs_heading TEXT DEFAULT 'Strong Foundations. Bright Futures.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='programs_sub') THEN
    ALTER TABLE school_settings ADD COLUMN programs_sub TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='programs_jss_title') THEN
    ALTER TABLE school_settings ADD COLUMN programs_jss_title TEXT DEFAULT 'Junior Secondary School';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='programs_jss_text') THEN
    ALTER TABLE school_settings ADD COLUMN programs_jss_text TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='programs_jss_image') THEN
    ALTER TABLE school_settings ADD COLUMN programs_jss_image TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='programs_sss_title') THEN
    ALTER TABLE school_settings ADD COLUMN programs_sss_title TEXT DEFAULT 'Senior Secondary School';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='programs_sss_text') THEN
    ALTER TABLE school_settings ADD COLUMN programs_sss_text TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='programs_sss_image') THEN
    ALTER TABLE school_settings ADD COLUMN programs_sss_image TEXT;
  END IF;
  -- CTA banner
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='cta_heading') THEN
    ALTER TABLE school_settings ADD COLUMN cta_heading TEXT DEFAULT 'Begin Your Child''s Journey With Us Today';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='cta_sub') THEN
    ALTER TABLE school_settings ADD COLUMN cta_sub TEXT DEFAULT 'Admissions are open for the 2025/2026 academic session.';
  END IF;
  -- academic_session column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='school_settings' AND column_name='academic_session') THEN
    ALTER TABLE school_settings ADD COLUMN academic_session TEXT DEFAULT '2025/2026';
  END IF;
END $$;

-- ============================================
-- STORAGE BUCKETS (run once in Supabase dashboard
-- or via API — schema.sql is for reference)
-- ============================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('logos', 'logos', true)
-- ON CONFLICT DO NOTHING;
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('images', 'images', true)
-- ON CONFLICT DO NOTHING;
--
-- Allow public read for logos and images buckets:
-- CREATE POLICY "Public read logos" ON storage.objects
--   FOR SELECT USING (bucket_id = 'logos');
-- CREATE POLICY "Admin upload logos" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');
-- CREATE POLICY "Admin upsert logos" ON storage.objects
--   FOR UPDATE USING (bucket_id = 'logos' AND auth.role() = 'authenticated');
-- CREATE POLICY "Public read images" ON storage.objects
--   FOR SELECT USING (bucket_id = 'images');
-- CREATE POLICY "Admin upload images" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Admin upsert images" ON storage.objects
--   FOR UPDATE USING (bucket_id = 'images' AND auth.role() = 'authenticated');
