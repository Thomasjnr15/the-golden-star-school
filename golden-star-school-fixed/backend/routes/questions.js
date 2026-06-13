const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// Update question
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { question_text, option_a, option_b, option_c, option_d, correct_option } = req.body;
  try {
    const { data, error } = await supabase
      .from('questions')
      .update({ question_text, option_a, option_b, option_c, option_d, correct_option })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error updating question' });
  }
});

// Delete question
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { error } = await supabase.from('questions').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Question deleted' });
  } catch {
    res.status(500).json({ message: 'Error deleting question' });
  }
});

module.exports = router;
