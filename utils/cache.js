// Simple in-memory cache with TTL (Time To Live)
class Cache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, ttl = 300000) { // Default 5 minutes
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

module.exports = new Cache();

