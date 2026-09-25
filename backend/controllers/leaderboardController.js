const { getSupabase } = require('../config/supabase');

// Fetch rankings (XP, problems solved, streaks)
const getLeaderboard = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { type = 'xp' } = req.query; // types: 'xp', 'solved', 'streak'

    let leaderboardData = [];

    if (type === 'streak') {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, avatar, level, rank, streak, bio')
        .order('streak', { ascending: false })
        .limit(100);

      if (error) throw error;
      leaderboardData = (data || []).map(u => ({
        _id: u.id,
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        level: u.level,
        rank: u.rank,
        streak: u.streak,
        bio: u.bio
      }));
    } else if (type === 'solved') {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, avatar, level, rank, completed_challenges, bio')
        .order('completed_challenges', { ascending: false })
        .limit(100);

      if (error) throw error;
      leaderboardData = (data || []).map(u => ({
        _id: u.id,
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        level: u.level,
        rank: u.rank,
        problemsSolved: u.completed_challenges,
        bio: u.bio
      }));
    } else {
      // Default: 'xp'
      const { data, error } = await supabase
        .from('users')
        .select('id, username, avatar, level, rank, xp, bio')
        .order('xp', { ascending: false })
        .limit(100);

      if (error) throw error;
      leaderboardData = (data || []).map(u => ({
        _id: u.id,
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        level: u.level,
        rank: u.rank,
        xp: u.xp,
        bio: u.bio
      }));
    }

    res.json(leaderboardData);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getEditorial = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { problemId } = req.params;

    const { data: problem } = await supabase
      .from('problems')
      .select('hints, description')
      .eq('id', problemId)
      .maybeSingle();

    res.json({
      problemId,
      content: problem ? (problem.hints || []).join('\n\n') || problem.description : 'No editorial currently available.'
    });
  } catch (error) {
    console.error('Get editorial error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getLeaderboard,
  getEditorial
};
