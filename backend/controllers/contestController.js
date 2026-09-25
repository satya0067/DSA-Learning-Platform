const { getSupabase } = require('../config/supabase');

const getContests = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: contests, error } = await supabase
      .from('contests')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) throw error;

    const now = new Date();
    const categorized = (contests || []).map(c => {
      let status = 'completed';
      if (c.start_time && now < new Date(c.start_time)) {
        status = 'upcoming';
      } else if (c.start_time && c.end_time && now >= new Date(c.start_time) && now <= new Date(c.end_time)) {
        status = 'live';
      }
      return {
        _id: c.id,
        id: c.id,
        title: c.title,
        description: c.description,
        startTime: c.start_time,
        endTime: c.end_time,
        problems: c.problems || [],
        participants: c.participants || [],
        status
      };
    });

    res.json(categorized);
  } catch (error) {
    console.error('Get contests error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getContestById = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: contest, error } = await supabase
      .from('contests')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    res.json({
      _id: contest.id,
      id: contest.id,
      title: contest.title,
      description: contest.description,
      startTime: contest.start_time,
      endTime: contest.end_time,
      problems: contest.problems || [],
      participants: contest.participants || []
    });
  } catch (error) {
    console.error('Get contest by id error:', error);
    res.status(500).json({ error: error.message });
  }
};

const joinContest = async (req, res) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id;

    const { data: contest } = await supabase
      .from('contests')
      .select('participants')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    const participants = contest.participants || [];
    const isRegistered = participants.some(p => p.userId === userId);
    if (isRegistered) {
      return res.status(400).json({ message: 'Already registered for this contest' });
    }

    participants.push({
      userId,
      score: 0,
      joinedAt: new Date().toISOString()
    });

    await supabase
      .from('contests')
      .update({ participants })
      .eq('id', req.params.id);

    res.json({ message: 'Successfully registered for the contest' });
  } catch (error) {
    console.error('Join contest error:', error);
    res.status(500).json({ error: error.message });
  }
};

const createContest = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { title, description, problems, startTime, endTime } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: 'Title, startTime, and endTime are required' });
    }

    const { data: contest, error } = await supabase
      .from('contests')
      .insert({
        title,
        description: description || '',
        problems: problems || [],
        start_time: startTime,
        end_time: endTime,
        participants: []
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ _id: contest.id, id: contest.id, ...contest });
  } catch (error) {
    console.error('Create contest error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getContests,
  getContestById,
  joinContest,
  createContest
};
