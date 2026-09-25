const { getSupabase } = require('../config/supabase');

const toggleBookmark = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { problemId, listName = 'Favorites' } = req.body;
    const userId = req.user.id;

    if (!problemId) {
      return res.status(400).json({ message: 'Problem ID is required' });
    }

    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('problem_id', problemId)
      .eq('list_name', listName)
      .maybeSingle();

    if (existing) {
      await supabase.from('bookmarks').delete().eq('id', existing.id);
      return res.json({ bookmarked: false, message: 'Removed from bookmarks' });
    } else {
      await supabase.from('bookmarks').insert({
        user_id: userId,
        problem_id: problemId,
        list_name: listName
      });
      return res.json({ bookmarked: true, message: 'Added to bookmarks' });
    }
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id;

    const { data: bookmarks, error } = await supabase
      .from('bookmarks')
      .select('*, problems(*)')
      .eq('user_id', userId);

    if (error) throw error;

    const formatted = (bookmarks || []).map(b => ({
      _id: b.id,
      id: b.id,
      userId: b.user_id,
      problemId: b.problems ? {
        _id: b.problems.id,
        id: b.problems.id,
        title: b.problems.title,
        difficulty: b.problems.difficulty,
        topic: b.problems.topic,
        acceptanceRate: b.problems.acceptance_rate,
        points: b.problems.points
      } : b.problem_id,
      listName: b.list_name,
      createdAt: b.created_at
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  toggleBookmark,
  getBookmarks
};
