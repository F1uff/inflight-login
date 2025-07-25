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
        
        // Check if tables already exist
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'suppliers'
            );
        `);
        
        const tablesExist = tableCheck.rows[0].exists;
        
        if (!tablesExist) {
            console.log('📋 Creating database schema...');
            const schemaPath = path.join(__dirname, 'postgresql-schema.sql');
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            
            await client.query(schemaSql);
            console.log('✅ Database schema created successfully');
            
            console.log('📊 Inserting sample data...');
            await insertSampleData(client);
            console.log('✅ Sample data inserted successfully');
        } else {
            console.log('📊 Database schema already exists, skipping creation');
            console.log('📊 Checking for existing data...');
            
            // Check if we have any suppliers data
            const supplierCount = await client.query('SELECT COUNT(*) FROM suppliers');
            if (supplierCount.rows[0].count === '0') {
                console.log('📊 No suppliers found, inserting sample data...');
                await insertSampleData(client);
                console.log('✅ Sample data inserted successfully');
            } else {
                console.log('📊 Existing data found, preserving current data');
            }
        }
        
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
        
        console.log('🚚 Skipping sample supplier data insertion...');
        // Sample supplier data insertion removed to eliminate mockup portfolio counts
        // The suppliers table will remain empty for real data integration
        
        console.log('💊 Inserting system health data...');
        await client.query(`
            INSERT INTO system_health (
                overall_health_score, db_response_time, api_response_time, 
                active_sessions, system_errors_last_hour
            ) VALUES ($1, $2, $3, $4, $5)
        `, [95, 12.5, 145.2, 24, 0]);
        
        // Insert sample users for drivers
        console.log('👥 Inserting users...');
        const users = [
            ['john.doe@transport.com', 'hashed_password', 'driver', 'John', 'Doe', '+63-917-123-4567'],
            ['jane.smith@transport.com', 'hashed_password', 'driver', 'Jane', 'Smith', '+63-918-765-4321'],
            ['mike.johnson@transport.com', 'hashed_password', 'driver', 'Mike', 'Johnson', '+63-919-555-0123'],
            ['sarah.wilson@transport.com', 'hashed_password', 'driver', 'Sarah', 'Wilson', '+63-920-444-5678'],
            ['carlos.garcia@transport.com', 'hashed_password', 'driver', 'Carlos', 'Garcia', '+63-921-333-9999']
        ];
        
        for (const user of users) {
            await client.query(`
                INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (email) DO NOTHING
            `, user);
        }
        
        // Get user and company IDs for relationships
        const userResult = await client.query('SELECT id FROM users WHERE role = $1 ORDER BY id LIMIT 5', ['driver']);
        const userIds = userResult.rows.map(row => row.id);
        
        console.log('🚗 Inserting drivers...');
        const drivers = [
            [companyIds[0] || 1, userIds[0] || 1, 'DL123456789', 'professional', 'Metro Manila, Philippines', 'pending', '{"nda_status": "Submitted"}'],
            [companyIds[0] || 1, userIds[1] || 2, 'DL987654321', 'professional', 'Quezon City, Philippines', 'pending', '{"nda_status": "Pending"}'],
            [companyIds[1] || 2, userIds[2] || 3, 'DL456789123', 'professional', 'Cebu City, Philippines', 'active', '{"nda_status": "Submitted"}'],
            [companyIds[1] || 2, userIds[3] || 4, 'DL789123456', 'professional', 'Makati City, Philippines', 'active', '{"nda_status": "Submitted"}'],
            [companyIds[2] || 3, userIds[4] || 5, 'DL321654987', 'professional', 'Davao City, Philippines', 'inactive', '{"nda_status": "Expired"}']
        ];
        
        for (const driver of drivers) {
            await client.query(`
                INSERT INTO drivers (company_id, user_id, license_number, license_type, address, status, documents)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (license_number) DO NOTHING
            `, driver);
        }
        
        console.log('🚙 Inserting vehicles...');
        const vehicles = [
            [companyIds[0] || 1, 'ABC-1234', 'Toyota', 'Vios', 2022, 'White', 'sedan', '["air_conditioning", "gps", "dashcam"]', 'active'],
            [companyIds[0] || 1, 'XYZ-5678', 'Honda', 'CR-V', 2021, 'Black', 'suv', '["air_conditioning", "gps"]', 'pending'],
            [companyIds[1] || 2, 'DEF-9012', 'Nissan', 'Almera', 2023, 'Silver', 'sedan', '["air_conditioning", "gps", "dashcam", "child_seat"]', 'active'],
            [companyIds[1] || 2, 'GHI-3456', 'Mitsubishi', 'Montero Sport', 2020, 'Blue', 'suv', '["air_conditioning", "gps"]', 'active'],
            [companyIds[2] || 3, 'JKL-7890', 'Isuzu', 'D-Max', 2022, 'Red', 'truck', '["air_conditioning"]', 'maintenance'],
            [companyIds[0] || 1, 'MNO-2468', 'Hyundai', 'Accent', 2021, 'Gray', 'sedan', '["air_conditioning", "gps"]', 'active'],
            [companyIds[2] || 3, 'PQR-1357', 'Ford', 'Everest', 2023, 'Brown', 'suv', '["air_conditioning", "gps", "dashcam"]', 'active']
        ];
        
        for (const vehicle of vehicles) {
            await client.query(`
                INSERT INTO vehicles (company_id, plate_number, make, model, year, color, vehicle_type, features, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (plate_number) DO NOTHING
            `, vehicle);
        }
        
        // Get driver and vehicle IDs for booking assignments
        const driverResult = await client.query('SELECT id FROM drivers ORDER BY id LIMIT 5');
        const driverIds = driverResult.rows.map(row => row.id);
        
        const vehicleResult = await client.query('SELECT id FROM vehicles ORDER BY id LIMIT 7');
        const vehicleIds = vehicleResult.rows.map(row => row.id);
        
        console.log('📋 Inserting bookings...');
        const bookingStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled'];
        for (let i = 1; i <= 20; i++) {
            const date = new Date();
            date.setHours(date.getHours() - Math.floor(Math.random() * 48));
            
            // Some bookings get driver/vehicle assignments
            const hasDriver = Math.random() > 0.4;
            const hasVehicle = Math.random() > 0.3;
            const driverId = hasDriver && driverIds.length > 0 ? driverIds[i % driverIds.length] : null;
            const vehicleId = hasVehicle && vehicleIds.length > 0 ? vehicleIds[i % vehicleIds.length] : null;
            
            await client.query(`
                INSERT INTO bookings (
                    booking_reference, company_id, driver_id, vehicle_id,
                    pickup_address, destination_address, pickup_datetime, 
                    total_amount, booking_status, payment_status,
                    contact_person_name, contact_person_phone
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT (booking_reference) DO NOTHING
            `, [
                `TV-${String(i).padStart(3, '0')}`,
                companyIds[i % companyIds.length] || 1,
                driverId,
                vehicleId,
                `Pickup Location ${i}`,
                `Destination ${i}`,
                date.toISOString(),
                Math.round((Math.random() * 2000 + 500) * 100) / 100,
                bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)],
                Math.random() > 0.3 ? 'paid' : 'pending',
                `Passenger ${i}`,
                `+63-${String(Math.floor(Math.random() * 900000000 + 900000000))}`
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
