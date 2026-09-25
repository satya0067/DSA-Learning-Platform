const { getSupabase } = require('../config/supabase');

const defaultQuizData = {
  title: 'DSA Fundamentals Quiz',
  topic: 'general',
  difficulty: 'easy',
  questions: [
    {
      id: 'q1',
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
      correctAnswer: 1,
      explanation: 'Binary search divides the search space in half at each step, yielding O(log n) complexity.'
    },
    {
      id: 'q2',
      question: 'Which data structure uses FIFO?',
      options: ['Stack', 'Queue', 'Tree', 'Graph'],
      correctAnswer: 1,
      explanation: 'Queue follows First-In, First-Out (FIFO) ordering.'
    },
    {
      id: 'q3',
      question: 'Which data structure uses LIFO?',
      options: ['Queue', 'Stack', 'Array', 'Tree'],
      correctAnswer: 1,
      explanation: 'Stack follows Last-In, First-Out (LIFO) ordering.'
    },
    {
      id: 'q4',
      question: 'What is the time complexity of merge sort?',
      options: ['O(n^2)', 'O(n log n)', 'O(n)', 'O(log n)'],
      correctAnswer: 1,
      explanation: 'Merge sort always splits the list in halves and merges in linear time, guaranteeing O(n log n).'
    },
    {
      id: 'q5',
      question: 'Which algorithm uses a stack?',
      options: ['BFS', 'DFS', 'Dijkstra', 'Prim'],
      correctAnswer: 1,
      explanation: 'Depth-First Search (DFS) uses a recursion stack or an explicit stack data structure.'
    }
  ]
};

const ensureDefaultQuizExists = async () => {
  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from('quizzes')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (!existing) {
    const { data: created } = await supabase
      .from('quizzes')
      .insert({
        title: defaultQuizData.title,
        topic: defaultQuizData.topic,
        difficulty: defaultQuizData.difficulty,
        questions: defaultQuizData.questions
      })
      .select()
      .single();
    return created;
  }
  return existing;
};

// GET all quizzes
const getQuizzes = async (req, res) => {
  try {
    const supabase = getSupabase();
    let { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('*');

    if (error) throw error;

    if (!quizzes || quizzes.length === 0) {
      const defaultQuiz = await ensureDefaultQuizExists();
      quizzes = [defaultQuiz];
    }

    // Strip correctAnswer for client safety
    const safeQuizzes = quizzes.map(q => ({
      _id: q.id,
      id: q.id,
      title: q.title,
      topic: q.topic,
      difficulty: q.difficulty,
      questions: (q.questions || []).map(quest => ({
        _id: quest.id || quest._id,
        id: quest.id || quest._id,
        question: quest.question,
        options: quest.options,
        hint: quest.hint
      }))
    }));

    res.json(safeQuizzes);
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: error.message });
  }
};

// CREATE quiz
const createQuiz = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { title, topic, difficulty, questions } = req.body;

    const { data: quiz, error } = await supabase
      .from('quizzes')
      .insert({
        title,
        topic: topic || 'general',
        difficulty: difficulty || 'all',
        questions: questions || []
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ _id: quiz.id, id: quiz.id, ...quiz });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET quiz by ID
const getQuizById = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const safeQuiz = {
      _id: quiz.id,
      id: quiz.id,
      title: quiz.title,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      questions: (quiz.questions || []).map(q => ({
        _id: q.id || q._id,
        id: q.id || q._id,
        question: q.question,
        options: q.options,
        hint: q.hint
      }))
    };

    res.json(safeQuiz);
  } catch (error) {
    console.error('Get quiz by id error:', error);
    res.status(500).json({ error: error.message });
  }
};

// RANDOM QUIZ
const getRandomQuiz = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { topic, difficulty, limit } = req.query;

    let query = supabase.from('quizzes').select('*');
    if (topic && topic !== 'all' && topic !== 'general') {
      query = query.ilike('topic', `%${topic}%`);
    }

    const { data: quizzes } = await query;

    let quiz = null;
    if (quizzes && quizzes.length > 0) {
      quiz = quizzes[Math.floor(Math.random() * quizzes.length)];
    } else {
      quiz = await ensureDefaultQuizExists();
    }

    const clientQuestions = (quiz.questions || []).map(q => ({
      _id: q.id || q._id,
      id: q.id || q._id,
      question: q.question,
      options: q.options,
      hint: q.hint
    }));

    res.json({
      _id: quiz.id,
      id: quiz.id,
      title: quiz.title,
      questions: clientQuestions
    });
  } catch (error) {
    console.error('Get random quiz error:', error);
    res.status(500).json({ error: error.message });
  }
};

// SUBMIT QUIZ
const submitQuiz = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const { answers } = req.body;
    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers must be array' });
    }

    let score = 0;
    const questions = quiz.questions || [];

    if (answers.length > 0 && typeof answers[0] === 'object' && answers[0] !== null && 'questionId' in answers[0]) {
      const answerMap = new Map();
      answers.forEach(({ questionId, answer }) => {
        if (questionId !== undefined && answer !== undefined) {
          answerMap.set(String(questionId), answer);
        }
      });

      questions.forEach((q, index) => {
        const key = String(q.id || q._id || index);
        const submitted = answerMap.get(key);
        if (submitted === q.correctAnswer) {
          score++;
        }
      });
    } else {
      questions.forEach((q, i) => {
        if (answers[i] === q.correctAnswer) {
          score++;
        }
      });
    }

    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    let userUpdates = null;

    if (req.user && req.user.id) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.user.id)
        .maybeSingle();

      if (user) {
        const isPassed = percentage >= 60;
        const newQuizzesPassed = (user.quizzes_passed || 0) + (isPassed ? 1 : 0);
        const newXp = (user.xp || 0) + percentage;
        const oldLevel = user.level || 1;
        const newLevel = Math.floor(newXp / 100) + 1;
        const levelUp = newLevel > oldLevel;

        let rank = user.rank || 'Mizunoto 🌙';
        if (newLevel >= 11) rank = 'Hashira ⚔️';
        else if (newLevel >= 9) rank = 'Tsuguko 💠';
        else if (newLevel >= 7) rank = 'Pillar-in-Training 💎';
        else if (newLevel >= 5) rank = 'Kinoe 🔥';
        else if (newLevel >= 3) rank = 'Kinoto 💧';
        else rank = 'Mizunoto 🌙';

        const newPracticeScore = Math.round(
          (((user.practice_score || 0) * (newQuizzesPassed - (isPassed ? 1 : 0))) + percentage) / (newQuizzesPassed || 1)
        );
        const streak = Math.min((user.streak || 0) + 1, 365);

        await supabase
          .from('users')
          .update({
            quizzes_passed: newQuizzesPassed,
            xp: newXp,
            level: newLevel,
            rank,
            practice_score: newPracticeScore,
            streak
          })
          .eq('id', user.id);

        userUpdates = {
          xp: newXp,
          level: newLevel,
          rank,
          levelUp,
          quizzesPassed: newQuizzesPassed,
          practiceScore: newPracticeScore,
          streak
        };
      }
    }

    res.json({
      score,
      total: questions.length,
      percentage,
      correctAnswers: questions.map(q => q.correctAnswer),
      explanations: questions.map(q => q.explanation || ''),
      hints: questions.map(q => q.hint || ''),
      userUpdates
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
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