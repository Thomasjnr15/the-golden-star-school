const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// Get public settings (no auth needed - for landing page)
router.get('/public', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('school_settings')
      .select('*')
      .single();
    if (error) throw error;
    // Parse fees_table if it's a string
    if (data.fees_table && typeof data.fees_table === 'string') {
      try { data.fees_table = JSON.parse(data.fees_table); } catch {}
    }
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

// Get all settings (admin)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('school_settings')
      .select('*')
      .single();
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

// Update settings (admin)
router.put('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    // Stringify fees_table if it's an array
    if (Array.isArray(updates.fees_table)) {
      updates.fees_table = JSON.stringify(updates.fees_table);
    }
    const { data, error } = await supabase
      .from('school_settings')
      .update(updates)
      .eq('id', 1)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error saving settings' });
  }
});

module.exports = router;
