const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  bio: { type: String, default: '' },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  rank: { type: String, default: 'Mizunoto 🌙' },
  streak: { type: Number, default: 1 },
  practiceScore: { type: Number, default: 0 },
  quizzesPassed: { type: Number, default: 0 },
  totalHours: { type: Number, default: 0 },
  completedChallenges: { type: Number, default: 0 },
  avatar: { type: String, default: '' },
  breathingStyle: { type: String, default: 'Flame' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);