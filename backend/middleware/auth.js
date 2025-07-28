const jwt = require('jsonwebtoken');
const { getConnection } = require('../config/database');
const { AuthenticationError, AuthorizationError } = require('./errorHandler');

// Validate JWT_SECRET exists
if (!process.env.JWT_SECRET) {
    console.error('❌ CRITICAL: JWT_SECRET environment variable is not set!');
    console.error('   Please set JWT_SECRET in your .env file or environment variables');
    process.exit(1);
}

// Middleware to authenticate JWT token
async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        // Development bypass for test-token
        if (process.env.NODE_ENV === 'development' && token === 'test-token') {
            // Create a mock user for development
            req.user = {
                userId: 1,
                email: 'dev@test.com',
                role: 'admin',
                firstName: 'Dev',
                lastName: 'User',
                company_id: 1  // Add company_id for development
            };
            return next();
        }
        
        if (!token) {
            throw new AuthenticationError('Access token required', { code: 'MISSING_TOKEN' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Optional: Verify user still exists and is active
        const pool = getConnection();
        const userQuery = `
            SELECT id, email, role, status, first_name, last_name
            FROM users 
            WHERE id = $1 AND status = 'active'
        `;
        
        const userResult = await pool.query(userQuery, [decoded.userId]);
        const user = userResult.rows[0];
        
        if (!user) {
            throw new AuthenticationError('User not found or inactive', { code: 'USER_INACTIVE' });
        }
        
        // Attach user info to request
        req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
            firstName: user.first_name,
            lastName: user.last_name
        };
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ 
                error: 'Invalid token',
                code: 'INVALID_TOKEN' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ 
                error: 'Token expired',
                code: 'TOKEN_EXPIRED' 
            });
        }
        
        return res.status(500).json({ 
            error: 'Authentication failed',
            code: 'AUTH_ERROR' 
        });
    }
}

// Middleware to check specific roles
function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            throw new AuthenticationError('Authentication required', { code: 'AUTH_REQUIRED' });
        }
        
        const userRoles = Array.isArray(roles) ? roles : [roles];
        
        if (!userRoles.includes(req.user.role)) {
            throw new AuthorizationError('Insufficient permissions', { 
                code: 'INSUFFICIENT_PERMISSIONS',
                required: userRoles,
                current: req.user.role
            });
        }
        
        next();
    };
}

// Middleware to check if user owns resource or is admin
function requireOwnershipOrAdmin(resourceIdField = 'id') {
    return (req, res, next) => {
        if (!req.user) {
            throw new AuthenticationError('Authentication required', { code: 'AUTH_REQUIRED' });
        }
        
        const resourceId = req.params[resourceIdField];
        
        // Admin can access any resource
        if (req.user.role === 'admin') {
            return next();
        }
        
        // User can only access their own resources
        if (req.user.userId.toString() === resourceId) {
            return next();
        }
        
        throw new AuthorizationError('Access denied', { code: 'ACCESS_DENIED' });
    };
}

// Generate JWT token with proper configuration
function generateToken(payload, expiresIn = '24h') {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    
    return jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn,
        issuer: 'inflight-admin',
        audience: 'inflight-users'
    });
}

// Rate limiting for authentication endpoints
const authRateLimit = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        error: 'Too many authentication attempts, please try again later',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
};

module.exports = {
    authenticateToken,
    requireRole,
    requireOwnershipOrAdmin,
    generateToken,
    authRateLimit
}; 