const Bookmark = require('../models/Bookmark');

const toggleBookmark = async (req, res) => {
  try {
    const { problemId, listName = 'Favorites' } = req.body;
    const userId = req.user.id;

    if (!problemId) {
      return res.status(400).json({ message: 'Problem ID is required' });
    }

    const existing = await Bookmark.findOne({ userId, problemId, listName });
    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      return res.json({ bookmarked: false, message: 'Removed from bookmarks' });
    } else {
      const bookmark = new Bookmark({ userId, problemId, listName });
      await bookmark.save();
      return res.json({ bookmarked: true, message: 'Added to bookmarks' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookmarks = await Bookmark.find({ userId }).populate('problemId').lean();
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  toggleBookmark,
  getBookmarks
};
