const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const { getSupabase } = require('./config/supabase');

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

// API health route (supports both /api/ping and /ping)
app.get(['/api/ping', '/ping'], (req, res) => {
  res.send('API is running (Supabase Edition)');
});

// Diagnostic database status route for Supabase (supports both /api/db-status and /db-status)
app.get(['/api/db-status', '/db-status'], async (req, res) => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';
  const maskedUrl = url ? url.replace(/^(https?:\/\/[^.]+).*/, '$1.supabase.co') : 'NOT SET';
  const maskedKey = key ? key.substring(0, 8) + '...' : 'NOT SET';

  const envInfo = {
    SUPABASE_URL_configured: Boolean(url),
    SUPABASE_KEY_configured: Boolean(key),
    JWT_SECRET_configured: Boolean(process.env.JWT_SECRET),
    isVercel: Boolean(process.env.VERCEL)
  };

  try {
    const supabase = getSupabase();
    const { count: usersCount, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (userError) throw userError;

    const { count: problemsCount } = await supabase
      .from('problems')
      .select('*', { count: 'exact', head: true });

    const isLocalMode = process.env.USE_LOCAL_DB === 'true';

    res.json({
      status: 'success',
      database: isLocalMode ? 'connected (Local Development Mode)' : 'connected',
      provider: isLocalMode ? 'Local JSON Storage (backend/data/local_db.json)' : 'Supabase (PostgreSQL)',
      supabaseUrl: maskedUrl,
      tableCounts: {
        users: usersCount || 0,
        problems: problemsCount || 0
      },
      environment: envInfo,
      ...(isLocalMode ? { note: 'Running locally without cloud credentials. To connect to Supabase, add SUPABASE_URL and SUPABASE_ANON_KEY to .env.' } : {})
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      provider: 'Supabase (PostgreSQL)',
      errorMessage: err.message,
      supabaseUrl: maskedUrl,
      environment: envInfo,
      troubleshooting: [
        !url ? 'CRITICAL: SUPABASE_URL is missing. Add it in Vercel Settings -> Environment Variables.' : 'URL detected: ' + maskedUrl,
        !key ? 'CRITICAL: SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) is missing. Add it in Vercel Settings -> Environment Variables.' : 'Key detected: ' + maskedKey,
        'Make sure you ran the SQL script (supabase-schema.sql) in your Supabase SQL Editor.',
        'IMPORTANT: In Vercel, go to Deployments -> ... -> Redeploy after saving Environment Variables.'
      ]
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Helper to mount routes supporting both /api/<prefix> and /<prefix> (essential for Vercel serverless rewrites)
const mountRoute = (pathPrefix, router) => {
  app.use(`/api${pathPrefix}`, router);
  app.use(pathPrefix, router);
};

// Routes
mountRoute('/auth', authRoutes);
mountRoute('/admin', adminRoutes);
mountRoute('/progress', progressRoutes);
mountRoute('/quiz', quizRoutes);
mountRoute('/code', codeRoutes);
mountRoute('/problems', problemRoutes);
mountRoute('/submissions', submissionRoutes);
mountRoute('/bookmarks', bookmarkRoutes);
mountRoute('/notes', noteRoutes);
mountRoute('/discussions', discussionRoutes);
mountRoute('/leaderboard', leaderboardRoutes);
mountRoute('/contests', contestRoutes);
mountRoute('/challenges', challengeRoutes);
mountRoute('/notifications', notificationRoutes);

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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} with Supabase`);
  });
}

module.exports = app;
