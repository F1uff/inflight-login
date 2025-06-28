const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// PostgreSQL configuration
const config = {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT) || 5432,
    database: process.env.PG_DATABASE || 'inflight_admin',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '',
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

async function initPostgreSQL() {
    const pool = new Pool(config);
    
    try {
        console.log('🔄 Connecting to PostgreSQL...');
        
        const client = await pool.connect();
        console.log('✅ PostgreSQL connection successful');
        
        console.log('📋 Creating database schema...');
        const schemaPath = path.join(__dirname, 'postgresql-schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        await client.query(schemaSql);
        console.log('✅ Database schema created successfully');
        
        console.log('📊 Inserting sample data...');
        await insertSampleData(client);
        console.log('✅ Sample data inserted successfully');
        
        client.release();
        
        console.log('🎉 PostgreSQL database initialization completed!');
        console.log(`📊 Database: ${config.database}`);
        console.log(`🏠 Host: ${config.host}:${config.port}`);
        
    } catch (error) {
        console.error('❌ PostgreSQL initialization failed:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

async function insertSampleData(client) {
    try {
        console.log('📈 Inserting dashboard metrics...');
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            await client.query(`
                INSERT INTO dashboard_metrics (
                    metric_date, total_bookings, completed_bookings, cancelled_bookings,
                    total_revenue, active_suppliers, active_drivers, average_rating, customer_satisfaction
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (metric_date) DO NOTHING
            `, [
                dateStr,
                Math.floor(Math.random() * 50 + 20),
                Math.floor(Math.random() * 40 + 15),
                Math.floor(Math.random() * 5 + 1),
                Math.round((Math.random() * 50000 + 20000) * 100) / 100,
                Math.floor(Math.random() * 20 + 10),
                Math.floor(Math.random() * 50 + 25),
                Math.round((Math.random() * 1.5 + 3.5) * 100) / 100,
                Math.round((Math.random() * 20 + 80) * 100) / 100
            ]);
        }
        
        console.log('🏢 Inserting companies...');
        const companies = [
            ['Metro Manila Transport Co.', 'contact@mmtransport.com', '+63-2-123-4567', '123 EDSA', 'Manila'],
            ['Cebu Logistics Services', 'info@cebulogistics.com', '+63-32-234-5678', '456 Colon St', 'Cebu'],
            ['Davao Express Lines', 'support@davaoexpress.com', '+63-82-345-6789', '789 Roxas Ave', 'Davao']
        ];
        
        for (const company of companies) {
            await client.query(`
                INSERT INTO companies (name, email, phone, address_line1, city)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT DO NOTHING
            `, company);
        }
        
        const companyResult = await client.query('SELECT id FROM companies ORDER BY id LIMIT 3');
        const companyIds = companyResult.rows.map(row => row.id);
        
        console.log('🚚 Inserting suppliers...');
        const supplierData = [
            [companyIds[0] || 1, 'HTL001', 'hotel', 4.5, 1250, 875000.00, 92.5, 'active'],
            [companyIds[1] || 2, 'HTL002', 'hotel', 4.2, 980, 650000.00, 88.3, 'active'],
            [companyIds[2] || 3, 'HTL003', 'hotel', 4.8, 1450, 1200000.00, 95.2, 'active'],
            [companyIds[0] || 1, 'TRF001', 'transfer', 4.3, 850, 420000.00, 89.5, 'active'],
            [companyIds[1] || 2, 'TRF002', 'transfer', 4.6, 1100, 680000.00, 91.2, 'active'],
            [companyIds[2] || 3, 'AIR001', 'airline', 4.1, 2200, 1800000.00, 87.8, 'active'],
            [companyIds[0] || 1, 'AIR002', 'airline', 4.4, 1950, 1650000.00, 90.1, 'active'],
            [companyIds[1] || 2, 'TRV001', 'travel_operator', 4.7, 1600, 950000.00, 93.4, 'active'],
            [companyIds[2] || 3, 'TRV002', 'travel_operator', 4.2, 1200, 720000.00, 88.9, 'active'],
            [companyIds[0] || 1, 'TRV003', 'travel_operator', 4.5, 1350, 810000.00, 91.7, 'pending']
        ];
        
        for (const supplier of supplierData) {
            await client.query(`
                INSERT INTO suppliers (
                    company_id, supplier_code, supplier_type, overall_rating, 
                    total_trips_completed, total_revenue_generated, on_time_percentage, account_status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (supplier_code) DO NOTHING
            `, supplier);
        }
        
        console.log('💊 Inserting system health data...');
        await client.query(`
            INSERT INTO system_health (
                overall_health_score, db_response_time, api_response_time, 
                active_sessions, system_errors_last_hour
            ) VALUES ($1, $2, $3, $4, $5)
        `, [95, 12.5, 145.2, 24, 0]);
        
        console.log('📋 Inserting bookings...');
        const bookingStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled'];
        for (let i = 0; i < 20; i++) {
            const date = new Date();
            date.setHours(date.getHours() - Math.floor(Math.random() * 24));
            
            await client.query(`
                INSERT INTO bookings (
                    booking_reference, pickup_address, destination_address,
                    pickup_datetime, total_amount, booking_status, payment_status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (booking_reference) DO NOTHING
            `, [
                `BK${Date.now()}${i}`,
                `Pickup Location ${i + 1}`,
                `Destination ${i + 1}`,
                date.toISOString(),
                Math.round((Math.random() * 2000 + 500) * 100) / 100,
                bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)],
                Math.random() > 0.3 ? 'paid' : 'pending'
            ]);
        }
        
        console.log('✅ All sample data inserted successfully');
        
    } catch (error) {
        console.error('❌ Error inserting sample data:', error.message);
        throw error;
    }
}

async function checkPostgreSQL() {
    const pool = new Pool(config);
    
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        await pool.end();
        return true;
    } catch (error) {
        await pool.end();
        return false;
    }
}

module.exports = {
    initPostgreSQL,
    checkPostgreSQL,
    config
};

if (require.main === module) {
    initPostgreSQL()
        .then(() => {
            console.log('🎉 PostgreSQL setup completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ PostgreSQL setup failed:', error.message);
            process.exit(1);
        });
}
