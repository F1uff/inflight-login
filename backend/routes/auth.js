const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../scripts/init-database');

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const db = getDatabase();
        
        const query = `
            SELECT id, email, password_hash, role, first_name, last_name, status
            FROM users 
            WHERE email = ? AND status = 'active'
        `;
        
        db.get(query, [email], async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Login failed' });
            }
            
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            try {
                const isValidPassword = await bcrypt.compare(password, user.password_hash);
                
                if (!isValidPassword) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }
                
                // Update last login
                db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
                
                // Generate JWT token
                const token = jwt.sign(
                    { 
                        userId: user.id, 
                        email: user.email, 
                        role: user.role 
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
                );
                
                const response = {
                    message: 'Login successful',
                    token: token,
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        firstName: user.first_name,
                        lastName: user.last_name
                    }
                };
                
                res.json(response);
                db.close();
                
            } catch (bcryptError) {
                console.error('Password comparison error:', bcryptError);
                res.status(500).json({ error: 'Login failed' });
                db.close();
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const db = getDatabase();
        
        const query = `
            SELECT id, email, role, first_name, last_name, phone, avatar_url, 
                   email_verified, status, last_login, created_at
            FROM users 
            WHERE id = ?
        `;
        
        db.get(query, [req.user.userId], (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch user profile' });
            }
            
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
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
            db.close();
        });
        
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create demo admin user
router.post('/create-demo-admin', async (req, res) => {
    try {
        const db = getDatabase();
        
        // Check if demo admin already exists
        db.get('SELECT id FROM users WHERE email = ?', ['admin@inflight.com'], async (err, existingUser) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to check existing user' });
            }
            
            if (existingUser) {
                return res.status(400).json({ error: 'Demo admin already exists' });
            }
            
            try {
                const hashedPassword = await bcrypt.hash('admin123', 10);
                
                const query = `
                    INSERT INTO users (
                        email, password_hash, role, first_name, last_name, 
                        email_verified, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                
                db.run(query, [
                    'admin@inflight.com',
                    hashedPassword,
                    'admin',
                    'Admin',
                    'User',
                    1,
                    'active'
                ], (err) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ error: 'Failed to create demo admin' });
                    }
                    
                    res.json({
                        message: 'Demo admin created successfully',
                        credentials: {
                            email: 'admin@inflight.com',
                            password: 'admin123'
                        }
                    });
                    
                    db.close();
                });
                
            } catch (hashError) {
                console.error('Password hashing error:', hashError);
                res.status(500).json({ error: 'Failed to create demo admin' });
                db.close();
            }
        });
        
    } catch (error) {
        console.error('Create demo admin error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        
        req.user = user;
        next();
    });
}

module.exports = router; 