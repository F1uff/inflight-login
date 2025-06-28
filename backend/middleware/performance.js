// Performance monitoring middleware for Express.js
const performanceMetrics = {
    requests: new Map(),
    stats: {
        totalRequests: 0,
        slowRequests: 0,
        errorRequests: 0,
        averageResponseTime: 0,
        peakMemoryUsage: 0
    }
};

// Performance monitoring middleware
function performanceMonitoring(options = {}) {
    const {
        slowRequestThreshold = 1000, // 1 second
        enableLogging = true,
        enableMetrics = true
    } = options;

    return (req, res, next) => {
        const startTime = process.hrtime.bigint();
        const startMemory = process.memoryUsage();
        const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Add request ID to request object
        req.requestId = requestId;

        // Store request start info
        if (enableMetrics) {
            performanceMetrics.requests.set(requestId, {
                method: req.method,
                url: req.originalUrl || req.url,
                startTime: Date.now(),
                startMemory
            });
        }

        // Override res.end to capture metrics
        const originalEnd = res.end;
        res.end = function(...args) {
            const endTime = process.hrtime.bigint();
            const endMemory = process.memoryUsage();
            const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds

            // Update global stats
            if (enableMetrics) {
                performanceMetrics.stats.totalRequests++;
                
                // Update average response time
                const currentAvg = performanceMetrics.stats.averageResponseTime;
                const newAvg = (currentAvg * (performanceMetrics.stats.totalRequests - 1) + responseTime) / performanceMetrics.stats.totalRequests;
                performanceMetrics.stats.averageResponseTime = newAvg;

                // Track slow requests
                if (responseTime > slowRequestThreshold) {
                    performanceMetrics.stats.slowRequests++;
                }

                // Track errors
                if (res.statusCode >= 400) {
                    performanceMetrics.stats.errorRequests++;
                }

                // Track peak memory usage
                const currentMemory = endMemory.heapUsed;
                if (currentMemory > performanceMetrics.stats.peakMemoryUsage) {
                    performanceMetrics.stats.peakMemoryUsage = currentMemory;
                }

                // Clean up request tracking
                performanceMetrics.requests.delete(requestId);
            }

            // Add performance headers
            res.set({
                'X-Response-Time': `${responseTime.toFixed(2)}ms`,
                'X-Request-ID': requestId,
                'X-Memory-Usage': `${(endMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`
            });

            // Log slow requests
            if (enableLogging && responseTime > slowRequestThreshold) {
                console.warn(`🐌 Slow request detected:`, {
                    requestId,
                    method: req.method,
                    url: req.originalUrl || req.url,
                    responseTime: `${responseTime.toFixed(2)}ms`,
                    statusCode: res.statusCode,
                    memoryDelta: `${((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024).toFixed(2)}MB`,
                    userAgent: req.get('User-Agent'),
                    ip: req.ip
                });
            }

            // Log errors
            if (enableLogging && res.statusCode >= 400) {
                console.error(`❌ Error request:`, {
                    requestId,
                    method: req.method,
                    url: req.originalUrl || req.url,
                    statusCode: res.statusCode,
                    responseTime: `${responseTime.toFixed(2)}ms`,
                    userAgent: req.get('User-Agent'),
                    ip: req.ip
                });
            }

            // Call original end method
            originalEnd.apply(this, args);
        };

        next();
    };
}

// Database query performance tracking
function trackDatabaseQuery(query, params = []) {
    const startTime = Date.now();
    
    return {
        end: () => {
            const duration = Date.now() - startTime;
            
            if (duration > 100) { // Log slow queries (>100ms)
                console.warn(`🐌 Slow database query:`, {
                    query: query.substring(0, 100) + '...',
                    duration: `${duration}ms`,
                    params: params.length > 0 ? params : undefined
                });
            }
            
            return duration;
        }
    };
}

// System health checker
async function getSystemHealth() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
        memory: {
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
            external: Math.round(memoryUsage.external / 1024 / 1024), // MB
            rss: Math.round(memoryUsage.rss / 1024 / 1024) // MB
        },
        cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system
        },
        uptime: Math.round(process.uptime()),
        activeRequests: performanceMetrics.requests.size,
        stats: {
            ...performanceMetrics.stats,
            averageResponseTime: Math.round(performanceMetrics.stats.averageResponseTime * 100) / 100,
            peakMemoryUsage: Math.round(performanceMetrics.stats.peakMemoryUsage / 1024 / 1024), // MB
            errorRate: performanceMetrics.stats.totalRequests > 0 
                ? Math.round((performanceMetrics.stats.errorRequests / performanceMetrics.stats.totalRequests) * 100 * 100) / 100
                : 0,
            slowRequestRate: performanceMetrics.stats.totalRequests > 0
                ? Math.round((performanceMetrics.stats.slowRequests / performanceMetrics.stats.totalRequests) * 100 * 100) / 100
                : 0
        }
    };
}

// Performance metrics endpoint
function getPerformanceMetrics() {
    return {
        currentRequests: Array.from(performanceMetrics.requests.entries()).map(([id, data]) => ({
            requestId: id,
            method: data.method,
            url: data.url,
            duration: Date.now() - data.startTime,
            memoryAtStart: Math.round(data.startMemory.heapUsed / 1024 / 1024) // MB
        })),
        stats: performanceMetrics.stats,
        timestamp: new Date().toISOString()
    };
}

// Reset metrics (useful for testing)
function resetMetrics() {
    performanceMetrics.requests.clear();
    performanceMetrics.stats = {
        totalRequests: 0,
        slowRequests: 0,
        errorRequests: 0,
        averageResponseTime: 0,
        peakMemoryUsage: 0
    };
}

// Performance optimization suggestions
function getOptimizationSuggestions() {
    const stats = performanceMetrics.stats;
    const suggestions = [];

    if (stats.averageResponseTime > 500) {
        suggestions.push({
            type: 'warning',
            message: 'Average response time is high (>500ms). Consider implementing caching or optimizing database queries.'
        });
    }

    if (stats.slowRequestRate > 10) {
        suggestions.push({
            type: 'error',
            message: `${stats.slowRequestRate}% of requests are slow. Review database indexes and query optimization.`
        });
    }

    if (stats.errorRate > 5) {
        suggestions.push({
            type: 'error',
            message: `Error rate is ${stats.errorRate}%. Check error logs and implement better error handling.`
        });
    }

    if (stats.peakMemoryUsage > 500) { // 500MB
        suggestions.push({
            type: 'warning',
            message: `Peak memory usage is ${stats.peakMemoryUsage}MB. Consider implementing memory optimization strategies.`
        });
    }

    return suggestions;
}

module.exports = {
    performanceMonitoring,
    trackDatabaseQuery,
    getSystemHealth,
    getPerformanceMetrics,
    resetMetrics,
    getOptimizationSuggestions
}; 