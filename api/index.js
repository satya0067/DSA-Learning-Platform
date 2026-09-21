const connectDB = require('../backend/config/db');
const app = require('../backend/server');

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('MongoDB connection failure in serverless entrypoint:', error);
    return res.status(500).json({
      error: 'Database Connection Error',
      message: 'Failed to connect to MongoDB. Please ensure MONGODB_URI in Vercel Environment Variables is correct and MongoDB Atlas Network Access has 0.0.0.0/0 allowed.'
    });
  }
};
