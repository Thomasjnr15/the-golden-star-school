-- ============================================================
-- MIGRATION: Stream Management, Subject System, Promotions
-- Golden Star School Platform
-- Safe to run on existing DB — all operations are idempotent
-- ============================================================

-- ============================================================
-- STEP 1: Add stream column to students
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'stream'
  ) THEN
    ALTER TABLE students ADD COLUMN stream TEXT
      CHECK (stream IN ('Science', 'Arts', 'Commercial'));
    COMMENT ON COLUMN students.stream IS 'Stream only applies to SSS1, SSS2, SSS3. NULL for other classes.';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_students_stream ON students(stream);

-- ============================================================
-- STEP 2: Add requested_stream to registration_requests
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registration_requests' AND column_name = 'requested_stream'
  ) THEN
    ALTER TABLE registration_requests ADD COLUMN requested_stream TEXT
      CHECK (requested_stream IN ('Science', 'Arts', 'Commercial'));
    COMMENT ON COLUMN registration_requests.requested_stream IS 'Only required when class_applying is SSS1/SSS2/SSS3.';
  END IF;
END $$;

-- ============================================================
-- STEP 3: Create subjects table
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subjects_is_active ON subjects(is_active);
CREATE INDEX IF NOT EXISTS idx_subjects_name ON subjects(name);

