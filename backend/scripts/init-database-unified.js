const { initPostgreSQL } = require('./init-postgresql');

async function initDatabase() {
    console.log('🔄 Initializing POSTGRESQL database...');
    
    try {
        await initPostgreSQL();
        console.log('✅ POSTGRESQL database initialization completed successfully');
        
    } catch (error) {
        console.error('❌ PostgreSQL initialization failed:', error.message);
        throw error;
    }
}

module.exports = initDatabase;
