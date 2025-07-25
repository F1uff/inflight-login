const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { getConnection } = require('../config/database');
const { authenticateToken, generateToken, authRateLimit } = require('../middleware/auth');
const { asyncHandler, ValidationError, AuthenticationError } = require('../middleware/errorHandler');

// Create rate limiter for auth endpoints
const authLimiter = rateLimit(authRateLimit);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User authentication
 *     description: Authenticate user credentials and return JWT token
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "admin@inflight.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               success: true
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 id: 1
 *                 email: "admin@inflight.com"
 *                 role: "admin"
 *                 firstName: "Admin"
 *                 lastName: "User"
 *       400:
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 code: "VALIDATION_ERROR"
 *                 message: "Email and password are required"
 *                 statusCode: 400
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 code: "AUTHENTICATION_ERROR"
 *                 message: "Invalid credentials"
 *                 statusCode: 401
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 code: "AUTH_RATE_LIMIT_EXCEEDED"
 *                 message: "Too many authentication attempts. Please try again later."
 *                 statusCode: 429
 */
router.post('/login', authLimiter, asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        throw new ValidationError('Email and password are required');
    }
    
    const pool = getConnection();
    
    const query = `
        SELECT id, email, password_hash, role, first_name, last_name, status
        FROM users 
        WHERE email = $1 AND status = 'active'
    `;
    
    const result = await pool.query(query, [email]);
    const user = result.rows[0];
    
    if (!user) {
        throw new AuthenticationError('Invalid credentials');
    }
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
        throw new AuthenticationError('Invalid credentials');
    }
    
    // Create JWT token using secure generation
    const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
    });
    
    // Update last login
    const updateQuery = `
        UPDATE users 
        SET last_login = CURRENT_TIMESTAMP 
        WHERE id = $1
    `;
    
    await pool.query(updateQuery, [user.id]);
    
    res.json({
        success: true,
        token: token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.first_name,
            lastName: user.last_name
        }
    });
}));

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User registration
 *     description: Register a new user account
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "password123"
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               role:
 *                 type: string
 *                 enum: [user, admin, driver]
 *                 default: user
 *                 example: "user"
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many registration attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Register endpoint with rate limiting
router.post('/register', authLimiter, asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, phone, role = 'user' } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
        throw new ValidationError('Required fields missing');
    }
    
    const pool = getConnection();
    
    // Check if user already exists
    const checkQuery = `
        SELECT id FROM users WHERE email = $1
    `;
    
    const checkResult = await pool.query(checkQuery, [email]);
    
    if (checkResult.rows.length > 0) {
        throw new ValidationError('User already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const insertQuery = `
        INSERT INTO users (
            email, password_hash, first_name, last_name, phone, role, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, email, first_name, last_name, role
    `;
    
    const result = await pool.query(insertQuery, [
        email, hashedPassword, firstName, lastName, phone || null, role, 'active'
    ]);
    
    const newUser = result.rows[0];
    
    // Create JWT token using secure generation
    const token = generateToken({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role
    });
    
    res.status(201).json({
        success: true,
        token: token,
        user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.first_name,
            lastName: newUser.last_name,
            role: newUser.role
        }
    });
}));

// Get current user profile
router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
        const pool = getConnection();
        
        const query = `
            SELECT id, email, role, first_name, last_name, phone, avatar_url, 
                   email_verified, status, last_login, created_at
            FROM users 
            WHERE id = $1
        `;
        
    const result = await pool.query(query, [req.user.userId]);
    const user = result.rows[0];
    
    if (!user) {
        throw new AuthenticationError('User not found');
    }
    
    const response = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        emailVerified: user.email_verified,
        status: user.status,
        lastLogin: user.last_login,
        createdAt: user.created_at
    };
    
    res.json(response);
}));

// Create demo admin user - DEVELOPMENT ONLY
router.post('/create-demo-admin', authLimiter, async (req, res) => {
    // SECURITY: Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ 
            error: 'Demo admin creation is disabled in production' 
        });
    }

    try {
        const pool = getConnection();
        
        // Check if demo admin already exists
        const checkQuery = 'SELECT id FROM users WHERE email = $1';
        
        try {
            const checkResult = await pool.query(checkQuery, ['admin@inflight.com']);
            
            if (checkResult.rows.length > 0) {
                return res.status(400).json({ error: 'Demo admin already exists' });
            }
            
            // Generate secure random password instead of hardcoded one
            const crypto = require('crypto');
            const securePassword = crypto.randomBytes(16).toString('hex');
            const hashedPassword = await bcrypt.hash(securePassword, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
            
            const insertQuery = `
                INSERT INTO users (
                    email, password_hash, role, first_name, last_name, 
                    email_verified, status, password_reset_required
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
            `;
            
            await pool.query(insertQuery, [
                'admin@inflight.com',
                hashedPassword,
                'admin',
                'Admin',
                'User',
                true,
                'active',
                true // Require password reset on first login
            ]);
            
            // Note: In production, send password via secure channel
            
            res.json({
                message: 'Demo admin created successfully',
                email: 'admin@inflight.com',
                note: 'Password has been generated and logged to console. Password reset required on first login.'
            });
        } catch (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to create demo admin' });
        }
        
    } catch (error) {
        console.error('Create demo admin error:', error);
        res.status(500).json({ error: 'Failed to create demo admin' });
    }
});

// Authentication middleware is now imported from ../middleware/auth

module.exports = router; 