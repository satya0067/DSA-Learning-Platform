const { getSupabase } = require('../config/supabase');

const getDailyChallenge = async (req, res) => {
  try {
    const supabase = getSupabase();
    
    // Fetch a problem for daily challenge
    const { data: problems } = await supabase
      .from('problems')
      .select('*')
      .limit(5);

    if (!problems || problems.length === 0) {
      return res.status(404).json({ message: 'No coding problems available to set daily challenge' });
    }

    const randProb = problems[0];
    let solved = false;

    if (req.user && req.user.id) {
      const { data: sub } = await supabase
        .from('submissions')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('problem_id', randProb.id)
        .eq('status', 'Accepted')
        .limit(1);

      solved = !!(sub && sub.length > 0);
    }

    res.json({
      _id: randProb.id,
      id: randProb.id,
      problemId: {
        _id: randProb.id,
        id: randProb.id,
        title: randProb.title,
        difficulty: randProb.difficulty,
        topic: randProb.topic,
        acceptanceRate: randProb.acceptance_rate,
        points: randProb.points
      },
      pointsReward: 20,
      solved
    });
  } catch (error) {
    console.error('Get daily challenge error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getWeeklyChallenge = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: problems } = await supabase
      .from('problems')
      .select('*')
      .limit(3);

    const formattedProblems = (problems || []).map(p => ({
      _id: p.id,
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      topic: p.topic
    }));

    res.json({
      _id: 'weekly-1',
      title: 'Weekly Demon Hunt Challenge',
      problems: formattedProblems,
      pointsReward: 100,
      solvedAll: false,
      completedCount: 0
    });
  } catch (error) {
    console.error('Get weekly challenge error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getAchievements = async (req, res) => {
  res.json([
    { title: 'First Blood', description: 'Solve your first problem', unlocked: true, icon: '⚔️' },
    { title: 'Speed Demon', description: 'Solve a problem under 5 minutes', unlocked: true, icon: '⚡' },
    { title: 'Quiz Master', description: 'Pass 5 quizzes with 100%', unlocked: false, icon: '📜' }
  ]);
};

module.exports = {
  getDailyChallenge,
  getWeeklyChallenge,
  getAchievements
};
