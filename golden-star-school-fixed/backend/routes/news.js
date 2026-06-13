const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// Get all news (public)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error fetching news' });
  }
});

// Add news (admin)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { title, description, date, image_url } = req.body;
  if (!title || !description || !date)
    return res.status(400).json({ message: 'Title, description, and date are required' });
  try {
    const { data, error } = await supabase
      .from('news')
      .insert([{ title, description, date, image_url: image_url || null }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch {
    res.status(500).json({ message: 'Error adding news' });
  }
});

// Update news (admin)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { title, description, date, image_url } = req.body;
  try {
    const { data, error } = await supabase
      .from('news')
      .update({ title, description, date, image_url: image_url || null })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error updating news' });
  }
});

// Delete news (admin)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { error } = await supabase.from('news').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'News deleted' });
  } catch {
    res.status(500).json({ message: 'Error deleting news' });
  }
});

module.exports = router;
