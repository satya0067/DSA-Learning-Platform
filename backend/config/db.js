const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/structlearn';

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log(`✅ MongoDB Connected: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('❌ Database connection error:', error.message);
    if (process.env.NODE_ENV !== 'production' && require.main === module) {
      process.exit(1);
    }
    throw error;
  }

  return cached.conn;
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