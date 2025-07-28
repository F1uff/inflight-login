const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT) || 5432,
    database: process.env.PG_DATABASE || 'inflight_admin',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '',
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function standardizeSupplierTypes() {
    try {
        console.log('🔄 Starting supplier type standardization...');
        
        // First, let's see what we have currently
        const currentTypesQuery = `
            SELECT supplier_type, COUNT(*) as count 
            FROM suppliers 
            GROUP BY supplier_type 
            ORDER BY count DESC
        `;
        
        const currentTypes = await pool.query(currentTypesQuery);
        console.log('\n📊 Current supplier types:');
        currentTypes.rows.forEach(row => {
            console.log(`  ${row.supplier_type}: ${row.count} suppliers`);
        });
        
        // First, drop the existing constraint to allow updates
        console.log('\n🔧 Dropping existing constraint to allow updates...');
        const dropConstraintQuery = `
            ALTER TABLE suppliers DROP CONSTRAINT IF EXISTS suppliers_supplier_type_check
        `;
        await pool.query(dropConstraintQuery);
        console.log('✅ Dropped old supplier type constraint');
        
        // Update hotel-related types to "Hotels"
        console.log('\n🏨 Updating hotel suppliers to "Hotels"...');
        const updateHotelsQuery = `
            UPDATE suppliers 
            SET supplier_type = 'Hotels' 
            WHERE supplier_type IN ('hotel', 'hotels', 'Hotel', 'HOTEL', 'HOTELS')
        `;
        
        const hotelResult = await pool.query(updateHotelsQuery);
        console.log(`✅ Updated ${hotelResult.rowCount} hotel suppliers to "Hotels"`);
        
        // Update transport/transfer-related types to "Land Transfer"
        console.log('\n🚗 Updating transport suppliers to "Land Transfer"...');
        const updateTransferQuery = `
            UPDATE suppliers 
            SET supplier_type = 'Land Transfer' 
            WHERE supplier_type IN ('transport', 'transfer', 'Transport', 'Transfer', 'TRANSPORT', 'TRANSFER', 'land_transfer', 'landTransfer')
        `;
        
        const transferResult = await pool.query(updateTransferQuery);
        console.log(`✅ Updated ${transferResult.rowCount} transport suppliers to "Land Transfer"`);
        
        // Add new constraint with updated values
        console.log('\n🔧 Adding new constraint with standardized types...');
        const addConstraintQuery = `
            ALTER TABLE suppliers 
            ADD CONSTRAINT suppliers_supplier_type_check 
            CHECK (supplier_type IN ('Hotels', 'Land Transfer', 'airline', 'travel_operator'))
        `;
        await pool.query(addConstraintQuery);
        console.log('✅ Added new supplier type constraint');
        
        // Show final results
        console.log('\n📊 Final supplier types:');
        const finalTypes = await pool.query(currentTypesQuery);
        finalTypes.rows.forEach(row => {
            console.log(`  ${row.supplier_type}: ${row.count} suppliers`);
        });
        
        console.log('\n🎉 Supplier type standardization completed successfully!');
        
    } catch (error) {
        console.error('❌ Error standardizing supplier types:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run the standardization
if (require.main === module) {
    standardizeSupplierTypes()
        .then(() => {
            console.log('✅ Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}

module.exports = { standardizeSupplierTypes }; 