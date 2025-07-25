const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /dashboard/overview:
 *   get:
 *     summary: Get dashboard overview metrics
 *     description: Retrieve comprehensive dashboard metrics including bookings, revenue, and performance data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     metrics:
 *                       $ref: '#/components/schemas/DashboardStats'
 *                     recentBookings:
 *                       type: array
 *                       items:
 *                         type: object
 *                     topSuppliers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Supplier'
 *             example:
 *               success: true
 *               data:
 *                 metrics:
 *                   totalBookings: 1250
 *                   completedBookings: 1100
 *                   totalRevenue: 125000.50
 *                   activeSuppliers: 45
 *                   activeDrivers: 120
 *                 recentBookings: []
 *                 topSuppliers: []
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/overview', async (req, res) => {
    try {
        const { getConnection } = require('../config/database');
        const pool = getConnection();
        
        // Get latest metrics
        const metricsQuery = `
            SELECT 
                SUM(total_bookings) as total_bookings,
                SUM(completed_bookings) as completed_bookings,
                SUM(cancelled_bookings) as cancelled_bookings,
                SUM(total_revenue) as total_revenue,
                AVG(active_suppliers) as active_suppliers,
                AVG(active_drivers) as active_drivers,
                AVG(average_rating) as average_rating,
                AVG(customer_satisfaction) as customer_satisfaction
            FROM dashboard_metrics 
            WHERE metric_date >= CURRENT_DATE - INTERVAL '7 days'
        `;
        
        const metrics = await pool.query(metricsQuery);
        const metricsData = metrics.rows[0];
        
        // Get recent bookings
        const bookingsQuery = `
            SELECT 
                booking_reference,
                pickup_address,
                destination_address,
                total_amount,
                booking_status,
                payment_status,
                created_at
            FROM bookings 
            ORDER BY created_at DESC 
            LIMIT 10
        `;
        
        const recentBookings = await pool.query(bookingsQuery);
        
        // Calculate completion rate
        const completionRate = metricsData.total_bookings > 0 
            ? ((metricsData.completed_bookings / metricsData.total_bookings) * 100).toFixed(1)
            : 0;
        
        // Calculate cancellation rate
        const cancellationRate = metricsData.total_bookings > 0
            ? ((metricsData.cancelled_bookings / metricsData.total_bookings) * 100).toFixed(1)
            : 0;
        
        const response = {
            metrics: {
                totalBookings: Math.round(metricsData.total_bookings || 0),
                completedBookings: Math.round(metricsData.completed_bookings || 0),
                cancelledBookings: Math.round(metricsData.cancelled_bookings || 0),
                totalRevenue: parseFloat(metricsData.total_revenue || 0).toFixed(2),
                activeSuppliers: Math.round(metricsData.active_suppliers || 0),
                activeDrivers: Math.round(metricsData.active_drivers || 0),
                averageRating: parseFloat(metricsData.average_rating || 0).toFixed(1),
                customerSatisfaction: parseFloat(metricsData.customer_satisfaction || 0).toFixed(1),
                completionRate: parseFloat(completionRate),
                cancellationRate: parseFloat(cancellationRate)
            },
            recentBookings: recentBookings.rows.map(booking => ({
                ...booking,
                total_amount: parseFloat(booking.total_amount).toFixed(2),
                created_at: new Date(booking.created_at).toISOString()
            })),
            lastUpdated: new Date().toISOString()
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('Dashboard overview error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get revenue analytics
router.get('/revenue', async (req, res) => {
    try {
        const { getConnection } = require('../config/database');
        const pool = getConnection();
        const days = parseInt(req.query.days) || 7;
        
        const query = `
            SELECT 
                metric_date,
                total_revenue,
                total_bookings
            FROM dashboard_metrics 
            WHERE metric_date >= CURRENT_DATE - INTERVAL '${days} days'
            ORDER BY metric_date ASC
        `;
        
        const result = await pool.query(query);
        const rows = result.rows;
        
        const response = {
            period: `${days} days`,
            data: rows.map(row => ({
                date: row.metric_date,
                revenue: parseFloat(row.total_revenue).toFixed(2),
                bookings: row.total_bookings
            })),
            totalRevenue: rows.reduce((sum, row) => sum + parseFloat(row.total_revenue), 0).toFixed(2),
            totalBookings: rows.reduce((sum, row) => sum + row.total_bookings, 0)
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('Revenue analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get booking status distribution
router.get('/booking-stats', async (req, res) => {
    try {
        const { getConnection } = require('../config/database');
        const pool = getConnection();
        
        const query = `
            SELECT 
                booking_status,
                COUNT(*) as count,
                SUM(total_amount) as total_amount
            FROM bookings 
            WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
            GROUP BY booking_status
        `;
        
        const result = await pool.query(query);
        const rows = result.rows;
        
        const response = {
            period: '30 days',
            statusDistribution: rows.map(row => ({
                status: row.booking_status,
                count: parseInt(row.count),
                totalAmount: parseFloat(row.total_amount || 0).toFixed(2)
            })),
            lastUpdated: new Date().toISOString()
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('Booking stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get top performing metrics
router.get('/top-performers', async (req, res) => {
    try {
        const { getConnection } = require('../config/database');
        const pool = getConnection();
        
        const query = `
            SELECT 
                s.supplier_code,
                c.name as company_name,
                s.overall_rating,
                s.total_trips_completed,
                s.total_revenue_generated,
                s.on_time_percentage
            FROM suppliers s
            JOIN companies c ON s.company_id = c.id
            WHERE s.account_status = 'active'
            ORDER BY s.overall_rating DESC, s.total_revenue_generated DESC
            LIMIT 10
        `;
        
        const result = await pool.query(query);
        const rows = result.rows;
        
        const response = {
            topSuppliers: rows.map(row => ({
                supplierCode: row.supplier_code,
                companyName: row.company_name,
                rating: parseFloat(row.overall_rating).toFixed(1),
                tripsCompleted: row.total_trips_completed,
                revenueGenerated: parseFloat(row.total_revenue_generated).toFixed(2),
                onTimePercentage: parseFloat(row.on_time_percentage).toFixed(1)
            })),
            lastUpdated: new Date().toISOString()
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('Top performers error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 