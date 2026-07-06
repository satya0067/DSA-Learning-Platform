const Progress = require('../models/Progress');

const getProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user.id });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { topic, completed, score } = req.body;
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const progress = await Progress.findOneAndUpdate(
      { userId: req.user.id, topic },
      { completed, score, updatedAt: Date.now() },
      { upsert: true, new: true }
    );
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getProgress, updateProgress };
