const sqlite3 = require('sqlite3').verbose();

const DB_PATH = process.env.DB_PATH || './data/admin_dashboard.db';

function createConnection() {
    return new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Error opening database:', err);
            throw err;
        }
    });
}

async function migrateDatabase() {
    return new Promise((resolve, reject) => {
        const db = createConnection();
        
        console.log('🔄 Starting database migration...');
        
        db.serialize(() => {
            // Check if the new columns already exist
            db.all("PRAGMA table_info(suppliers)", (err, columns) => {
                if (err) {
                    console.error('Error checking table info:', err);
                    reject(err);
                    return;
                }
                
                const existingColumns = columns.map(col => col.name);
                const newColumns = [
                    'representative_name',
                    'designation', 
                    'tel_number',
                    'breakfast_type',
                    'room_quantity',
                    'mode_of_payment',
                    'credit_terms',
                    'remarks'
                ];
                
                const columnsToAdd = newColumns.filter(col => !existingColumns.includes(col));
                
                if (columnsToAdd.length === 0) {
                    console.log('✅ All columns already exist, no migration needed');
                    db.close();
                    resolve();
                    return;
                }
                
                console.log(`📝 Adding ${columnsToAdd.length} missing columns:`, columnsToAdd);
                
                // Add missing columns
                const addColumnPromises = columnsToAdd.map(column => {
                    return new Promise((resolveCol, rejectCol) => {
                        let columnDef = '';
                        switch(column) {
                            case 'representative_name':
                            case 'designation':
                            case 'breakfast_type':
                            case 'mode_of_payment':
                            case 'credit_terms':
                                columnDef = `${column} VARCHAR(255)`;
                                break;
                            case 'tel_number':
                                columnDef = `${column} VARCHAR(20)`;
                                break;
                            case 'room_quantity':
                                columnDef = `${column} INTEGER`;
                                break;
                            case 'remarks':
                                columnDef = `${column} TEXT`;
                                break;
                        }
                        
                        db.run(`ALTER TABLE suppliers ADD COLUMN ${columnDef}`, (err) => {
                            if (err) {
                                console.error(`Error adding column ${column}:`, err);
                                rejectCol(err);
                            } else {
                                console.log(`✅ Added column: ${column}`);
                                resolveCol();
                            }
                        });
                    });
                });
                
                Promise.all(addColumnPromises)
                    .then(() => {
                        console.log('✅ Database migration completed successfully');
                        db.close();
                        resolve();
                    })
                    .catch((err) => {
                        console.error('❌ Migration failed:', err);
                        db.close();
                        reject(err);
                    });
            });
        });
    });
}

// Run migration if called directly
if (require.main === module) {
    migrateDatabase()
        .then(() => {
            console.log('🎉 Migration completed successfully!');
            process.exit(0);
        })
        .catch((err) => {
            console.error('💥 Migration failed:', err);
            process.exit(1);
        });
}

module.exports = { migrateDatabase }; 