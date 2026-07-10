const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

dotenv.config();

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const progressRoutes = require('./routes/progressRoutes');
const quizRoutes = require('./routes/quizRoutes');
const codeRoutes = require('./routes/codeRoutes');
const problemRoutes = require('./routes/problemRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const noteRoutes = require('./routes/noteRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const contestRoutes = require('./routes/contestRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const frontendPath = path.join(__dirname, '..', 'frontend');

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Serve frontend static files
app.use(express.static(frontendPath));
app.use('/frontend', express.static(frontendPath));

// API health route
app.get('/api/ping', (req, res) => {
  res.send('API is running');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve standalone React-based code editor app under /code-editor
app.use('/code-editor', express.static(path.join(__dirname, '..', 'code editor', 'dist')));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use(require('./middleware/errorMiddleware'));

const PORT = process.env.PORT || 3000;

// Start server AFTER DB connect
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
