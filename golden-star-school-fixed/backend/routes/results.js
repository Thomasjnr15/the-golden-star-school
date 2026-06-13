const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// Get student's own results
router.get('/my-results', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*, exams(title, subject)')
      .eq('student_id', req.user.id)
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error fetching results' });
  }
});

// Get result for specific exam (student)
router.get('/:examId', authMiddleware, async (req, res) => {
  try {
    const { data: result, error } = await supabase
      .from('exam_results')
      .select('*, exams(title, subject)')
      .eq('exam_id', req.params.examId)
      .eq('student_id', req.user.id)
      .single();
    if (error) throw error;

    // Get questions with correct answers for review
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('exam_id', req.params.examId)
      .order('id');

    // Get student's answers
    const { data: studentAnswers } = await supabase
      .from('student_answers')
      .select('question_id, selected_option')
      .eq('exam_id', req.params.examId)
      .eq('student_id', req.user.id);

    const answersMap = {};
    (studentAnswers || []).forEach(a => { answersMap[a.question_id] = a.selected_option; });

    res.json({
      result: {
        ...result,
        exam_title: result.exams?.title,
        answers: answersMap
      },
      questions
    });
  } catch {
    res.status(500).json({ message: 'Error fetching result' });
  }
});

// Get all results for an exam (admin)
router.get('/exam/:examId', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*, students(full_name, registration_number, class)')
      .eq('exam_id', req.params.examId)
      .order('score', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error fetching results' });
  }
});

module.exports = router;
