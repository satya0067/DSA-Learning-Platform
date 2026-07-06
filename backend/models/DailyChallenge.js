const mongoose = require('mongoose');

const dailyChallengeSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  date: { type: String, required: true, unique: true }, // Format: YYYY-MM-DD
  pointsReward: { type: Number, default: 20 },
  claimedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('DailyChallenge', dailyChallengeSchema);
