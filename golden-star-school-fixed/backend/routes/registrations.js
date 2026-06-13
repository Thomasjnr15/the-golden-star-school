const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// Submit new registration (public - anyone can register)
router.post('/', async (req, res) => {
  const {
    full_name, date_of_birth, gender, class_applying,
    previous_school, parent_name, parent_phone,
    parent_email, home_address, additional_info
  } = req.body;

  // Validate required fields
  if (!full_name || !date_of_birth || !gender || !class_applying || !parent_name || !parent_phone || !home_address) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('registration_requests')
      .insert([{
        full_name,
        date_of_birth,
        gender,
        class_applying,
        previous_school: previous_school || null,
        parent_name,
        parent_phone,
        parent_email: parent_email || null,
        home_address,
        additional_info: additional_info || null,
        status: 'pending',
        submitted_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Registration submitted successfully', id: data.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting registration' });
  }
});

// Get all registration requests (admin only)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('registration_requests')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error fetching registrations' });
  }
});

// Approve registration (admin only)
// Creates a student account automatically
router.post('/:id/approve', authMiddleware, adminOnly, async (req, res) => {
  const { registration_number, class: studentClass, password } = req.body;

  if (!registration_number || !studentClass || !password) {
    return res.status(400).json({ message: 'Registration number, class and password are required' });
  }

  try {
    // Get the registration request
    const { data: request, error: reqError } = await supabase
      .from('registration_requests')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (reqError || !request) {
      return res.status(404).json({ message: 'Registration request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }

    // Check if registration number already exists
    const { data: existing } = await supabase
      .from('students')
      .select('id')
      .eq('registration_number', registration_number)
      .single();

    if (existing) {
      return res.status(400).json({ message: 'Registration number already exists. Please use a different one.' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create student account
    const { error: studentError } = await supabase
      .from('students')
      .insert([{
        full_name: request.full_name,
        registration_number,
        class: studentClass,
        password_hash
      }]);

    if (studentError) throw studentError;

    // Update request status to approved
    await supabase
      .from('registration_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        assigned_registration_number: registration_number,
        assigned_class: studentClass
      })
      .eq('id', req.params.id);

    res.json({ message: 'Student approved and account created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error approving registration' });
  }
});

// Reject registration (admin only)
router.post('/:id/reject', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { error } = await supabase
      .from('registration_requests')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString()
      })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Registration rejected' });
  } catch {
    res.status(500).json({ message: 'Error rejecting registration' });
  }
});

// Delete registration request (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { error } = await supabase
      .from('registration_requests')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Registration request deleted' });
  } catch {
    res.status(500).json({ message: 'Error deleting registration' });
  }
});

module.exports = router;
