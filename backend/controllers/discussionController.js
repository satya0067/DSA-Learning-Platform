const Discussion = require('../models/Discussion');
const Comment = require('../models/Comment');

// Fetch all discussion threads for a specific problem
const getDiscussions = async (req, res) => {
  try {
    const { problemId } = req.params;
    const discussions = await Discussion.find({ problemId })
      .populate('userId', 'username avatar level rank')
      .sort({ createdAt: -1 })
      .lean();

    res.json(discussions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch a single thread details with its comments
const getDiscussionById = async (req, res) => {
  try {
    const { id } = req.params;
    const thread = await Discussion.findById(id)
      .populate('userId', 'username avatar level rank')
      .lean();
      
    if (!thread) {
      return res.status(404).json({ message: 'Discussion thread not found' });
    }

    const comments = await Comment.find({ discussionId: id })
      .populate('userId', 'username avatar level rank')
      .sort({ createdAt: 1 })
      .lean();

    res.json({ thread, comments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new discussion thread
const createDiscussion = async (req, res) => {
  try {
    const { problemId, title, content } = req.body;
    const userId = req.user.id;

    if (!problemId || !title || !content) {
      return res.status(400).json({ message: 'Problem ID, title, and content are required' });
    }

    const thread = new Discussion({
      problemId,
      userId,
      title,
      content
    });

    await thread.save();
    
    const populated = await Discussion.findById(thread._id).populate('userId', 'username avatar level rank');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a comment or reply to a thread
const createComment = async (req, res) => {
  try {
    const { id } = req.params; // Thread ID (discussionId)
    const { content, parentId = null } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const comment = new Comment({
      discussionId: id,
      userId,
      parentId,
      content
    });

    await comment.save();

    const populated = await Comment.findById(comment._id).populate('userId', 'username avatar level rank');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Like/Unlike discussion thread
const toggleLikeDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const thread = await Discussion.findById(id);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    const likedIndex = thread.likes.indexOf(userId);
    if (likedIndex > -1) {
      thread.likes.splice(likedIndex, 1);
    } else {
      thread.likes.push(userId);
    }

    await thread.save();
    res.json({ likes: thread.likes.length, isLiked: thread.likes.includes(userId) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Like/Unlike comments
const toggleLikeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const likedIndex = comment.likes.indexOf(userId);
    if (likedIndex > -1) {
      comment.likes.splice(likedIndex, 1);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    res.json({ likes: comment.likes.length, isLiked: comment.likes.includes(userId) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDiscussions,
  getDiscussionById,
  createDiscussion,
  createComment,
  toggleLikeDiscussion,
  toggleLikeComment
};
