const { Pool } = require('pg');

// PostgreSQL connection pool configuration with improved settings
const config = {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT) || 5432,
    database: process.env.PG_DATABASE || 'inflight_admin',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '',
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
    
    // Connection pool settings
    max: parseInt(process.env.PG_MAX_CONNECTIONS) || 20,
    min: parseInt(process.env.PG_MIN_CONNECTIONS) || 5,
    idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: parseInt(process.env.PG_CONNECTION_TIMEOUT) || 5000,
    
    // Connection validation and retry settings
    statement_timeout: parseInt(process.env.PG_STATEMENT_TIMEOUT) || 30000,
    query_timeout: parseInt(process.env.PG_QUERY_TIMEOUT) || 15000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    
    // Application name for monitoring
    application_name: process.env.APP_NAME || 'inflight-admin'
};

let pgPool = null;
let poolStats = {
    totalConnections: 0,
    activeConnections: 0,
    idleConnections: 0,
    waitingClients: 0,
    connectionErrors: 0,
    queryErrors: 0,
    lastConnectionError: null,
    uptime: Date.now()
};

// Health check function
async function performHealthCheck() {
    if (!pgPool) return;
    
    try {
        const client = await pgPool.connect();
        await client.query('SELECT 1');
        client.release();
        
        // Update pool stats
        poolStats.idleConnections = pgPool.idleCount;
        poolStats.waitingClients = pgPool.waitingCount;
        
        // Log pool status if there are issues
        if (poolStats.waitingClients > 0) {
            console.warn(`⚠️  Pool overloaded: ${poolStats.waitingClients} clients waiting`);
        }
        
        if (poolStats.activeConnections > config.max * 0.8) {
            console.warn(`⚠️  Pool near capacity: ${poolStats.activeConnections}/${config.max} active`);
        }
        
    } catch (error) {
        poolStats.connectionErrors++;
        poolStats.lastConnectionError = error.message;
        console.error('❌ Database health check failed:', error.message);
    }
}

async function initializeDatabase() {
    console.log('🔄 Initializing PostgreSQL database...');
    try {
        console.log('🔄 Connecting to PostgreSQL...');
        pgPool = new Pool(config);
        
        // Set up connection pool event listeners
        pgPool.on('connect', (_client) => {
            poolStats.totalConnections++;
            console.log(`🔗 New client connected. Total: ${poolStats.totalConnections}`);
        });
        
        pgPool.on('acquire', (_client) => {
            poolStats.activeConnections++;
        });
        
        pgPool.on('release', (_client) => {
            poolStats.activeConnections--;
        });
        
        pgPool.on('error', (err, _client) => {
            poolStats.connectionErrors++;
            poolStats.lastConnectionError = err.message;
            console.error('❌ Unexpected database error:', err);
        });
        
        pgPool.on('remove', (_client) => {
            poolStats.totalConnections--;
            console.log(`🔌 Client disconnected. Total: ${poolStats.totalConnections}`);
        });
        
        // Test initial connection
        const client = await pgPool.connect();
        await client.query('SELECT NOW()');
        client.release();
        
        console.log('✅ PostgreSQL connection successful');
        console.log(`📊 Database: ${config.database}`);
        console.log(`🏠 Host: ${config.host}:${config.port}`);
        console.log(`🔗 Pool: ${config.min}-${config.max} connections`);
        
        // Set up periodic health checks
        setInterval(performHealthCheck, 60000); // Every minute
        
        return pgPool;
    } catch (error) {
        poolStats.connectionErrors++;
        poolStats.lastConnectionError = error.message;
        console.error('❌ PostgreSQL connection failed:', error.message);
        throw error;
    }
}

function getConnection() {
    if (!pgPool) {
        throw new Error('PostgreSQL pool not initialized');
    }
    return pgPool;
}

// Legacy function for backward compatibility
function getDatabase() {
    return getConnection();
}

async function executeQuery(query, params = []) {
    const client = await pgPool.connect();
    try {
        const result = await client.query(query, params);
        return result.rows;
    } catch (error) {
        poolStats.queryErrors++;
        console.error('❌ Query execution failed:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

async function executeQuerySingle(query, params = []) {
    const client = await pgPool.connect();
    try {
        const result = await client.query(query, params);
        return result.rows[0] || null;
    } finally {
        client.release();
    }
}

async function executeUpdate(query, params = []) {
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
}

async function closeConnections() {
    if (pgPool) {
        await pgPool.end();
        pgPool = null;
        console.log('✅ PostgreSQL connections closed');
    }
}

function getDatabaseType() {
    return 'postgresql';
}

function getDatabaseConfig() {
    return config;
}

// Get pool statistics for monitoring
function getPoolStats() {
    if (!pgPool) {
        return { ...poolStats, status: 'disconnected' };
    }
    
    return {
        ...poolStats,
        status: 'connected',
        totalConnections: pgPool.totalCount,
        idleConnections: pgPool.idleCount,
        waitingClients: pgPool.waitingCount,
        uptime: Date.now() - poolStats.uptime
    };
}

// Graceful shutdown
async function gracefulShutdown() {
    console.log('🔄 Initiating graceful database shutdown...');
    
    if (pgPool) {
        try {
            await pgPool.end();
            pgPool = null;
            console.log('✅ Database connections closed gracefully');
        } catch (error) {
            console.error('❌ Error during database shutdown:', error.message);
        }
    }
}

// Handle process termination
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = {
    initializeDatabase,
    getConnection,
    getDatabase,
    executeQuery,
    executeQuerySingle,
    executeUpdate,
    closeConnections,
    getDatabaseType,
    getDatabaseConfig,
    getPoolStats,
    gracefulShutdown,
    performHealthCheck
}; 