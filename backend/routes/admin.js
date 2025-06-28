const express = require('express');
const router = express.Router();
const { getDatabase } = require('../scripts/init-database');

// Get comprehensive admin dashboard overview
router.get('/overview', async (req, res) => {
    try {
        const db = getDatabase();
        
        // Get comprehensive admin metrics (simplified for existing schema)
        const adminMetricsQuery = `
            SELECT 
                COUNT(CASE WHEN booking_status = 'completed' THEN 1 END) as completed_bookings,
                COUNT(CASE WHEN booking_status = 'pending' THEN 1 END) as pending_bookings,
                COUNT(CASE WHEN booking_status = 'cancelled' THEN 1 END) as cancelled_bookings,
                COUNT(CASE WHEN booking_status = 'in_progress' THEN 1 END) as active_bookings,
                SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue,
                SUM(CASE WHEN payment_status = 'pending' THEN total_amount ELSE 0 END) as pending_revenue,
                COUNT(CASE WHEN DATE(created_at) = DATE('now') THEN 1 END) as today_bookings,
                COUNT(CASE WHEN DATE(created_at) >= DATE('now', '-7 days') THEN 1 END) as week_bookings,
                COUNT(CASE WHEN DATE(created_at) >= DATE('now', '-30 days') THEN 1 END) as month_bookings
            FROM bookings
            WHERE created_at >= DATE('now', '-90 days')
        `;
        
        db.get(adminMetricsQuery, [], (err, adminMetrics) => {
            if (err) {
                console.error('Admin metrics error:', err);
                return res.status(500).json({ error: 'Failed to fetch admin metrics' });
            }
            
            // Get supplier performance summary
            const supplierSummaryQuery = `
                SELECT 
                    s.supplier_type,
                    COUNT(*) as total_suppliers,
                    COUNT(CASE WHEN s.account_status = 'active' THEN 1 END) as active_suppliers,
                    COUNT(CASE WHEN s.account_status = 'pending' THEN 1 END) as pending_suppliers,
                    COUNT(CASE WHEN s.account_status = 'inactive' THEN 1 END) as inactive_suppliers,
                    AVG(s.overall_rating) as avg_rating,
                    SUM(s.total_revenue_generated) as total_revenue
                FROM suppliers s
                GROUP BY s.supplier_type
                ORDER BY total_revenue DESC
            `;
            
            db.all(supplierSummaryQuery, [], (err, supplierSummary) => {
                if (err) {
                    console.error('Supplier summary error:', err);
                    return res.status(500).json({ error: 'Failed to fetch supplier summary' });
                }
                
                const response = {
                    overview: {
                        bookings: {
                            total: (adminMetrics.completed_bookings || 0) + (adminMetrics.pending_bookings || 0) + (adminMetrics.cancelled_bookings || 0) + (adminMetrics.active_bookings || 0),
                            completed: adminMetrics.completed_bookings || 0,
                            pending: adminMetrics.pending_bookings || 0,
                            cancelled: adminMetrics.cancelled_bookings || 0,
                            active: adminMetrics.active_bookings || 0,
                            today: adminMetrics.today_bookings || 0,
                            thisWeek: adminMetrics.week_bookings || 0,
                            thisMonth: adminMetrics.month_bookings || 0
                        },
                        revenue: {
                            total: parseFloat(adminMetrics.total_revenue || 0).toFixed(2),
                            pending: parseFloat(adminMetrics.pending_revenue || 0).toFixed(2),
                            currency: 'PHP'
                        },
                        performance: {
                            totalBookings: (adminMetrics.completed_bookings || 0) + (adminMetrics.pending_bookings || 0) + (adminMetrics.cancelled_bookings || 0) + (adminMetrics.active_bookings || 0),
                            completionRate: adminMetrics.completed_bookings > 0 ? ((adminMetrics.completed_bookings / ((adminMetrics.completed_bookings || 0) + (adminMetrics.pending_bookings || 0) + (adminMetrics.cancelled_bookings || 0) + (adminMetrics.active_bookings || 0))) * 100).toFixed(1) : 0
                        }
                    },
                    supplierBreakdown: supplierSummary.map(supplier => ({
                        type: supplier.supplier_type,
                        total: supplier.total_suppliers,
                        active: supplier.active_suppliers,
                        pending: supplier.pending_suppliers,
                        inactive: supplier.inactive_suppliers,
                        avgRating: parseFloat(supplier.avg_rating || 0).toFixed(1),
                        totalRevenue: parseFloat(supplier.total_revenue || 0).toFixed(2)
                    })),
                    lastUpdated: new Date().toISOString()
                };
                
                res.json(response);
                db.close();
            });
        });
        
    } catch (error) {
        console.error('Admin overview error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get detailed booking analytics for admin dashboard
router.get('/bookings/analytics', async (req, res) => {
    try {
        const db = getDatabase();
        const timeframe = req.query.timeframe || '30'; // days
        
        const analyticsQuery = `
            SELECT 
                DATE(b.created_at) as booking_date,
                COUNT(*) as total_bookings,
                COUNT(CASE WHEN b.booking_status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN b.booking_status = 'cancelled' THEN 1 END) as cancelled,
                SUM(b.total_amount) as daily_revenue,
                AVG(b.total_amount) as avg_booking_value,
                COUNT(DISTINCT b.customer_id) as unique_customers
            FROM bookings b
            WHERE b.created_at >= DATE('now', '-${timeframe} days')
            GROUP BY DATE(b.created_at)
            ORDER BY booking_date DESC
        `;
        
        db.all(analyticsQuery, [], (err, analytics) => {
            if (err) {
                console.error('Booking analytics error:', err);
                return res.status(500).json({ error: 'Failed to fetch booking analytics' });
            }
            
            // Get status distribution
            const statusQuery = `
                SELECT 
                    booking_status,
                    COUNT(*) as count,
                    (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM bookings WHERE created_at >= DATE('now', '-${timeframe} days'))) as percentage
                FROM bookings
                WHERE created_at >= DATE('now', '-${timeframe} days')
                GROUP BY booking_status
            `;
            
            db.all(statusQuery, [], (err, statusDistribution) => {
                if (err) {
                    console.error('Status distribution error:', err);
                    return res.status(500).json({ error: 'Failed to fetch status distribution' });
                }
                
                const response = {
                    timeframe: `${timeframe} days`,
                    dailyAnalytics: analytics.map(day => ({
                        date: day.booking_date,
                        totalBookings: day.total_bookings,
                        completed: day.completed,
                        cancelled: day.cancelled,
                        revenue: parseFloat(day.daily_revenue || 0).toFixed(2),
                        avgBookingValue: parseFloat(day.avg_booking_value || 0).toFixed(2),
                        uniqueCustomers: day.unique_customers
                    })),
                    statusDistribution: statusDistribution.map(status => ({
                        status: status.booking_status,
                        count: status.count,
                        percentage: parseFloat(status.percentage).toFixed(1)
                    })),
                    lastUpdated: new Date().toISOString()
                };
                
                res.json(response);
                db.close();
            });
        });
        
    } catch (error) {
        console.error('Booking analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get real-time system monitoring data
router.get('/monitoring/realtime', async (req, res) => {
    try {
        const db = getDatabase();
        
        const monitoringQuery = `
            SELECT 
                -- Current active sessions
                COUNT(CASE WHEN us.is_active = 1 AND us.expires_at > DATETIME('now') THEN 1 END) as active_sessions,
                
                -- Recent activity (last hour)
                COUNT(CASE WHEN b.created_at >= DATETIME('now', '-1 hour') THEN 1 END) as bookings_last_hour,
                COUNT(CASE WHEN b.booking_status = 'in_progress' THEN 1 END) as trips_in_progress,
                
                -- System load indicators
                COUNT(CASE WHEN b.created_at >= DATETIME('now', '-5 minutes') THEN 1 END) as recent_activity
                
            FROM bookings b
            LEFT JOIN user_sessions us ON us.created_at >= DATETIME('now', '-1 hour')
        `;
        
        db.get(monitoringQuery, [], (err, monitoring) => {
            if (err) {
                console.error('Real-time monitoring error:', err);
                return res.status(500).json({ error: 'Failed to fetch monitoring data' });
            }
            
            // Calculate system health score
            const healthScore = Math.min(100, Math.max(0, 
                100 - (monitoring.recent_activity > 10 ? 5 : 0) // High activity penalty
            ));
            
            const response = {
                realTimeMetrics: {
                    activeSessions: monitoring.active_sessions || 0,
                    bookingsLastHour: monitoring.bookings_last_hour || 0,
                    tripsInProgress: monitoring.trips_in_progress || 0,
                    recentActivity: monitoring.recent_activity || 0,
                    systemHealthScore: healthScore,
                    timestamp: new Date().toISOString()
                },
                serverStatus: {
                    uptime: process.uptime(),
                    memoryUsage: process.memoryUsage(),
                    cpuUsage: process.cpuUsage(),
                    nodeVersion: process.version
                },
                lastUpdated: new Date().toISOString()
            };
            
            res.json(response);
            db.close();
        });
        
    } catch (error) {
        console.error('Real-time monitoring error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user management data for admin
router.get('/users', async (req, res) => {
    try {
        const db = getDatabase();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const role = req.query.role || 'all';
        const status = req.query.status || 'all';
        
        let whereClause = 'WHERE 1=1';
        if (role !== 'all') {
            whereClause += ` AND u.role = '${role}'`;
        }
        if (status !== 'all') {
            whereClause += ` AND u.status = '${status}'`;
        }
        
        const usersQuery = `
            SELECT 
                u.id,
                u.email,
                u.role,
                u.first_name,
                u.last_name,
                u.phone,
                u.status,
                u.email_verified,
                u.phone_verified,
                u.last_login,
                u.created_at,
                COUNT(us.id) as active_sessions
            FROM users u
            LEFT JOIN user_sessions us ON u.id = us.user_id AND us.is_active = 1 AND us.expires_at > DATETIME('now')
            ${whereClause}
            GROUP BY u.id
            ORDER BY u.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `;
        
        const countQuery = `
            SELECT COUNT(*) as total
            FROM users u
            ${whereClause}
        `;
        
        db.get(countQuery, [], (err, countResult) => {
            if (err) {
                console.error('User count error:', err);
                return res.status(500).json({ error: 'Failed to fetch user count' });
            }
            
            db.all(usersQuery, [], (err, users) => {
                if (err) {
                    console.error('Users query error:', err);
                    return res.status(500).json({ error: 'Failed to fetch users' });
                }
                
                const response = {
                    users: users.map(user => ({
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        name: `${user.first_name} ${user.last_name}`,
                        phone: user.phone,
                        status: user.status,
                        emailVerified: user.email_verified === 1,
                        phoneVerified: user.phone_verified === 1,
                        lastLogin: user.last_login,
                        activeSessions: user.active_sessions,
                        createdAt: user.created_at
                    })),
                    pagination: {
                        page: page,
                        limit: limit,
                        total: countResult.total,
                        pages: Math.ceil(countResult.total / limit)
                    },
                    filters: {
                        role: role,
                        status: status
                    },
                    lastUpdated: new Date().toISOString()
                };
                
                res.json(response);
                db.close();
            });
        });
        
    } catch (error) {
        console.error('User management error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user status (activate/deactivate/suspend)
router.put('/users/:id/status', async (req, res) => {
    try {
        const db = getDatabase();
        const userId = req.params.id;
        const { status, reason } = req.body;
        
        if (!['active', 'inactive', 'suspended', 'pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        
        const updateQuery = `
            UPDATE users 
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        db.run(updateQuery, [status, userId], function(err) {
            if (err) {
                console.error('User status update error:', err);
                return res.status(500).json({ error: 'Failed to update user status' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            // Log the status change for audit
            const auditQuery = `
                INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by, reason)
                VALUES ('users', ?, 'status_change', '{}', ?, ?, ?)
            `;
            
            const auditData = JSON.stringify({ status: status });
            
            db.run(auditQuery, [userId, auditData, req.user?.id || 'system', reason], (auditErr) => {
                if (auditErr) {
                    console.error('Audit log error:', auditErr);
                }
                
                res.json({
                    success: true,
                    message: `User status updated to ${status}`,
                    userId: userId,
                    newStatus: status,
                    updatedAt: new Date().toISOString()
                });
                
                db.close();
            });
        });
        
    } catch (error) {
        console.error('User status update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 