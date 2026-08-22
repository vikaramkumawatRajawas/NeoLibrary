import NodeCache from 'node-cache';

// Default TTL: 1 hour (3600 seconds), check period: 2 minutes
const appCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

export function getCache(key) {
  return appCache.get(key);
}

export function setCache(key, value, ttlSeconds = 3600) {
  return appCache.set(key, value, ttlSeconds);
}

export function clearCache(key) {
  if (key) {
    appCache.del(key);
  } else {
    appCache.flushAll();
  }
}
