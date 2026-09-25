const { getSupabase } = require('../config/supabase');

// Fetch all discussion threads for a specific problem
const getDiscussions = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { problemId } = req.params;

    const { data: discussions, error } = await supabase
      .from('discussions')
      .select('*, users(id, username, avatar, level, rank)')
      .eq('problem_id', problemId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = (discussions || []).map(d => ({
      _id: d.id,
      id: d.id,
      problemId: d.problem_id,
      userId: d.users ? {
        _id: d.users.id,
        id: d.users.id,
        username: d.users.username,
        avatar: d.users.avatar,
        level: d.users.level,
        rank: d.users.rank
      } : null,
      title: d.title,
      content: d.content,
      upvotes: d.upvotes,
      tags: d.tags,
      createdAt: d.created_at
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Fetch a single thread details with its comments
const getDiscussionById = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { id } = req.params;

    const { data: thread, error: threadError } = await supabase
      .from('discussions')
      .select('*, users(id, username, avatar, level, rank)')
      .eq('id', id)
      .maybeSingle();

    if (threadError || !thread) {
      return res.status(404).json({ message: 'Discussion thread not found' });
    }

    const { data: comments, error: commentError } = await supabase
      .from('comments')
      .select('*, users(id, username, avatar, level, rank)')
      .eq('discussion_id', id)
      .order('created_at', { ascending: true });

    if (commentError) throw commentError;

    res.json({
      thread: {
        _id: thread.id,
        id: thread.id,
        title: thread.title,
        content: thread.content,
        userId: thread.users,
        createdAt: thread.created_at
      },
      comments: (comments || []).map(c => ({
        _id: c.id,
        id: c.id,
        content: c.content,
        userId: c.users,
        createdAt: c.created_at
      }))
    });
  } catch (error) {
    console.error('Get discussion by id error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new discussion thread
const createDiscussion = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { problemId, title, content } = req.body;
    const userId = req.user.id;

    if (!problemId || !title || !content) {
      return res.status(400).json({ message: 'Problem ID, title, and content are required' });
    }

    const { data: thread, error } = await supabase
      .from('discussions')
      .insert({
        problem_id: problemId,
        user_id: userId,
        title,
        content
      })
      .select('*, users(id, username, avatar, level, rank)')
      .single();

    if (error) throw error;
    res.status(201).json({
      _id: thread.id,
      id: thread.id,
      title: thread.title,
      content: thread.content,
      userId: thread.users,
      createdAt: thread.created_at
    });
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add a comment or reply to a thread
const createComment = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { id } = req.params; // discussion_id
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        discussion_id: id,
        user_id: userId,
        content
      })
      .select('*, users(id, username, avatar, level, rank)')
      .single();

    if (error) throw error;
    res.status(201).json({
      _id: comment.id,
      id: comment.id,
      content: comment.content,
      userId: comment.users,
      createdAt: comment.created_at
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: error.message });
  }
};

const toggleLikeDiscussion = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { id } = req.params;

    const { data: thread } = await supabase
      .from('discussions')
      .select('upvotes')
      .eq('id', id)
      .maybeSingle();

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    const newUpvotes = (thread.upvotes || 0) + 1;
    await supabase.from('discussions').update({ upvotes: newUpvotes }).eq('id', id);

    res.json({ likes: newUpvotes, isLiked: true });
  } catch (error) {
    console.error('Toggle like discussion error:', error);
    res.status(500).json({ error: error.message });
  }
};

const toggleLikeComment = async (req, res) => {
  res.json({ success: true });
};

module.exports = {
  getDiscussions,
  getDiscussionById,
  createDiscussion,
  createComment,
  toggleLikeDiscussion,
  toggleLikeComment
};
