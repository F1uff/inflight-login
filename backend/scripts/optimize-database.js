const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database optimization script
async function optimizeDatabase() {
    const dbPath = path.join(__dirname, '../data/admin_dashboard.db');
    const db = new sqlite3.Database(dbPath);

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            console.log('🔧 Starting database optimization...');

            // ===== PERFORMANCE INDEXES =====
            
            // Suppliers table indexes
            db.run(`CREATE INDEX IF NOT EXISTS idx_suppliers_status_rating 
                    ON suppliers(account_status, overall_rating DESC, total_revenue_generated DESC)`);
            
            db.run(`CREATE INDEX IF NOT EXISTS idx_suppliers_type_status 
                    ON suppliers(supplier_type, account_status)`);
            
            db.run(`CREATE INDEX IF NOT EXISTS idx_suppliers_company 
                    ON suppliers(company_id)`);

            // Bookings table indexes
            db.run(`CREATE INDEX IF NOT EXISTS idx_bookings_status_date 
                    ON bookings(booking_status, created_at DESC)`);
            
            db.run(`CREATE INDEX IF NOT EXISTS idx_bookings_reference 
                    ON bookings(booking_reference)`);
            
            db.run(`CREATE INDEX IF NOT EXISTS idx_bookings_customer_date 
                    ON bookings(customer_id, created_at DESC)`);

            // Dashboard metrics indexes
            db.run(`CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_date 
                    ON dashboard_metrics(metric_date DESC)`);

            // System health indexes
            db.run(`CREATE INDEX IF NOT EXISTS idx_system_health_time 
                    ON system_health(check_time DESC)`);

            // Companies table indexes
            db.run(`CREATE INDEX IF NOT EXISTS idx_companies_name 
                    ON companies(name)`);

            // ===== PARTIAL INDEXES FOR COMMON QUERIES =====
            
            // Active suppliers only
            db.run(`CREATE INDEX IF NOT EXISTS idx_active_suppliers 
                    ON suppliers(overall_rating DESC, total_revenue_generated DESC) 
                    WHERE account_status = 'active'`);

            // Completed bookings for revenue calculations
            db.run(`CREATE INDEX IF NOT EXISTS idx_completed_bookings 
                    ON bookings(total_amount, created_at) 
                    WHERE booking_status = 'completed'`);

            // ===== COVERING INDEXES TO AVOID TABLE LOOKUPS =====
            
            // Supplier summary covering index
            db.run(`CREATE INDEX IF NOT EXISTS idx_supplier_summary 
                    ON suppliers(id, supplier_code, supplier_type, overall_rating, 
                                account_status, total_revenue_generated, total_trips_completed)`);

            // Booking summary covering index
            db.run(`CREATE INDEX IF NOT EXISTS idx_booking_summary 
                    ON bookings(id, booking_reference, booking_status, payment_status, 
                               total_amount, created_at)`);

            console.log('✅ Database indexes created successfully');

            // ===== ANALYZE TABLES FOR QUERY PLANNER =====
            db.run('ANALYZE', (err) => {
                if (err) {
                    console.error('❌ Error analyzing database:', err);
                    reject(err);
                } else {
                    console.log('✅ Database analysis completed');
                }
            });

            console.log('🚀 Database optimization completed successfully!');
        });

        db.close((err) => {
            if (err) {
                console.error('❌ Error closing database:', err);
                reject(err);
            } else {
                console.log('📊 Database connection closed');
                resolve();
            }
        });
    });
}

// Performance monitoring queries
const performanceQueries = {
    // Check index usage
    checkIndexUsage: `
        SELECT name, sql FROM sqlite_master 
        WHERE type = 'index' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
    `,
    
    // Get table sizes
    getTableSizes: `
        SELECT name, 
               COUNT(*) as row_count,
               LENGTH(sql) as schema_size
        FROM sqlite_master 
        WHERE type = 'table'
        GROUP BY name
        ORDER BY row_count DESC
    `,
    
    // Check query plan for suppliers
    explainSuppliers: `
        EXPLAIN QUERY PLAN 
        SELECT s.*, c.name as company_name 
        FROM suppliers s 
        JOIN companies c ON s.company_id = c.id 
        WHERE s.account_status = 'active' 
        ORDER BY s.overall_rating DESC 
        LIMIT 10
    `,
    
    // Check query plan for dashboard metrics
    explainDashboard: `
        EXPLAIN QUERY PLAN 
        SELECT 
            COUNT(CASE WHEN booking_status = 'completed' THEN 1 END) as completed,
            COUNT(CASE WHEN booking_status = 'cancelled' THEN 1 END) as cancelled,
            SUM(CASE WHEN booking_status = 'completed' THEN total_amount ELSE 0 END) as revenue
        FROM bookings 
        WHERE created_at >= datetime('now', '-30 days')
    `
};

// Database health check
async function checkDatabaseHealth() {
    const dbPath = path.join(__dirname, '../data/admin_dashboard.db');
    const db = new sqlite3.Database(dbPath);

    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        db.get('SELECT COUNT(*) as count FROM suppliers', [], (err, result) => {
            const responseTime = Date.now() - startTime;
            
            if (err) {
                reject(err);
            } else {
                resolve({
                    status: 'healthy',
                    responseTime: responseTime,
                    supplierCount: result.count,
                    timestamp: new Date().toISOString()
                });
            }
            
            db.close();
        });
    });
}

module.exports = {
    optimizeDatabase,
    performanceQueries,
    checkDatabaseHealth
}; 