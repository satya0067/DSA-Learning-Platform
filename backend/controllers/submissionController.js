const { getSupabase } = require('../config/supabase');
const judgeService = require('../services/judgeService');
const codeExecutor = require('../services/codeExecutor');

// Helper to award gamification rewards to user
const awardUserRewards = async (userId, points, coinsAwarded = 5, category = 'practice') => {
  const supabase = getSupabase();
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (userError || !user) return null;

  const currentXp = (user.xp || 0) + points;
  const currentPracticeScore = (user.practice_score || 0) + points;
  const completedChallenges = (user.completed_challenges || 0) + 1;

  // Level up calculation: 100 XP per level
  const oldLevel = user.level || 1;
  const newLevel = Math.floor(currentXp / 100) + 1;
  let leveledUp = false;
  let rank = user.rank || 'Mizunoto 🌙';

  if (newLevel > oldLevel) {
    leveledUp = true;
    if (newLevel >= 11) rank = 'Hashira ⚔️';
    else if (newLevel >= 9) rank = 'Hinoto ☀️';
    else if (newLevel >= 7) rank = 'Kanoe 🌫️';
    else if (newLevel >= 5) rank = 'Kanoto ⚡';
    else if (newLevel >= 3) rank = 'Mizunoe 💧';
    else rank = 'Mizunoto 🌙';
  }

  const streak = (user.streak || 0) + 1;

  await supabase
    .from('users')
    .update({
      xp: currentXp,
      practice_score: currentPracticeScore,
      completed_challenges: completedChallenges,
      level: newLevel,
      rank,
      streak
    })
    .eq('id', userId);

  // Send Notification
  let notificationMsg = `⚔️ Problem Solved! You earned +${points} XP and became stronger.`;
  if (leveledUp) {
    notificationMsg += ` 🎉 LEVEL UP! You reached Level ${newLevel} (${rank})!`;
  }

  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title: 'Milestone Reached',
      message: notificationMsg,
      type: 'milestone'
    });

  return { user: { ...user, xp: currentXp, level: newLevel, rank, streak }, leveledUp, pointsEarned: points };
};

// Run custom input execution or sample test cases
const runCode = async (req, res) => {
  try {
    const supabase = getSupabase();
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

    const { data: testCases, error } = await supabase
      .from('test_cases')
      .select('*')
      .eq('problem_id', problemId)
      .eq('is_sample', true);

    if (error || !testCases || testCases.length === 0) {
      return res.status(400).json({ message: 'No sample test cases found for this problem' });
    }

    const formattedCases = testCases.map(tc => ({
      input: tc.input,
      expectedOutput: tc.expected_output
    }));

    const judgeResult = await judgeService.judge(language, code, formattedCases);
    res.json(judgeResult);
  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Submit code execution (Evaluated against all visible + hidden test cases)
const submitCode = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { problemId, language, code } = req.body;
    const userId = req.user.id;

    if (!problemId || !language || !code) {
      return res.status(400).json({ message: 'Problem ID, language, and code are required' });
    }

    const { data: problem, error: problemError } = await supabase
      .from('problems')
      .select('*')
      .eq('id', problemId)
      .maybeSingle();

    if (problemError || !problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // 1. Gather all test cases
    const { data: testCasesData } = await supabase
      .from('test_cases')
      .select('*')
      .eq('problem_id', problemId);

    const allTestCases = (testCasesData || []).map(tc => ({
      input: tc.input,
      expectedOutput: tc.expected_output
    }));

    if (allTestCases.length === 0) {
      return res.status(400).json({ message: 'No test cases configured for this problem' });
    }

    // 2. Judge Code
    const judgeResult = await judgeService.judge(language, code, allTestCases);

    // 3. Save Submission Record
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .insert({
        user_id: userId,
        problem_id: problemId,
        code,
        language,
        status: judgeResult.status,
        runtime: judgeResult.runtime || 0,
        memory: judgeResult.memory || 0,
        error_output: judgeResult.errorOutput || ''
      })
      .select()
      .single();

    if (subError) throw subError;

    // 4. Update Problem Stats
    const totalSubmissions = (problem.total_submissions || 0) + 1;
    const successCount = (problem.success_count || 0) + (judgeResult.status === 'Accepted' ? 1 : 0);
    const acceptanceRate = Math.round((successCount / totalSubmissions) * 100);

    await supabase
      .from('problems')
      .update({
        total_submissions: totalSubmissions,
        success_count: successCount,
        acceptance_rate: acceptanceRate
      })
      .eq('id', problemId);

    // 5. If Accepted, process gamification rewards
    let rewardResult = null;
    if (judgeResult.status === 'Accepted') {
      // Check if user solved before
      const { data: priorAccepted } = await supabase
        .from('submissions')
        .select('id')
        .eq('user_id', userId)
        .eq('problem_id', problemId)
        .eq('status', 'Accepted')
        .neq('id', submission.id)
        .limit(1);

      if (!priorAccepted || priorAccepted.length === 0) {
        const pointsToAward = problem.points || 10;
        rewardResult = await awardUserRewards(userId, pointsToAward, 5, 'practice');
      }
    }

    res.json({
      submissionId: submission.id,
      _id: submission.id,
      status: judgeResult.status,
      runtime: judgeResult.runtime,
      memory: judgeResult.memory,
      errorOutput: judgeResult.errorOutput,
      failedTestCaseIndex: judgeResult.failedTestCaseIndex,
      reward: rewardResult
    });
  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Fetch submission history for a specific problem
const getSubmissionsHistory = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { problemId } = req.params;
    const userId = req.user.id;

    const { data: history, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', userId)
      .eq('problem_id', problemId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    const formattedHistory = (history || []).map(h => ({
      _id: h.id,
      id: h.id,
      userId: h.user_id,
      problemId: h.problem_id,
      code: h.code,
      language: h.language,
      status: h.status,
      runtime: h.runtime,
      memory: h.memory,
      errorOutput: h.error_output,
      submittedAt: h.submitted_at
    }));

    res.json(formattedHistory);
  } catch (error) {
    console.error('Get submission history error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  runCode,
  submitCode,
  getSubmissionsHistory
};
