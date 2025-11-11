const mongoose = require('mongoose');

const cachedNewsSchema = new mongoose.Schema({
  source: {
    type: String,
    enum: ['cryptopanic', 'fallback'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  fetchedAt: {
    type: Date,
    default: Date.now,
  },
});

// TTL index - auto-delete documents after 1 hour (longer than cache TTL to allow expired cache usage)
// delete the news chache after 1 hours
cachedNewsSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 1 * 60 * 60 });

// Index for faster lookups
cachedNewsSchema.index({ fetchedAt: -1 });

module.exports = mongoose.model('CachedNews', cachedNewsSchema);

