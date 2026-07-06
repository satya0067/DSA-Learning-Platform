const DailyChallenge = require('../models/DailyChallenge');
const WeeklyChallenge = require('../models/WeeklyChallenge');
const Achievement = require('../models/Achievement');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const Notification = require('../models/Notification');

// Fetch or auto-create daily challenge for today
const getDailyChallenge = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    let daily = await DailyChallenge.findOne({ date: todayStr })
      .populate('problemId')
      .lean();

    if (!daily) {
      // Find a random problem to set as the daily challenge
      const count = await Problem.countDocuments();
      if (count > 0) {
        const randomIdx = Math.floor(Math.random() * count);
        const randProb = await Problem.findOne().skip(randomIdx);
        
        const newDaily = new DailyChallenge({
          problemId: randProb._id,
          date: todayStr,
          pointsReward: 20
        });
        await newDaily.save();
        
        daily = await DailyChallenge.findById(newDaily._id)
          .populate('problemId')
          .lean();
      } else {
        return res.status(404).json({ message: 'No coding problems available to set daily challenge' });
      }
    }

    // Check if user solved it today
    let solved = false;
    if (req.user && req.user.id) {
      solved = daily.claimedUsers.some(uid => uid.toString() === req.user.id.toString());
    }

    res.json({
      ...daily,
      solved
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch or auto-create weekly challenge
const getWeeklyChallenge = async (req, res) => {
  try {
    const now = new Date();
    // Start of week (Sunday)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    // End of week (Saturday)
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    endOfWeek.setHours(23, 59, 59, 999);

    let weekly = await WeeklyChallenge.findOne({
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).populate('problems').lean();

    if (!weekly) {
      // Auto create weekly challenge with 3 random problems
      const problemsList = await Problem.find({}).limit(3).lean();
      if (problemsList.length > 0) {
        const newWeekly = new WeeklyChallenge({
          title: `Weekly Demon Hunt: ${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`,
          problems: problemsList.map(p => p._id),
          startDate: startOfWeek,
          endDate: endOfWeek,
          pointsReward: 100
        });
        await newWeekly.save();

        weekly = await WeeklyChallenge.findById(newWeekly._id)
          .populate('problems')
          .lean();
      } else {
        return res.status(404).json({ message: 'No coding problems available to set weekly challenge' });
      }
    }

    let solvedAll = false;
    let completedCount = 0;
    if (req.user && req.user.id) {
      solvedAll = weekly.claimedUsers.some(uid => uid.toString() === req.user.id.toString());
      
      const solvedProblems = await Submission.find({
        userId: req.user.id,
        problemId: { $in: weekly.problems.map(p => p._id) },
        status: 'Accepted'
      }).select('problemId').lean();
      
      const uniqueSolved = new Set(solvedProblems.map(s => s.problemId.toString()));
      completedCount = uniqueSolved.size;
    }

    res.json({
      ...weekly,
      solvedAll,
      completedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch achievements list with unlock indicators
const getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({}).lean();
    
    if (req.user && req.user.id) {
      const userId = req.user.id;
      
      // Calculate achievements unlocked:
      // Count total accepted submissions
      const submissions = await Submission.find({ userId, status: 'Accepted' }).lean();
      const uniqueSolvedIds = new Set(submissions.map(s => s.problemId.toString()));
      const problemsSolvedCount = uniqueSolvedIds.size;

      // Check max streak
      const user = await User.findById(userId).lean();
      const streakCount = user.streak || 0;

      // Check quiz count (quizzesPassed)
      const quizPassedCount = user.quizzesPassed || 0;

      const annotated = achievements.map(ach => {
        let currentCount = 0;
        let unlocked = false;
        
        switch (ach.category) {
          case 'problems':
            currentCount = problemsSolvedCount;
            unlocked = problemsSolvedCount >= ach.requirementCount;
            break;
          case 'streaks':
            currentCount = streakCount;
            unlocked = streakCount >= ach.requirementCount;
            break;
          case 'quizzes':
            currentCount = quizPassedCount;
            unlocked = quizPassedCount >= ach.requirementCount;
            break;
          default:
            break;
        }

        return {
          ...ach,
          unlocked,
          progress: currentCount
        };
      });

      return res.json(annotated);
    }

    // Unauthenticated view
    res.json(achievements.map(ach => ({ ...ach, unlocked: false, progress: 0 })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDailyChallenge,
  getWeeklyChallenge,
  getAchievements
};
