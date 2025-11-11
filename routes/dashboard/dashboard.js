const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Feedback = require('../../models/Feedback');
const { getMarketNews } = require('./services/newsService');
const { getCoinPrices } = require('./services/priceService');
const { getAIInsight } = require('./services/insightService');
const { getRandomMeme } = require('./services/memeService');

router.get('/', auth, async (req, res) => {
  try {
    const user = req.user;
    const preferences = user.preferences || {};

    // Debug logging for preferences
    console.log('Dashboard route - User preferences:', JSON.stringify(preferences, null, 2));
    console.log('Dashboard route - Assets requested:', preferences.assets || []);

    // Validate and sanitize assets array
    let assets = preferences.assets || [];
    if (!Array.isArray(assets)) {
      assets = [];
    }
    // Sanitize assets - ensure they are strings and don't contain MongoDB operators
    assets = assets
      .filter(asset => typeof asset === 'string' && asset.length > 0)
      .filter(asset => !asset.includes('$') && !asset.includes('{') && !asset.includes('}'))
      .slice(0, 100); // Limit to prevent DoS

      console.log('starting dashboard route');
    // Fetch all dashboard data and user votes in parallel
    const [news, prices, insight, meme, votes] = await Promise.all([
      getMarketNews(),
      getCoinPrices(assets),
      getAIInsight(preferences),
      Promise.resolve(getRandomMeme()),
      Feedback.find({ userId: user._id }),
    ]);

    // Convert votes to a map for easy lookup: { "targetType-targetId": vote }
    const votesMap = {};
    votes.forEach(feedback => {
      const key = `${feedback.targetType}-${feedback.targetId}`;
      votesMap[key] = feedback.vote;
    });

    // Debug logging
    console.log('Dashboard response - News count:', news?.length || 0);
    console.log('Dashboard response - Prices count:', prices?.length || 0);
    console.log('Dashboard response - Prices data:', prices?.map(p => p.coinId));
    console.log('Dashboard response - Content types:', preferences.contentTypes);

    res.json({
      news,
      prices,
      insight,
      meme,
      votes: votesMap,
      preferences: {
        assets: preferences.assets || [],
        investorType: preferences.investorType || '',
        contentTypes: preferences.contentTypes || [],
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard route error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

