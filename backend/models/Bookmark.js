const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  listName: { type: String, default: 'Favorites' }, // 'Favorites', 'Revision', or custom strings
  createdAt: { type: Date, default: Date.now }
});

// Ensure a user can only bookmark a problem once per list name
bookmarkSchema.index({ userId: 1, problemId: 1, listName: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
