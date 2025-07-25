const fs = require('fs');
const path = require('path');

// Error types classification
const ERROR_TYPES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
    FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
    EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
    BUSINESS_LOGIC_ERROR: 'BUSINESS_LOGIC_ERROR',
    SYSTEM_ERROR: 'SYSTEM_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR'
};

// Error severity levels
const ERROR_SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

// Custom error class for application-specific errors
class AppError extends Error {
    constructor(message, statusCode, errorType = ERROR_TYPES.SYSTEM_ERROR, severity = ERROR_SEVERITY.MEDIUM, details = {}) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errorType = errorType;
        this.severity = severity;
        this.details = details;
        this.timestamp = new Date().toISOString();
        this.isOperational = true;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

// Custom error classes for specific error types
class ValidationError extends AppError {
    constructor(message, details = {}) {
        super(message, 400, ERROR_TYPES.VALIDATION_ERROR, ERROR_SEVERITY.LOW, details);
    }
}

class AuthenticationError extends AppError {
    constructor(message, details = {}) {
        super(message, 401, ERROR_TYPES.AUTHENTICATION_ERROR, ERROR_SEVERITY.MEDIUM, details);
    }
}

class AuthorizationError extends AppError {
    constructor(message, details = {}) {
        super(message, 403, ERROR_TYPES.AUTHORIZATION_ERROR, ERROR_SEVERITY.MEDIUM, details);
    }
}

class DatabaseError extends AppError {
    constructor(message, details = {}) {
        super(message, 500, ERROR_TYPES.DATABASE_ERROR, ERROR_SEVERITY.HIGH, details);
    }
}

class RateLimitError extends AppError {
    constructor(message, details = {}) {
        super(message, 429, ERROR_TYPES.RATE_LIMIT_ERROR, ERROR_SEVERITY.LOW, details);
    }
}

class BusinessLogicError extends AppError {
    constructor(message, details = {}) {
        super(message, 400, ERROR_TYPES.BUSINESS_LOGIC_ERROR, ERROR_SEVERITY.MEDIUM, details);
    }
}

class NetworkError extends AppError {
    constructor(message, details = {}) {
        super(message, 500, ERROR_TYPES.NETWORK_ERROR, ERROR_SEVERITY.HIGH, details);
    }
}

// Error statistics tracking
let errorStats = {
    total: 0,
    byType: {},
    bySeverity: {},
    byStatusCode: {},
    recentErrors: [],
    startTime: Date.now()
};

// Error logging utility
class ErrorLogger {
    constructor() {
        this.logDir = path.join(__dirname, '../logs');
        this.errorLogFile = path.join(this.logDir, 'error.log');
        this.accessLogFile = path.join(this.logDir, 'access.log');
        
        // Create logs directory if it doesn't exist
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }
    
    log(level, message, error = null, req = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            error: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
                statusCode: error.statusCode,
                errorType: error.errorType,
                severity: error.severity,
                details: error.details
            } : null,
            request: req ? {
                method: req.method,
                url: req.originalUrl,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                userId: req.user?.userId,
                userRole: req.user?.role
            } : null,
            environment: process.env.NODE_ENV || 'development',
            processId: process.pid
        };
        
        // Console logging with colors
        const colors = {
            error: '\x1b[31m',
            warn: '\x1b[33m',
            info: '\x1b[36m',
            debug: '\x1b[37m',
            reset: '\x1b[0m'
        };
        
        console.log(
            `${colors[level] || colors.info}[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}${colors.reset}`
        );
        
        if (error && error.stack) {
            console.log(`${colors.error}${error.stack}${colors.reset}`);
        }
        
        // File logging
        try {
            fs.appendFileSync(this.errorLogFile, JSON.stringify(logEntry) + '\n');
        } catch (fileError) {
            console.error('Failed to write to error log file:', fileError);
        }
        
        // Update error statistics
        try {
            this.updateErrorStats(error);
        } catch (statsError) {
            console.error('Failed to update error statistics:', statsError.message);
        }
    }
    
    updateErrorStats(error) {
        if (!error) return;
        
        try {
            errorStats.total++;
            errorStats.byType[error.errorType || 'UNKNOWN'] = (errorStats.byType[error.errorType || 'UNKNOWN'] || 0) + 1;
            errorStats.bySeverity[error.severity || 'UNKNOWN'] = (errorStats.bySeverity[error.severity || 'UNKNOWN'] || 0) + 1;
            errorStats.byStatusCode[error.statusCode || 500] = (errorStats.byStatusCode[error.statusCode || 500] || 0) + 1;
            
            // Keep only last 100 errors
            errorStats.recentErrors.unshift({
                timestamp: new Date().toISOString(),
                type: error.errorType || 'UNKNOWN',
                severity: error.severity || 'UNKNOWN',
                statusCode: error.statusCode || 500,
                message: error.message || 'Unknown error'
            });
            
            if (errorStats.recentErrors.length > 100) {
                errorStats.recentErrors.pop();
            }
        } catch (statsError) {
            // Silently fail to prevent recursive errors
            console.error('Error updating statistics:', statsError.message);
        }
    }
    
    error(message, error, req) {
        this.log('error', message, error, req);
    }
    
    warn(message, error, req) {
        this.log('warn', message, error, req);
    }
    
    info(message, error, req) {
        this.log('info', message, error, req);
    }
    
    debug(message, error, req) {
        this.log('debug', message, error, req);
    }
}

const logger = new ErrorLogger();

