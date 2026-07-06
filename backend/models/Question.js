const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    type: [String],
    validate: [arr => arr.length === 4, 'Must have exactly 4 options']
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  topic: {
    type: String,
    required: true,
    enum: ['arrays', 'linked-lists', 'trees', 'stacks-queues', 'graphs', 'sorting', 'general']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard']
  },
  hint: { type: String, required: true },
  explanation: { type: String, required: true }
});

module.exports = mongoose.model('Question', questionSchema);
