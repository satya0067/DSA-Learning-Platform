const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/structlearn';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
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