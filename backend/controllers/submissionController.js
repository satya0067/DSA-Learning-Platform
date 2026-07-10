const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');
const HiddenTestCase = require('../models/HiddenTestCase');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const DailyChallenge = require('../models/DailyChallenge');
const WeeklyChallenge = require('../models/WeeklyChallenge');
const Notification = require('../models/Notification');
const Progress = require('../models/Progress');
const judgeService = require('../services/judgeService');
const codeExecutor = require('../services/codeExecutor');

// Helper to award gamification rewards to user
const awardUserRewards = async (userId, points, coinsAwarded = 5, category = 'practice') => {
  const user = await User.findById(userId);
  if (!user) return null;

  user.xp = (user.xp || 0) + points;
  user.practiceScore = (user.practiceScore || 0) + points; // Accumulate practice score

  // Increment completed challenges
  user.completedChallenges = (user.completedChallenges || 0) + 1;

  // Level up calculation: 100 XP per level
  const oldLevel = user.level || 1;
  const newLevel = Math.floor(user.xp / 100) + 1;
  let leveledUp = false;
  if (newLevel > oldLevel) {
    user.level = newLevel;
    leveledUp = true;
  }

  // Update Slayer Rank based on level
  // Mizunoto (Level 1-2), Mizunoe (Level 3-4), Kanoto (Level 5-6), Kanoe (Level 7-8), Hinoto (Level 9-10), Hashira (Level 11+)
  if (user.level >= 11) {
    user.rank = 'Hashira ⚔️';
  } else if (user.level >= 9) {
    user.rank = 'Hinoto ☀️';
  } else if (user.level >= 7) {
    user.rank = 'Kanoe 🌫️';
  } else if (user.level >= 5) {
    user.rank = 'Kanoto ⚡';
  } else if (user.level >= 3) {
    user.rank = 'Mizunoe 💧';
  } else {
    user.rank = 'Mizunoto 🌙';
  }

  // Update Streak
  const today = new Date().toDateString();
  const lastActive = user.createdAt ? new Date(user.createdAt).toDateString() : null; // Temp check fallback
  // Normally we would check a lastSubmissionDate, let's keep it simple: increment streak if active today
  user.streak = (user.streak || 0) + 1;

  await user.save();

  // Update Leaderboard cache
  await Leaderboard.findOneAndUpdate(
    { userId: user._id },
    {
      xp: user.xp,
      streak: user.streak,
      $inc: { problemsSolved: 1 },
      lastUpdated: Date.now()
    },
    { upsert: true, new: true }
  );

  // Send Notification
  let notificationMsg = `⚔️ Problem Solved! You earned +${points} XP and became stronger.`;
  if (leveledUp) {
    notificationMsg += ` 🎉 LEVEL UP! You reached Level ${user.level} (${user.rank})!`;
  }
  
  const notification = new Notification({
    userId: user._id,
    message: notificationMsg,
    type: 'milestone'
  });
  await notification.save();

  return { user, leveledUp, pointsEarned: points };
};

