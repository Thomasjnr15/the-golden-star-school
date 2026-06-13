const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// Get all students (admin only)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('id, full_name, registration_number, class')
      .order('full_name');
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// Add student
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { full_name, registration_number, class: studentClass, password } = req.body;
  if (!full_name || !registration_number || !studentClass || !password)
    return res.status(400).json({ message: 'All fields are required' });
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('students')
      .insert([{ full_name, registration_number, class: studentClass, password_hash }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Registration number already exists' });
    res.status(500).json({ message: 'Error adding student' });
  }
});

// Update student
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { full_name, registration_number, class: studentClass, password } = req.body;
  try {
    const updates = { full_name, registration_number, class: studentClass };
    if (password && password.trim()) {
      updates.password_hash = await bcrypt.hash(password, 10);
    }
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error updating student' });
  }
});

// Delete student
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { error } = await supabase.from('students').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Student deleted' });
  } catch {
    res.status(500).json({ message: 'Error deleting student' });
  }
});

module.exports = router;
