-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- FIX: Removed invalid "CREATE POLICY IF NOT EXISTS" syntax.
-- Using DROP POLICY IF EXISTS + CREATE POLICY which is valid PostgreSQL.
-- ============================================

-- ENABLE RLS ON ALL TABLES
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS news ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS score_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS report_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contact_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES
-- ============================================
DROP POLICY IF EXISTS "profiles_read_own" ON profiles;
CREATE POLICY "profiles_read_own" ON profiles FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_read_admin" ON profiles;
CREATE POLICY "profiles_read_admin" ON profiles FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "profiles_insert_trigger" ON profiles;
CREATE POLICY "profiles_insert_trigger" ON profiles FOR INSERT WITH CHECK (id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid() OR is_admin());

-- ============================================
-- STUDENTS
-- ============================================
DROP POLICY IF EXISTS "students_read_own" ON students;
CREATE POLICY "students_read_own" ON students FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "students_read_admin" ON students;
CREATE POLICY "students_read_admin" ON students FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "students_insert_admin" ON students;
CREATE POLICY "students_insert_admin" ON students FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "students_update_admin" ON students;
CREATE POLICY "students_update_admin" ON students FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "students_delete_admin" ON students;
CREATE POLICY "students_delete_admin" ON students FOR DELETE USING (is_admin());

-- ============================================
-- SCHOOL_SETTINGS
-- ============================================
DROP POLICY IF EXISTS "school_settings_read_all" ON school_settings;
CREATE POLICY "school_settings_read_all" ON school_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "school_settings_update_admin" ON school_settings;
CREATE POLICY "school_settings_update_admin" ON school_settings FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "school_settings_insert_admin" ON school_settings;
CREATE POLICY "school_settings_insert_admin" ON school_settings FOR INSERT WITH CHECK (is_admin());

-- ============================================
-- NEWS
-- ============================================
DROP POLICY IF EXISTS "news_read_all" ON news;
CREATE POLICY "news_read_all" ON news FOR SELECT USING (true);

DROP POLICY IF EXISTS "news_insert_admin" ON news;
CREATE POLICY "news_insert_admin" ON news FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "news_update_admin" ON news;
CREATE POLICY "news_update_admin" ON news FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "news_delete_admin" ON news;
CREATE POLICY "news_delete_admin" ON news FOR DELETE USING (is_admin());

-- ============================================
-- EXAMS
-- ============================================
DROP POLICY IF EXISTS "exams_read_student" ON exams;
CREATE POLICY "exams_read_student" ON exams FOR SELECT USING (
  is_active = TRUE AND
  class = (SELECT class FROM students WHERE user_id = auth.uid() LIMIT 1)
);

DROP POLICY IF EXISTS "exams_read_admin" ON exams;
CREATE POLICY "exams_read_admin" ON exams FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "exams_insert_admin" ON exams;
CREATE POLICY "exams_insert_admin" ON exams FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "exams_update_admin" ON exams;
CREATE POLICY "exams_update_admin" ON exams FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "exams_delete_admin" ON exams;
CREATE POLICY "exams_delete_admin" ON exams FOR DELETE USING (is_admin());

-- ============================================
-- QUESTIONS
-- ============================================
DROP POLICY IF EXISTS "questions_read_admin" ON questions;
CREATE POLICY "questions_read_admin" ON questions FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "questions_insert_admin" ON questions;
CREATE POLICY "questions_insert_admin" ON questions FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "questions_update_admin" ON questions;
CREATE POLICY "questions_update_admin" ON questions FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "questions_delete_admin" ON questions;
CREATE POLICY "questions_delete_admin" ON questions FOR DELETE USING (is_admin());

-- ============================================
-- EXAM_SESSIONS
-- ============================================
DROP POLICY IF EXISTS "exam_sessions_read_own" ON exam_sessions;
CREATE POLICY "exam_sessions_read_own" ON exam_sessions FOR SELECT USING (student_id = my_student_id());

DROP POLICY IF EXISTS "exam_sessions_insert_own" ON exam_sessions;
CREATE POLICY "exam_sessions_insert_own" ON exam_sessions FOR INSERT WITH CHECK (student_id = my_student_id());

DROP POLICY IF EXISTS "exam_sessions_read_admin" ON exam_sessions;
CREATE POLICY "exam_sessions_read_admin" ON exam_sessions FOR SELECT USING (is_admin());

-- ============================================
-- STUDENT_ANSWERS
-- ============================================
DROP POLICY IF EXISTS "student_answers_read_own" ON student_answers;
CREATE POLICY "student_answers_read_own" ON student_answers FOR SELECT USING (student_id = my_student_id());

