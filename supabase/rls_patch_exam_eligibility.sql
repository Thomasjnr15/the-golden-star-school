-- ============================================================
-- RLS PATCH: Exam eligibility via student_subjects
-- Run AFTER migration_streams_subjects.sql
-- ============================================================

-- Drop and recreate the student exam read policy to check subject assignment
DROP POLICY IF EXISTS "exams_read_student" ON exams;

CREATE POLICY "exams_read_student" ON exams FOR SELECT USING (
  is_active = TRUE
  AND class = (SELECT class FROM students WHERE user_id = auth.uid() LIMIT 1)
  AND (
    -- For SSS classes: student must have this subject assigned
    -- For non-SSS: no subject restriction (backward compatible)
    (SELECT class FROM students WHERE user_id = auth.uid() LIMIT 1)
      NOT IN ('SSS 1', 'SSS 2', 'SSS 3')
    OR
    EXISTS (
      SELECT 1
      FROM student_subjects stu_sub
      JOIN subjects sub ON sub.id = stu_sub.subject_id
      WHERE stu_sub.student_id = my_student_id()
        AND stu_sub.is_active = TRUE
        AND sub.name = exams.subject
    )
  )
);

-- questions: students can only read questions for exams they are eligible for
DROP POLICY IF EXISTS "questions_read_student" ON questions;

CREATE POLICY "questions_read_student" ON questions FOR SELECT USING (
  -- Student can read questions if they can read the exam
  EXISTS (
    SELECT 1 FROM exams e
    WHERE e.id = questions.exam_id
      AND e.is_active = TRUE
      AND e.class = (SELECT class FROM students WHERE user_id = auth.uid() LIMIT 1)
      AND (
        (SELECT class FROM students WHERE user_id = auth.uid() LIMIT 1)
          NOT IN ('SSS 1', 'SSS 2', 'SSS 3')
        OR
        EXISTS (
          SELECT 1
          FROM student_subjects stu_sub
          JOIN subjects sub ON sub.id = stu_sub.subject_id
          WHERE stu_sub.student_id = my_student_id()
            AND stu_sub.is_active = TRUE
            AND sub.name = e.subject
        )
      )
  )
  OR is_admin()
);
