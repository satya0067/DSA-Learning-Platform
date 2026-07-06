const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'structlearn_default_jwt_secret';

const generateToken = (payload) => {
  return jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
};

module.exports = generateToken;
