const { getSupabase } = require('../config/supabase');

const getProgress = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: progress, error } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) throw error;

    const formatted = (progress || []).map(p => ({
      _id: p.id,
      id: p.id,
      userId: p.user_id,
      topic: p.topic,
      completed: p.completed,
      score: p.score,
      updatedAt: p.updated_at
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateProgress = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { topic, completed, score } = req.body;
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const { data: updated, error } = await supabase
      .from('progress')
      .upsert(
        {
          user_id: req.user.id,
          topic,
          completed: Boolean(completed),
          score: Number(score) || 0,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id,topic' }
      )
      .select()
      .single();

    if (error) throw error;

    res.json({
      _id: updated.id,
      id: updated.id,
      userId: updated.user_id,
      topic: updated.topic,
      completed: updated.completed,
      score: updated.score,
      updatedAt: updated.updated_at
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getProgress, updateProgress };
