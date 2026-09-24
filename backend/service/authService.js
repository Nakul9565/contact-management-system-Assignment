const jwt = require('jsonwebtoken');
const User = require('../db/User');

const JWT_SECRET = process.env.JWT_SECRET || 'contacthub_secret_2026';

const authService = {
  async signup({ name, email, password }) {
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      const err = new Error('An account with this email already exists.');
      err.errors = { email: 'Email is already registered.' };
      throw err;
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: { id: user._id, name: user.name, email: user.email },
    };
  },

  // Log in user (data pre-validated by Zod)
  async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: { id: user._id, name: user.name, email: user.email },
    };
  },

  // Get user profile by ID
  async getProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found.');
    }
    return { id: user._id, name: user.name, email: user.email };
  },
};

module.exports = authService;
