const { getConnection } = require('../config/database');

async function applyRoomTypesMigration() {
    try {
        const pool = getConnection();
        
        console.log('🔄 Applying room_types migration...');
        
        // Add room_types column
        const alterTableQuery = `
            ALTER TABLE suppliers 
            ADD COLUMN IF NOT EXISTS room_types JSONB DEFAULT '["Standard Room", "Deluxe Room", "Suite"]'
        `;
        
        await pool.query(alterTableQuery);
        
        // Add comment
        const commentQuery = `
            COMMENT ON COLUMN suppliers.room_types IS 'Array of room type names for dynamic room rates management'
        `;
        
        await pool.query(commentQuery);
        
        console.log('✅ Room types migration applied successfully!');
        
        // Verify the column was added
        const verifyQuery = `
            SELECT column_name, data_type, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'suppliers' AND column_name = 'room_types'
        `;
        
        const result = await pool.query(verifyQuery);
        
        if (result.rows.length > 0) {
            console.log('✅ room_types column verified:', result.rows[0]);
        } else {
            console.log('❌ room_types column not found');
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        process.exit(0);
    }
}

applyRoomTypesMigration(); 