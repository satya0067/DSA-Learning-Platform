const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, default: 120 }, // in minutes
  participants: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      score: { type: Number, default: 0 },
      penaltyTime: { type: Number, default: 0 }, // in minutes from start
      submissions: [
        {
          problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
          status: { type: String },
          timeSolved: { type: Date }
        }
      ]
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contest', contestSchema);
