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

