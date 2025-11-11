const axios = require('axios');
const CachedPrice = require('../../../models/CachedPrice');

// Format price object for response
const formatPrice = (price) => ({
  id: `price-${price.coinId}`,
  coinId: price.coinId,
  name: price.coinId.charAt(0).toUpperCase() + price.coinId.slice(1),
  price: price.priceUsd,
  change24h: price.change24h || 0,
  marketCap: price.marketCap || 0,
});

// Group prices by coinId and get most recent for each coin
const groupPricesByCoin = (prices) => {
  const priceMap = new Map();
  prices.forEach(price => {
    // if price dont exist or is older than the current price, set the price
    if (!priceMap.has(price.coinId) || price.fetchedAt > priceMap.get(price.coinId).fetchedAt) {
      priceMap.set(price.coinId, price);
    }
  });
  return priceMap;
};

const getCoinPrices = async (assets) => {


  const coinIds = (Array.isArray(assets) && assets.length > 0 ? assets : ['bitcoin', 'ethereum'])
    .filter(id => typeof id === 'string' && id.length > 0)
    .filter(id => !id.includes('$') && !id.includes('{') && !id.includes('}'))

  // they update the prices every 60 seconds, but it's too much api calls
  // because we can only make 30 requests per minute
  const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  const now = new Date();
  const cacheExpiry = new Date(now.getTime() - CACHE_TTL);

  // get the cached prices from the database, get the prices that are not older than the cache expiry
  const cachedPrices = await CachedPrice.find({
    coinId: { $in: coinIds },
    fetchedAt: { $gte: cacheExpiry }
  }).sort({ fetchedAt: -1 });

  // group the cached prices by coinId and get the most recent for each coin
  const cachedPriceMap = groupPricesByCoin(cachedPrices || []);
  // get the coinIds that are not in the cached prices
  const missingCoinIds = coinIds.filter(id => !cachedPriceMap.has(id));

  // if all the coinIds are in the cached prices, return the cached prices
  if (missingCoinIds.length === 0 && cachedPriceMap.size > 0) {
    console.log(`getCoinPrices: Returning ${cachedPriceMap.size} items from cache`);
    return Array.from(cachedPriceMap.values()).map(formatPrice);
  }

  const coinsToFetch = missingCoinIds.length > 0 ? missingCoinIds : coinIds;
  console.log(`getCoinPrices: Fetching ${coinsToFetch.length} coins from API`);

  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: coinsToFetch.join(','),
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_market_cap: true,
      },
      timeout: 5000,
    });

    for (const [id, data] of Object.entries(response.data)) {
      const priceData = {
        coinId: id,
        priceUsd: data.usd,
        marketCap: data.usd_market_cap || 0,
        change24h: data.usd_24h_change || 0,
        fetchedAt: now,
      };
      await new CachedPrice(priceData).save();
      cachedPriceMap.set(id, priceData);
    }

    console.log(`getCoinPrices: Returning ${cachedPriceMap.size} items from API`);
    return Array.from(cachedPriceMap.values())
      .filter(price => coinIds.includes(price.coinId))
      .map(formatPrice);
  } catch (error) {
    if (error.response?.status === 429) {
      console.warn('getCoinPrices: Rate limit exceeded, using cache');
    } else {
      console.error('getCoinPrices: API error:', error.message);
    }

    const anyCachedPrices = await CachedPrice.find({
      coinId: { $in: coinIds }
    }).sort({ fetchedAt: -1 });

    if (anyCachedPrices?.length > 0) {
      const fallbackMap = groupPricesByCoin(anyCachedPrices);
      const fallbackPrices = Array.from(fallbackMap.values())
        .filter(price => coinIds.includes(price.coinId))
        .map(formatPrice);
      console.log(`getCoinPrices: Returning ${fallbackPrices.length} items from cache (fallback)`);
      return fallbackPrices;
    }

    if (cachedPriceMap.size > 0) {
      const cachedOnlyPrices = Array.from(cachedPriceMap.values())
        .filter(price => coinIds.includes(price.coinId))
        .map(formatPrice);
      console.log(`getCoinPrices: Returning ${cachedOnlyPrices.length} items from cache (error)`);
      return cachedOnlyPrices;
    }

    return [];
  }
};

module.exports = {
  getCoinPrices,
};

