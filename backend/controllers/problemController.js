const { getSupabase } = require('../config/supabase');

const formatProblem = (p) => ({
  _id: p.id,
  id: p.id,
  title: p.title,
  description: p.description,
  difficulty: p.difficulty,
  topic: p.topic,
  inputFormat: p.input_format,
  outputFormat: p.output_format,
  constraints: p.constraints,
  examples: p.examples || [],
  starterCode: p.starter_code || [],
  hints: p.hints || [],
  companyTags: p.company_tags || [],
  acceptanceRate: p.acceptance_rate || 0,
  totalSubmissions: p.total_submissions || 0,
  successCount: p.success_count || 0,
  points: p.points || 10,
  createdAt: p.created_at
});

// Get all problems with filtering, search, sorting, and pagination
const getProblems = async (req, res) => {
  try {
    const supabase = getSupabase();
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

    let query = supabase.from('problems').select('*');

    if (difficulty) query = query.eq('difficulty', difficulty);
    if (topic) query = query.eq('topic', topic);

    if (search) {
      query = query.or(`title.ilike.%${search}%,topic.ilike.%${search}%`);
    }

    const { data: rawProblems, error } = await query;
    if (error) throw error;

    let problems = (rawProblems || []).map(formatProblem);

    // 3. User-Specific Annotations (if logged in)
    if (req.user && req.user.id) {
      const userId = req.user.id;

      // Fetch user's submissions
      const { data: submissions } = await supabase
        .from('submissions')
        .select('problem_id, status')
        .eq('user_id', userId);

      const solvedProblemIds = new Set(
        (submissions || []).filter(s => s.status === 'Accepted').map(s => s.problem_id)
      );
      const attemptedProblemIds = new Set(
        (submissions || []).map(s => s.problem_id)
      );

      // Fetch user's bookmarks
      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('problem_id')
        .eq('user_id', userId);

      const bookmarkedProblemIds = new Set((bookmarks || []).map(b => b.problem_id));

      // Annotate problems
      problems = problems.map(prob => {
        const idStr = prob.id;
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
          problems.sort((a, b) => (diffWeight[a.difficulty] || 0) - (diffWeight[b.difficulty] || 0));
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
    console.error('Get problems error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single problem by ID (includes sample test cases, bookmarks and user notes)
const getProblemById = async (req, res) => {
  try {
    const supabase = getSupabase();
    const problemId = req.params.id;

    const { data: rawProblem, error: problemError } = await supabase
      .from('problems')
      .select('*')
      .eq('id', problemId)
      .maybeSingle();

    if (problemError) throw problemError;
    if (!rawProblem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const problem = formatProblem(rawProblem);

    // Fetch sample test cases (visible)
    const { data: testCasesData } = await supabase
      .from('test_cases')
      .select('*')
      .eq('problem_id', problemId)
      .eq('is_sample', true);

    const testCases = (testCasesData || []).map(tc => ({
      _id: tc.id,
      id: tc.id,
      problemId: tc.problem_id,
      input: tc.input,
      expectedOutput: tc.expected_output,
      isSample: tc.is_sample
    }));

    let isBookmarked = false;
    let userNote = null;
    let hasSolved = false;

    if (req.user && req.user.id) {
      const userId = req.user.id;

      const { data: bookmark } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('problem_id', problemId)
        .maybeSingle();
      isBookmarked = !!bookmark;

      const { data: note } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .eq('problem_id', problemId)
        .maybeSingle();
      userNote = note ? { _id: note.id, content: note.content } : null;

      const { data: solvedSubmission } = await supabase
        .from('submissions')
        .select('id')
        .eq('user_id', userId)
        .eq('problem_id', problemId)
        .eq('status', 'Accepted')
        .limit(1)
        .maybeSingle();
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
    console.error('Get problem by id error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Admin CRUD Operations
const createProblem = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { title, description, difficulty, topic, inputFormat, outputFormat, constraints, examples, starterCode, hints, companyTags, points } = req.body;
    
    if (!title || !description || !difficulty || !topic) {
      return res.status(400).json({ message: 'Title, description, difficulty, and topic are required' });
    }

    const { data: newProblem, error } = await supabase
      .from('problems')
      .insert({
        title,
        description,
        difficulty,
        topic,
        input_format: inputFormat || '',
        output_format: outputFormat || '',
        constraints: constraints || '',
        examples: examples || [],
        starter_code: starterCode || [],
        hints: hints || [],
        company_tags: companyTags || [],
        points: Number(points) || 10
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(formatProblem(newProblem));
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateProblem = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { title, description, difficulty, topic, inputFormat, outputFormat, constraints, examples, starterCode, hints, companyTags, points } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (difficulty !== undefined) updates.difficulty = difficulty;
    if (topic !== undefined) updates.topic = topic;
    if (inputFormat !== undefined) updates.input_format = inputFormat;
    if (outputFormat !== undefined) updates.output_format = outputFormat;
    if (constraints !== undefined) updates.constraints = constraints;
    if (examples !== undefined) updates.examples = examples;
    if (starterCode !== undefined) updates.starter_code = starterCode;
    if (hints !== undefined) updates.hints = hints;
    if (companyTags !== undefined) updates.company_tags = companyTags;
    if (points !== undefined) updates.points = Number(points);

    const { data: updatedProblem, error } = await supabase
      .from('problems')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!updatedProblem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json(formatProblem(updatedProblem));
  } catch (error) {
    console.error('Update problem error:', error);
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
    res.json({ message: 'Problem and associated test cases deleted successfully' });
  } catch (error) {
    console.error('Delete problem error:', error);
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
