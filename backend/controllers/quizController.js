const { getSupabase } = require('../config/supabase');
const { quizQuestionsPool } = require('../data/quizQuestionsPool');
const { standardQuizzes } = require('../data/standardQuizzes');

// Helper to shuffle an array
const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Ensure all standard topic trials exist in the database
const ensureStandardQuizzesExist = async () => {
  const supabase = getSupabase();
  const { data: existingQuizzes, error } = await supabase
    .from('quizzes')
    .select('id, title, topic');

  if (error) {
    console.error('Error checking existing quizzes:', error);
  }

  const existingTitles = new Set((existingQuizzes || []).map(q => q.title.toLowerCase()));

  for (const sq of standardQuizzes) {
    if (!existingTitles.has(sq.title.toLowerCase())) {
      try {
        await supabase
          .from('quizzes')
          .insert({
            title: sq.title,
            topic: sq.topic,
            difficulty: sq.difficulty,
            questions: sq.questions
          });
      } catch (insertErr) {
        console.warn(`Could not seed quiz "${sq.title}":`, insertErr.message);
      }
    }
  }

  const { data: allQuizzes } = await supabase.from('quizzes').select('*');
  return allQuizzes || standardQuizzes;
};

// Ensure fallback default quiz exists
const ensureDefaultQuizExists = async () => {
  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from('quizzes')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (!existing) {
    const fallback = standardQuizzes[0];
    const { data: created } = await supabase
      .from('quizzes')
      .insert({
        title: fallback.title,
        topic: fallback.topic,
        difficulty: fallback.difficulty,
        questions: fallback.questions
      })
      .select()
      .single();
    return created || fallback;
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

    if (!quizzes || quizzes.length < standardQuizzes.length) {
      quizzes = await ensureStandardQuizzesExist();
    }

    // Strip correctAnswer for client safety
    const safeQuizzes = (quizzes || []).map(q => ({
      _id: q.id,
      id: q.id,
      title: q.title,
      topic: q.topic,
      difficulty: q.difficulty,
      questions: (q.questions || []).map((quest, idx) => ({
        _id: quest.id || quest._id || `q_${q.id}_${idx}`,
        id: quest.id || quest._id || `q_${q.id}_${idx}`,
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

// CREATE quiz (admin)
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
        questions: (questions || []).map((q, idx) => ({
          id: q.id || `custom_q_${Date.now()}_${idx}`,
          ...q
        }))
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
      questions: (quiz.questions || []).map((q, idx) => ({
        _id: q.id || q._id || `q_${quiz.id}_${idx}`,
        id: q.id || q._id || `q_${quiz.id}_${idx}`,
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

// RANDOM / DYNAMIC QUIZ (Generates custom quiz based on topic, difficulty, and limit)
const getRandomQuiz = async (req, res) => {
  try {
    const supabase = getSupabase();
    let { topic, difficulty, limit } = req.query;

    const reqLimit = Math.max(1, Math.min(parseInt(limit, 10) || 10, 20));
    topic = (topic || 'all').toLowerCase().trim();
    difficulty = (difficulty || 'all').toLowerCase().trim();

    // Map any frontend topic aliases
    if (topic === 'linked-list') topic = 'linked-lists';
    if (topic === 'stack-queue' || topic === 'stacks' || topic === 'queues') topic = 'stacks-queues';

    // Filter question pool
    let candidatePool = quizQuestionsPool;
    if (topic !== 'all' && topic !== 'general') {
      const topicMatches = quizQuestionsPool.filter(q => q.topic === topic);
      if (topicMatches.length > 0) {
        candidatePool = topicMatches;
      }
    }

    let filteredByDiff = candidatePool;
    if (difficulty !== 'all') {
      const diffMatches = candidatePool.filter(q => q.difficulty === difficulty);
      if (diffMatches.length > 0) {
        // If diff matches are enough or available, use them first
        filteredByDiff = diffMatches;
        // If not enough to satisfy reqLimit, backfill with other difficulties from same pool
        if (filteredByDiff.length < reqLimit && candidatePool.length > filteredByDiff.length) {
          const remaining = candidatePool.filter(q => q.difficulty !== difficulty);
          filteredByDiff = [...filteredByDiff, ...shuffle(remaining)];
        }
      }
    }

    // Shuffle and pick exactly the requested limit
    const shuffled = shuffle(filteredByDiff);
    const selectedQuestions = shuffled.slice(0, Math.min(reqLimit, shuffled.length));

    // Ensure all questions have consistent IDs
    const finalQuestions = selectedQuestions.map((q, idx) => ({
      id: q.id || `q_dyn_${Date.now()}_${idx}`,
      _id: q.id || `q_dyn_${Date.now()}_${idx}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      topic: q.topic,
      difficulty: q.difficulty,
      hint: q.hint,
      explanation: q.explanation
    }));

    const topicLabel = topic === 'all' ? 'Master DSA' : topic.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
    const diffLabel = difficulty === 'all' ? 'All Ranks' : difficulty.toUpperCase();
    const quizTitle = `${topicLabel} Concentration Trial (${diffLabel})`;

    // Insert dynamic quiz into DB so submitQuiz can grade against exact questions
    let createdQuiz = null;
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          title: quizTitle,
          topic: topic,
          difficulty: difficulty,
          questions: finalQuestions
        })
        .select()
        .single();

      if (!error && data) {
        createdQuiz = data;
      }
    } catch (insertError) {
      console.warn('Could not persist dynamic quiz to DB:', insertError.message);
    }

    const quizId = createdQuiz ? createdQuiz.id : `dyn_${Date.now()}`;

    // Return client-safe questions
    const clientQuestions = finalQuestions.map(q => ({
      _id: q.id,
      id: q.id,
      question: q.question,
      options: q.options,
      hint: q.hint
    }));

    res.json({
      _id: quizId,
      id: quizId,
      title: quizTitle,
      topic,
      difficulty,
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

    // Map answers by questionId and fallback by index
    const answerMap = new Map();
    answers.forEach((ans, idx) => {
      if (typeof ans === 'object' && ans !== null && 'questionId' in ans) {
        if (ans.questionId !== undefined && ans.answer !== undefined) {
          answerMap.set(String(ans.questionId), ans.answer);
        }
      } else {
        answerMap.set(String(idx), ans);
      }
    });

    const evaluatedQuestions = questions.map((q, index) => {
      const qId = String(q.id || q._id || index);
      const submitted = answerMap.has(qId) ? answerMap.get(qId) : answerMap.get(String(index));
      const isCorrect = submitted !== undefined && submitted === q.correctAnswer;
      if (isCorrect) score++;

      return {
        questionId: q.id || q._id || `q_${index}`,
        userAnswer: submitted !== undefined ? submitted : -1,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation || '',
        hint: q.hint || ''
      };
    });

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
      results: evaluatedQuestions,
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
  submitQuiz,
  ensureStandardQuizzesExist
};