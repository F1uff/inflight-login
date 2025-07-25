const { getConnection } = require('../config/database');

async function addHotelFields() {
    try {
        const pool = getConnection();
        
        console.log('Adding hotel-specific fields to suppliers table...');
        
        // Add the new columns
        await pool.query(`
            ALTER TABLE suppliers 
            ADD COLUMN IF NOT EXISTS frontdesk_phone VARCHAR(20),
            ADD COLUMN IF NOT EXISTS frontdesk_email VARCHAR(255),
            ADD COLUMN IF NOT EXISTS security_deposit VARCHAR(100),
            ADD COLUMN IF NOT EXISTS representative_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS designation VARCHAR(100),
            ADD COLUMN IF NOT EXISTS tel_number VARCHAR(20),
            ADD COLUMN IF NOT EXISTS breakfast_type VARCHAR(50),
            ADD COLUMN IF NOT EXISTS room_quantity INTEGER,
            ADD COLUMN IF NOT EXISTS mode_of_payment VARCHAR(50),
            ADD COLUMN IF NOT EXISTS credit_terms VARCHAR(50),
            ADD COLUMN IF NOT EXISTS remarks TEXT
        `);
        
        console.log('✅ Hotel-specific fields added successfully!');
        
        // Update supplier_type constraint to include 'hotel'
        await pool.query(`
            ALTER TABLE suppliers DROP CONSTRAINT IF EXISTS suppliers_supplier_type_check
        `);
        
        await pool.query(`
            ALTER TABLE suppliers ADD CONSTRAINT suppliers_supplier_type_check 
            CHECK (supplier_type IN ('transport', 'logistics', 'tour', 'rental', 'hotel', 'land_transfer'))
        `);
        
        console.log('✅ Supplier type constraint updated!');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error adding hotel fields:', error);
        process.exit(1);
    }
}

addHotelFields(); 