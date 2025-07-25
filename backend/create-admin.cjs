const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const config = {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT) || 5432,
    database: process.env.PG_DATABASE || 'inflight_admin',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '',
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false
};

async function createAdmin() {
    const pool = new Pool(config);
    
    try {
        const email = 'admin@test.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Delete existing user if exists
        await pool.query('DELETE FROM users WHERE email = $1', [email]);
        
        // Create new admin user
        const result = await pool.query(`
            INSERT INTO users (email, password_hash, role, first_name, last_name, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, email, role
        `, [email, hashedPassword, 'admin', 'Test', 'Admin', 'active']);
        
        console.log('✅ Admin user created:', result.rows[0]);
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        
    } catch (error) {
        console.error('❌ Error creating admin:', error);
    } finally {
        await pool.end();
    }
}

createAdmin(); 