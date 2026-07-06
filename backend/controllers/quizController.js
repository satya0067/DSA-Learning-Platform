const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Question = require('../models/Question');

const defaultQuizData = {
  title: 'DSA Fundamentals Quiz',
  questions: [
    {
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
      correctAnswer: 1
    },
    {
      question: 'Which data structure uses FIFO?',
      options: ['Stack', 'Queue', 'Tree', 'Graph'],
      correctAnswer: 1
    },
    {
      question: 'Which data structure uses LIFO?',
      options: ['Queue', 'Stack', 'Array', 'Tree'],
      correctAnswer: 1
    },
    {
      question: 'What is the time complexity of merge sort?',
      options: ['O(n^2)', 'O(n log n)', 'O(n)', 'O(log n)'],
      correctAnswer: 1
    },
    {
      question: 'Which algorithm uses a stack?',
      options: ['BFS', 'DFS', 'Dijkstra', 'Prim'],
      correctAnswer: 1
    },
    {
      question: 'What is the space complexity of quicksort?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'],
      correctAnswer: 1
    },
    {
      question: 'Which of these is NOT a linear data structure?',
      options: ['Array', 'Queue', 'Stack', 'Tree'],
      correctAnswer: 3
    },
    {
      question: 'What is the time complexity of linear search?',
      options: ['O(log n)', 'O(n)', 'O(1)', 'O(n^2)'],
      correctAnswer: 1
    },
    {
      question: 'How many edges does a tree with n nodes have?',
      options: ['n', 'n-1', 'n+1', '2n'],
      correctAnswer: 1
    },
    {
      question: 'What is the minimum height of a binary search tree with n nodes?',
      options: ['n', 'log n', 'n/2', 'sqrt(n)'],
      correctAnswer: 1
    }
  ]
};

const shuffleArray = (items) => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const ensureDefaultQuizExists = async () => {
  let quiz = await Quiz.findOne();
  if (!quiz) {
    quiz = new Quiz(defaultQuizData);
    await quiz.save();
  }
  return quiz;
};

// GET all quizzes
const getQuizzes = async (req, res) => {
  try {
    let quizzes = await Quiz.find().select('-questions.correctAnswer');

    if (!quizzes || quizzes.length === 0) {
      const defaultQuiz = await ensureDefaultQuizExists();
      quizzes = [await Quiz.findById(defaultQuiz._id).select('-questions.correctAnswer')];
    }

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE quiz
const createQuiz = async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET quiz by ID
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('-questions.correctAnswer');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔥 RANDOM QUIZ (IMPORTANT - Custom Selections)
const getRandomQuiz = async (req, res) => {
  try {
    const { topic, difficulty, limit } = req.query;

    // Parse limit (defaults to 10 questions)
    let limitNum = parseInt(limit) || 10;
    if (limitNum < 1) limitNum = 5;
    if (limitNum > 30) limitNum = 30;

    // Build matching query
    const matchQuery = {};
    if (topic && topic !== 'all' && topic !== 'general') {
      matchQuery.topic = topic;
    }
    if (difficulty && difficulty !== 'all') {
      matchQuery.difficulty = difficulty;
    }

    // Dynamic random question sampling from the pool
    let questions = await Question.aggregate([
      { $match: matchQuery },
      { $sample: { size: limitNum } }
    ]);

    // Fallback if no questions matched the specified filters
    if (!questions || questions.length === 0) {
      questions = await Question.aggregate([
        { $sample: { size: limitNum } }
      ]);
    }

    // Create a new temporary Quiz document with 2-hour TTL expiration
    const topicTitle = topic ? (topic.charAt(0).toUpperCase() + topic.slice(1).replace('-', ' ')) : 'Random';
    const diffTitle = difficulty ? (difficulty.charAt(0).toUpperCase() + difficulty.slice(1)) : 'All';
    const title = `${topicTitle} Training (${diffTitle})`;

    const quizQuestions = questions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      hint: q.hint,
      explanation: q.explanation
    }));

    const newQuiz = new Quiz({
      title,
      topic: topic || 'all',
      difficulty: difficulty || 'all',
      questions: quizQuestions
    });

    await newQuiz.save();

    // Map questions to strip correctAnswer to secure the quiz on client load
    // We explicitly include the hint here so it can be requested by the client on lifeline trigger
    const clientQuestions = newQuiz.questions.map(({ _id, question, options, hint }) => ({
      _id,
      question,
      options,
      hint
    }));

    res.json({
      _id: newQuiz._id,
      title: newQuiz.title,
      questions: clientQuestions
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SUBMIT QUIZ
const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers must be array' });
    }

    let score = 0;

    if (answers.length > 0 && typeof answers[0] === 'object' && answers[0] !== null && 'questionId' in answers[0]) {
      const answerMap = new Map();
      answers.forEach(({ questionId, answer }) => {
        if (questionId !== undefined && answer !== undefined) {
          answerMap.set(String(questionId), answer);
        }
      });

      quiz.questions.forEach((q) => {
        const submitted = answerMap.get(String(q._id));
        if (submitted === q.correctAnswer) {
          score++;
        }
      });
    } else {
      quiz.questions.forEach((q, i) => {
        if (answers[i] === q.correctAnswer) {
          score++;
        }
      });
    }

    const percentage = Math.round((score / quiz.questions.length) * 100);
    let userUpdates = null;

    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id);
      if (user) {
        const isPassed = percentage >= 60;
        if (isPassed) {
          user.quizzesPassed += 1;
        }

        user.xp += percentage;

        const oldLevel = user.level;
        user.level = Math.floor(user.xp / 100) + 1;
        const levelUp = user.level > oldLevel;

        if (user.level >= 11) {
          user.rank = 'Hashira ⚔️';
        } else if (user.level >= 9) {
          user.rank = 'Tsuguko 💠';
        } else if (user.level >= 7) {
          user.rank = 'Pillar-in-Training 💎';
        } else if (user.level >= 5) {
          user.rank = 'Kinoe 🔥';
        } else if (user.level >= 3) {
          user.rank = 'Kinoto 💧';
        } else {
          user.rank = 'Mizunoto 🌙';
        }

        user.practiceScore = Math.round(((user.practiceScore * (user.quizzesPassed - (isPassed ? 1 : 0))) + percentage) / (user.quizzesPassed || 1));
        user.streak = Math.min((user.streak || 0) + 1, 365);

        await user.save();

        userUpdates = {
          xp: user.xp,
          level: user.level,
          rank: user.rank,
          levelUp,
          quizzesPassed: user.quizzesPassed,
          practiceScore: user.practiceScore,
          streak: user.streak
        };
      }
    }

    res.json({
      score,
      total: quiz.questions.length,
      percentage,
      correctAnswers: quiz.questions.map(q => q.correctAnswer),
      explanations: quiz.questions.map(q => q.explanation || ''),
      hints: quiz.questions.map(q => q.hint || ''),
      userUpdates
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getQuizzes,
  createQuiz,
  getQuizById,
  getRandomQuiz,
  submitQuiz
};