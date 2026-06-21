const cache = new Map();

const DEFAULT_MAX = 100;

function cacheKey(prefix, obj) {
  return `${prefix}:${JSON.stringify(obj)}`;
}

function get(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function set(key, value, ttlMs) {
  if (cache.size >= DEFAULT_MAX) {
    const oldest = cache.entries().next().value;
    if (oldest) cache.delete(oldest[0]);
  }
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

function clear() {
  cache.clear();
}

module.exports = { get, set, clear };
