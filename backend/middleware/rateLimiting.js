const rateLimit = require('express-rate-limit');

// Rate limiting configurations for different endpoint types
const rateLimitConfigs = {
    // Authentication endpoints - stricter limits
    auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 attempts per window
        message: {
            error: 'Too many authentication attempts. Please try again later.',
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
            retryAfter: '15 minutes'
        },
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: true, // Don't count successful requests
        skipFailedRequests: false,
        keyGenerator: (req) => req.ip + ':auth'
    },
    
    // API endpoints - moderate limits
    api: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // 100 requests per window
        message: {
            error: 'Too many API requests. Please try again later.',
            code: 'API_RATE_LIMIT_EXCEEDED',
            retryAfter: '15 minutes'
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => req.ip + ':api'
    },
    
    // File upload endpoints - very strict limits
    upload: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10, // 10 uploads per hour
        message: {
            error: 'Too many file uploads. Please try again later.',
            code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
            retryAfter: '1 hour'
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => req.ip + ':upload'
    },
    
    // Password reset endpoints - very strict limits
    passwordReset: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3, // 3 password reset attempts per hour
        message: {
            error: 'Too many password reset requests. Please try again later.',
            code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
            retryAfter: '1 hour'
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => req.ip + ':password-reset'
    },
    
    // Search endpoints - moderate limits
    search: {
        windowMs: 60 * 1000, // 1 minute
        max: 30, // 30 searches per minute
        message: {
            error: 'Too many search requests. Please slow down.',
            code: 'SEARCH_RATE_LIMIT_EXCEEDED',
            retryAfter: '1 minute'
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => req.ip + ':search'
    },
    
    // Database modification endpoints - strict limits
    modification: {
        windowMs: 60 * 1000, // 1 minute
        max: 20, // 20 modifications per minute
        message: {
            error: 'Too many modification requests. Please slow down.',
            code: 'MODIFICATION_RATE_LIMIT_EXCEEDED',
            retryAfter: '1 minute'
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => req.ip + ':modification'
    },
    
    // General endpoints - relaxed limits
    general: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // 1000 requests per window
        message: {
            error: 'Too many requests from this IP. Please try again later.',
            code: 'GENERAL_RATE_LIMIT_EXCEEDED',
            retryAfter: '15 minutes'
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => req.ip + ':general'
    }
};

// Create rate limiters
const rateLimiters = {};
Object.keys(rateLimitConfigs).forEach(key => {
    rateLimiters[key] = rateLimit(rateLimitConfigs[key]);
});

// Custom rate limiter for authenticated users (higher limits)
const authenticatedUserLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per window for authenticated users
    message: {
        error: 'Too many requests. Please try again later.',
        code: 'AUTHENTICATED_RATE_LIMIT_EXCEEDED',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise fallback to IP
        const userId = req.user?.userId || req.ip;
        return `${userId}:authenticated`;
    },
    skip: (req) => {
        // Skip rate limiting for authenticated users with higher privileges
        return req.user?.role === 'admin' || req.user?.role === 'superadmin';
    }
});

// Rate limiter for specific IP addresses (whitelist/blacklist)
const ipBasedLimiter = (customConfig = {}) => {
    const config = {
        windowMs: 15 * 60 * 1000,
        max: 100,
        ...customConfig
    };
    
    return rateLimit({
        ...config,
        skip: (req) => {
            // Skip rate limiting for whitelisted IPs
            const whitelistedIPs = process.env.WHITELISTED_IPS?.split(',') || [];
            if (whitelistedIPs.includes(req.ip)) {
                return true;
            }
            
            // Apply strict limits for blacklisted IPs
            const blacklistedIPs = process.env.BLACKLISTED_IPS?.split(',') || [];
            if (blacklistedIPs.includes(req.ip)) {
                config.max = 10; // Very strict for blacklisted IPs
            }
            
            return false;
        }
    });
};

// Dynamic rate limiter based on request type
const dynamicRateLimiter = (req, res, next) => {
    const path = req.path.toLowerCase();
    const method = req.method.toLowerCase();
    
    // Determine appropriate rate limiter
    let limiter;
    
    if (path.includes('/auth/')) {
        limiter = rateLimiters.auth;
    } else if (path.includes('/upload') || method === 'post' && path.includes('/files')) {
        limiter = rateLimiters.upload;
    } else if (path.includes('/password-reset') || path.includes('/forgot-password')) {
        limiter = rateLimiters.passwordReset;
    } else if (path.includes('/search') || req.query.search) {
        limiter = rateLimiters.search;
    } else if (['post', 'put', 'patch', 'delete'].includes(method)) {
        limiter = rateLimiters.modification;
    } else if (path.includes('/api/')) {
        limiter = rateLimiters.api;
    } else {
        limiter = rateLimiters.general;
    }
    
    // Use authenticated user limiter if user is authenticated
    if (req.user && req.user.userId) {
        limiter = authenticatedUserLimiter;
    }
    
    limiter(req, res, next);
};

// Rate limiting middleware for specific routes
const createCustomRateLimiter = (options = {}) => {
    return rateLimit({
        windowMs: options.windowMs || 15 * 60 * 1000,
        max: options.max || 100,
        message: options.message || {
            error: 'Too many requests. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED'
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: options.keyGenerator || ((req) => req.ip),
        skip: options.skip || (() => false),
        ...options
    });
};

// Rate limiting status endpoint
const getRateLimitStatus = (req, res) => {
    const limits = {};
    
    // Get current limits for each type
    Object.keys(rateLimitConfigs).forEach(key => {
        const config = rateLimitConfigs[key];
        limits[key] = {
            windowMs: config.windowMs,
            max: config.max,
            remaining: config.max, // This would need to be calculated from the actual limiter
            resetTime: new Date(Date.now() + config.windowMs).toISOString()
        };
    });
    
    res.json({
        success: true,
        data: {
            limits,
            ip: req.ip,
            authenticated: !!req.user,
            userRole: req.user?.role || 'anonymous'
        }
    });
};

module.exports = {
    rateLimiters,
    authenticatedUserLimiter,
    ipBasedLimiter,
    dynamicRateLimiter,
    createCustomRateLimiter,
    getRateLimitStatus,
    rateLimitConfigs
}; 