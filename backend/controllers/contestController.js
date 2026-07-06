const Contest = require('../models/Contest');

// Get all contests grouped by status
const getContests = async (req, res) => {
  try {
    const contests = await Contest.find({}).lean();
    const now = new Date();

    const categorized = contests.map(c => {
      let status = 'completed';
      if (now < new Date(c.startTime)) {
        status = 'upcoming';
      } else if (now >= new Date(c.startTime) && now <= new Date(c.endTime)) {
        status = 'live';
      }
      return { ...c, status };
    });

    res.json(categorized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single contest by ID with its problems (problems hidden if upcoming)
const getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('problems', 'title difficulty topic acceptanceRate')
      .lean();

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    const now = new Date();
    // Hide problems if contest hasn't started yet
    if (now < new Date(contest.startTime)) {
      contest.problems = [];
    }

    res.json(contest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Register user for a contest
const joinContest = async (req, res) => {
  try {
    const userId = req.user.id;
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    const isRegistered = contest.participants.some(p => p.userId.toString() === userId.toString());
    if (isRegistered) {
      return res.status(400).json({ message: 'Already registered for this contest' });
    }

    contest.participants.push({
      userId,
      score: 0,
      penaltyTime: 0,
      submissions: []
    });

    await contest.save();
    res.json({ message: 'Successfully registered for the contest' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin only: Create a contest
const createContest = async (req, res) => {
  try {
    const { title, description, problems, startTime, endTime, duration } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: 'Title, startTime, and endTime are required' });
    }

    const contest = new Contest({
      title,
      description,
      problems,
      startTime,
      endTime,
      duration
    });

    await contest.save();
    res.status(201).json(contest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getContests,
  getContestById,
  joinContest,
  createContest
};
