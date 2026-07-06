const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  content: { type: String, required: true },
  isRevision: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
});

noteSchema.index({ userId: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model('Note', noteSchema);
