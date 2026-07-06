const mongoose = require('mongoose');

const editorialSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true, unique: true },
  approaches: [
    {
      title: { type: String, required: true }, // e.g. "Brute Force", "Hashing", "Optimal"
      description: { type: String, required: true },
      code: { type: String, required: true },
      language: { type: String, default: 'python' },
      timeComplexity: { type: String, default: 'O(N)' },
      spaceComplexity: { type: String, default: 'O(1)' }
    }
  ],
  videoUrl: { type: String, default: '' },
  complexityAnalysis: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Editorial', editorialSchema);
