const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// Get all payments (admin)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*, students(full_name, class)')
      .order('date_paid', { ascending: false });
    if (error) throw error;

    const formatted = data.map(p => ({
      ...p,
      student_name: p.students?.full_name,
      student_class: p.students?.class,
    }));
    res.json(formatted);
  } catch {
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

// Add payment (admin)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { student_id, amount, date_paid, status } = req.body;
  if (!student_id || !amount || !date_paid)
    return res.status(400).json({ message: 'Student, amount, and date are required' });
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([{ student_id, amount, date_paid, status: status || 'pending' }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch {
    res.status(500).json({ message: 'Error recording payment' });
  }
});

// Update payment (admin)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { student_id, amount, date_paid, status } = req.body;
  try {
    const { data, error } = await supabase
      .from('payments')
      .update({ student_id, amount, date_paid, status })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error updating payment' });
  }
});

// Delete payment (admin)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { error } = await supabase.from('payments').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Payment deleted' });
  } catch {
    res.status(500).json({ message: 'Error deleting payment' });
  }
});

module.exports = router;
