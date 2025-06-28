// In-memory cache implementation for API responses
class MemoryCache {
    constructor(defaultTTL = 300000) { // 5 minutes default
        this.cache = new Map();
        this.defaultTTL = defaultTTL;
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0
        };
    }

    generateKey(req) {
        // Create cache key from URL and query parameters
        const baseKey = req.originalUrl || req.url;
        const queryString = JSON.stringify(req.query);
        return `${baseKey}:${queryString}`;
    }

    set(key, value, ttl = null) {
        const expiry = Date.now() + (ttl || this.defaultTTL);
        this.cache.set(key, {
            value,
            expiry,
            createdAt: Date.now()
        });
        this.stats.sets++;
        
        // Auto-cleanup expired entries
        this.cleanup();
    }

    get(key) {
        const item = this.cache.get(key);
        
        if (!item) {
            this.stats.misses++;
            return null;
        }
        
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            this.stats.misses++;
            return null;
        }
        
        this.stats.hits++;
        return item.value;
    }

    delete(key) {
        return this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
        this.stats = { hits: 0, misses: 0, sets: 0 };
    }

    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
            }
        }
    }

    getStats() {
        const total = this.stats.hits + this.stats.misses;
        return {
            ...this.stats,
            hitRate: total > 0 ? (this.stats.hits / total * 100).toFixed(2) + '%' : '0%',
            size: this.cache.size
        };
    }
}

// Global cache instance
const cache = new MemoryCache();

// Cache middleware factory
function cacheMiddleware(options = {}) {
    const {
        ttl = 300000, // 5 minutes default
        keyGenerator = null,
        condition = () => true
    } = options;

    return (req, res, next) => {
        // Skip caching for non-GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Check condition
        if (!condition(req)) {
            return next();
        }

        const key = keyGenerator ? keyGenerator(req) : cache.generateKey(req);
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            // Add cache headers
            res.set({
                'X-Cache': 'HIT',
                'X-Cache-Key': key,
                'X-Cache-TTL': ttl
            });
            
            return res.json(cachedResponse);
        }

        // Store original json method
        const originalJson = res.json;

        // Override json method to cache response
        res.json = function(data) {
            // Cache the response
            cache.set(key, data, ttl);
            
            // Add cache headers
            res.set({
                'X-Cache': 'MISS',
                'X-Cache-Key': key,
                'X-Cache-TTL': ttl
            });

            // Call original json method
            return originalJson.call(this, data);
        };

        next();
    };
}

// Specific cache configurations for different endpoints
const cacheConfigs = {
    // Dashboard data - cache for 2 minutes
    dashboard: cacheMiddleware({
        ttl: 120000, // 2 minutes
        condition: (req) => !req.query.realtime
    }),

    // Suppliers data - cache for 5 minutes
    suppliers: cacheMiddleware({
        ttl: 300000, // 5 minutes
        keyGenerator: (req) => `suppliers:${JSON.stringify(req.query)}`
    }),

    // System health - cache for 30 seconds
    health: cacheMiddleware({
        ttl: 30000, // 30 seconds
    }),

    // Performance metrics - cache for 1 minute
    metrics: cacheMiddleware({
        ttl: 60000, // 1 minute
    })
};

// Cache invalidation helpers
function invalidateCache(pattern) {
    const keys = Array.from(cache.cache.keys());
    const regex = new RegExp(pattern);
    
    let invalidated = 0;
    keys.forEach(key => {
        if (regex.test(key)) {
            cache.delete(key);
            invalidated++;
        }
    });
    
    return invalidated;
}

// Cache statistics endpoint
function getCacheStats() {
    return cache.getStats();
}

module.exports = {
    cache,
    cacheMiddleware,
    cacheConfigs,
    invalidateCache,
    getCacheStats
}; 