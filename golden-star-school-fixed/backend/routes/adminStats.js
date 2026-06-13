const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// Get dashboard stats
router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [students, exams, news, messages, payments] = await Promise.all([
      supabase.from('students').select('id', { count: 'exact', head: true }),
      supabase.from('exams').select('id', { count: 'exact', head: true }),
      supabase.from('news').select('id', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('id', { count: 'exact', head: true }),
      supabase.from('payments').select('status'),
    ]);

    const paid = payments.data?.filter(p => p.status === 'paid').length || 0;
    const pending = payments.data?.filter(p => p.status === 'pending').length || 0;

    res.json({
      students: students.count || 0,
      exams: exams.count || 0,
      news: news.count || 0,
      messages: messages.count || 0,
      payments: { paid, pending },
    });
  } catch {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router;
