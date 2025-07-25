const express = require('express');
const cors = require('cors');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./docs/swagger');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Import security middleware
const { 
    securityHeaders, 
    csrfProtection, 
    additionalSecurity, 
    sanitizeRequest, 
    securityAuditLogger, 
    getSecurityConfig 
} = require('./middleware/security');

// Import performance monitoring middleware
const { performanceMonitoring } = require('./middleware/performance');

const securityConfig = getSecurityConfig();

// Security middleware stack
if (securityConfig.enableSecurityHeaders) {
    app.use(securityHeaders);
}

if (securityConfig.enableRequestSanitization) {
    app.use(sanitizeRequest);
}

if (securityConfig.enableAuditLogging) {
    app.use(securityAuditLogger);
}

app.use(additionalSecurity);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration with security considerations
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = securityConfig.allowedOrigins.length > 0 
            ? securityConfig.allowedOrigins 
            : [
                process.env.FRONTEND_URL || 'http://localhost:5173',
                'http://localhost:5173',
                'http://localhost:5174',
                'http://localhost:5175',
                'http://localhost:5176',
                'http://localhost:5177',
                'http://localhost:5178',
                'http://localhost:5179',
                'http://localhost:5180'
            ];
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-CSRF-Token', 
        'X-Session-ID',
        'X-Request-ID',
        'Origin',
        'Accept',
        'X-Requested-With'
    ],
    exposedHeaders: ['X-Request-ID', 'X-Response-Time'],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Enhanced rate limiting system
const { 
    dynamicRateLimiter, 
    getRateLimitStatus
} = require('./middleware/rateLimiting');

// Apply dynamic rate limiting based on request type (disabled in development)
if (process.env.NODE_ENV === 'production') {
    app.use(dynamicRateLimiter);
    console.log('🔒 Rate limiting enabled (production mode)');
} else {
    console.log('🔓 Rate limiting disabled (development mode)');
}

// Performance monitoring middleware
app.use(performanceMonitoring({
    slowRequestThreshold: 1000, // 1 second
    enableLogging: true,
    enableMetrics: true
}));

// CSRF protection (conditionally applied)
if (securityConfig.enableCSRF) {
    app.use(csrfProtection.generateToken);
    app.use(csrfProtection.validateToken);
    console.log('🔒 CSRF protection enabled');
}

// Security and monitoring endpoints
app.get('/api/v1/rate-limit-status', getRateLimitStatus);
app.get('/api/v1/csrf-token', csrfProtection.generateToken, csrfProtection.getToken);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Inflight Admin API Documentation'
}));

console.log('🔒 Security middleware stack enabled');
console.log('📚 API Documentation available at /api-docs');

// Import routes
const dashboardRoutes = require('./routes/dashboard');
const suppliersRoutes = require('./routes/suppliers');
const monitoringRoutes = require('./routes/monitoring');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userDashboardRoutes = require('./routes/user-dashboard');

// Note: Socket.IO removed for simpler HTTP-based polling approach

// API routes
const apiPrefix = process.env.API_PREFIX || '/api/v1';

// API base route for health check
app.get(apiPrefix, (req, res) => {
    res.json({
        success: true,
        message: 'Inflight Admin API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            dashboard: `${apiPrefix}/dashboard`,
            suppliers: `${apiPrefix}/suppliers`,
            monitoring: `${apiPrefix}/monitoring`,
            auth: `${apiPrefix}/auth`,
            admin: `${apiPrefix}/admin`,
            userDashboard: `${apiPrefix}/user-dashboard`,
            health: '/health',
            docs: '/api-docs'
        }
    });
});

app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/suppliers`, suppliersRoutes);
app.use(`${apiPrefix}/monitoring`, monitoringRoutes);
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/user-dashboard`, userDashboardRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const startTime = Date.now();
        
        // Check database connection
        const { getConnection } = require('./config/database');
        const pool = getConnection();
        await pool.query('SELECT 1');
        const dbResponseTime = Date.now() - startTime;
        
        // Get system metrics
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            database: {
                status: 'connected',
                responseTime: dbResponseTime
            },
            system: {
                memory: {
                    used: Math.round(memUsage.heapUsed / 1024 / 1024),
                    total: Math.round(memUsage.heapTotal / 1024 / 1024),
                    external: Math.round(memUsage.external / 1024 / 1024)
                },
                cpu: {
                    user: Math.round(cpuUsage.user / 1000),
                    system: Math.round(cpuUsage.system / 1000)
                }
            }
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: 'Database connection failed',
            details: error.message
        });
    }
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
            userDashboard: `${apiPrefix}/user-dashboard`,
            health: '/health'
        }
    });
});

// Import and initialize error handling system
const { 
    errorHandler, 
    notFoundHandler, 
    initializeErrorHandlers,
    getErrorStats 
} = require('./middleware/errorHandler');

// Initialize global error handlers
initializeErrorHandlers();

// Error statistics endpoint
app.get('/api/v1/error-stats', getErrorStats);

// 404 handler (must be after all routes)
app.use('*', notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
const initDatabase = require('./scripts/init-database-unified');
const { initializeDatabase } = require('./config/database');

async function startServer() {
    try {
        console.log('🔄 Initializing database...');
        
        // Initialize database connection first
        await initializeDatabase();
        
        // Only run database setup if explicitly requested
        if (process.env.INIT_DATABASE === 'true') {
            console.log('🔄 Running database setup/migration...');
            await initDatabase();
            console.log('✅ Database setup completed');
        } else {
            console.log('📊 Using existing database (skip initialization)');
        }
        console.log('✅ Database initialized successfully');
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 Dashboard API: http://localhost:${PORT}${apiPrefix}/dashboard`);
            console.log(`🏢 Suppliers API: http://localhost:${PORT}${apiPrefix}/suppliers`);
            console.log(`📈 Monitoring API: http://localhost:${PORT}${apiPrefix}/monitoring`);
            console.log(`🔐 Auth API: http://localhost:${PORT}${apiPrefix}/auth`);
            console.log(`⚙️  Admin API: http://localhost:${PORT}${apiPrefix}/admin`);
            console.log(`🏢 User Dashboard API: http://localhost:${PORT}${apiPrefix}/user-dashboard`);
            console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
            console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
            console.log(`💾 Database Type: ${process.env.DATABASE_TYPE || 'postgresql'}`);
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