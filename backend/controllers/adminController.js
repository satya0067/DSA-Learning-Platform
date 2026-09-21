const User = require('../models/User');
const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');
const HiddenTestCase = require('../models/HiddenTestCase');
const Contest = require('../models/Contest');
const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');

// 1. Dashboard Overview Stats
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProblems,
      totalSubmissions,
      totalContests,
      totalQuizzes,
      acceptedSubmissions,
      recentUsers,
      recentSubmissions
    ] = await Promise.all([
      User.countDocuments(),
      Problem.countDocuments(),
      Submission.countDocuments(),
      Contest.countDocuments(),
      Quiz.countDocuments(),
      Submission.countDocuments({ status: 'Accepted' }),
      User.find().select('-password').sort({ createdAt: -1 }).limit(5).lean(),
      Submission.find().populate('userId', 'username email').populate('problemId', 'title difficulty').sort({ submittedAt: -1 }).limit(5).lean()
    ]);

    const globalAcceptanceRate = totalSubmissions > 0
      ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
      : 0;

    res.json({
      stats: {
        totalUsers,
        totalProblems,
        totalSubmissions,
        totalContests,
        totalQuizzes,
        acceptedSubmissions,
        globalAcceptanceRate
      },
      recentUsers,
      recentSubmissions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. User Management
const getUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 50 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ username: searchRegex }, { email: searchRegex }];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['student', 'mentor', 'instructor', 'admin'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Must be one of: ${allowedRoles.join(', ')}` });
    }

    // Prevent admin from accidentally demoting themselves if they are the last admin
    if (req.user.id === req.params.id && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot demote the only remaining administrator.' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User ${user.username} deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Problem Management with Test Cases
const getAdminProblems = async (req, res) => {
  try {
    const { search, difficulty, topic } = req.query;
    const query = {};

    if (difficulty && difficulty !== 'all') query.difficulty = difficulty;
    if (topic && topic !== 'all') query.topic = topic;
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ title: searchRegex }, { topic: searchRegex }];
    }

    const problems = await Problem.find(query).sort({ createdAt: -1 }).lean();
    
    // Attach test case counts
    const problemsWithCounts = await Promise.all(
      problems.map(async (prob) => {
        const sampleCount = await TestCase.countDocuments({ problemId: prob._id });
        const hiddenCount = await HiddenTestCase.countDocuments({ problemId: prob._id });
        return {
          ...prob,
          sampleCount,
          hiddenCount
        };
      })
    );

    res.json(problemsWithCounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createProblemWithTestCases = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      topic,
      inputFormat,
      outputFormat,
      constraints,
      points,
      starterCode,
      sampleTestCases = [],
      hiddenTestCases = []
    } = req.body;

    if (!title || !description || !difficulty || !topic) {
      return res.status(400).json({ message: 'Title, description, difficulty, and topic are required.' });
    }

    const problem = new Problem({
      title,
      description,
      difficulty,
      topic,
      inputFormat,
      outputFormat,
      constraints,
      points: points || (difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 20 : 30),
      starterCode: starterCode || []
    });

    await problem.save();

    // Persist Sample Test Cases
    if (Array.isArray(sampleTestCases) && sampleTestCases.length > 0) {
      const sampleDocs = sampleTestCases
        .filter(tc => tc.input !== undefined && tc.expectedOutput !== undefined)
        .map(tc => ({
          problemId: problem._id,
          input: tc.input || '',
          expectedOutput: tc.expectedOutput || '',
          isSample: true
        }));
      if (sampleDocs.length > 0) {
        await TestCase.insertMany(sampleDocs);
      }
    }

    // Persist Hidden Test Cases
    if (Array.isArray(hiddenTestCases) && hiddenTestCases.length > 0) {
      const hiddenDocs = hiddenTestCases
        .filter(tc => tc.input !== undefined && tc.expectedOutput !== undefined)
        .map(tc => ({
          problemId: problem._id,
          input: tc.input || '',
          expectedOutput: tc.expectedOutput || '',
          description: tc.description || ''
        }));
      if (hiddenDocs.length > 0) {
        await HiddenTestCase.insertMany(hiddenDocs);
      }
    }

    res.status(201).json({ message: 'Problem and test cases created successfully', problem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProblemWithTestCases = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      topic,
      inputFormat,
      outputFormat,
      constraints,
      points,
      starterCode,
      sampleTestCases,
      hiddenTestCases
    } = req.body;

    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        difficulty,
        topic,
        inputFormat,
        outputFormat,
        constraints,
        points,
        starterCode
      },
      { new: true }
    );

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // If sampleTestCases provided, replace existing
    if (Array.isArray(sampleTestCases)) {
      await TestCase.deleteMany({ problemId: problem._id });
      const sampleDocs = sampleTestCases
        .filter(tc => tc.input !== undefined && tc.expectedOutput !== undefined)
        .map(tc => ({
          problemId: problem._id,
          input: tc.input || '',
          expectedOutput: tc.expectedOutput || '',
          isSample: true
        }));
      if (sampleDocs.length > 0) {
        await TestCase.insertMany(sampleDocs);
      }
    }

    // If hiddenTestCases provided, replace existing
    if (Array.isArray(hiddenTestCases)) {
      await HiddenTestCase.deleteMany({ problemId: problem._id });
      const hiddenDocs = hiddenTestCases
        .filter(tc => tc.input !== undefined && tc.expectedOutput !== undefined)
        .map(tc => ({
          problemId: problem._id,
          input: tc.input || '',
          expectedOutput: tc.expectedOutput || '',
          description: tc.description || ''
        }));
      if (hiddenDocs.length > 0) {
        await HiddenTestCase.insertMany(hiddenDocs);
      }
    }

    res.json({ message: 'Problem updated successfully', problem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Cascade delete linked test cases and submissions
    await Promise.all([
      TestCase.deleteMany({ problemId: req.params.id }),
      HiddenTestCase.deleteMany({ problemId: req.params.id }),
      Submission.deleteMany({ problemId: req.params.id })
    ]);

    res.json({ message: 'Problem, test cases, and submissions deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Contest Management
const getAdminContests = async (req, res) => {
  try {
    const contests = await Contest.find().sort({ startTime: -1 }).lean();
    res.json(contests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }
    res.json({ message: 'Contest deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Quiz Management
const getAdminQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 }).lean();
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getAdminProblems,
  createProblemWithTestCases,
  updateProblemWithTestCases,
  deleteProblem,
  getAdminContests,
  deleteContest,
  getAdminQuizzes,
  deleteQuiz
};
