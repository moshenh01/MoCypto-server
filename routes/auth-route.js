const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate name length and format
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }
    // Validate name contains only letters and spaces
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      return res.status(400).json({ message: 'Name must contain only letters and spaces' });
    }

    // Validate password length (for request that not necessarily from the frontend)
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Validate email exists and is a string
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email is required' });
    }


    // Remove any MongoDB operators and sanitize
    const sanitizedEmail = email.toLowerCase().trim(); // prevent noSQL injection

    // Check if user exists in db
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }


    // Create user (trim name to remove extra spaces)
    const user = new User({
      name: name.trim(),
      email: sanitizedEmail,
      passwordHash: password, 
    });

    // the hashing id done in User.js with 10 rounds of salt
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      // 12 hours
      { expiresIn: '7h' }
    )

    // send the token and user data to the client
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasPreferences: !!user.preferences.investorType, //for onboarding page
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email exists and is a string
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Remove any MongoDB operators and sanitize
    const sanitizedEmail = email.toLowerCase().trim(); // prevent noSQL injection

    // Find user
    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user has password hash
    if (!user.passwordHash) {
      return res.status(500).json({ message: 'User data error' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update lastSeenAt
    user.lastSeenAt = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasPreferences: !!user.preferences.investorType,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

module.exports = router;

