const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user preferences
router.put('/', auth, async (req, res) => {
  try {
    const { assets, investorType, contentTypes } = req.body;
    // Validate assets is an array
    if (!Array.isArray(assets)) {
      return res.status(400).json({ message: 'Assets must be an array' });
    }

    // Validate contentTypes is an array
    if (!Array.isArray(contentTypes)) {
      return res.status(400).json({ message: 'Content types must be an array' });
    }
    // Validate investorType is a string
    if (typeof investorType !== 'string') {
      return res.status(400).json({ message: 'Investor type must be a string' });
    }

    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (assets !== undefined) user.preferences.assets = assets;
    if (investorType !== undefined) user.preferences.investorType = investorType;
    if (contentTypes !== undefined) user.preferences.contentTypes = contentTypes;

    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

