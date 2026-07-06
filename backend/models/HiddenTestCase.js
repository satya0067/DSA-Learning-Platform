const mongoose = require('mongoose');

const hiddenTestCaseSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  input: { type: String, default: '' },
  expectedOutput: { type: String, default: '' }
});

module.exports = mongoose.model('HiddenTestCase', hiddenTestCaseSchema);
