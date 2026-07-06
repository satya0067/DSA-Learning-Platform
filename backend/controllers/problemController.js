const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');
const Submission = require('../models/Submission');
const Bookmark = require('../models/Bookmark');
const Note = require('../models/Note');

// Get all problems with filtering, search, sorting, and pagination
const getProblems = async (req, res) => {
  try {
    const {
      difficulty,
      topic,
      status, // 'Solved', 'Unsolved', 'Attempted'
      bookmarked, // 'true'
      search,
      sortBy, // 'difficulty', 'acceptanceRate', 'newest', 'oldest', 'alphabetical'
      page = 1,
      limit = 50
    } = req.query;

    const query = {};

    // 1. Core Filters
    if (difficulty) query.difficulty = difficulty;
    if (topic) query.topic = topic;

    // 2. Search
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { topic: searchRegex }
      ];
      // If it looks like an ObjectId or ID search
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        query.$or.push({ _id: search });
      }
    }

    // Fetch initial matching problems
    let problems = await Problem.find(query).lean();

    // 3. User-Specific Annotations (if logged in)
    if (req.user && req.user.id) {
      const userId = req.user.id;

      // Fetch user's submissions
      const submissions = await Submission.find({ userId }).lean();
      const solvedProblemIds = new Set(
        submissions.filter(s => s.status === 'Accepted').map(s => s.problemId.toString())
      );
      const attemptedProblemIds = new Set(
        submissions.map(s => s.problemId.toString())
      );

      // Fetch user's bookmarks
      const bookmarks = await Bookmark.find({ userId }).lean();
      const bookmarkedProblemIds = new Set(bookmarks.map(b => b.problemId.toString()));

      // Annotate problems
      problems = problems.map(prob => {
        const idStr = prob._id.toString();
        let probStatus = 'Unsolved';
        if (solvedProblemIds.has(idStr)) {
          probStatus = 'Solved';
        } else if (attemptedProblemIds.has(idStr)) {
          probStatus = 'Attempted';
        }

        return {
          ...prob,
          status: probStatus,
          isBookmarked: bookmarkedProblemIds.has(idStr)
        };
      });

      // Apply status / bookmark filters in-memory after annotation
      if (status) {
        problems = problems.filter(p => p.status === status);
      }
      if (bookmarked === 'true') {
        problems = problems.filter(p => p.isBookmarked);
      }
    } else {
      // Unauthenticated users default
      problems = problems.map(prob => ({
        ...prob,
        status: 'Unsolved',
        isBookmarked: false
      }));

      // If filters requested for logged-in only, return empty or filter out
      if (status && status !== 'Unsolved') {
        problems = [];
      }
      if (bookmarked === 'true') {
        problems = [];
      }
    }

    // 4. Sorting
    if (sortBy) {
      switch (sortBy) {
        case 'difficulty':
          const diffWeight = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          problems.sort((a, b) => diffWeight[a.difficulty] - diffWeight[b.difficulty]);
          break;
        case 'acceptanceRate':
          problems.sort((a, b) => b.acceptanceRate - a.acceptanceRate);
          break;
        case 'newest':
          problems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'oldest':
          problems.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'alphabetical':
          problems.sort((a, b) => a.title.localeCompare(b.title));
          break;
        default:
          break;
      }
    }

    // 5. Pagination
    const startIndex = (page - 1) * limit;
    const paginatedProblems = problems.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      problems: paginatedProblems,
      total: problems.length,
      page: parseInt(page),
      pages: Math.ceil(problems.length / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single problem by ID (includes sample test cases, bookmarks and user notes)
const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id).lean();
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Fetch sample test cases (visible)
    const testCases = await TestCase.find({ problemId: problem._id, isSample: true }).lean();

    let isBookmarked = false;
    let userNote = null;
    let hasSolved = false;

    if (req.user && req.user.id) {
      const userId = req.user.id;
      const bookmark = await Bookmark.findOne({ userId, problemId: problem._id });
      isBookmarked = !!bookmark;

      userNote = await Note.findOne({ userId, problemId: problem._id }).lean();

      const solvedSubmission = await Submission.findOne({ userId, problemId: problem._id, status: 'Accepted' });
      hasSolved = !!solvedSubmission;
    }

    res.json({
      problem,
      testCases,
      isBookmarked,
      userNote,
      hasSolved
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin CRUD Operations
const createProblem = async (req, res) => {
  try {
    const { title, description, difficulty, topic, inputFormat, outputFormat, constraints, examples, starterCode, hints, companyTags, points } = req.body;
    
    if (!title || !description || !difficulty || !topic) {
      return res.status(400).json({ message: 'Title, description, difficulty, and topic are required' });
    }

    const problem = new Problem({
      title,
      description,
      difficulty,
      topic,
      inputFormat,
      outputFormat,
      constraints,
      examples,
      starterCode,
      hints,
      companyTags,
      points
    });

    await problem.save();
    res.status(201).json(problem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json(problem);
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
    // Delete linked testcases
    await TestCase.deleteMany({ problemId: req.params.id });
    res.json({ message: 'Problem and associated test cases deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem
};
