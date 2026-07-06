const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topic: { type: String },
  difficulty: { type: String },

  questions: [
    {
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
      hint: { type: String },
      explanation: { type: String }
    }
  ],

  createdAt: { type: Date, default: Date.now },
  
  // TTL index to automatically remove temporary quizzes after 2 hours
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 2 * 60 * 60 * 1000),
    index: { expires: 0 }
  }
});

module.exports = mongoose.model('Quiz', quizSchema);