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
const adminRoutes = require('./routes/adminRoutes');

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

// Diagnostic database status route
app.get('/api/db-status', async (req, res) => {
  const mongoose = require('mongoose');
  const uri = process.env.MONGODB_URI || '';
  const maskedUri = uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'NOT SET';

  const readyStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  try {
    const connectDB = require('./config/db');
    await connectDB();
    res.json({
      status: 'success',
      database: 'connected',
      connectionState: readyStateMap[mongoose.connection.readyState] || mongoose.connection.readyState,
      databaseHost: mongoose.connection.host || 'unknown',
      databaseName: mongoose.connection.name || 'unknown',
      maskedUri: maskedUri,
      jwtSecretConfigured: Boolean(process.env.JWT_SECRET)
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      errorMessage: err.message,
      maskedUri: maskedUri,
      jwtSecretConfigured: Boolean(process.env.JWT_SECRET),
      troubleshooting: {
        step1: 'Ensure MONGODB_URI is added in Vercel -> Settings -> Environment Variables.',
        step2: 'Ensure MongoDB Atlas -> Network Access has 0.0.0.0/0 (Allow Access from Anywhere) enabled.',
        step3: 'Ensure your MongoDB Atlas Database User password in the connection string has no < > brackets.',
        step4: 'Make sure to REDEPLOY your project in Vercel after updating Environment Variables.'
      }
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
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
const codeEditorDist = path.join(__dirname, '..', 'code editor', 'dist');
app.use('/code-editor', express.static(codeEditorDist));
app.get(['/code-editor', '/code-editor/*'], (req, res) => {
  res.sendFile(path.join(codeEditorDist, 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use(require('./middleware/errorMiddleware'));

const PORT = process.env.PORT || 3000;

// Start server AFTER DB connect only when executed directly
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch((err) => {
    console.error('Failed to start server:', err);
  });
}

module.exports = app;
