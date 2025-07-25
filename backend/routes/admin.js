const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/database');
const DataUtilityService = require('../services/DataUtilityService');

// Get comprehensive admin dashboard overview
router.get('/overview', async (req, res) => {
    try {
        const pool = getConnection();
        
        // Get comprehensive admin metrics (simplified for existing schema)
        const adminMetricsQuery = `
            SELECT 
                COUNT(CASE WHEN booking_status = 'completed' THEN 1 END) as completed_bookings,
                COUNT(CASE WHEN booking_status = 'pending' THEN 1 END) as pending_bookings,
                COUNT(CASE WHEN booking_status = 'cancelled' THEN 1 END) as cancelled_bookings,
                COUNT(CASE WHEN booking_status = 'in_progress' THEN 1 END) as active_bookings,
                SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue,
                SUM(CASE WHEN payment_status = 'pending' THEN total_amount ELSE 0 END) as pending_revenue,
                COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_bookings,
                COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_bookings,
                COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as month_bookings
            FROM bookings
            WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
        `;
        
        try {
            // Execute all metrics queries in parallel for better performance
            const [
                bookingResult,
                companyResult,
                userResult,
                healthResult
            ] = await Promise.all([
                pool.query(adminMetricsQuery),
                pool.query(`
                SELECT 
                    COUNT(*) as total_companies,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_companies,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_companies,
                    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_companies
                FROM companies
                `),
                pool.query(`
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
                    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
                    COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users
                FROM users
                `),
                pool.query(`
                SELECT 
                    overall_health_score,
                    db_response_time,
                    api_response_time,
                    active_sessions,
                    system_errors_last_hour
                FROM system_health 
                ORDER BY check_time DESC 
                LIMIT 1
                `)
            ]);
            
            const metrics = bookingResult.rows[0];
            const companyMetrics = companyResult.rows[0];
            const userMetrics = userResult.rows[0];
            const healthMetrics = healthResult.rows[0] || {
                overall_health_score: 100,
                db_response_time: 0,
                api_response_time: 0,
                active_sessions: 0,
                system_errors_last_hour: 0
            };
            
            const response = {
                success: true,
                overview: {
                    bookings: {
                        completed: parseInt(metrics.completed_bookings) || 0,
                        pending: parseInt(metrics.pending_bookings) || 0,
                        cancelled: parseInt(metrics.cancelled_bookings) || 0,
                        active: parseInt(metrics.active_bookings) || 0,
                        today: parseInt(metrics.today_bookings) || 0,
                        week: parseInt(metrics.week_bookings) || 0,
                        month: parseInt(metrics.month_bookings) || 0
                    },
                    revenue: {
                        total: parseFloat(metrics.total_revenue) || 0,
                        pending: parseFloat(metrics.pending_revenue) || 0,
                        paid: parseFloat(metrics.total_revenue) || 0
                    },
                    companies: {
                        total: parseInt(companyMetrics.total_companies) || 0,
                        active: parseInt(companyMetrics.active_companies) || 0,
                        pending: parseInt(companyMetrics.pending_companies) || 0,
                        inactive: parseInt(companyMetrics.inactive_companies) || 0
                    },
                    users: {
                        total: parseInt(userMetrics.total_users) || 0,
                        active: parseInt(userMetrics.active_users) || 0,
                        admin: parseInt(userMetrics.admin_users) || 0,
                        regular: parseInt(userMetrics.regular_users) || 0
                    },
                    system: {
                        health_score: healthMetrics.overall_health_score || 100,
                        db_response_time: parseFloat(healthMetrics.db_response_time) || 0,
                        api_response_time: parseFloat(healthMetrics.api_response_time) || 0,
                        active_sessions: parseInt(healthMetrics.active_sessions) || 0,
                        system_errors: parseInt(healthMetrics.system_errors_last_hour) || 0
                    }
                },
                timestamp: new Date().toISOString()
            };
            
            res.json(response);
        } catch (err) {
            console.error('Admin overview query error:', err);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: 'Failed to fetch admin overview',
                    details: err.message
                },
                timestamp: new Date().toISOString()
            });
        }
        
    } catch (error) {
        console.error('Admin overview error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error',
                details: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Get detailed booking analytics for admin dashboard
router.get('/bookings/analytics', async (req, res) => {
    try {
        const pool = getConnection();
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
            WHERE b.created_at >= CURRENT_DATE - INTERVAL '${timeframe} days'
            GROUP BY DATE(b.created_at)
            ORDER BY booking_date DESC
        `;
        
        try {
            const result = await pool.query(analyticsQuery);
            const analytics = result.rows || [];
            
            // Get status distribution
            const statusQuery = `
                SELECT 
                    booking_status,
                    COUNT(*) as count,
                    (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM bookings WHERE created_at >= CURRENT_DATE - INTERVAL '${timeframe} days')) as percentage
                FROM bookings
                WHERE created_at >= CURRENT_DATE - INTERVAL '${timeframe} days'
                GROUP BY booking_status
            `;
            
            const statusResult = await pool.query(statusQuery);
            const statusDistribution = statusResult.rows || [];
            
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
        } catch (err) {
            console.error('Booking analytics query error:', err);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: 'Failed to fetch booking analytics',
                    details: err.message
                },
                timestamp: new Date().toISOString()
            });
        }
        
    } catch (error) {
        console.error('Booking analytics error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error',
                details: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Get real-time system monitoring data
router.get('/monitoring/realtime', async (req, res) => {
    try {
        const pool = getConnection();
        
        const monitoringQuery = `
            SELECT 
                -- Current active sessions
                COUNT(CASE WHEN us.is_active = true AND us.expires_at > CURRENT_TIMESTAMP THEN 1 END) as active_sessions,
                
                -- Recent activity (last hour)
                COUNT(CASE WHEN b.created_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour' THEN 1 END) as bookings_last_hour,
                COUNT(CASE WHEN b.booking_status = 'in_progress' THEN 1 END) as trips_in_progress,
                
                -- System load indicators
                COUNT(CASE WHEN b.created_at >= CURRENT_TIMESTAMP - INTERVAL '5 minutes' THEN 1 END) as recent_activity
                
            FROM bookings b
            LEFT JOIN user_sessions us ON us.created_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
        `;
        
        try {
            const result = await pool.query(monitoringQuery);
            const monitoring = result.rows[0];
            
            // Get additional system metrics
            const systemQuery = `
                SELECT 
                    overall_health_score,
                    db_response_time,
                    api_response_time,
                    system_errors_last_hour,
                    check_time
                FROM system_health 
                ORDER BY check_time DESC 
                LIMIT 1
            `;
            
            const systemResult = await pool.query(systemQuery);
            const systemMetrics = systemResult.rows[0] || {
                overall_health_score: 100,
                db_response_time: 0,
                api_response_time: 0,
                system_errors_last_hour: 0,
                check_time: new Date().toISOString()
            };
            
            const response = {
                success: true,
                monitoring: {
                    active_sessions: parseInt(monitoring.active_sessions) || 0,
                    bookings_last_hour: parseInt(monitoring.bookings_last_hour) || 0,
                    trips_in_progress: parseInt(monitoring.trips_in_progress) || 0,
                    recent_activity: parseInt(monitoring.recent_activity) || 0,
                    health_score: systemMetrics.overall_health_score || 100,
                    db_response_time: parseFloat(systemMetrics.db_response_time) || 0,
                    api_response_time: parseFloat(systemMetrics.api_response_time) || 0,
                    system_errors: parseInt(systemMetrics.system_errors_last_hour) || 0,
                    last_check: systemMetrics.check_time || new Date().toISOString()
                },
                timestamp: new Date().toISOString()
            };
            
            res.json(response);
        } catch (err) {
            console.error('Admin monitoring query error:', err);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: 'Failed to fetch monitoring data',
                    details: err.message
                },
                timestamp: new Date().toISOString()
            });
        }
        
    } catch (error) {
        console.error('Admin monitoring error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error',
                details: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Get user management data for admin
router.get('/users', async (req, res) => {
    try {
        const pool = getConnection();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const role = req.query.role || 'all';
        const status = req.query.status || 'all';
        
        let whereConditions = ['1=1'];
        let queryParams = [];
        let paramIndex = 1;
        
        if (role !== 'all') {
            whereConditions.push(`u.role = $${paramIndex}`);
            queryParams.push(role);
            paramIndex++;
        }
        
        if (status !== 'all') {
            whereConditions.push(`u.status = $${paramIndex}`);
            queryParams.push(status);
            paramIndex++;
        }
        
        const whereClause = whereConditions.length > 1 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
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
            LEFT JOIN user_sessions us ON u.id = us.user_id AND us.is_active = true AND us.expires_at > CURRENT_TIMESTAMP
            ${whereClause}
            GROUP BY u.id, u.email, u.role, u.first_name, u.last_name, u.phone, u.status, u.email_verified, u.phone_verified, u.last_login, u.created_at
            ORDER BY u.created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        
        const countQuery = `
            SELECT COUNT(*) as total
            FROM users u
            ${whereClause}
        `;
        
        const usersParams = [...queryParams, limit, offset];
        const countParams = queryParams;
        
        try {
            const [usersResult, countResult] = await Promise.all([
                pool.query(usersQuery, usersParams),
                pool.query(countQuery, countParams)
            ]);
            
            const users = usersResult.rows || [];
            const total = parseInt(countResult.rows[0].total);
            
            const response = {
                success: true,
                users: users,
                pagination: {
                    page: page,
                    limit: limit,
                    total: total,
                    pages: Math.ceil(total / limit)
                },
                timestamp: new Date().toISOString()
            };
            
            res.json(response);
        } catch (err) {
            console.error('Admin users query error:', err);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: 'Failed to fetch users data',
                    details: err.message
                },
                timestamp: new Date().toISOString()
            });
        }
        
    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error',
                details: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Update user status (activate/deactivate/suspend)
router.put('/users/:id/status', async (req, res) => {
    try {
        const pool = getConnection();
        const userId = req.params.id;
        const { status, reason } = req.body;
        
        if (!['active', 'inactive', 'suspended', 'pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        
        const updateQuery = `
            UPDATE users 
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
        `;
        
        try {
            const result = await pool.query(updateQuery, [status, userId]);
            
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            // Log the status change for audit
            const auditQuery = `
                INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by, reason)
                VALUES ('users', $1, 'status_change', '{}', $2, $3, $4)
            `;
            
            const auditData = JSON.stringify({ status: status });
            
            await pool.query(auditQuery, [userId, auditData, req.user?.id || 'system', reason]);
            
            res.json({
                success: true,
                message: `User status updated to ${status}`,
                userId: userId,
                newStatus: status,
                updatedAt: new Date().toISOString()
            });
        } catch (err) {
            console.error('User status update error:', err);
            return res.status(500).json({ error: 'Failed to update user status' });
        }
        
    } catch (error) {
        console.error('User status update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================================
// SHARED DATA ENDPOINTS - Admin views (see all companies)
// ============================================================================

// Get all drivers across all companies (Admin view)
router.get('/drivers', async (req, res) => {
    try {
        const pool = getConnection();
        const { page = 1, limit = 50, status, search } = req.query;
        
        // Admin sees all companies
        const queryData = DataUtilityService.buildDriverQuery({
            admin_view: true,
            status,
            search
        });

        const offset = (page - 1) * limit;
        const driversQuery = queryData.query + ` LIMIT $${queryData.params.length + 1} OFFSET $${queryData.params.length + 2}`;
        const driversParams = [...queryData.params, limit, offset];

        try {
            const [driversResult, countResult] = await Promise.all([
                pool.query(driversQuery, driversParams),
                pool.query(queryData.countQuery, queryData.countParams)
            ]);

            const drivers = driversResult.rows || [];
            const total = parseInt(countResult.rows[0].total);

            // Get summary data for admin (all companies)
            const summaryQueries = DataUtilityService.buildSummaryQueries({ admin_view: true });
            const summaryResult = await pool.query(summaryQueries.drivers.query, summaryQueries.drivers.params);
            const summary = summaryResult.rows[0];

            const response = DataUtilityService.formatResponse(
                true,
                {
                    drivers: drivers,
                    summary: {
                        total: summary?.total || 0,
                        active: summary?.active || 0,
                        pending: summary?.pending || 0,
                        inactive: summary?.inactive || 0,
                        regular: summary?.regular || 0,
                        subcon: summary?.subcon || 0
                    },
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: total,
                        totalPages: Math.ceil(total / limit)
                    }
                },
                null,
                'admin'
            );

            res.json(response);
        } catch (err) {
            console.error('Admin drivers query error:', err);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: 'Failed to fetch drivers data',
                    details: err.message
                },
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        console.error('Admin drivers error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error',
                details: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Get all vehicles across all companies (Admin view)
router.get('/vehicles', async (req, res) => {
    try {
        const pool = getConnection();
        const { page = 1, limit = 50, status, search } = req.query;
        
        // Admin sees all companies
        const queryData = DataUtilityService.buildVehicleQuery({
            admin_view: true,
            status,
            search
        });

        const offset = (page - 1) * limit;
        const vehiclesQuery = queryData.query + ` LIMIT $${queryData.params.length + 1} OFFSET $${queryData.params.length + 2}`;
        const vehiclesParams = [...queryData.params, limit, offset];

        try {
            const [vehiclesResult, countResult] = await Promise.all([
                pool.query(vehiclesQuery, vehiclesParams),
                pool.query(queryData.countQuery, queryData.countParams)
            ]);

            const vehicles = vehiclesResult.rows || [];
            const total = parseInt(countResult.rows[0].total);

            // Get summary data for admin (all companies)
            const summaryQueries = DataUtilityService.buildSummaryQueries({ admin_view: true });
            const summaryResult = await pool.query(summaryQueries.vehicles.query, summaryQueries.vehicles.params);
            const summary = summaryResult.rows[0];

            const response = DataUtilityService.formatResponse(
                true,
                {
                    vehicles: vehicles,
                    summary: {
                        total: summary?.total || 0,
                        active: summary?.active || 0,
                        pending: summary?.pending || 0,
                        inactive: summary?.inactive || 0,
                        company: summary?.company || 0,
                        subcon: summary?.subcon || 0
                    },
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: total,
                        totalPages: Math.ceil(total / limit)
                    }
                },
                null,
                'admin'
            );

            res.json(response);
        } catch (err) {
            console.error('Admin vehicles query error:', err);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: 'Failed to fetch vehicles data',
                    details: err.message
                },
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        console.error('Admin vehicles error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error',
                details: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Get all bookings across all companies (Admin view)
router.get('/bookings', async (req, res) => {
    try {
        const pool = getConnection();
        const { page = 1, limit = 50, status, date_from, date_to } = req.query;
        
        // Admin sees all companies
        const queryData = DataUtilityService.buildBookingQuery({
            admin_view: true,
            status,
            date_from,
            date_to
        });

        const offset = (page - 1) * limit;
        const bookingsQuery = queryData.query + ` LIMIT $${queryData.params.length + 1} OFFSET $${queryData.params.length + 2}`;
        const bookingsParams = [...queryData.params, limit, offset];

        try {
            const [bookingsResult, countResult] = await Promise.all([
                pool.query(bookingsQuery, bookingsParams),
                pool.query(queryData.countQuery, queryData.countParams)
            ]);

            const bookings = bookingsResult.rows || [];
            const total = parseInt(countResult.rows[0].total);

            // Get summary data for admin (all companies)
            const summaryQueries = DataUtilityService.buildSummaryQueries({ admin_view: true });
            const summaryResult = await pool.query(summaryQueries.bookings.query, summaryQueries.bookings.params);
            const summary = summaryResult.rows[0];

            const response = DataUtilityService.formatResponse(
                true,
                {
                    bookings: bookings,
                    summary: {
                        total: summary?.total || 0,
                        confirmed: summary?.confirmed || 0,
                        pending: summary?.pending || 0,
                        completed: summary?.completed || 0,
                        cancelled: summary?.cancelled || 0,
                        revenue: summary?.revenue || 0
                    },
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: total,
                        totalPages: Math.ceil(total / limit)
                    }
                },
                null,
                'admin'
            );

            res.json(response);
        } catch (err) {
            console.error('Admin bookings query error:', err);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: 'Failed to fetch bookings data',
                    details: err.message
                },
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        console.error('Admin bookings error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error',
                details: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Get system-wide activities (Admin view)
router.get('/activities', async (req, res) => {
    try {
        const pool = getConnection();
        const { page = 1, limit = 20, days = 30 } = req.query;
        
        // Admin sees all companies
        const queryData = DataUtilityService.buildActivityQuery({
            admin_view: true,
            days: parseInt(days)
        });

        const offset = (page - 1) * limit;
        const activitiesQuery = queryData.query + ` LIMIT $${queryData.params.length + 1} OFFSET $${queryData.params.length + 2}`;
        const activitiesParams = [...queryData.params, limit, offset];

        try {
            const [activitiesResult, countResult] = await Promise.all([
                pool.query(activitiesQuery, activitiesParams),
                pool.query(queryData.countQuery, queryData.countParams)
            ]);

            const activities = activitiesResult.rows || [];
            const total = parseInt(countResult.rows[0].total);

            const response = DataUtilityService.formatResponse(
                true,
                {
                    activities: activities,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: total,
                        totalPages: Math.ceil(total / limit)
                    },
                    timeframe: parseInt(days)
                },
                null,
                'admin'
            );

            res.json(response);
        } catch (err) {
            console.error('Admin activities query error:', err);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: 'Failed to fetch activities data',
                    details: err.message
                },
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        console.error('Admin activities error:', error);
        res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'admin', 'Internal server error'));
    }
});

// Get supplier statistics for dashboard
router.get('/supplier-stats', async (req, res) => {
    try {
        const pool = getConnection();
        
        // Get supplier statistics with accreditation and regional breakdown
        const statsQuery = `
            SELECT 
                -- Accreditation statistics
                COUNT(CASE WHEN c.accreditation_status = 'accredited' THEN 1 END) as accredited,
                COUNT(CASE WHEN c.accreditation_status = 'accredited' AND s.account_status = 'active' THEN 1 END) as accredited_prepaid,
                COUNT(CASE WHEN c.accreditation_status IN ('none', 'expired', 'pending') THEN 1 END) as non_accredited,
                
                -- Regional statistics (Philippines regions)
                COUNT(CASE 
                    WHEN UPPER(c.city) IN ('MANILA', 'QUEZON CITY', 'MAKATI', 'PASIG', 'TAGUIG', 'MANDALUYONG', 'CALOOCAN', 'LAS PIÑAS', 'MARIKINA', 'MUNTINLUPA', 'NAVOTAS', 'PARAÑAQUE', 'PASAY', 'PATEROS', 'SAN JUAN', 'VALENZUELA', 'MALABON')
                         OR UPPER(c.state) IN ('NCR', 'METRO MANILA', 'NATIONAL CAPITAL REGION')
                         OR UPPER(c.city) LIKE '%MANILA%'
                         OR UPPER(c.city) IN ('ANTIPOLO', 'CAINTA', 'MARIKINA', 'SAN MATEO', 'TAYTAY')
                         OR UPPER(c.state) IN ('RIZAL', 'BULACAN', 'CAVITE', 'LAGUNA', 'BATANGAS', 'PAMPANGA', 'NUEVA ECIJA', 'TARLAC', 'ZAMBALES', 'BATAAN', 'AURORA', 'QUEZON')
                    THEN 1 END) as ncr_luzon,
                    
                COUNT(CASE 
                    WHEN UPPER(c.state) IN ('AKLAN', 'ANTIQUE', 'CAPIZ', 'GUIMARAS', 'ILOILO', 'NEGROS OCCIDENTAL', 'ALBAY', 'CAMARINES NORTE', 'CAMARINES SUR', 'CATANDUANES', 'MASBATE', 'SORSOGON', 'BOHOL', 'CEBU', 'NEGROS ORIENTAL', 'SIQUIJOR', 'BILIRAN', 'EASTERN SAMAR', 'LEYTE', 'NORTHERN SAMAR', 'SAMAR', 'SOUTHERN LEYTE')
                         OR UPPER(c.city) IN ('CEBU CITY', 'ILOILO CITY', 'BACOLOD', 'TACLOBAN', 'DUMAGUETE', 'TAGBILARAN', 'ROXAS CITY', 'KALIBO', 'BORACAY')
                         OR UPPER(c.city) LIKE '%CEBU%'
                         OR UPPER(c.city) LIKE '%ILOILO%'
                         OR UPPER(c.city) LIKE '%BOHOL%'
                    THEN 1 END) as visayas,
                    
                COUNT(CASE 
                    WHEN UPPER(c.state) IN ('ZAMBOANGA DEL NORTE', 'ZAMBOANGA DEL SUR', 'ZAMBOANGA SIBUGAY', 'BASILAN', 'LANAO DEL NORTE', 'LANAO DEL SUR', 'MAGUINDANAO', 'NORTH COTABATO', 'SARANGANI', 'SOUTH COTABATO', 'SULTAN KUDARAT', 'SULU', 'TAWI-TAWI', 'AGUSAN DEL NORTE', 'AGUSAN DEL SUR', 'DINAGAT ISLANDS', 'SURIGAO DEL NORTE', 'SURIGAO DEL SUR', 'CAMIGUIN', 'MISAMIS OCCIDENTAL', 'MISAMIS ORIENTAL', 'BUKIDNON', 'DAVAO DEL NORTE', 'DAVAO DEL SUR', 'DAVAO OCCIDENTAL', 'DAVAO ORIENTAL', 'COMPOSTELA VALLEY')
                         OR UPPER(c.city) IN ('DAVAO CITY', 'CAGAYAN DE ORO', 'ZAMBOANGA CITY', 'BUTUAN', 'ILIGAN', 'COTABATO CITY', 'MARAWI', 'PAGADIAN', 'MALAYBALAY', 'SURIGAO CITY', 'TANDAG', 'BISLIG', 'KIDAPAWAN')
                         OR UPPER(c.city) LIKE '%DAVAO%'
                         OR UPPER(c.city) LIKE '%MINDANAO%'
                    THEN 1 END) as mindanao
                    
            FROM suppliers s
            JOIN companies c ON s.company_id = c.id
            WHERE s.account_status IN ('active', 'pending_approval')
        `;
        
        try {
            const result = await pool.query(statsQuery);
            const stats = result.rows[0];
            
            const response = {
                success: true,
                data: {
                    accreditation: {
                        accredited: parseInt(stats.accredited) || 0,
                        accreditedPrepaid: parseInt(stats.accredited_prepaid) || 0,
                        nonAccredited: parseInt(stats.non_accredited) || 0
                    },
                    regional: {
                        ncrLuzon: parseInt(stats.ncr_luzon) || 0,
                        visayas: parseInt(stats.visayas) || 0,
                        mindanao: parseInt(stats.mindanao) || 0
                    },
                    total: {
                        suppliers: parseInt(stats.accredited) + parseInt(stats.non_accredited) || 0
                    }
                },
                timestamp: new Date().toISOString()
            };
            
            res.json(response);
            
        } catch (err) {
            console.error('Supplier stats query error:', err);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: 'Failed to fetch supplier statistics',
                    details: err.message
                },
                timestamp: new Date().toISOString()
            });
        }
        
    } catch (error) {
        console.error('Supplier stats error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error',
                details: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router; 