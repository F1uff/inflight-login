const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || './data/admin_dashboard.db';

async function runMigration() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                reject(err);
                return;
            }
            console.log('✅ Connected to SQLite database');
        });

        // Read migration file
        const migrationPath = path.join(__dirname, '../../database/migrations/001_enhance_admin_dashboard.sql');
        
        if (!fs.existsSync(migrationPath)) {
            console.error('❌ Migration file not found:', migrationPath);
            reject(new Error('Migration file not found'));
            return;
        }

        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('🔄 Running admin dashboard enhancement migration...');

        // Split SQL by semicolons and execute each statement
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        let completed = 0;
        const total = statements.length;

        db.serialize(() => {
            statements.forEach((statement, index) => {
                db.run(statement, [], function(err) {
                    if (err) {
                        console.error(`❌ Error executing statement ${index + 1}:`, err.message);
                        console.error('Statement:', statement.substring(0, 100) + '...');
                    } else {
                        completed++;
                        console.log(`✅ Executed statement ${completed}/${total}`);
                    }

                    if (completed === total) {
                        console.log('\n🎉 Migration completed successfully!');
                        console.log(`📊 Enhanced admin dashboard database with:`);
                        console.log('   • Audit logging system');
                        console.log('   • User session management');
                        console.log('   • System settings configuration');
                        console.log('   • Notification system');
                        console.log('   • Real-time health monitoring');
                        console.log('   • Enhanced user management');
                        console.log('   • Performance indexes');
                        console.log('   • Dashboard summary view');
                        
                        db.close((err) => {
                            if (err) {
                                console.error('Error closing database:', err);
                                reject(err);
                            } else {
                                console.log('✅ Database connection closed');
                                resolve();
                            }
                        });
                    }
                });
            });
        });
    });
}

// Run migration if called directly
if (require.main === module) {
    runMigration()
        .then(() => {
            console.log('\n🚀 Admin dashboard database enhancement complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Migration failed:', error);
            process.exit(1);
        });
}

module.exports = runMigration; 