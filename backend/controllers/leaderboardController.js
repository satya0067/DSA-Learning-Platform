const User = require('../models/User');
const Submission = require('../models/Submission');
const Editorial = require('../models/Editorial');

// Fetch rankings (XP, problems solved, streaks)
const getLeaderboard = async (req, res) => {
  try {
    const { type = 'xp' } = req.query; // types: 'xp', 'solved', 'streak'

    let leaderboardData = [];

    if (type === 'streak') {
      leaderboardData = await User.find({})
        .select('username avatar level rank streak bio')
        .sort({ streak: -1 })
        .limit(100)
        .lean();
    } else if (type === 'solved') {
      // Aggregate problems solved per user from Submissions
      const aggregates = await Submission.aggregate([
        { $match: { status: 'Accepted' } },
        { $group: { _id: '$userId', solvedCount: { $sum: 1 } } },
        { $sort: { solvedCount: -1 } },
        { $limit: 100 }
      ]);

      const userIds = aggregates.map(item => item._id);
      const users = await User.find({ _id: { $in: userIds } })
        .select('username avatar level rank bio')
        .lean();

      // Combine
      leaderboardData = aggregates.map(item => {
        const u = users.find(usr => usr._id.toString() === item._id.toString());
        return {
          ...u,
          problemsSolved: item.solvedCount
        };
      }).filter(item => item.username); // ensure user exists
    } else {
      // Default: 'xp'
      leaderboardData = await User.find({})
        .select('username avatar level rank xp bio')
        .sort({ xp: -1 })
        .limit(100)
        .lean();
    }

    res.json(leaderboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch unlocked editorial for problem
const getEditorial = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id;

    // Check if user is Admin or if they have solved this problem
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'admin') {
      const solved = await Submission.findOne({ userId, problemId, status: 'Accepted' });
      if (!solved) {
        return res.status(403).json({ message: 'Editorial locked. You must solve the problem first.' });
      }
    }

    const editorial = await Editorial.findOne({ problemId }).lean();
    if (!editorial) {
      return res.status(404).json({ message: 'Editorial editorial not found for this problem' });
    }

    res.json(editorial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getLeaderboard,
  getEditorial
};
