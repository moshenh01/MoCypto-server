const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');

// GET endpoint to fetch user's votes
router.get('/', auth, async (req, res) => {
  try {
    const votes = await Feedback.find({ userId: req.user._id });
    
    // Convert to a map for easy lookup: { "targetType-targetId": vote }
    const votesMap = {};
    votes.forEach(feedback => {
      const key = `${feedback.targetType}-${feedback.targetId}`;
      votesMap[key] = feedback.vote;
    });
    
    res.json({ votes: votesMap });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { targetType, targetId, vote } = req.body;

    if (!targetType || !targetId || !vote) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!['news', 'price', 'insight', 'meme'].includes(targetType)) {
      return res.status(400).json({ message: 'Invalid targetType' });
    }

    if (vote !== 1 && vote !== -1) {
      return res.status(400).json({ message: 'Vote must be 1 or -1' });
    }

    // Validate targetId is a string and doesn't contain operators
    if (typeof targetId !== 'string' || targetId.length === 0) {
      return res.status(400).json({ message: 'Invalid targetId' });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      userId: req.user._id,
      targetType,
      targetId,
    });

    if (existingFeedback) {
      // Update existing feedback
      existingFeedback.vote = vote;
      await existingFeedback.save();
      return res.json({ message: 'Feedback updated', feedback: existingFeedback });
    }

    // Create new feedback
    const feedback = new Feedback({
      userId: req.user._id,
      targetType,
      targetId,
      vote,
    });

    await feedback.save();

    res.status(201).json({
      message: 'Feedback saved',
      feedback,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

