const Note = require('../models/Note');

const getNote = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id;

    const note = await Note.findOne({ userId, problemId }).lean();
    res.json(note || { content: '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const saveNote = async (req, res) => {
  try {
    const { problemId, content, isRevision = false } = req.body;
    const userId = req.user.id;

    if (!problemId) {
      return res.status(400).json({ message: 'Problem ID is required' });
    }

    const note = await Note.findOneAndUpdate(
      { userId, problemId },
      { content, isRevision, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id;

    await Note.deleteOne({ userId, problemId });
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getNote,
  saveNote,
  deleteNote
};
