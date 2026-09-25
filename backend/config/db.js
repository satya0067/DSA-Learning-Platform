const mongoose = require('mongoose');

const connectDB = async () => {
  // If already connected, return existing connection
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const MONGODB_URI = 
    process.env.MONGODB_URI || 
    process.env.MONGO_URI || 
    process.env.MONGODB_URL || 
    process.env.DATABASE_URL || 
    (process.env.VERCEL ? null : 'mongodb://127.0.0.1:27017/structlearn');

  if (!MONGODB_URI) {
    const errorMsg = 'MONGODB_URI environment variable is missing on Vercel. Please add MONGODB_URI in Vercel Dashboard -> Settings -> Environment Variables, and click Redeploy.';
    console.error('❌ ' + errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    if (process.env.NODE_ENV !== 'production' && require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

// Optional logs
mongoose.connection.on('connected', () => {
  console.log('📦 Mongoose connected');
});

mongoose.connection.on('error', (err) => {
  console.error('⚠️ Mongoose error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('❌ Mongoose disconnected');
});

module.exports = connectDB;