const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const config = {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT) || 5432,
    database: process.env.PG_DATABASE || 'inflight_admin',
    user: process.env.PG_USER || 'inflightit',
    password: process.env.PG_PASSWORD || '',
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false
};

async function applyPerformanceIndexes() {
    const pool = new Pool(config);
    
    try {
        console.log('🔄 Connecting to database...');
        await pool.query('SELECT 1');
        console.log('✅ Database connection successful');
        
        // Read the migration file
        const migrationPath = path.join(__dirname, '../../database/migrations/005_performance_optimization.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('📋 Applying performance optimization indexes...');
        
        // Split the SQL into individual statements
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const statement of statements) {
            try {
                if (statement.trim()) {
                    await pool.query(statement);
                    successCount++;
                    console.log(`✅ Applied: ${statement.substring(0, 50)}...`);
                }
            } catch (error) {
                if (error.code === '42710') {
                    // Index already exists, skip
                    console.log(`⏭️  Skipped (already exists): ${statement.substring(0, 50)}...`);
                    successCount++;
                } else {
                    console.error(`❌ Error applying: ${statement.substring(0, 50)}...`);
                    console.error(`   Error: ${error.message}`);
                    errorCount++;
                }
            }
        }
        
        console.log('\n📊 Migration Summary:');
        console.log(`✅ Successful: ${successCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`📈 Performance indexes applied successfully!`);
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run the migration
applyPerformanceIndexes().catch(console.error); 