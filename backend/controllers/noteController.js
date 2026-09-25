const { getSupabase } = require('../config/supabase');

const getNote = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { problemId } = req.params;
    const userId = req.user.id;

    const { data: note, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .eq('problem_id', problemId)
      .maybeSingle();

    if (error) throw error;
    res.json(note ? { _id: note.id, id: note.id, content: note.content } : { content: '' });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: error.message });
  }
};

const saveNote = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { problemId, content } = req.body;
    const userId = req.user.id;

    if (!problemId) {
      return res.status(400).json({ message: 'Problem ID is required' });
    }

    const { data: note, error } = await supabase
      .from('notes')
      .upsert(
        {
          user_id: userId,
          problem_id: problemId,
          content: content || '',
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id,problem_id' }
      )
      .select()
      .single();

    if (error) throw error;
    res.json({ _id: note.id, id: note.id, content: note.content });
  } catch (error) {
    console.error('Save note error:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { problemId } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('user_id', userId)
      .eq('problem_id', problemId);

    if (error) throw error;
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getNote,
  saveNote,
  deleteNote
};
