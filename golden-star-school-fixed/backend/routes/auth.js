const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Student Login
router.post('/student-login', async (req, res) => {
  const { registration_number, password } = req.body;
  if (!registration_number || !password)
    return res.status(400).json({ message: 'Registration number and password are required' });

  try {
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('registration_number', registration_number.trim())
      .single();

    if (error || !student)
      return res.status(401).json({ message: 'Invalid registration number or password' });

    const valid = await bcrypt.compare(password, student.password_hash);
    if (!valid)
      return res.status(401).json({ message: 'Invalid registration number or password' });

    const token = jwt.sign(
      { id: student.id, role: 'student', class: student.class },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      student: {
        id: student.id,
        full_name: student.full_name,
        registration_number: student.registration_number,
        class: student.class,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Login
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (error || !admin)
      return res.status(401).json({ message: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid)
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: admin.id, role: 'admin', email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      token,
      admin: { id: admin.id, email: admin.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