// Run custom input execution or sample test cases
const runCode = async (req, res) => {
  try {
    const { problemId, language, code, stdin = '', useSampleCases = false } = req.body;

    if (!language || !code) {
      return res.status(400).json({ message: 'Language and code are required' });
    }

    // 1. If running with custom manual input
    if (!useSampleCases) {
      const result = await codeExecutor.execute(language, code, stdin);
      return res.json({
        status: result.status,
        output: result.output,
        customRun: true
      });
    }

    // 2. If running against sample test cases
    if (!problemId) {
      return res.status(400).json({ message: 'Problem ID is required to run sample cases' });
    }

    const testCases = await TestCase.find({ problemId, isSample: true });
    if (testCases.length === 0) {
      return res.status(400).json({ message: 'No sample test cases found for this problem' });
    }

    const judgeResult = await judgeService.judge(language, code, testCases);
    res.json(judgeResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit code execution (Evaluated against all visible + hidden test cases)
const submitCode = async (req, res) => {
  try {
    const { problemId, language, code } = req.body;
    const userId = req.user.id;

    if (!problemId || !language || !code) {
      return res.status(400).json({ message: 'Problem ID, language, and code are required' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // 1. Gather all test cases (sample + hidden)
    const sampleCases = await TestCase.find({ problemId }).lean();
    const hiddenCases = await HiddenTestCase.find({ problemId }).lean();
    const allTestCases = [...sampleCases, ...hiddenCases];

    if (allTestCases.length === 0) {
      return res.status(400).json({ message: 'No test cases configured for this problem' });
    }

    // 2. Judge Code
    const judgeResult = await judgeService.judge(language, code, allTestCases);

    // 3. Save Submission Record
    const submission = new Submission({
      userId,
      problemId,
      code,
      language,
      status: judgeResult.status,
      runtime: judgeResult.runtime || 0,
      memory: judgeResult.memory || 0,
      errorOutput: judgeResult.errorOutput || ''
    });
    await submission.save();

    // 4. Update Problem Stats
    problem.totalSubmissions += 1;
    if (judgeResult.status === 'Accepted') {
      problem.successCount += 1;
    }
    problem.acceptanceRate = Math.round((problem.successCount / problem.totalSubmissions) * 100);
    await problem.save();

    // 5. If Accepted, process gamification rewards and checks
    let rewardResult = null;
    if (judgeResult.status === 'Accepted') {
      // Check if user has already solved this problem to prevent duplicate reward farming
      const solvedBefore = await Submission.findOne({
        userId,
        problemId,
        status: 'Accepted',
        _id: { $ne: submission._id }
      });

      const pointsToAward = problem.points || 10;
      if (!solvedBefore) {
        rewardResult = await awardUserRewards(userId, pointsToAward, 5, 'practice');

        // Check if it's the Daily Challenge
        const todayStr = new Date().toISOString().split('T')[0];
        const dailyChallenge = await DailyChallenge.findOne({ problemId, date: todayStr });
        if (dailyChallenge && !dailyChallenge.claimedUsers.includes(userId)) {
          dailyChallenge.claimedUsers.push(userId);
          await dailyChallenge.save();
          
          // Extra reward for daily challenge
          await awardUserRewards(userId, dailyChallenge.pointsReward, 10, 'daily');
          
          const dailyNotif = new Notification({
            userId,
            message: `🌅 Daily Challenge Completed! Bonus +${dailyChallenge.pointsReward} XP claimed!`,
            type: 'success'
          });
          await dailyNotif.save();
        }

        // Check Weekly Challenge
        const weeklyChallenges = await WeeklyChallenge.find({
          problems: problemId,
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() }
        });
        
        for (const weekly of weeklyChallenges) {
          if (!weekly.claimedUsers.includes(userId)) {
            // Check if user solved all problems in this weekly challenge
            const solvedProblemsCount = await Submission.countDocuments({
              userId,
              problemId: { $in: weekly.problems },
              status: 'Accepted'
            });

            if (solvedProblemsCount >= weekly.problems.length) {
              weekly.claimedUsers.push(userId);
              await weekly.save();

              await awardUserRewards(userId, weekly.pointsReward, 25, 'weekly');
              
              const weeklyNotif = new Notification({
                userId,
                message: `🏆 Weekly Challenge Completed! Bonus +${weekly.pointsReward} XP claimed!`,
                type: 'success'
              });
              await weeklyNotif.save();
            }
          }
        }
      }
    }

    res.json({
      submissionId: submission._id,
      status: judgeResult.status,
      runtime: judgeResult.runtime,
      memory: judgeResult.memory,
      errorOutput: judgeResult.errorOutput,
      failedTestCaseIndex: judgeResult.failedTestCaseIndex,
      reward: rewardResult
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch submission history for a specific problem
const getSubmissionsHistory = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id;

    const history = await Submission.find({ userId, problemId })
      .sort({ submittedAt: -1 })
      .lean();

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  runCode,
  submitCode,
  getSubmissionsHistory
};
