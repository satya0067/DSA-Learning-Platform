const connectDB = require('../backend/config/db');
const app = require('../backend/server');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    console.error('MongoDB connection failure in serverless entrypoint:', error.message);
    req.dbError = error.message;
  }
  return app(req, res);
};
