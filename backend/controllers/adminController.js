const { getSupabase } = require('../config/supabase');

// 1. Dashboard Overview Stats
const getStats = async (req, res) => {
  try {
    const supabase = getSupabase();

    const [
      { count: totalUsers },
      { count: totalProblems },
      { count: totalSubmissions },
      { count: totalContests },
      { count: totalQuizzes },
      { count: acceptedSubmissions },
      { data: recentUsers },
      { data: recentSubmissions }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('problems').select('*', { count: 'exact', head: true }),
      supabase.from('submissions').select('*', { count: 'exact', head: true }),
      supabase.from('contests').select('*', { count: 'exact', head: true }),
      supabase.from('quizzes').select('*', { count: 'exact', head: true }),
      supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'Accepted'),
      supabase.from('users').select('id, username, email, role, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('submissions').select('*, users(username, email), problems(title, difficulty)').order('submitted_at', { ascending: false }).limit(5)
    ]);

    const totalSub = totalSubmissions || 0;
    const acceptedSub = acceptedSubmissions || 0;
    const globalAcceptanceRate = totalSub > 0
      ? Math.round((acceptedSub / totalSub) * 100)
      : 0;

    res.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalProblems: totalProblems || 0,
        totalSubmissions: totalSub,
        totalContests: totalContests || 0,
        totalQuizzes: totalQuizzes || 0,
        acceptedSubmissions: acceptedSub,
        globalAcceptanceRate
      },
      recentUsers: (recentUsers || []).map(u => ({ _id: u.id, id: u.id, ...u })),
      recentSubmissions: (recentSubmissions || []).map(s => ({
        _id: s.id,
        id: s.id,
        status: s.status,
        submittedAt: s.submitted_at,
        userId: s.users,
        problemId: s.problems
      }))
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

// 2. User Management
const getUsers = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { search, role, page = 1, limit = 50 } = req.query;

    let query = supabase.from('users').select('id, username, email, role, level, xp, rank, streak, created_at', { count: 'exact' });

    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    const { data: users, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const formattedUsers = (users || []).map(u => ({
      _id: u.id,
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      level: u.level,
      xp: u.xp,
      rank: u.rank,
      streak: u.streak,
      createdAt: u.created_at
    }));

    res.json({
      users: formattedUsers,
      total: count || 0,
      page: parseInt(page),
      pages: Math.ceil((count || 0) / parseInt(limit))
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { role } = req.body;
    const allowedRoles = ['student', 'mentor', 'instructor', 'admin'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Must be one of: ${allowedRoles.join(', ')}` });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', req.params.id)
      .select('id, username, email, role')
      .single();

    if (error) throw error;
    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const supabase = getSupabase();
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: error.message });
  }
};

// 3. Problem Management with Test Cases
const getAdminProblems = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { search, difficulty, topic } = req.query;

    let query = supabase.from('problems').select('*, test_cases(id, is_sample)');

    if (difficulty && difficulty !== 'all') query = query.eq('difficulty', difficulty);
    if (topic && topic !== 'all') query = query.eq('topic', topic);
    if (search) {
      query = query.or(`title.ilike.%${search}%,topic.ilike.%${search}%`);
    }

    const { data: problems, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    const formatted = (problems || []).map(prob => {
      const testCases = prob.test_cases || [];
      return {
        _id: prob.id,
        id: prob.id,
        title: prob.title,
        description: prob.description,
        difficulty: prob.difficulty,
        topic: prob.topic,
        points: prob.points,
        acceptanceRate: prob.acceptance_rate,
        totalSubmissions: prob.total_submissions,
        sampleCount: testCases.filter(tc => tc.is_sample).length,
        hiddenCount: testCases.filter(tc => !tc.is_sample).length,
        createdAt: prob.created_at
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Admin get problems error:', error);
    res.status(500).json({ error: error.message });
  }
};

const createProblemWithTestCases = async (req, res) => {
  try {
    const supabase = getSupabase();
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

    const { data: problem, error: probError } = await supabase
      .from('problems')
      .insert({
        title,
        description,
        difficulty,
        topic,
        input_format: inputFormat || '',
        output_format: outputFormat || '',
        constraints: constraints || '',
        points: points || (difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 20 : 30),
        starter_code: starterCode || []
      })
      .select()
      .single();

    if (probError) throw probError;

    // Insert test cases
    const allCases = [];
    if (Array.isArray(sampleTestCases)) {
      sampleTestCases.forEach(tc => {
        if (tc.input !== undefined && tc.expectedOutput !== undefined) {
          allCases.push({
            problem_id: problem.id,
            input: tc.input || '',
            expected_output: tc.expectedOutput || '',
            is_sample: true
          });
        }
      });
    }

    if (Array.isArray(hiddenTestCases)) {
      hiddenTestCases.forEach(tc => {
        if (tc.input !== undefined && tc.expectedOutput !== undefined) {
          allCases.push({
            problem_id: problem.id,
            input: tc.input || '',
            expected_output: tc.expectedOutput || '',
            is_sample: false
          });
        }
      });
    }

    if (allCases.length > 0) {
      await supabase.from('test_cases').insert(allCases);
    }

    res.status(201).json({ message: 'Problem and test cases created successfully', problem });
  } catch (error) {
    console.error('Admin create problem error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateProblemWithTestCases = async (req, res) => {
  try {
    const supabase = getSupabase();
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

    const { data: problem, error: probError } = await supabase
      .from('problems')
      .update({
        title,
        description,
        difficulty,
        topic,
        input_format: inputFormat,
        output_format: outputFormat,
        constraints,
        points: Number(points),
        starter_code: starterCode
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (probError) throw probError;

    if (Array.isArray(sampleTestCases) || Array.isArray(hiddenTestCases)) {
      await supabase.from('test_cases').delete().eq('problem_id', req.params.id);

      const allCases = [];
      if (Array.isArray(sampleTestCases)) {
        sampleTestCases.forEach(tc => {
          if (tc.input !== undefined && tc.expectedOutput !== undefined) {
            allCases.push({
              problem_id: req.params.id,
              input: tc.input || '',
              expected_output: tc.expectedOutput || '',
              is_sample: true
            });
          }
        });
      }
      if (Array.isArray(hiddenTestCases)) {
        hiddenTestCases.forEach(tc => {
          if (tc.input !== undefined && tc.expectedOutput !== undefined) {
            allCases.push({
              problem_id: req.params.id,
              input: tc.input || '',
              expected_output: tc.expectedOutput || '',
              is_sample: false
            });
          }
        });
      }

      if (allCases.length > 0) {
        await supabase.from('test_cases').insert(allCases);
      }
    }

    res.json({ message: 'Problem updated successfully', problem });
  } catch (error) {
    console.error('Admin update problem error:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteProblem = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('problems')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Problem and test cases deleted successfully' });
  } catch (error) {
    console.error('Admin delete problem error:', error);
    res.status(500).json({ error: error.message });
  }
};

// 4. Contest Management
const getAdminContests = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: contests, error } = await supabase
      .from('contests')
      .select('*')
      .order('start_time', { ascending: false });

    if (error) throw error;
    res.json(contests || []);
  } catch (error) {
    console.error('Admin get contests error:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteContest = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('contests')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Contest deleted successfully' });
  } catch (error) {
    console.error('Admin delete contest error:', error);
    res.status(500).json({ error: error.message });
  }
};

// 5. Quiz Management
const getAdminQuizzes = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(quizzes || []);
  } catch (error) {
    console.error('Admin get quizzes error:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Admin delete quiz error:', error);
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
