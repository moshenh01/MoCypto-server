const mongoose = require('mongoose');

const cachedPriceSchema = new mongoose.Schema({
  coinId: {
    type: String,
    required: true,
    index: true,
  },
  priceUsd: {
    type: Number,
    required: true,
  },
  marketCap: {
    type: Number,
    default: 0,
  },
  change24h: {
    type: Number,
    default: 0,
  },
  fetchedAt: {
    type: Date,
    default: Date.now,
  },
});

// TTL index - auto-delete documents after 10 minutes
cachedPriceSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 10 * 60 });

// Compound index for faster lookups
cachedPriceSchema.index({ coinId: 1, fetchedAt: -1 });

module.exports = mongoose.model('CachedPrice', cachedPriceSchema);

