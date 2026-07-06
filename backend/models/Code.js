const mongoose = require('mongoose');

const codeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  language: { type: String, required: true },
  code: { type: String, required: true },
  input: { type: String },
  output: { type: String },
  status: { type: String, default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Code', codeSchema);