DROP POLICY IF EXISTS "student_answers_insert_own" ON student_answers;
CREATE POLICY "student_answers_insert_own" ON student_answers FOR INSERT WITH CHECK (student_id = my_student_id());

DROP POLICY IF EXISTS "student_answers_update_own" ON student_answers;
CREATE POLICY "student_answers_update_own" ON student_answers FOR UPDATE USING (student_id = my_student_id()) WITH CHECK (student_id = my_student_id());

DROP POLICY IF EXISTS "student_answers_read_admin" ON student_answers;
CREATE POLICY "student_answers_read_admin" ON student_answers FOR SELECT USING (is_admin());

-- ============================================
-- EXAM_RESULTS
-- ============================================
DROP POLICY IF EXISTS "exam_results_read_own" ON exam_results;
CREATE POLICY "exam_results_read_own" ON exam_results FOR SELECT USING (
  student_id = my_student_id() AND is_published = TRUE
);

DROP POLICY IF EXISTS "exam_results_read_admin" ON exam_results;
CREATE POLICY "exam_results_read_admin" ON exam_results FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "exam_results_insert_admin" ON exam_results;
CREATE POLICY "exam_results_insert_admin" ON exam_results FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "exam_results_update_admin" ON exam_results;
CREATE POLICY "exam_results_update_admin" ON exam_results FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "exam_results_delete_admin" ON exam_results;
CREATE POLICY "exam_results_delete_admin" ON exam_results FOR DELETE USING (is_admin());

-- ============================================
-- SCORE_COMPONENTS
-- ============================================
DROP POLICY IF EXISTS "score_components_read_admin" ON score_components;
CREATE POLICY "score_components_read_admin" ON score_components FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "score_components_insert_admin" ON score_components;
CREATE POLICY "score_components_insert_admin" ON score_components FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "score_components_update_admin" ON score_components;
CREATE POLICY "score_components_update_admin" ON score_components FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "score_components_delete_admin" ON score_components;
CREATE POLICY "score_components_delete_admin" ON score_components FOR DELETE USING (is_admin());

-- ============================================
-- REPORT_CARDS
-- ============================================
DROP POLICY IF EXISTS "report_cards_read_own" ON report_cards;
CREATE POLICY "report_cards_read_own" ON report_cards FOR SELECT USING (
  student_id = my_student_id() AND is_published = TRUE
);

DROP POLICY IF EXISTS "report_cards_read_admin" ON report_cards;
CREATE POLICY "report_cards_read_admin" ON report_cards FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "report_cards_insert_admin" ON report_cards;
CREATE POLICY "report_cards_insert_admin" ON report_cards FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "report_cards_update_admin" ON report_cards;
CREATE POLICY "report_cards_update_admin" ON report_cards FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "report_cards_delete_admin" ON report_cards;
CREATE POLICY "report_cards_delete_admin" ON report_cards FOR DELETE USING (is_admin());

-- ============================================
-- PAYMENTS
-- ============================================
DROP POLICY IF EXISTS "payments_read_own" ON payments;
CREATE POLICY "payments_read_own" ON payments FOR SELECT USING (student_id = my_student_id());

DROP POLICY IF EXISTS "payments_read_admin" ON payments;
CREATE POLICY "payments_read_admin" ON payments FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "payments_insert_admin" ON payments;
CREATE POLICY "payments_insert_admin" ON payments FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "payments_update_admin" ON payments;
CREATE POLICY "payments_update_admin" ON payments FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "payments_delete_admin" ON payments;
CREATE POLICY "payments_delete_admin" ON payments FOR DELETE USING (is_admin());

-- ============================================
-- REGISTRATION_REQUESTS
-- ============================================
DROP POLICY IF EXISTS "registration_requests_insert_anon" ON registration_requests;
CREATE POLICY "registration_requests_insert_anon" ON registration_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "registration_requests_read_admin" ON registration_requests;
CREATE POLICY "registration_requests_read_admin" ON registration_requests FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "registration_requests_update_admin" ON registration_requests;
CREATE POLICY "registration_requests_update_admin" ON registration_requests FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "registration_requests_delete_admin" ON registration_requests;
CREATE POLICY "registration_requests_delete_admin" ON registration_requests FOR DELETE USING (is_admin());

-- ============================================
-- CONTACT_MESSAGES
-- ============================================
DROP POLICY IF EXISTS "contact_messages_insert_anon" ON contact_messages;
CREATE POLICY "contact_messages_insert_anon" ON contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "contact_messages_read_admin" ON contact_messages;
CREATE POLICY "contact_messages_read_admin" ON contact_messages FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "contact_messages_delete_admin" ON contact_messages;
CREATE POLICY "contact_messages_delete_admin" ON contact_messages FOR DELETE USING (is_admin());
