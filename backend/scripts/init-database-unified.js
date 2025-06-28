const { getDatabaseType } = require('../config/database');
const { initPostgreSQL } = require('./init-postgresql');

// Legacy SQLite functions for backward compatibility
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || './data/admin_dashboard.db';

async function initDatabase() {
    const dbType = getDatabaseType();
    
    console.log(`🔄 Initializing ${dbType.toUpperCase()} database...`);
    
    try {
        if (dbType === 'postgresql') {
            await initPostgreSQL();
        } else {
            await initSQLiteDatabase();
        }
        
        console.log(`✅ ${dbType.toUpperCase()} database initialization completed successfully`);
        
    } catch (error) {
        console.error(`❌ ${dbType.toUpperCase()} database initialization failed:`, error.message);
        throw error;
    }
}

async function initSQLiteDatabase() {
    return new Promise((resolve, reject) => {
        const db = createConnection();
        
        db.serialize(() => {
            db.run("PRAGMA foreign_keys = ON");
            
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(50) NOT NULL DEFAULT 'customer',
                    first_name VARCHAR(100) NOT NULL,
                    last_name VARCHAR(100) NOT NULL,
                    phone VARCHAR(20),
                    avatar_url VARCHAR(500),
                    email_verified BOOLEAN DEFAULT 0,
                    status VARCHAR(20) DEFAULT 'active',
                    last_login DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            db.run(`
                CREATE TABLE IF NOT EXISTS companies (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255),
                    phone VARCHAR(20),
                    address_line1 VARCHAR(255),
                    city VARCHAR(100),
                    country VARCHAR(100) DEFAULT 'Philippines',
                    status VARCHAR(20) DEFAULT 'active',
                    verification_status VARCHAR(20) DEFAULT 'unverified',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            db.run(`
                CREATE TABLE IF NOT EXISTS suppliers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    company_id INTEGER REFERENCES companies(id),
                    supplier_code VARCHAR(50) UNIQUE NOT NULL,
                    supplier_type VARCHAR(50) NOT NULL,
                    overall_rating DECIMAL(3,2) DEFAULT 0,
                    total_trips_completed INTEGER DEFAULT 0,
                    total_revenue_generated DECIMAL(15,2) DEFAULT 0,
                    on_time_percentage DECIMAL(5,2) DEFAULT 0,
                    account_status VARCHAR(20) DEFAULT 'active',
                    representative_name VARCHAR(255),
                    designation VARCHAR(255),
                    tel_number VARCHAR(20),
                    breakfast_type VARCHAR(50),
                    room_quantity INTEGER,
                    mode_of_payment VARCHAR(100),
                    credit_terms VARCHAR(100),
                    remarks TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            db.run(`
                CREATE TABLE IF NOT EXISTS dashboard_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    metric_date DATE NOT NULL,
                    total_bookings INTEGER DEFAULT 0,
                    completed_bookings INTEGER DEFAULT 0,
                    cancelled_bookings INTEGER DEFAULT 0,
                    total_revenue DECIMAL(15,2) DEFAULT 0,
                    active_suppliers INTEGER DEFAULT 0,
                    active_drivers INTEGER DEFAULT 0,
                    average_rating DECIMAL(3,2) DEFAULT 0,
                    customer_satisfaction DECIMAL(5,2) DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            db.run(`
                CREATE TABLE IF NOT EXISTS system_health (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    check_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                    overall_health_score INTEGER DEFAULT 100,
                    db_response_time DECIMAL(8,3) DEFAULT 0,
                    api_response_time DECIMAL(8,3) DEFAULT 0,
                    active_sessions INTEGER DEFAULT 0,
                    system_errors_last_hour INTEGER DEFAULT 0
                )
            `);
            
            db.run(`
                CREATE TABLE IF NOT EXISTS bookings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    booking_reference VARCHAR(20) UNIQUE NOT NULL,
                    customer_id INTEGER REFERENCES users(id),
                    pickup_address TEXT NOT NULL,
                    destination_address TEXT NOT NULL,
                    pickup_datetime DATETIME NOT NULL,
                    total_amount DECIMAL(10,2) NOT NULL,
                    booking_status VARCHAR(20) DEFAULT 'pending',
                    payment_status VARCHAR(20) DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            insertSQLiteSampleData(db);
        });
        
        db.close((err) => {
            if (err) {
                console.error('Error closing SQLite database:', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function createConnection() {
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    return new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Error opening SQLite database:', err);
            throw err;
        }
    });
}

function insertSQLiteSampleData(db) {
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        db.run(`
            INSERT OR IGNORE INTO dashboard_metrics (
                metric_date, total_bookings, completed_bookings, cancelled_bookings,
                total_revenue, active_suppliers, active_drivers, average_rating, customer_satisfaction
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    
    const companies = [
        ['Metro Manila Transport Co.', 'contact@mmtransport.com', '+63-2-123-4567', '123 EDSA', 'Manila'],
        ['Cebu Logistics Services', 'info@cebulogistics.com', '+63-32-234-5678', '456 Colon St', 'Cebu'],
        ['Davao Express Lines', 'support@davaoexpress.com', '+63-82-345-6789', '789 Roxas Ave', 'Davao']
    ];
    
    companies.forEach(company => {
        db.run(`
            INSERT OR IGNORE INTO companies (name, email, phone, address_line1, city)
            VALUES (?, ?, ?, ?, ?)
        `, company);
    });
    
    const supplierData = [
        [1, 'HTL001', 'hotel', 4.5, 1250, 875000.00, 92.5, 'active'],
        [2, 'HTL002', 'hotel', 4.2, 980, 650000.00, 88.3, 'active'],
        [3, 'HTL003', 'hotel', 4.8, 1450, 1200000.00, 95.2, 'active'],
        [1, 'TRF001', 'transfer', 4.3, 850, 420000.00, 89.5, 'active'],
        [2, 'TRF002', 'transfer', 4.6, 1100, 680000.00, 91.2, 'active'],
        [3, 'AIR001', 'airline', 4.1, 2200, 1800000.00, 87.8, 'active'],
        [1, 'AIR002', 'airline', 4.4, 1950, 1650000.00, 90.1, 'active'],
        [2, 'TRV001', 'travel_operator', 4.7, 1600, 950000.00, 93.4, 'active'],
        [3, 'TRV002', 'travel_operator', 4.2, 1200, 720000.00, 88.9, 'active'],
        [1, 'TRV003', 'travel_operator', 4.5, 1350, 810000.00, 91.7, 'pending']
    ];
    
    supplierData.forEach(supplier => {
        db.run(`
            INSERT OR IGNORE INTO suppliers (
                company_id, supplier_code, supplier_type, overall_rating, 
                total_trips_completed, total_revenue_generated, on_time_percentage, account_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, supplier);
    });
    
    db.run(`
        INSERT OR REPLACE INTO system_health (
            overall_health_score, db_response_time, api_response_time, 
            active_sessions, system_errors_last_hour
        ) VALUES (95, 12.5, 145.2, 24, 0)
    `);
    
    const bookingStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled'];
    for (let i = 0; i < 20; i++) {
        const date = new Date();
        date.setHours(date.getHours() - Math.floor(Math.random() * 24));
        
        db.run(`
            INSERT OR IGNORE INTO bookings (
                booking_reference, pickup_address, destination_address,
                pickup_datetime, total_amount, booking_status, payment_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
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
}

function getDatabase() {
    const dbType = getDatabaseType();
    
    if (dbType === 'postgresql') {
        const { getConnection } = require('../config/database');
        return getConnection();
    } else {
        return createConnection();
    }
}

module.exports = initDatabase;
module.exports.getDatabase = getDatabase;
module.exports.createConnection = createConnection;
