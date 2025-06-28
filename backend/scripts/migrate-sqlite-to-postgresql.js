const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// SQLite configuration
const sqlitePath = process.env.SQLITE_DB_PATH || './data/admin_dashboard.db';

// PostgreSQL configuration
const pgConfig = {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT) || 5432,
    database: process.env.PG_DATABASE || 'inflight_admin',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '',
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

async function migrateSQLiteToPostgreSQL() {
    console.log('🔄 Starting SQLite to PostgreSQL migration...');
    
    // Check if SQLite database exists
    if (!fs.existsSync(sqlitePath)) {
        console.log('❌ SQLite database not found at:', sqlitePath);
        return;
    }
    
    const pgPool = new Pool(pgConfig);
    
    try {
        // Connect to PostgreSQL
        console.log('🔗 Connecting to PostgreSQL...');
        const pgClient = await pgPool.connect();
        console.log('✅ PostgreSQL connected');
        
        // Connect to SQLite
        console.log('🔗 Connecting to SQLite...');
        const sqliteDb = new sqlite3.Database(sqlitePath);
        console.log('✅ SQLite connected');
        
        // Migrate tables in order (respecting foreign keys)
        await migrateTable(sqliteDb, pgClient, 'users');
        await migrateTable(sqliteDb, pgClient, 'companies');
        await migrateTable(sqliteDb, pgClient, 'suppliers');
        await migrateTable(sqliteDb, pgClient, 'dashboard_metrics');
        await migrateTable(sqliteDb, pgClient, 'system_health');
        await migrateTable(sqliteDb, pgClient, 'bookings');
        
        // Close connections
        sqliteDb.close();
        pgClient.release();
        
        console.log('🎉 Migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        await pgPool.end();
    }
}

async function migrateTable(sqliteDb, pgClient, tableName) {
    console.log(`📋 Migrating table: ${tableName}`);
    
    return new Promise((resolve, reject) => {
        sqliteDb.all(`SELECT * FROM ${tableName}`, [], async (err, rows) => {
            if (err) {
                console.error(`❌ Error reading from ${tableName}:`, err.message);
                reject(err);
                return;
            }
            
            if (rows.length === 0) {
                console.log(`⚠️  No data found in ${tableName}`);
                resolve();
                return;
            }
            
            try {
                // Clear existing data in PostgreSQL table
                await pgClient.query(`DELETE FROM ${tableName}`);
                console.log(`🗑️  Cleared existing data from ${tableName}`);
                
                // Insert data row by row
                for (const row of rows) {
                    const columns = Object.keys(row);
                    const values = Object.values(row);
                    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
                    
                    const query = `
                        INSERT INTO ${tableName} (${columns.join(', ')})
                        VALUES (${placeholders})
                    `;
                    
                    await pgClient.query(query, values);
                }
                
                // Reset sequence for auto-increment columns
                if (tableName !== 'dashboard_metrics') { // dashboard_metrics uses date as unique key
                    await pgClient.query(`
                        SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), 
                               COALESCE((SELECT MAX(id) FROM ${tableName}), 1), false)
                    `);
                }
                
                console.log(`✅ Migrated ${rows.length} rows to ${tableName}`);
                resolve();
                
            } catch (pgError) {
                console.error(`❌ Error inserting into ${tableName}:`, pgError.message);
                reject(pgError);
            }
        });
    });
}

async function checkPostgreSQLConnection() {
    const pool = new Pool(pgConfig);
    
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

// Run migration if called directly
if (require.main === module) {
    (async () => {
        try {
            // Check PostgreSQL connection first
            console.log('🔍 Checking PostgreSQL connection...');
            const isConnected = await checkPostgreSQLConnection();
            
            if (!isConnected) {
                console.error('❌ Cannot connect to PostgreSQL. Please check your configuration.');
                console.log('Configuration:', {
                    host: pgConfig.host,
                    port: pgConfig.port,
                    database: pgConfig.database,
                    user: pgConfig.user
                });
                process.exit(1);
            }
            
            await migrateSQLiteToPostgreSQL();
            console.log('🎉 Migration completed successfully!');
            process.exit(0);
        } catch (error) {
            console.error('❌ Migration failed:', error.message);
            process.exit(1);
        }
    })();
}

module.exports = {
    migrateSQLiteToPostgreSQL,
    checkPostgreSQLConnection
};
