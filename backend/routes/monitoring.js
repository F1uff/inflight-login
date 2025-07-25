const express = require('express');
const router = express.Router();
const { getSystemHealth, getPerformanceMetrics, getOptimizationSuggestions } = require('../middleware/performance');
const { getErrorStats } = require('../middleware/errorHandler');

// Get system health overview
router.get('/health', async (req, res) => {
    try {
        const { getConnection } = require('../config/database');
        const pool = getConnection();
        
        const query = `
            SELECT 
                overall_health_score,
                db_response_time,
                api_response_time,
                active_sessions,
                system_errors_last_hour,
                check_time
            FROM system_health 
            ORDER BY check_time DESC 
            LIMIT 1
        `;
        
        const result = await pool.query(query);
        const health = result.rows[0];
        
        if (!health) {
            // Return default health status if no data
            return res.json({
                healthScore: 100,
                dbResponseTime: 0,
                apiResponseTime: 0,
                activeSessions: 0,
                systemErrors: 0,
                status: 'healthy',
                lastCheck: new Date().toISOString()
            });
        }
        
        // Determine health status
        let status = 'healthy';
        if (health.overall_health_score < 70) {
            status = 'critical';
        } else if (health.overall_health_score < 85) {
            status = 'warning';
        }
        
        const response = {
            healthScore: health.overall_health_score,
            dbResponseTime: parseFloat(health.db_response_time).toFixed(1),
            apiResponseTime: parseFloat(health.api_response_time).toFixed(1),
            activeSessions: health.active_sessions,
            systemErrors: health.system_errors_last_hour,
            status: status,
            lastCheck: health.check_time
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('System health error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get system metrics over time
router.get('/metrics', async (req, res) => {
    try {
        const { getConnection } = require('../config/database');
        const pool = getConnection();
        const hours = parseInt(req.query.hours) || 24;
        
        const query = `
            SELECT 
                overall_health_score,
                db_response_time,
                api_response_time,
                active_sessions,
                system_errors_last_hour,
                check_time
            FROM system_health 
            WHERE check_time >= CURRENT_TIMESTAMP - INTERVAL '${hours} hours'
            ORDER BY check_time ASC
        `;
        
        const result = await pool.query(query);
        const metrics = result.rows;
        
        const response = {
            period: `${hours} hours`,
            metrics: metrics.map(metric => ({
                timestamp: metric.check_time,
                healthScore: metric.overall_health_score,
                dbResponseTime: parseFloat(metric.db_response_time).toFixed(1),
                apiResponseTime: parseFloat(metric.api_response_time).toFixed(1),
                activeSessions: metric.active_sessions,
                systemErrors: metric.system_errors_last_hour
            })),
            averages: {
                healthScore: metrics.length > 0 
                    ? Math.round(metrics.reduce((sum, m) => sum + m.overall_health_score, 0) / metrics.length)
                    : 100,
                dbResponseTime: metrics.length > 0
                    ? (metrics.reduce((sum, m) => sum + parseFloat(m.db_response_time), 0) / metrics.length).toFixed(1)
                    : '0.0',
                apiResponseTime: metrics.length > 0
                    ? (metrics.reduce((sum, m) => sum + parseFloat(m.api_response_time), 0) / metrics.length).toFixed(1)
                    : '0.0'
            },
            lastUpdated: new Date().toISOString()
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('System metrics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update system health (for testing purposes)
router.post('/health/update', async (req, res) => {
    try {
        const { getConnection } = require('../config/database');
        const pool = getConnection();
        const startTime = Date.now();
        
        // Simulate some system checks
        const dbStartTime = Date.now();
        await pool.query('SELECT 1');
        const dbResponseTime = Date.now() - dbStartTime;
        const apiResponseTime = Date.now() - startTime;
        
        // Calculate health score based on response times and errors
        let healthScore = 100;
        if (dbResponseTime > 100) healthScore -= 10;
        if (apiResponseTime > 500) healthScore -= 15;
        
        const query = `
            INSERT INTO system_health (
                overall_health_score,
                db_response_time,
                api_response_time,
                active_sessions,
                system_errors_last_hour
            ) VALUES ($1, $2, $3, $4, $5)
        `;
        
        await pool.query(query, [
            healthScore,
            dbResponseTime,
            apiResponseTime,
            Math.floor(Math.random() * 50 + 10), // Random active sessions
            Math.floor(Math.random() * 3) // Random errors (0-2)
        ]);
        
        res.json({
            message: 'System health updated successfully',
            healthScore: healthScore,
            dbResponseTime: dbResponseTime,
            apiResponseTime: apiResponseTime,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Update system health error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get enhanced system performance metrics
router.get('/performance', async (req, res) => {
    try {
        const systemHealth = await getSystemHealth();
        const performanceMetrics = getPerformanceMetrics();
        const optimizationSuggestions = getOptimizationSuggestions();
        
        const response = {
            systemHealth,
            performanceMetrics,
            optimizationSuggestions,
            timestamp: new Date().toISOString()
        };
        
        res.json(response);
    } catch (error) {
        console.error('Performance metrics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get detailed error statistics
router.get('/errors', (req, res) => {
    getErrorStats(req, res);
});

// Get real-time system status
router.get('/realtime', async (req, res) => {
    try {
        const { getConnection } = require('../config/database');
        const pool = getConnection();
        
        // Get current system metrics
        const systemHealth = await getSystemHealth();
        const performanceMetrics = getPerformanceMetrics();
        
        // Get database pool statistics
        const poolStats = {
            totalConnections: pool.totalCount || 0,
            idleConnections: pool.idleCount || 0,
            waitingClients: pool.waitingCount || 0
        };
        
        // Get recent activity
        const activityQuery = `
            SELECT 
                COUNT(CASE WHEN created_at >= CURRENT_TIMESTAMP - INTERVAL '5 minutes' THEN 1 END) as recent_bookings,
                COUNT(CASE WHEN created_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour' THEN 1 END) as hourly_bookings,
                COUNT(CASE WHEN booking_status = 'in_progress' THEN 1 END) as active_bookings
            FROM bookings
        `;
        
        const activityResult = await pool.query(activityQuery);
        const activity = activityResult.rows[0];
        
        const response = {
            timestamp: new Date().toISOString(),
            system: {
                health: systemHealth,
                performance: performanceMetrics,
                database: poolStats
            },
            activity: {
                recentBookings: parseInt(activity.recent_bookings) || 0,
                hourlyBookings: parseInt(activity.hourly_bookings) || 0,
                activeBookings: parseInt(activity.active_bookings) || 0
            },
            alerts: generateAlerts(systemHealth, performanceMetrics)
        };
        
        res.json(response);
    } catch (error) {
        console.error('Realtime monitoring error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get performance trends
router.get('/trends', async (req, res) => {
    try {
        const { getConnection } = require('../config/database');
        const pool = getConnection();
        const hours = parseInt(req.query.hours) || 24;
        
        const trendsQuery = `
            SELECT 
                DATE_TRUNC('hour', check_time) as hour,
                AVG(overall_health_score) as avg_health_score,
                AVG(db_response_time) as avg_db_response_time,
                AVG(api_response_time) as avg_api_response_time,
                SUM(system_errors_last_hour) as total_errors
            FROM system_health 
            WHERE check_time >= CURRENT_TIMESTAMP - INTERVAL '${hours} hours'
            GROUP BY DATE_TRUNC('hour', check_time)
            ORDER BY hour ASC
        `;
        
        const result = await pool.query(trendsQuery);
        const trends = result.rows.map(row => ({
            timestamp: row.hour,
            healthScore: parseFloat(row.avg_health_score).toFixed(1),
            dbResponseTime: parseFloat(row.avg_db_response_time).toFixed(1),
            apiResponseTime: parseFloat(row.avg_api_response_time).toFixed(1),
            totalErrors: parseInt(row.total_errors) || 0
        }));
        
        // Calculate trend analysis
        const analysis = calculateTrendAnalysis(trends);
        
        res.json({
            period: `${hours} hours`,
            trends,
            analysis,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('Performance trends error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Performance alerts endpoint
router.get('/alerts', async (req, res) => {
    try {
        const systemHealth = await getSystemHealth();
        const performanceMetrics = getPerformanceMetrics();
        const alerts = generateAlerts(systemHealth, performanceMetrics);
        
        res.json({
            alerts,
            summary: {
                total: alerts.length,
                critical: alerts.filter(a => a.severity === 'critical').length,
                warning: alerts.filter(a => a.severity === 'warning').length,
                info: alerts.filter(a => a.severity === 'info').length
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Performance alerts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper function to generate alerts
function generateAlerts(systemHealth, _performanceMetrics) {
    const alerts = [];
    
    // High memory usage alert
    if (systemHealth.memory.heapUsed > 500) {
        alerts.push({
            id: 'high-memory',
            severity: 'warning',
            title: 'High Memory Usage',
            message: `Heap memory usage is ${systemHealth.memory.heapUsed}MB`,
            threshold: '500MB',
            current: `${systemHealth.memory.heapUsed}MB`,
            timestamp: new Date().toISOString()
        });
    }
    
    // High response time alert
    if (systemHealth.stats.averageResponseTime > 1000) {
        alerts.push({
            id: 'slow-response',
            severity: 'critical',
            title: 'Slow Response Time',
            message: `Average response time is ${systemHealth.stats.averageResponseTime}ms`,
            threshold: '1000ms',
            current: `${systemHealth.stats.averageResponseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
    
    // High error rate alert
    if (systemHealth.stats.errorRate > 5) {
        alerts.push({
            id: 'high-error-rate',
            severity: 'critical',
            title: 'High Error Rate',
            message: `Error rate is ${systemHealth.stats.errorRate}%`,
            threshold: '5%',
            current: `${systemHealth.stats.errorRate}%`,
            timestamp: new Date().toISOString()
        });
    }
    
    // Active requests alert
    if (systemHealth.activeRequests > 10) {
        alerts.push({
            id: 'high-load',
            severity: 'warning',
            title: 'High Server Load',
            message: `${systemHealth.activeRequests} active requests`,
            threshold: '10 requests',
            current: `${systemHealth.activeRequests} requests`,
            timestamp: new Date().toISOString()
        });
    }
    
    return alerts;
}

// Helper function to calculate trend analysis
function calculateTrendAnalysis(trends) {
    if (trends.length < 2) return { status: 'insufficient_data' };
    
    const latest = trends[trends.length - 1];
    const previous = trends[trends.length - 2];
    
    const healthTrend = parseFloat(latest.healthScore) - parseFloat(previous.healthScore);
    const responseTrend = parseFloat(latest.apiResponseTime) - parseFloat(previous.apiResponseTime);
    const errorTrend = latest.totalErrors - previous.totalErrors;
    
    return {
        status: 'analyzed',
        healthScore: {
            trend: healthTrend > 0 ? 'improving' : healthTrend < 0 ? 'degrading' : 'stable',
            change: healthTrend.toFixed(1)
        },
        responseTime: {
            trend: responseTrend > 0 ? 'slower' : responseTrend < 0 ? 'faster' : 'stable',
            change: `${responseTrend.toFixed(1)}ms`
        },
        errors: {
            trend: errorTrend > 0 ? 'increasing' : errorTrend < 0 ? 'decreasing' : 'stable',
            change: errorTrend
        }
    };
}

module.exports = router; 