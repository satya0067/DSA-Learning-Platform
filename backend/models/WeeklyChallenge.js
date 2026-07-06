const mongoose = require('mongoose');

const weeklyChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  pointsReward: { type: Number, default: 100 },
  claimedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('WeeklyChallenge', weeklyChallengeSchema);
