const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const User = require('./models/User');

const createAdmin = async () => {
  try {
    await connectDB();
    console.log('📦 Connected to MongoDB...');

    // Delete if existing
    await User.deleteOne({ email: 'slayer@codecorps.com' });

    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = new User({
      username: 'slayer_admin',
      email: 'slayer@codecorps.com',
      password: hashedPassword,
      role: 'admin',
      bio: 'Flame Hashira of the Code Corps.',
      level: 11,
      xp: 1150,
      rank: 'Hashira ⚔️',
      streak: 5,
      avatar: '',
      breathingStyle: 'Flame'
    });

    await user.save();
    console.log('✅ Admin user "slayer@codecorps.com" created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
    process.exit(1);
  }
};

createAdmin();
