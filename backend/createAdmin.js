const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected');

    const existingAdmin = await User.findOne({
      role: 'admin'
    });

    if (existingAdmin) {
      console.log('Admin account already exists.');
      process.exit(0);
    }

    const password = 'Admin@12345';

    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@peterlawfirm.com',
      password,
      role: 'admin'
    });

    console.log('----------------------------------');
    console.log('Initial Admin Created Successfully');
    console.log('Email:', admin.email);
    console.log('Password:', password);
    console.log('Role:', admin.role);
    console.log('----------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin:', error.message);
    process.exit(1);
  }
};

createAdmin();