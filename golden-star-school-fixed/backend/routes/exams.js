const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// ─── ADMIN: Get all exams ────────────────────────────────────────────────────
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error fetching exams' });
  }
});

// ─── STUDENT: Get my assigned exams ─────────────────────────────────────────
router.get('/my-exams', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('class', req.user.class)
      .order('date', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error fetching exams' });
  }
});

// ─── ADMIN: Get questions for an exam (includes correct answers) ─────────────
router.get('/:id/questions', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('exam_id', req.params.id)
      .order('id');
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// ─── STUDENT: Open exam (timer starts here) ──────────────────────────────────
// FIX: Timer now starts when student opens the exam, not from scheduled time.
// FIX: Questions returned WITHOUT correct_option so students can't cheat.
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // Admins can view full exam details without starting a session
    if (req.user.role === 'admin') {
      const { data: exam, error: examError } = await supabase
        .from('exams').select('*').eq('id', req.params.id).single();
      if (examError) throw examError;
      const { data: questions } = await supabase
        .from('questions').select('*').eq('exam_id', req.params.id).order('id');
      return res.json({ exam, questions, savedAnswers: {}, elapsed_seconds: 0 });
    }

    // --- STUDENT FLOW ---

    // 1. Get exam details
    const { data: exam, error: examError } = await supabase
      .from('exams').select('*').eq('id', req.params.id).single();
    if (examError) throw examError;

    // 2. Check if student already submitted — if so, redirect to results
    const { data: existingResult } = await supabase
      .from('exam_results')
      .select('id')
      .eq('exam_id', req.params.id)
      .eq('student_id', req.user.id)
      .single();
    if (existingResult) {
      return res.status(409).json({ message: 'Already submitted', redirect: `/results/${req.params.id}` });
    }

    // 3. FIX: Record when student FIRST opens exam (only insert once)
    const { data: session } = await supabase
      .from('exam_sessions')
      .select('started_at')
      .eq('exam_id', req.params.id)
      .eq('student_id', req.user.id)
      .single();

    let startedAt;
    if (!session) {
      // First time opening — record NOW as the start time
      const { data: newSession, error: sessionError } = await supabase
        .from('exam_sessions')
        .insert([{ student_id: req.user.id, exam_id: req.params.id, started_at: new Date().toISOString() }])
        .select()
        .single();
      if (sessionError) throw sessionError;
      startedAt = new Date(newSession.started_at);
    } else {
      // Already opened before — use original start time
      startedAt = new Date(session.started_at);
    }

    // 4. Calculate elapsed seconds from when STUDENT started (not scheduled time)
    const elapsed_seconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);

    // 5. Get questions WITHOUT correct_option (security fix — students can't cheat)
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('id, question_text, option_a, option_b, option_c, option_d')
      .eq('exam_id', req.params.id)
      .order('id');
    if (qError) throw qError;

    // 6. Get any previously saved answers for this student
    const { data: savedAnswers } = await supabase
      .from('student_answers')
      .select('question_id, selected_option')
      .eq('exam_id', req.params.id)
      .eq('student_id', req.user.id);

    const answersMap = {};
    (savedAnswers || []).forEach(a => { answersMap[a.question_id] = a.selected_option; });

    res.json({ exam, questions, savedAnswers: answersMap, elapsed_seconds });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching exam' });
  }
});

// ─── ADMIN: Create exam ──────────────────────────────────────────────────────
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { title, subject, class: examClass, date, start_time, duration } = req.body;
  if (!title || !subject || !examClass || !date || !start_time || !duration)
    return res.status(400).json({ message: 'All fields are required' });
  try {
    const { data, error } = await supabase
      .from('exams')
      .insert([{ title, subject, class: examClass, date, start_time, duration }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch {
    res.status(500).json({ message: 'Error creating exam' });
  }
});

// ─── ADMIN: Add question to exam ─────────────────────────────────────────────
router.post('/:id/questions', authMiddleware, adminOnly, async (req, res) => {
  const { question_text, option_a, option_b, option_c, option_d, correct_option } = req.body;
  if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option)
    return res.status(400).json({ message: 'All fields are required' });
  try {
    const { data, error } = await supabase
      .from('questions')
      .insert([{ exam_id: req.params.id, question_text, option_a, option_b, option_c, option_d, correct_option }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch {
    res.status(500).json({ message: 'Error adding question' });
  }
});

// ─── ADMIN: Update exam ──────────────────────────────────────────────────────
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { title, subject, class: examClass, date, start_time, duration } = req.body;
  try {
    const { data, error } = await supabase
      .from('exams')
      .update({ title, subject, class: examClass, date, start_time, duration })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error updating exam' });
  }
});

// ─── ADMIN: Delete exam ──────────────────────────────────────────────────────
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await supabase.from('student_answers').delete().eq('exam_id', req.params.id);
    await supabase.from('exam_results').delete().eq('exam_id', req.params.id);
    await supabase.from('exam_sessions').delete().eq('exam_id', req.params.id);
    await supabase.from('questions').delete().eq('exam_id', req.params.id);
    const { error } = await supabase.from('exams').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Exam deleted' });
  } catch {
    res.status(500).json({ message: 'Error deleting exam' });
  }
});

// ─── STUDENT: Auto-save answers ──────────────────────────────────────────────
router.post('/:id/save-answers', authMiddleware, async (req, res) => {
  const { answers } = req.body;
  try {
    for (const [question_id, selected_option] of Object.entries(answers)) {
      await supabase
        .from('student_answers')
        .upsert({
          student_id: req.user.id,
          exam_id: req.params.id,
          question_id,
          selected_option,
          saved_at: new Date().toISOString()
        }, { onConflict: 'student_id,exam_id,question_id' });
    }
    res.json({ message: 'Answers saved' });
  } catch {
    res.status(500).json({ message: 'Error saving answers' });
  }
});

// ─── STUDENT: Submit exam ────────────────────────────────────────────────────
router.post('/:id/submit', authMiddleware, async (req, res) => {
  const { answers } = req.body;
  try {
    // Prevent double submission
    const { data: existing } = await supabase
      .from('exam_results')
      .select('id')
      .eq('exam_id', req.params.id)
      .eq('student_id', req.user.id)
      .single();
    if (existing) return res.json({ message: 'Already submitted' });

    // Get correct answers for grading (safe — this is server-side only)
    const { data: questions } = await supabase
      .from('questions')
      .select('id, correct_option')
      .eq('exam_id', req.params.id);

    // Auto-grade
    let score = 0;
    const total = questions.length;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_option) score++;
    });

    // Save final result
    await supabase.from('exam_results').insert([{
      student_id: req.user.id,
      exam_id: req.params.id,
      score,
      total,
      submitted_at: new Date().toISOString()
    }]);

    // Save final answers
    for (const [question_id, selected_option] of Object.entries(answers)) {
      await supabase
        .from('student_answers')
        .upsert({
          student_id: req.user.id,
          exam_id: req.params.id,
          question_id,
          selected_option,
          saved_at: new Date().toISOString()
        }, { onConflict: 'student_id,exam_id,question_id' });
    }

    res.json({ message: 'Exam submitted', score, total });
  } catch {
    res.status(500).json({ message: 'Error submitting exam' });
  }
});

module.exports = router;
