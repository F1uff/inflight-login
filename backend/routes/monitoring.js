const express = require('express');
const router = express.Router();
const { getDatabase } = require('../scripts/init-database');

// Get system health overview
router.get('/health', async (req, res) => {
    try {
        const db = getDatabase();
        
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
        
        db.get(query, [], (err, health) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch system health' });
            }
            
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
            db.close();
        });
        
    } catch (error) {
        console.error('System health error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get system metrics over time
router.get('/metrics', async (req, res) => {
    try {
        const db = getDatabase();
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
            WHERE check_time >= datetime('now', '-${hours} hours')
            ORDER BY check_time ASC
        `;
        
        db.all(query, [], (err, metrics) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch system metrics' });
            }
            
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
            db.close();
        });
        
    } catch (error) {
        console.error('System metrics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update system health (for testing purposes)
router.post('/health/update', async (req, res) => {
    try {
        const db = getDatabase();
        const startTime = Date.now();
        
        // Simulate some system checks
        const dbStartTime = Date.now();
        db.get('SELECT 1', [], () => {
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
                ) VALUES (?, ?, ?, ?, ?)
            `;
            
            db.run(query, [
                healthScore,
                dbResponseTime,
                apiResponseTime,
                Math.floor(Math.random() * 50 + 10), // Random active sessions
                Math.floor(Math.random() * 3) // Random errors (0-2)
            ], (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to update system health' });
                }
                
                res.json({
                    message: 'System health updated successfully',
                    healthScore: healthScore,
                    dbResponseTime: dbResponseTime,
                    apiResponseTime: apiResponseTime,
                    timestamp: new Date().toISOString()
                });
                
                db.close();
            });
        });
        
    } catch (error) {
        console.error('Update system health error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 