const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Submit contact message (public)
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ message: 'All fields are required' });
  try {
    const { error } = await supabase
      .from('contact_messages')
      .insert([{ name, email, message, received_at: new Date().toISOString() }]);
    if (error) throw error;
    res.status(201).json({ message: 'Message sent successfully' });
  } catch {
    res.status(500).json({ message: 'Error sending message' });
  }
});

module.exports = router;
