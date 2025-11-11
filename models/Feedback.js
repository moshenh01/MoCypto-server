const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetType: {
    type: String,
    enum: ['news', 'price', 'insight', 'meme'],
    required: true,
  },
  // targetId is the id of the target object (news, price, insight, meme)
  targetId: {
    type: String,
    required: true,
  },
  vote: {
    type: Number,
    enum: [1, -1],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Feedback', feedbackSchema);

