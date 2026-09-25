const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getSupabase } = require('../config/supabase');

const register = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { username, email, password, role } = req.body;
    const normalizedRole = ['student', 'mentor', 'instructor'].includes(role) ? role : 'student';

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Check if user exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id, email, username')
      .or(`email.eq.${email.toLowerCase().trim()},username.eq.${username.trim()}`)
      .limit(1);

    if (checkError) throw checkError;

    if (existingUsers && existingUsers.length > 0) {
      return res.status(409).json({ message: 'Username or email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: normalizedRole,
        level: 1,
        xp: 0,
        rank: 'Mizunoto 🌙',
        streak: 1,
        practice_score: 0,
        quizzes_passed: 0,
        total_hours: 0,
        completed_challenges: 0,
        breathing_style: 'Flame'
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') { // Unique constraint violation
        return res.status(409).json({ message: 'Username or email already in use' });
      }
      throw insertError;
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'structlearn_default_jwt_secret';
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '7d' });

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, role, bio, level, xp, rank, streak, practice_score, quizzes_passed, total_hours, completed_challenges, avatar, breathing_style, created_at')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) throw error;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Format fields to match frontend expectations (camelCase aliases if needed)
    res.json({
      _id: user.id,
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      bio: user.bio,
      level: user.level,
      xp: user.xp,
      rank: user.rank,
      streak: user.streak,
      practiceScore: user.practice_score,
      quizzesPassed: user.quizzes_passed,
      totalHours: user.total_hours,
      completedChallenges: user.completed_challenges,
      avatar: user.avatar,
      breathingStyle: user.breathing_style,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { username, bio, breathingStyle, avatar, totalHours, completedChallenges } = req.body;

    const updates = {};
    if (username !== undefined) updates.username = username.trim();
    if (bio !== undefined) updates.bio = bio;
    if (breathingStyle !== undefined) updates.breathing_style = breathingStyle;
    if (avatar !== undefined) updates.avatar = avatar;
    if (totalHours !== undefined) updates.total_hours = Number(totalHours) || 0;
    if (completedChallenges !== undefined) updates.completed_challenges = Number(completedChallenges) || 0;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, username, email, role, bio, level, xp, rank, streak, practice_score, quizzes_passed, total_hours, completed_challenges, avatar, breathing_style, created_at')
      .single();

    if (error) throw error;

    res.json({
      _id: updatedUser.id,
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      bio: updatedUser.bio,
      level: updatedUser.level,
      xp: updatedUser.xp,
      rank: updatedUser.rank,
      streak: updatedUser.streak,
      practiceScore: updatedUser.practice_score,
      quizzesPassed: updatedUser.quizzes_passed,
      totalHours: updatedUser.total_hours,
      completedChallenges: updatedUser.completed_challenges,
      avatar: updatedUser.avatar,
      breathingStyle: updatedUser.breathing_style,
      createdAt: updatedUser.created_at
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Email, current password, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, password')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', user.id);

    if (updateError) throw updateError;

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, password, role')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Administrator accounts cannot be reset via public password recovery.' });
    }

    const newPasswordMatchesCurrent = await bcrypt.compare(newPassword, user.password);
    if (newPasswordMatchesCurrent) {
      return res.status(400).json({ message: 'New password must be different from current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', user.id);

    if (updateError) throw updateError;

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, changePassword, forgotPassword };