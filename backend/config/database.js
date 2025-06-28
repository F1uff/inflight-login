const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const config = {
    type: process.env.DATABASE_TYPE || 'sqlite',
    sqlite: {
        path: process.env.DB_PATH || './data/admin_dashboard.db'
    },
    postgresql: {
        host: process.env.PG_HOST || 'localhost',
        port: parseInt(process.env.PG_PORT) || 5432,
        database: process.env.PG_DATABASE || 'inflight_admin',
        user: process.env.PG_USER || 'postgres',
        password: process.env.PG_PASSWORD || '',
        ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    }
};

// PostgreSQL connection pool
let pgPool = null;

// SQLite connection
let sqliteDb = null;

/**
 * Initialize database connection based on configuration
 */
async function initializeDatabase() {
    console.log(`🔄 Initializing ${config.type.toUpperCase()} database...`);
    
    if (config.type === 'postgresql') {
        return initializePostgreSQL();
    } else {
        return initializeSQLite();
    }
}

/**
 * Initialize PostgreSQL connection
 */
async function initializePostgreSQL() {
    try {
        pgPool = new Pool(config.postgresql);
        
        // Test connection
        const client = await pgPool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        
        console.log('✅ PostgreSQL connected successfully');
        console.log(`📊 Database: ${config.postgresql.database}`);
        console.log(`🏠 Host: ${config.postgresql.host}:${config.postgresql.port}`);
        
        return pgPool;
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error.message);
        throw error;
    }
}

/**
 * Initialize SQLite connection
 */
async function initializeSQLite() {
    return new Promise((resolve, reject) => {
        try {
            // Ensure data directory exists
            const dataDir = path.dirname(config.sqlite.path);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            
            sqliteDb = new sqlite3.Database(config.sqlite.path, (err) => {
                if (err) {
                    console.error('❌ SQLite connection failed:', err.message);
                    reject(err);
                } else {
                    console.log('✅ SQLite connected successfully');
                    console.log(`📁 Database file: ${config.sqlite.path}`);
                    resolve(sqliteDb);
                }
            });
        } catch (error) {
            console.error('❌ SQLite initialization failed:', error.message);
            reject(error);
        }
    });
}

/**
 * Get database connection
 */
function getConnection() {
    if (config.type === 'postgresql') {
        if (!pgPool) {
            throw new Error('PostgreSQL pool not initialized');
        }
        return pgPool;
    } else {
        if (!sqliteDb) {
            throw new Error('SQLite database not initialized');
        }
        return sqliteDb;
    }
}

/**
 * Execute query with proper database handling
 */
async function executeQuery(query, params = []) {
    if (config.type === 'postgresql') {
        const client = await pgPool.connect();
        try {
            const result = await client.query(query, params);
            return result.rows;
        } finally {
            client.release();
        }
    } else {
        return new Promise((resolve, reject) => {
            sqliteDb.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

/**
 * Execute single query with proper database handling
 */
async function executeQuerySingle(query, params = []) {
    if (config.type === 'postgresql') {
        const client = await pgPool.connect();
        try {
            const result = await client.query(query, params);
            return result.rows[0] || null;
        } finally {
            client.release();
        }
    } else {
        return new Promise((resolve, reject) => {
            sqliteDb.get(query, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row || null);
                }
            });
        });
    }
}

/**
 * Execute insert/update/delete with proper database handling
 */
async function executeUpdate(query, params = []) {
    if (config.type === 'postgresql') {
        const client = await pgPool.connect();
        try {
            const result = await client.query(query, params);
            return {
                changes: result.rowCount,
                lastID: result.rows[0]?.id || null
            };
        } finally {
            client.release();
        }
    } else {
        return new Promise((resolve, reject) => {
            sqliteDb.run(query, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        changes: this.changes,
                        lastID: this.lastID
                    });
                }
            });
        });
    }
}

/**
 * Close database connections
 */
async function closeConnections() {
    if (config.type === 'postgresql' && pgPool) {
        await pgPool.end();
        pgPool = null;
        console.log('✅ PostgreSQL connections closed');
    } else if (sqliteDb) {
        return new Promise((resolve) => {
            sqliteDb.close((err) => {
                if (err) {
                    console.error('❌ Error closing SQLite:', err);
                } else {
                    console.log('✅ SQLite connection closed');
                }
                sqliteDb = null;
                resolve();
            });
        });
    }
}

/**
 * Get database type
 */
function getDatabaseType() {
    return config.type;
}

/**
 * Get database configuration
 */
function getDatabaseConfig() {
    return config;
}

module.exports = {
    initializeDatabase,
    getConnection,
    executeQuery,
    executeQuerySingle,
    executeUpdate,
    closeConnections,
    getDatabaseType,
    getDatabaseConfig
}; 