-- ============================================================
-- STEP 4: Create stream_subjects table
-- (maps which subjects belong to which streams, and whether compulsory)
-- ============================================================
CREATE TABLE IF NOT EXISTS stream_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream TEXT NOT NULL CHECK (stream IN ('Science', 'Arts', 'Commercial')),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  is_compulsory BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(stream, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_stream_subjects_stream ON stream_subjects(stream);
CREATE INDEX IF NOT EXISTS idx_stream_subjects_subject_id ON stream_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_stream_subjects_is_compulsory ON stream_subjects(is_compulsory);

-- ============================================================
-- STEP 5: Create student_subjects table
-- ============================================================
CREATE TABLE IF NOT EXISTS student_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(student_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_student_subjects_student_id ON student_subjects(student_id);
CREATE INDEX IF NOT EXISTS idx_student_subjects_subject_id ON student_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_subjects_is_active ON student_subjects(is_active);

-- ============================================================
-- STEP 6: Create promotion_history table
-- ============================================================
CREATE TABLE IF NOT EXISTS promotion_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  from_class TEXT NOT NULL,
  to_class TEXT NOT NULL,
  from_stream TEXT CHECK (from_stream IN ('Science', 'Arts', 'Commercial')),
  to_stream TEXT CHECK (to_stream IN ('Science', 'Arts', 'Commercial')),
  promoted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  promoted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_promotion_history_student_id ON promotion_history(student_id);
CREATE INDEX IF NOT EXISTS idx_promotion_history_promoted_at ON promotion_history(promoted_at DESC);

-- ============================================================
-- STEP 7: RLS for new tables
-- ============================================================
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_history ENABLE ROW LEVEL SECURITY;

-- subjects: all authenticated users can read; only admin can write
DROP POLICY IF EXISTS "subjects_read_all" ON subjects;
CREATE POLICY "subjects_read_all" ON subjects FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "subjects_insert_admin" ON subjects;
CREATE POLICY "subjects_insert_admin" ON subjects FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "subjects_update_admin" ON subjects;
CREATE POLICY "subjects_update_admin" ON subjects FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "subjects_delete_admin" ON subjects;
CREATE POLICY "subjects_delete_admin" ON subjects FOR DELETE USING (is_admin());

-- stream_subjects: all authenticated users can read; only admin can write
DROP POLICY IF EXISTS "stream_subjects_read_all" ON stream_subjects;
CREATE POLICY "stream_subjects_read_all" ON stream_subjects FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "stream_subjects_insert_admin" ON stream_subjects;
CREATE POLICY "stream_subjects_insert_admin" ON stream_subjects FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "stream_subjects_update_admin" ON stream_subjects;
CREATE POLICY "stream_subjects_update_admin" ON stream_subjects FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "stream_subjects_delete_admin" ON stream_subjects;
CREATE POLICY "stream_subjects_delete_admin" ON stream_subjects FOR DELETE USING (is_admin());

-- student_subjects: student reads own; admin reads all; only admin writes
DROP POLICY IF EXISTS "student_subjects_read_own" ON student_subjects;
CREATE POLICY "student_subjects_read_own" ON student_subjects
  FOR SELECT USING (student_id = my_student_id());

DROP POLICY IF EXISTS "student_subjects_read_admin" ON student_subjects;
CREATE POLICY "student_subjects_read_admin" ON student_subjects
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "student_subjects_insert_admin" ON student_subjects;
CREATE POLICY "student_subjects_insert_admin" ON student_subjects
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "student_subjects_update_admin" ON student_subjects;
CREATE POLICY "student_subjects_update_admin" ON student_subjects
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "student_subjects_delete_admin" ON student_subjects;
CREATE POLICY "student_subjects_delete_admin" ON student_subjects
  FOR DELETE USING (is_admin());

-- promotion_history: student reads own; admin reads all; only admin writes
DROP POLICY IF EXISTS "promotion_history_read_own" ON promotion_history;
CREATE POLICY "promotion_history_read_own" ON promotion_history
  FOR SELECT USING (student_id = my_student_id());

DROP POLICY IF EXISTS "promotion_history_read_admin" ON promotion_history;
CREATE POLICY "promotion_history_read_admin" ON promotion_history
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "promotion_history_insert_admin" ON promotion_history;
CREATE POLICY "promotion_history_insert_admin" ON promotion_history
  FOR INSERT WITH CHECK (is_admin());

-- ============================================================
-- STEP 8: DB-level constraint — stream only on SSS classes
-- Enforced via CHECK function trigger
-- ============================================================
CREATE OR REPLACE FUNCTION validate_student_stream()
RETURNS TRIGGER AS $$
BEGIN
  -- Only SSS1/SSS2/SSS3 may have a stream
  IF NEW.stream IS NOT NULL AND NEW.class NOT IN ('SSS 1', 'SSS 2', 'SSS 3') THEN
    RAISE EXCEPTION 'Stream can only be assigned to SSS1, SSS2, or SSS3 students. Class: %', NEW.class;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_student_stream ON students;
CREATE TRIGGER trg_validate_student_stream
  BEFORE INSERT OR UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION validate_student_stream();

-- ============================================================
-- STEP 9: Function — auto-assign compulsory subjects when stream is set
-- ============================================================
CREATE OR REPLACE FUNCTION auto_assign_stream_subjects(
  p_student_id UUID,
  p_stream TEXT,
  p_assigned_by UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_count INTEGER := 0;
  v_subject RECORD;
BEGIN
  -- Assign all compulsory subjects for the stream (skip already assigned)
  FOR v_subject IN
    SELECT ss.subject_id
    FROM stream_subjects ss
    WHERE ss.stream = p_stream
      AND ss.is_compulsory = TRUE
      AND NOT EXISTS (
        SELECT 1 FROM student_subjects stu
        WHERE stu.student_id = p_student_id
          AND stu.subject_id = ss.subject_id
      )
  LOOP
    INSERT INTO student_subjects (student_id, subject_id, assigned_by, is_active)
    VALUES (p_student_id, v_subject.subject_id, p_assigned_by, TRUE);
    v_count := v_count + 1;
  END LOOP;

  RETURN json_build_object('success', TRUE, 'subjects_assigned', v_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION auto_assign_stream_subjects(UUID, TEXT, UUID) TO authenticated;

-- ============================================================
-- STEP 10: Function — handle stream change
-- Deactivates future-incompatible subject assignments but PRESERVES history
-- ============================================================
CREATE OR REPLACE FUNCTION change_student_stream(
  p_student_id UUID,
  p_new_stream TEXT,
  p_changed_by UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_removed INTEGER := 0;
  v_added INTEGER := 0;
  v_result JSON;
BEGIN
  -- Deactivate subjects that are NOT in the new stream
  UPDATE student_subjects
  SET is_active = FALSE
  WHERE student_id = p_student_id
    AND is_active = TRUE
    AND subject_id NOT IN (
      SELECT subject_id FROM stream_subjects WHERE stream = p_new_stream
    );
  GET DIAGNOSTICS v_removed = ROW_COUNT;

  -- Update student stream
  UPDATE students SET stream = p_new_stream WHERE id = p_student_id;

  -- Auto-assign compulsory subjects for new stream
  SELECT auto_assign_stream_subjects(p_student_id, p_new_stream, p_changed_by)
  INTO v_result;
  v_added := (v_result->>'subjects_assigned')::INTEGER;

  RETURN json_build_object(
    'success', TRUE,
    'subjects_deactivated', v_removed,
    'subjects_added', v_added
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION change_student_stream(UUID, TEXT, UUID) TO authenticated;

-- ============================================================
-- STEP 11: Function — promote student
-- ============================================================
CREATE OR REPLACE FUNCTION promote_student(
  p_student_id UUID,
  p_to_class TEXT,
  p_to_stream TEXT DEFAULT NULL,
  p_promoted_by UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_student students%ROWTYPE;
  v_auto_stream TEXT;
BEGIN
  SELECT * INTO v_student FROM students WHERE id = p_student_id;

  IF v_student IS NULL THEN
    RETURN json_build_object('error', 'Student not found');
  END IF;

  -- Validate stream rules
  IF p_to_class IN ('SSS 1', 'SSS 2', 'SSS 3') THEN
    -- JSS3 -> SSS1: stream is REQUIRED
    IF v_student.class = 'JSS 3' AND p_to_class = 'SSS 1' AND p_to_stream IS NULL THEN
      RETURN json_build_object('error', 'Stream selection is required when promoting from JSS 3 to SSS 1');
    END IF;
    -- SSS1->SSS2 or SSS2->SSS3: carry forward existing stream unless override provided
    IF v_student.class IN ('SSS 1', 'SSS 2') AND p_to_stream IS NULL THEN
      v_auto_stream := v_student.stream;
    ELSE
      v_auto_stream := p_to_stream;
    END IF;
  ELSE
    -- Non-SSS class: stream must be NULL
    IF p_to_stream IS NOT NULL THEN
      RETURN json_build_object('error', 'Stream cannot be assigned for non-SSS classes');
    END IF;
    v_auto_stream := NULL;
  END IF;

  -- Record promotion history
  INSERT INTO promotion_history (student_id, from_class, to_class, from_stream, to_stream, promoted_by, notes)
  VALUES (p_student_id, v_student.class, p_to_class, v_student.stream, v_auto_stream, p_promoted_by, p_notes);

  -- Update student record
  UPDATE students
  SET class = p_to_class, stream = v_auto_stream
  WHERE id = p_student_id;

  -- If SSS class with stream: auto-assign compulsory subjects
  IF p_to_class IN ('SSS 1', 'SSS 2', 'SSS 3') AND v_auto_stream IS NOT NULL THEN
    PERFORM auto_assign_stream_subjects(p_student_id, v_auto_stream, p_promoted_by);
  END IF;

  RETURN json_build_object(
    'success', TRUE,
    'from_class', v_student.class,
    'to_class', p_to_class,
    'stream', v_auto_stream,
    'message', 'Student promoted successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION promote_student(UUID, TEXT, TEXT, UUID, TEXT) TO authenticated;

-- ============================================================
-- STEP 12: Update approve_registration to handle stream
-- DROP the old 4-argument overload first to avoid ambiguity.
-- The new version adds p_stream TEXT DEFAULT NULL (backward compatible).
-- ============================================================
DROP FUNCTION IF EXISTS approve_registration(UUID, TEXT, TEXT, UUID);

CREATE OR REPLACE FUNCTION approve_registration(
  p_request_id UUID,
  p_registration_number TEXT,
  p_class TEXT,
  p_user_id UUID,
  p_stream TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_request registration_requests%ROWTYPE;
  v_student_id UUID;
BEGIN
  SELECT * INTO v_request FROM registration_requests WHERE id = p_request_id;

  IF v_request IS NULL THEN
    RETURN json_build_object('error', 'Registration request not found');
  END IF;

  -- Validate stream: required for SSS, forbidden for others
  IF p_class IN ('SSS 1', 'SSS 2', 'SSS 3') AND p_stream IS NULL THEN
    -- Allow null stream for SSS (admin can set later), but warn
    NULL;
  END IF;
  IF p_class NOT IN ('SSS 1', 'SSS 2', 'SSS 3') AND p_stream IS NOT NULL THEN
    RETURN json_build_object('error', 'Stream cannot be assigned for non-SSS classes');
  END IF;

  -- Create student record
  INSERT INTO students (user_id, full_name, registration_number, class, stream)
  VALUES (p_user_id, v_request.full_name, p_registration_number, p_class, p_stream)
  RETURNING id INTO v_student_id;

  -- Update registration request
  UPDATE registration_requests
  SET status = 'approved',
      assigned_registration_number = p_registration_number,
      assigned_class = p_class,
      reviewed_at = NOW()
  WHERE id = p_request_id;

  -- Auto-assign compulsory subjects if SSS with stream
  IF p_class IN ('SSS 1', 'SSS 2', 'SSS 3') AND p_stream IS NOT NULL THEN
    PERFORM auto_assign_stream_subjects(v_student_id, p_stream, NULL);
  END IF;

  RETURN json_build_object(
    'success', TRUE,
    'student_id', v_student_id,
    'registration_number', p_registration_number,
    'stream', p_stream,
    'message', 'Student record created successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION approve_registration(UUID, TEXT, TEXT, UUID, TEXT) TO authenticated;

-- ============================================================
-- STEP 13: Seed default subjects
-- (admin can add/edit/delete via UI — this just bootstraps)
-- ============================================================
INSERT INTO subjects (name, is_active) VALUES
  ('English Language', TRUE),
  ('Mathematics', TRUE),
  ('Civic Education', TRUE),
  ('Economics', TRUE),
  ('Government', TRUE),
  ('Literature in English', TRUE),
  ('Biology', TRUE),
  ('Chemistry', TRUE),
  ('Physics', TRUE),
  ('Further Mathematics', TRUE),
  ('Agricultural Science', TRUE),
  ('Geography', TRUE),
  ('Commerce', TRUE),
  ('Accounts', TRUE),
  ('Business Studies', TRUE),
  ('Christian Religious Studies', TRUE),
  ('Islamic Religious Studies', TRUE),
  ('Computer Science', TRUE),
  ('Physical Education', TRUE),
  ('French', TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- STEP 14: Seed stream_subjects (compulsory / optional per stream)
-- ============================================================
-- Science Stream compulsory
INSERT INTO stream_subjects (stream, subject_id, is_compulsory)
SELECT 'Science', id, TRUE FROM subjects WHERE name IN (
  'English Language', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'Civic Education'
)
ON CONFLICT (stream, subject_id) DO NOTHING;

-- Science optional
INSERT INTO stream_subjects (stream, subject_id, is_compulsory)
SELECT 'Science', id, FALSE FROM subjects WHERE name IN (
  'Further Mathematics', 'Computer Science', 'Agricultural Science', 'Physical Education'
)
ON CONFLICT (stream, subject_id) DO NOTHING;

-- Arts Stream compulsory
INSERT INTO stream_subjects (stream, subject_id, is_compulsory)
SELECT 'Arts', id, TRUE FROM subjects WHERE name IN (
  'English Language', 'Mathematics', 'Literature in English', 'Government', 'Civic Education'
)
ON CONFLICT (stream, subject_id) DO NOTHING;

-- Arts optional
INSERT INTO stream_subjects (stream, subject_id, is_compulsory)
SELECT 'Arts', id, FALSE FROM subjects WHERE name IN (
  'Economics', 'Geography', 'Christian Religious Studies', 'Islamic Religious Studies',
  'French', 'Agricultural Science', 'Computer Science'
)
ON CONFLICT (stream, subject_id) DO NOTHING;

-- Commercial Stream compulsory
INSERT INTO stream_subjects (stream, subject_id, is_compulsory)
SELECT 'Commercial', id, TRUE FROM subjects WHERE name IN (
  'English Language', 'Mathematics', 'Economics', 'Commerce', 'Accounts', 'Civic Education'
)
ON CONFLICT (stream, subject_id) DO NOTHING;

-- Commercial optional
INSERT INTO stream_subjects (stream, subject_id, is_compulsory)
SELECT 'Commercial', id, FALSE FROM subjects WHERE name IN (
  'Government', 'Business Studies', 'Computer Science', 'Geography', 'Agricultural Science'
)
ON CONFLICT (stream, subject_id) DO NOTHING;

-- ============================================================
-- DONE
-- ============================================================
