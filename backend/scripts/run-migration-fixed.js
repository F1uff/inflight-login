const sqlite3 = require('sqlite3').verbose();

const DB_PATH = process.env.DB_PATH || './data/admin_dashboard.db';

async function runEnhancedMigration() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                reject(err);
                return;
            }
            console.log('✅ Connected to SQLite database');
        });

        console.log('🔄 Running enhanced admin dashboard migration...');

        db.serialize(() => {
            // Create audit_logs table
            db.run(`
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    table_name VARCHAR(100) NOT NULL,
                    record_id INTEGER,
                    action VARCHAR(50) NOT NULL,
                    old_values TEXT,
                    new_values TEXT,
                    changed_by INTEGER,
                    reason TEXT,
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('Error creating audit_logs:', err.message);
                else console.log('✅ Created audit_logs table');
            });

            // Create user_sessions table
            db.run(`
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    session_token VARCHAR(255) UNIQUE NOT NULL,
                    refresh_token VARCHAR(255),
                    expires_at DATETIME NOT NULL,
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('Error creating user_sessions:', err.message);
                else console.log('✅ Created user_sessions table');
            });

            // Create system_settings table
            db.run(`
                CREATE TABLE IF NOT EXISTS system_settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    setting_key VARCHAR(100) UNIQUE NOT NULL,
                    setting_value TEXT NOT NULL,
                    setting_type VARCHAR(50) DEFAULT 'string',
                    category VARCHAR(50) DEFAULT 'general',
                    description TEXT,
                    is_public BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('Error creating system_settings:', err.message);
                else console.log('✅ Created system_settings table');
            });

            // Create notifications table
            db.run(`
                CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    recipient_id INTEGER NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    type VARCHAR(50) DEFAULT 'info',
                    category VARCHAR(50) DEFAULT 'system',
                    is_read BOOLEAN DEFAULT 0,
                    action_url VARCHAR(500),
                    action_text VARCHAR(100),
                    expires_at DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    read_at DATETIME
                )
            `, (err) => {
                if (err) console.error('Error creating notifications:', err.message);
                else console.log('✅ Created notifications table');
            });

            // Enhance system_health table (might already exist)
            db.run(`
                CREATE TABLE IF NOT EXISTS system_health_enhanced (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    metric_name VARCHAR(100) NOT NULL,
                    metric_value DECIMAL(10,2) NOT NULL,
                    metric_unit VARCHAR(20),
                    status VARCHAR(20) DEFAULT 'normal',
                    threshold_warning DECIMAL(10,2),
                    threshold_critical DECIMAL(10,2),
                    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('Error creating system_health_enhanced:', err.message);
                else console.log('✅ Created system_health_enhanced table');
            });

            // Add new columns to users table (if they don't exist)
            const userColumns = [
                'avatar_url VARCHAR(500)',
                'login_attempts INTEGER DEFAULT 0',
                'locked_until DATETIME',
                'preferences TEXT'
            ];

            userColumns.forEach(column => {
                const columnName = column.split(' ')[0];
                db.run(`ALTER TABLE users ADD COLUMN ${column}`, (err) => {
                    if (err && !err.message.includes('duplicate column')) {
                        console.error(`Error adding ${columnName} to users:`, err.message);
                    } else if (!err) {
                        console.log(`✅ Added ${columnName} column to users table`);
                    }
                });
            });

            // Create indexes
            setTimeout(() => {
                const indexes = [
                    'CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id)',
                    'CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)',
                    'CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)',
                    'CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token)',
                    'CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key)',
                    'CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id)',
                    'CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)',
                    'CREATE INDEX IF NOT EXISTS idx_system_health_enhanced_metric ON system_health_enhanced(metric_name)',
                    'CREATE INDEX IF NOT EXISTS idx_users_email_idx ON users(email)',
                    'CREATE INDEX IF NOT EXISTS idx_users_role_idx ON users(role)'
                ];

                indexes.forEach(indexSQL => {
                    db.run(indexSQL, (err) => {
                        if (err) console.error('Index error:', err.message);
                    });
                });

                console.log('✅ Created performance indexes');
            }, 1000);

            // Insert default settings
            setTimeout(() => {
                const settings = [
                    ['site_name', 'Inflight Admin Dashboard', 'string', 'general', 'Application name'],
                    ['maintenance_mode', 'false', 'boolean', 'system', 'Maintenance mode flag'],
                    ['max_login_attempts', '5', 'number', 'security', 'Max login attempts'],
                    ['session_timeout', '3600', 'number', 'security', 'Session timeout seconds'],
                    ['dashboard_refresh_interval', '30', 'number', 'dashboard', 'Auto-refresh interval']
                ];

                settings.forEach(([key, value, type, category, description]) => {
                    db.run(`
                        INSERT OR IGNORE INTO system_settings 
                        (setting_key, setting_value, setting_type, category, description, is_public) 
                        VALUES (?, ?, ?, ?, ?, 0)
                    `, [key, value, type, category, description], (err) => {
                        if (err) console.error('Settings insert error:', err.message);
                    });
                });

                console.log('✅ Inserted default system settings');
            }, 1500);

            // Insert sample health metrics
            setTimeout(() => {
                const healthMetrics = [
                    ['api_response_time', 85, 'ms', 'normal', 200, 500],
                    ['database_response_time', 42, 'ms', 'normal', 100, 300],
                    ['memory_usage', 65.5, '%', 'normal', 80, 90],
                    ['cpu_usage', 23.2, '%', 'normal', 70, 85],
                    ['active_connections', 156, 'count', 'normal', 500, 1000]
                ];

                healthMetrics.forEach(([name, value, unit, status, warning, critical]) => {
                    db.run(`
                        INSERT OR IGNORE INTO system_health_enhanced 
                        (metric_name, metric_value, metric_unit, status, threshold_warning, threshold_critical) 
                        VALUES (?, ?, ?, ?, ?, ?)
                    `, [name, value, unit, status, warning, critical], (err) => {
                        if (err) console.error('Health metrics insert error:', err.message);
                    });
                });

                console.log('✅ Inserted sample health metrics');
            }, 2000);

            // Complete migration
            setTimeout(() => {
                console.log('\n🎉 Enhanced admin dashboard migration completed!');
                console.log('📊 Database now includes:');
                console.log('   • Audit logging system');
                console.log('   • User session management');
                console.log('   • System settings configuration');
                console.log('   • Notification system');
                console.log('   • Enhanced health monitoring');
                console.log('   • Performance indexes');
                console.log('   • Default configuration data');

                db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err);
                        reject(err);
                    } else {
                        console.log('✅ Database connection closed');
                        resolve();
                    }
                });
            }, 2500);
        });
    });
}

// Run migration if called directly
if (require.main === module) {
    runEnhancedMigration()
        .then(() => {
            console.log('\n🚀 Admin dashboard database enhancement complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Migration failed:', error);
            process.exit(1);
        });
}

module.exports = runEnhancedMigration; 