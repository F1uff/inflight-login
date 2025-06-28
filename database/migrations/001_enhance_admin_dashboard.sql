-- ============================================================================
-- ADMIN DASHBOARD ENHANCEMENT MIGRATION
-- Migration: 001_enhance_admin_dashboard.sql
-- Description: Add enhanced tables and features for comprehensive admin dashboard
-- ============================================================================

-- Add audit logging table for tracking admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER,
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'status_change'
    old_values TEXT, -- JSON string of old values
    new_values TEXT, -- JSON string of new values
    changed_by INTEGER, -- user ID who made the change
    reason TEXT, -- reason for the change
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add user sessions table for tracking active sessions
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
);

-- Add system settings table for configurable admin settings
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(50) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    category VARCHAR(50) DEFAULT 'general',
    description TEXT,
    is_public BOOLEAN DEFAULT 0, -- whether setting is visible to non-admin users
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add notification system for admin alerts
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_id INTEGER NOT NULL, -- user ID
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
    category VARCHAR(50) DEFAULT 'system', -- 'system', 'booking', 'supplier', 'user'
    is_read BOOLEAN DEFAULT 0,
    action_url VARCHAR(500), -- optional URL for action button
    action_text VARCHAR(100), -- text for action button
    expires_at DATETIME, -- optional expiration
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME
);

-- Add system health monitoring table
CREATE TABLE IF NOT EXISTS system_health (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    metric_unit VARCHAR(20), -- 'ms', '%', 'MB', 'count'
    status VARCHAR(20) DEFAULT 'normal', -- 'normal', 'warning', 'critical'
    threshold_warning DECIMAL(10,2),
    threshold_critical DECIMAL(10,2),
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Enhance existing users table with additional admin fields
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN last_login DATETIME;
ALTER TABLE users ADD COLUMN login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until DATETIME;
ALTER TABLE users ADD COLUMN preferences TEXT; -- JSON string for user preferences

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON audit_logs(changed_by);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

CREATE INDEX IF NOT EXISTS idx_system_health_metric ON system_health(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_health_recorded_at ON system_health(recorded_at);
CREATE INDEX IF NOT EXISTS idx_system_health_status ON system_health(status);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Insert default system settings
INSERT OR IGNORE INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
('site_name', 'Inflight Admin Dashboard', 'string', 'general', 'Name of the application', 1),
('site_description', 'Comprehensive admin dashboard for transport management', 'string', 'general', 'Site description', 1),
('maintenance_mode', 'false', 'boolean', 'system', 'Enable maintenance mode', 0),
('max_login_attempts', '5', 'number', 'security', 'Maximum login attempts before lockout', 0),
('session_timeout', '3600', 'number', 'security', 'Session timeout in seconds', 0),
('notification_retention_days', '30', 'number', 'system', 'Days to keep notifications', 0),
('audit_retention_days', '90', 'number', 'system', 'Days to keep audit logs', 0),
('dashboard_refresh_interval', '30', 'number', 'dashboard', 'Dashboard auto-refresh interval in seconds', 0),
('enable_email_notifications', 'true', 'boolean', 'notifications', 'Enable email notifications', 0),
('enable_push_notifications', 'false', 'boolean', 'notifications', 'Enable push notifications', 0);

-- Insert sample system health metrics
INSERT OR IGNORE INTO system_health (metric_name, metric_value, metric_unit, status, threshold_warning, threshold_critical) VALUES
('api_response_time', 85, 'ms', 'normal', 200, 500),
('database_response_time', 42, 'ms', 'normal', 100, 300),
('memory_usage', 65.5, '%', 'normal', 80, 90),
('cpu_usage', 23.2, '%', 'normal', 70, 85),
('disk_usage', 45.8, '%', 'normal', 80, 90),
('active_connections', 156, 'count', 'normal', 500, 1000),
('error_rate', 0.2, '%', 'normal', 1, 5);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS trigger_user_sessions_updated_at 
    AFTER UPDATE ON user_sessions
    FOR EACH ROW 
    BEGIN
        UPDATE user_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS trigger_system_settings_updated_at 
    AFTER UPDATE ON system_settings
    FOR EACH ROW 
    BEGIN
        UPDATE system_settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Create view for dashboard summary
CREATE VIEW IF NOT EXISTS dashboard_summary AS
SELECT 
    (SELECT COUNT(*) FROM bookings WHERE DATE(created_at) = DATE('now')) as today_bookings,
    (SELECT COUNT(*) FROM bookings WHERE DATE(created_at) >= DATE('now', '-7 days')) as week_bookings,
    (SELECT COUNT(*) FROM bookings WHERE DATE(created_at) >= DATE('now', '-30 days')) as month_bookings,
    (SELECT COUNT(*) FROM suppliers WHERE account_status = 'active') as active_suppliers,
    (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
    (SELECT COUNT(*) FROM user_sessions WHERE is_active = 1 AND expires_at > DATETIME('now')) as active_sessions,
    (SELECT COUNT(*) FROM notifications WHERE is_read = 0) as unread_notifications,
    (SELECT AVG(metric_value) FROM system_health WHERE metric_name = 'api_response_time' AND recorded_at >= DATETIME('now', '-1 hour')) as avg_api_response_time,
    (SELECT COUNT(*) FROM system_health WHERE status = 'critical' AND recorded_at >= DATETIME('now', '-1 hour')) as critical_alerts;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================ 