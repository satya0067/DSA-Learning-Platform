const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
  topic: {
    type: String,
    required: true,
    enum: [
      'Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 'HashMap',
      'Trees', 'BST', 'Graphs', 'Trie', 'Heap', 'Backtracking',
      'Greedy', 'Bit Manipulation', 'Sliding Window', 'Binary Search',
      'DP', 'Math', 'Recursion'
    ]
  },
  inputFormat: { type: String, default: '' },
  outputFormat: { type: String, default: '' },
  constraints: { type: String, default: '' },
  examples: [
    {
      input: { type: String, default: '' },
      output: { type: String, default: '' },
      explanation: { type: String, default: '' },
      image: { type: String, default: '' }
    }
  ],
  starterCode: [
    {
      language: { type: String, required: true }, // e.g. python, java, c, cpp, javascript
      code: { type: String, required: true }
    }
  ],
  hints: [{ type: String }],
  companyTags: [{ type: String }],
  acceptanceRate: { type: Number, default: 0 },
  totalSubmissions: { type: Number, default: 0 },
  successCount: { type: Number, default: 0 },
  points: { type: Number, default: 10 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Problem', problemSchema);
