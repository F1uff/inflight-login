const express = require('express');
const router = express.Router();
const { getDatabase } = require('../scripts/init-database');

// Get dashboard overview metrics
router.get('/overview', async (req, res) => {
    try {
        const db = getDatabase();
        
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
            WHERE metric_date >= date('now', '-7 days')
        `;
        
        db.get(metricsQuery, [], (err, metrics) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
            }
            
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
            
            db.all(bookingsQuery, [], (err, recentBookings) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to fetch recent bookings' });
                }
                
                // Calculate completion rate
                const completionRate = metrics.total_bookings > 0 
                    ? ((metrics.completed_bookings / metrics.total_bookings) * 100).toFixed(1)
                    : 0;
                
                // Calculate cancellation rate
                const cancellationRate = metrics.total_bookings > 0
                    ? ((metrics.cancelled_bookings / metrics.total_bookings) * 100).toFixed(1)
                    : 0;
                
                const response = {
                    metrics: {
                        totalBookings: Math.round(metrics.total_bookings || 0),
                        completedBookings: Math.round(metrics.completed_bookings || 0),
                        cancelledBookings: Math.round(metrics.cancelled_bookings || 0),
                        totalRevenue: parseFloat(metrics.total_revenue || 0).toFixed(2),
                        activeSuppliers: Math.round(metrics.active_suppliers || 0),
                        activeDrivers: Math.round(metrics.active_drivers || 0),
                        averageRating: parseFloat(metrics.average_rating || 0).toFixed(1),
                        customerSatisfaction: parseFloat(metrics.customer_satisfaction || 0).toFixed(1),
                        completionRate: parseFloat(completionRate),
                        cancellationRate: parseFloat(cancellationRate)
                    },
                    recentBookings: recentBookings.map(booking => ({
                        ...booking,
                        total_amount: parseFloat(booking.total_amount).toFixed(2),
                        created_at: new Date(booking.created_at).toISOString()
                    })),
                    lastUpdated: new Date().toISOString()
                };
                
                res.json(response);
                db.close();
            });
        });
        
    } catch (error) {
        console.error('Dashboard overview error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get revenue analytics
router.get('/revenue', async (req, res) => {
    try {
        const db = getDatabase();
        const days = parseInt(req.query.days) || 7;
        
        const query = `
            SELECT 
                metric_date,
                total_revenue,
                total_bookings
            FROM dashboard_metrics 
            WHERE metric_date >= date('now', '-${days} days')
            ORDER BY metric_date ASC
        `;
        
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch revenue data' });
            }
            
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
            db.close();
        });
        
    } catch (error) {
        console.error('Revenue analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get booking status distribution
router.get('/booking-stats', async (req, res) => {
    try {
        const db = getDatabase();
        
        const query = `
            SELECT 
                booking_status,
                COUNT(*) as count,
                SUM(total_amount) as total_amount
            FROM bookings 
            WHERE created_at >= datetime('now', '-30 days')
            GROUP BY booking_status
        `;
        
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch booking statistics' });
            }
            
            const response = {
                period: '30 days',
                statusDistribution: rows.map(row => ({
                    status: row.booking_status,
                    count: row.count,
                    totalAmount: parseFloat(row.total_amount || 0).toFixed(2)
                })),
                lastUpdated: new Date().toISOString()
            };
            
            res.json(response);
            db.close();
        });
        
    } catch (error) {
        console.error('Booking stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get top performing metrics
router.get('/top-performers', async (req, res) => {
    try {
        const db = getDatabase();
        
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
        
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch top performers' });
            }
            
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
            db.close();
        });
        
    } catch (error) {
        console.error('Top performers error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 