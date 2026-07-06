const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  xpReward: { type: Number, default: 50 },
  coinsReward: { type: Number, default: 10 },
  badgeName: { type: String, required: true }, // e.g. "Arrays Hashira", "Streak Demon"
  category: { type: String, enum: ['problems', 'streaks', 'contests', 'quizzes'], default: 'problems' },
  requirementCount: { type: Number, required: true } // threshold count to unlock
});

module.exports = mongoose.model('Achievement', achievementSchema);
