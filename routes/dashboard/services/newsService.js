const axios = require('axios');
const CachedNews = require('../../../models/CachedNews');

const formatCachedNews = (items) => items.map(item => ({
  id: item._id.toString(),
  title: item.title,
  url: item.url,
  source: 'CryptoPanic',
  published_at: item.createdAt || item.fetchedAt,
  summary: item.summary || item.title,
  tags: item.tags || [],
}));

const getCachedNews = async (expired = false) => {
  // delete the news cache after 1 hour
  const CACHE_TTL = 1 * 60 * 60 * 1000; 
  const query = expired 
    ? { source: 'cryptopanic' }
    : { source: 'cryptopanic', fetchedAt: { $gte: new Date(Date.now() - CACHE_TTL) } };
  
  return await CachedNews.find(query).sort({ fetchedAt: -1 }).limit(5);
};

const getMarketNews = async () => {
  const now = new Date();
  const freshCache = await getCachedNews(false);
  
  if (freshCache.length > 0) {
    console.log(`getCachedNews: Returning ${freshCache.length} items from cache`);
    return formatCachedNews(freshCache);
  }

  if (!process.env.CRYPTOPANIC_API_KEY) {
    const expiredCache = await getCachedNews(true);
    if (expiredCache.length > 0) {
      console.log(`getCachedNews: No API key, returning ${expiredCache.length} items from expired cache`);
      return formatCachedNews(expiredCache);
    }
    return [];
  }

  const anyCachedNews = await getCachedNews(true);

  try {
    const response = await axios.get('https://cryptopanic.com/api/developer/v2/posts/', {
      params: {
        auth_token: process.env.CRYPTOPANIC_API_KEY,
        public: true,
        filter: 'hot',
      },
      timeout: 5000,
    });
    
    const results = response.data?.results || response.data?.data || [];
    if (!results?.length) {
      console.log('getCachedNews: API returned no results');
      return [];
    }

    const newsItems = results
      .map((item, index) => {
        const title = item.title || '';
        let url = item.original_url || item.url || '';
        if (!url && item.slug) url = `https://cryptopanic.com/news/${item.slug}/`;
        if (!url) url = `https://cryptopanic.com/news/${item.slug || item.id}/`;
        
        return {
          id: item.id ? `news-${item.id}` : `news-${index}`,
          title,
          url,
          source: item.source?.title || item.source?.domain || 'CryptoPanic',
          published_at: item.published_at || item.created_at || new Date().toISOString(),
          summary: item.description || item.title || '',
          tags: (item.instruments || []).map(inst => inst.code || inst.title || '').filter(Boolean),
        };
      })
      .filter(item => item.title)
      .slice(0, 5);

    await Promise.all(
      newsItems
        .filter(news => news.url && news.url !== '#')
        .map(news => new CachedNews({
          source: 'cryptopanic',
          title: news.title,
          url: news.url,
          summary: news.summary || '',
          tags: news.tags || [],
          createdAt: new Date(news.published_at),
          fetchedAt: now,
        }).save())
    );

    console.log(`getCachedNews: Returning ${newsItems.length} items from API`);
    return newsItems;
  } catch (error) {
    if (error.response?.status === 429) {
      console.warn('getCachedNews: Rate limit exceeded, using cache');
      const cachedData = anyCachedNews.length > 0 ? anyCachedNews : await getCachedNews(true);
      if (cachedData.length > 0) {
        console.log(`getCachedNews: Returning ${cachedData.length} items from cache (rate limit)`);
        return formatCachedNews(cachedData);
      }
      return [];
    }
    
    console.error('getCachedNews: API error:', error.message);
    const cachedData = anyCachedNews.length > 0 ? anyCachedNews : await getCachedNews(true);
    if (cachedData.length > 0) {
      console.log(`getCachedNews: Returning ${cachedData.length} items from cache (error fallback)`);
      return formatCachedNews(cachedData);
    }
    return [];
  }
};

module.exports = { getMarketNews };

