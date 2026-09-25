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
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL || process.env.DATABASE_URL || '';
  const maskedUri = uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'NOT SET';

  const envInfo = {
    MONGODB_URI_configured: Boolean(process.env.MONGODB_URI),
    MONGO_URI_configured: Boolean(process.env.MONGO_URI),
    JWT_SECRET_configured: Boolean(process.env.JWT_SECRET),
    isVercel: Boolean(process.env.VERCEL)
  };

  try {
    const connectDB = require('./config/db');
    await connectDB();
    res.json({
      status: 'success',
      database: 'connected',
      connectionState: mongoose.connection.readyState === 1 ? 'connected' : mongoose.connection.readyState,
      databaseHost: mongoose.connection.host || 'unknown',
      databaseName: mongoose.connection.name || 'unknown',
      detectedUri: maskedUri,
      environment: envInfo
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      errorMessage: err.message,
      detectedUri: maskedUri,
      environment: envInfo,
      troubleshooting: [
        !uri ? 'CRITICAL: No MongoDB URI found in environment variables. Add MONGODB_URI in Vercel Settings -> Environment Variables.' : 'URI detected: ' + maskedUri,
        'Ensure MongoDB Atlas -> Network Access has 0.0.0.0/0 (Allow Access from Anywhere) enabled.',
        'Ensure your Database User password in MongoDB Atlas has no < > brackets and matches your connection string.',
        'IMPORTANT: In Vercel, after updating Environment Variables, go to Deployments -> ... -> Redeploy.'
      ]
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Middleware to guard database routes if connection failed
const requireDB = (req, res, next) => {
  if (req.dbError) {
    return res.status(500).json({
      error: 'Database Connection Error',
      message: 'Failed to connect to MongoDB database.',
      details: req.dbError,
      suggestion: 'Visit /api/db-status for full diagnostic information.'
    });
  }
  next();
};

// Routes
app.use('/api/auth', requireDB, authRoutes);
app.use('/api/admin', requireDB, adminRoutes);
app.use('/api/progress', requireDB, progressRoutes);
app.use('/api/quiz', requireDB, quizRoutes);
app.use('/api/code', requireDB, codeRoutes);
app.use('/api/problems', requireDB, problemRoutes);
app.use('/api/submissions', requireDB, submissionRoutes);
app.use('/api/bookmarks', requireDB, bookmarkRoutes);
app.use('/api/notes', requireDB, noteRoutes);
app.use('/api/discussions', requireDB, discussionRoutes);
app.use('/api/leaderboard', requireDB, leaderboardRoutes);
app.use('/api/contests', requireDB, contestRoutes);
app.use('/api/challenges', requireDB, challengeRoutes);
app.use('/api/notifications', requireDB, notificationRoutes);

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
