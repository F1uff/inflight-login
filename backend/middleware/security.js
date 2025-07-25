const helmet = require('helmet');
const crypto = require('crypto');

// CSRF token storage (in production, use Redis or database)
const csrfTokens = new Map();

// Generate CSRF token
const generateCSRFToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Validate CSRF token
const validateCSRFToken = (token, sessionId) => {
    const storedToken = csrfTokens.get(sessionId);
    if (!storedToken) return false;
    
    // Use timing-safe comparison
    const expectedBuffer = Buffer.from(storedToken, 'hex');
    const actualBuffer = Buffer.from(token, 'hex');
    
    if (expectedBuffer.length !== actualBuffer.length) {
        return false;
    }
    
    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
};

// Security headers configuration
const securityHeaders = helmet({
    // Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: [
                "'self'",
                "'unsafe-inline'", // Allow inline styles for development
                "https://fonts.googleapis.com",
                "https://cdnjs.cloudflare.com"
            ],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'", // Allow inline scripts for development
                "https://cdnjs.cloudflare.com"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "https:",
                "http:" // Allow external images
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com",
                "https://cdnjs.cloudflare.com"
            ],
            connectSrc: [
                "'self'",
                "https://api.inflight.com",
                process.env.FRONTEND_URL || "http://localhost:5173"
            ],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            manifestSrc: ["'self'"],
            workerSrc: ["'self'"]
        },
        reportOnly: process.env.NODE_ENV === 'development'
    },
    
    // HTTP Strict Transport Security
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    
    // X-Frame-Options
    frameguard: {
        action: 'deny'
    },
    
    // X-Content-Type-Options
    noSniff: true,
    
    // X-XSS-Protection
    xssFilter: true,
    
    // Referrer Policy
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
    },
    
    // Hide X-Powered-By header
    hidePoweredBy: true,
    
    // Permissions Policy
    permissionsPolicy: {
        features: {
            geolocation: ["'self'"],
            camera: ["'none'"],
            microphone: ["'none'"],
            payment: ["'self'"],
            usb: ["'none'"],
            magnetometer: ["'none'"],
            gyroscope: ["'none'"],
            accelerometer: ["'none'"]
        }
    }
});

// CSRF protection middleware
const csrfProtection = {
    // Generate and set CSRF token
    generateToken: (req, res, next) => {
        const sessionId = req.sessionID || req.ip + Date.now();
        const token = generateCSRFToken();
        
        // Store token with expiration (30 minutes)
        csrfTokens.set(sessionId, token);
        setTimeout(() => {
            csrfTokens.delete(sessionId);
        }, 30 * 60 * 1000);
        
        // Attach token to response
        res.locals.csrfToken = token;
        req.csrfToken = token;
        req.sessionId = sessionId;
        
        next();
    },
    
    // Validate CSRF token
    validateToken: (req, res, next) => {
        // Skip validation for GET, HEAD, OPTIONS requests
        if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
            return next();
        }
        
        // Skip validation for API authentication endpoints
        if (req.path.includes('/auth/login') || req.path.includes('/auth/register')) {
            return next();
        }
        
        const token = req.headers['x-csrf-token'] || req.body._csrf || req.query._csrf;
        const sessionId = req.sessionID || req.headers['x-session-id'];
        
        if (!token) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'CSRF_TOKEN_MISSING',
                    message: 'CSRF token is required'
                }
            });
        }
        
        if (!validateCSRFToken(token, sessionId)) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'CSRF_TOKEN_INVALID',
                    message: 'Invalid CSRF token'
                }
            });
        }
        
        next();
    },
    
    // CSRF token endpoint
    getToken: (req, res) => {
        res.json({
            success: true,
            data: {
                csrfToken: req.csrfToken,
                sessionId: req.sessionId
            }
        });
    }
};

// Additional security middleware
const additionalSecurity = (req, res, next) => {
    // Remove sensitive headers
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    
    // Add custom security headers
    res.setHeader('X-Request-ID', req.requestId || crypto.randomUUID());
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Cache control for sensitive endpoints
    if (req.path.includes('/auth/') || req.path.includes('/admin/')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    
    next();
};

// IP whitelist middleware
const ipWhitelist = (allowedIPs = []) => {
    return (req, res, next) => {
        if (allowedIPs.length === 0) {
            return next(); // No whitelist configured
        }
        
        const clientIP = req.ip || req.connection.remoteAddress;
        
        if (!allowedIPs.includes(clientIP)) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'IP_NOT_ALLOWED',
                    message: 'Your IP address is not allowed to access this resource'
                }
            });
        }
        
        next();
    };
};

// Request sanitization middleware
const sanitizeRequest = (req, res, next) => {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
        sanitizeObject(req.body);
    }
    
    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
        sanitizeObject(req.query);
    }
    
    // Sanitize request headers (remove potentially dangerous headers)
    const dangerousHeaders = ['x-forwarded-host', 'x-forwarded-server'];
    dangerousHeaders.forEach(header => {
        if (req.headers[header]) {
            delete req.headers[header];
        }
    });
    
    next();
};

// Sanitize object recursively
const sanitizeObject = (obj) => {
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
            // Remove potential script tags and dangerous characters
            obj[key] = obj[key]
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '')
                .replace(/data:text\/html/gi, '')
                .trim();
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
        }
    });
};

// Security audit logging
const securityAuditLogger = (req, res, next) => {
    const startTime = Date.now();
    
    // Log security-relevant events
    const auditData = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.userId,
        sessionId: req.sessionId,
        referer: req.get('Referer'),
        contentType: req.get('Content-Type'),
        contentLength: req.get('Content-Length')
    };
    
    // Log after response
    res.on('finish', () => {
        auditData.statusCode = res.statusCode;
        auditData.responseTime = Date.now() - startTime;
        
        // Log suspicious activity
        if (res.statusCode >= 400 || auditData.responseTime > 5000) {
            console.warn('🔍 Security Audit:', JSON.stringify(auditData));
        }
    });
    
    next();
};

// Security configuration for different environments
const getSecurityConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    return {
        enableCSRF: isProduction,
        enableSecurityHeaders: true,
        enableIPWhitelist: isProduction,
        enableAuditLogging: true,
        enableRequestSanitization: true,
        strictCSP: isProduction,
        allowedOrigins: isProduction 
            ? [process.env.FRONTEND_URL]
            : ['http://localhost:5173', 'http://localhost:3000'],
        allowedIPs: process.env.ALLOWED_IPS?.split(',') || []
    };
};

module.exports = {
    securityHeaders,
    csrfProtection,
    additionalSecurity,
    ipWhitelist,
    sanitizeRequest,
    securityAuditLogger,
    getSecurityConfig
}; 