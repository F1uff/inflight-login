const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:5177',
        'http://localhost:5178',
        'http://localhost:5179',
        'http://localhost:5180'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use(limiter);

// Import routes
const dashboardRoutes = require('./routes/dashboard');
const suppliersRoutes = require('./routes/suppliers');
const monitoringRoutes = require('./routes/monitoring');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// API routes
const apiPrefix = process.env.API_PREFIX || '/api/v1';
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/suppliers`, suppliersRoutes);
app.use(`${apiPrefix}/monitoring`, monitoringRoutes);
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Inflight Admin Dashboard API',
        version: '1.0.0',
        status: 'Running',
        endpoints: {
            dashboard: `${apiPrefix}/dashboard`,
            suppliers: `${apiPrefix}/suppliers`,
            monitoring: `${apiPrefix}/monitoring`,
            auth: `${apiPrefix}/auth`,
            admin: `${apiPrefix}/admin`,
            health: '/health'
        }
    });
});

// Error handling middleware
app.use((err, req, res, _next) => {
    console.error('Error:', err);
    
    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : err.message;
    
    res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Initialize database and start server
const initDatabase = require('./scripts/init-database-unified');

async function startServer() {
    try {
        console.log('🔄 Initializing database...');
        await initDatabase();
        console.log('✅ Database initialized successfully');
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 Dashboard API: http://localhost:${PORT}${apiPrefix}/dashboard`);
            console.log(`🏢 Suppliers API: http://localhost:${PORT}${apiPrefix}/suppliers`);
            console.log(`📈 Monitoring API: http://localhost:${PORT}${apiPrefix}/monitoring`);
            console.log(`🔐 Auth API: http://localhost:${PORT}${apiPrefix}/auth`);
            console.log(`⚙️  Admin API: http://localhost:${PORT}${apiPrefix}/admin`);
            console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
            console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
            console.log(`💾 Database Type: ${process.env.DATABASE_TYPE || 'sqlite'}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🔄 SIGINT received, shutting down gracefully...');
    process.exit(0);
});

startServer(); 