// Standardized error response formatter
const formatErrorResponse = (error, req) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return {
        success: false,
        error: {
            code: error.errorType || 'UNKNOWN_ERROR',
            message: error.message || 'An unexpected error occurred',
            statusCode: error.statusCode || 500,
            severity: error.severity || ERROR_SEVERITY.MEDIUM,
            timestamp: new Date().toISOString(),
            requestId: req?.requestId || 'unknown',
            ...(isDevelopment && { 
                stack: error.stack,
                details: error.details 
            })
        },
        ...(isDevelopment && { 
            debug: {
                url: req?.originalUrl,
                method: req?.method,
                ip: req?.ip,
                userAgent: req?.get('User-Agent')
            }
        })
    };
};

// Main error handling middleware
const errorHandler = (err, req, res, _next) => {
    let error = err;
    
    // Convert known errors to AppError instances
    if (err.name === 'ValidationError') {
        error = new ValidationError(err.message, { originalError: err.message });
    } else if (err.name === 'JsonWebTokenError') {
        error = new AuthenticationError('Invalid token provided', { originalError: err.message });
    } else if (err.name === 'TokenExpiredError') {
        error = new AuthenticationError('Token has expired', { originalError: err.message });
    } else if (err.code === '23505') { // PostgreSQL unique constraint violation
        error = new ValidationError('Duplicate entry detected', { originalError: err.message });
    } else if (err.code === '23503') { // PostgreSQL foreign key constraint violation
        error = new ValidationError('Referenced record not found', { originalError: err.message });
    } else if (err.code === '23502') { // PostgreSQL not null constraint violation
        error = new ValidationError('Required field missing', { originalError: err.message });
    } else if (err.code === 'ECONNREFUSED') {
        error = new DatabaseError('Database connection refused', { originalError: err.message });
    } else if (err.code === 'ENOTFOUND') {
        error = new NetworkError('Network resource not found', { originalError: err.message });
    } else if (err.type === 'entity.parse.failed') {
        error = new ValidationError('Invalid JSON format', { originalError: err.message });
    } else if (err.type === 'entity.too.large') {
        error = new ValidationError('Request entity too large', { originalError: err.message });
    } else if (!(error instanceof AppError)) {
        // For unknown errors, create a generic system error
        error = new AppError(
            'An unexpected error occurred',
            500,
            ERROR_TYPES.SYSTEM_ERROR,
            ERROR_SEVERITY.HIGH,
            { originalError: err.message }
        );
    }
    
    // Log the error
    logger.error(`${error.errorType}: ${error.message}`, error, req);
    
    // Send error response
    res.status(error.statusCode || 500).json(formatErrorResponse(error, req));
};

// Async error wrapper for route handlers
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Not found handler
const notFoundHandler = (req, res) => {
    const error = new AppError(
        `Route ${req.originalUrl} not found`,
        404,
        ERROR_TYPES.SYSTEM_ERROR,
        ERROR_SEVERITY.LOW,
        { 
            method: req.method,
            url: req.originalUrl,
            availableRoutes: [] // Could be populated with actual routes
        }
    );
    
    logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`, error, req);
    res.status(404).json(formatErrorResponse(error, req));
};

// Unhandled promise rejection handler
const unhandledRejectionHandler = () => {
    process.on('unhandledRejection', (reason, _promise) => {
        try {
            // Use console.error instead of custom logger to avoid recursive issues
            console.error('🚨 [CRITICAL] Unhandled Promise Rejection:', {
                timestamp: new Date().toISOString(),
                reason: reason ? reason.toString() : 'Unknown reason',
                stack: reason && reason.stack ? reason.stack : 'No stack trace available',
                pid: process.pid
            });
        } catch (logError) {
            // Fallback if even console.error fails
            console.log('CRITICAL: Unhandled promise rejection occurred and logging failed');
            console.log('Original reason:', reason);
            console.log('Logging error:', logError.message);
        }
        
        // Graceful shutdown
        setTimeout(() => {
            process.exit(1);
        }, 1000);
    });
};

// Uncaught exception handler
const uncaughtExceptionHandler = () => {
    process.on('uncaughtException', (error) => {
        try {
            // Use console.error instead of custom logger to avoid recursive issues
            console.error('🚨 [CRITICAL] Uncaught Exception:', {
                timestamp: new Date().toISOString(),
                name: error.name,
                message: error.message,
                stack: error.stack,
                pid: process.pid
            });
        } catch (logError) {
            // Fallback if even console.error fails
            console.log('CRITICAL: Uncaught exception occurred and logging failed');
            console.log('Original error:', error.message);
            console.log('Logging error:', logError.message);
        }
        
        // Graceful shutdown
        setTimeout(() => {
            process.exit(1);
        }, 1000);
    });
};

// Error statistics endpoint
const getErrorStats = (req, res) => {
    const stats = {
        ...errorStats,
        uptime: Date.now() - errorStats.startTime,
        errorRate: errorStats.total / ((Date.now() - errorStats.startTime) / 1000 / 60), // errors per minute
        timestamp: new Date().toISOString()
    };
    
    res.json({
        success: true,
        data: stats
    });
};

// Initialize error handlers
const initializeErrorHandlers = () => {
    unhandledRejectionHandler();
    uncaughtExceptionHandler();
    
    console.log('✅ Error handlers initialized');
};

module.exports = {
    // Error classes
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    DatabaseError,
    RateLimitError,
    BusinessLogicError,
    NetworkError,
    
    // Error types and severity
    ERROR_TYPES,
    ERROR_SEVERITY,
    
    // Middleware
    errorHandler,
    notFoundHandler,
    asyncHandler,
    
    // Utilities
    logger,
    formatErrorResponse,
    getErrorStats,
    initializeErrorHandlers,
    
    // Statistics
    errorStats
}; 