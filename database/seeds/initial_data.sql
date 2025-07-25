-- ============================================================================
-- INITIAL DATA SEEDS
-- Essential data required for system operation
-- ============================================================================

-- ============================================================================
-- SYSTEM SETTINGS
-- ============================================================================

INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
-- General settings
('app_name', '"Inflight Admin Dashboard"', 'string', 'general', 'Application name', true),
('app_version', '"1.0.0"', 'string', 'general', 'Application version', true),
('default_currency', '"PHP"', 'string', 'general', 'Default currency code', true),
('default_timezone', '"Asia/Manila"', 'string', 'general', 'Default timezone', true),
('date_format', '"Y-m-d"', 'string', 'general', 'Default date format', true),
('time_format', '"H:i:s"', 'string', 'general', 'Default time format', true),

-- Business settings
('commission_rate', '0.15', 'number', 'business', 'Default commission rate (15%)', false),
('booking_cancellation_window', '24', 'number', 'business', 'Hours before pickup to allow cancellation', true),
('driver_response_timeout', '15', 'number', 'business', 'Minutes to wait for driver response', false),
('max_booking_advance_days', '30', 'number', 'business', 'Maximum days in advance to book', true),

-- Payment settings
('payment_methods', '["cash", "credit_card", "gcash", "paymaya", "bank_transfer"]', 'array', 'payment', 'Enabled payment methods', true),
('auto_payout_threshold', '5000', 'number', 'payment', 'Minimum amount for automatic payout', false),
('payment_processing_fee', '0.035', 'number', 'payment', 'Payment processing fee (3.5%)', false),

-- Notification settings
('email_notifications_enabled', 'true', 'boolean', 'notification', 'Enable email notifications', false),
('sms_notifications_enabled', 'true', 'boolean', 'notification', 'Enable SMS notifications', false),
('push_notifications_enabled', 'true', 'boolean', 'notification', 'Enable push notifications', false),
('notification_batch_size', '100', 'number', 'notification', 'Batch size for notification processing', false),

-- Security settings
('session_timeout', '3600', 'number', 'security', 'Session timeout in seconds', false),
('max_login_attempts', '5', 'number', 'security', 'Maximum login attempts before lockout', false),
('password_min_length', '8', 'number', 'security', 'Minimum password length', true),
('require_2fa', 'false', 'boolean', 'security', 'Require two-factor authentication', false),

-- API settings
('api_rate_limit_per_minute', '60', 'number', 'api', 'API rate limit per minute', false),
('api_rate_limit_per_hour', '1000', 'number', 'api', 'API rate limit per hour', false),
('api_timeout', '30', 'number', 'api', 'API timeout in seconds', false);

-- ============================================================================
-- DASHBOARD COUNTERS
-- ============================================================================

INSERT INTO dashboard_counters (counter_name, counter_value, counter_type, counter_category, description) VALUES
-- Business counters
('total_bookings', 0, 'cumulative', 'business', 'Total number of bookings'),
('active_bookings', 0, 'current', 'business', 'Currently active bookings'),
('completed_bookings', 0, 'cumulative', 'business', 'Total completed bookings'),
('cancelled_bookings', 0, 'cumulative', 'business', 'Total cancelled bookings'),

-- Financial counters
('total_revenue', 0, 'cumulative', 'financial', 'Total revenue generated'),
('pending_payments', 0, 'current', 'financial', 'Pending payment amount'),
('total_payouts', 0, 'cumulative', 'financial', 'Total payouts to suppliers'),

-- Operational counters
('active_suppliers', 0, 'current', 'operational', 'Number of active suppliers'),
('active_drivers', 0, 'current', 'operational', 'Number of active drivers'),
('active_vehicles', 0, 'current', 'operational', 'Number of active vehicles'),
('available_drivers', 0, 'current', 'operational', 'Number of available drivers'),

-- System counters
('total_users', 0, 'cumulative', 'system', 'Total registered users'),
('active_sessions', 0, 'current', 'system', 'Current active sessions'),
('system_errors_today', 0, 'current', 'system', 'System errors today'),
('api_requests_today', 0, 'current', 'system', 'API requests today');

-- ============================================================================
-- NOTIFICATION TEMPLATES
-- ============================================================================

INSERT INTO notification_templates (template_name, template_type, subject_template, body_template, supported_channels, required_variables, description) VALUES
-- Booking notifications
('booking_confirmed', 'email', 'Booking Confirmed - {{booking_reference}}', 
 'Your booking {{booking_reference}} has been confirmed. Pickup: {{pickup_datetime}} at {{pickup_address}}. Driver: {{driver_name}}.',
 ARRAY['email', 'sms', 'in_app'], ARRAY['booking_reference', 'pickup_datetime', 'pickup_address', 'driver_name'],
 'Booking confirmation notification'),

('booking_cancelled', 'email', 'Booking Cancelled - {{booking_reference}}',
 'Your booking {{booking_reference}} has been cancelled. Reason: {{cancellation_reason}}. Refund will be processed if applicable.',
 ARRAY['email', 'sms', 'in_app'], ARRAY['booking_reference', 'cancellation_reason'],
 'Booking cancellation notification'),

('driver_assigned', 'sms', 'Driver Assigned', 
 'Driver {{driver_name}} ({{driver_phone}}) has been assigned to your booking {{booking_reference}}. Vehicle: {{vehicle_details}}.',
 ARRAY['sms', 'in_app'], ARRAY['driver_name', 'driver_phone', 'booking_reference', 'vehicle_details'],
 'Driver assignment notification'),

-- Payment notifications
('payment_received', 'email', 'Payment Received - {{transaction_reference}}',
 'Payment of {{amount}} {{currency}} has been received for booking {{booking_reference}}. Transaction ID: {{transaction_reference}}.',
 ARRAY['email', 'in_app'], ARRAY['amount', 'currency', 'booking_reference', 'transaction_reference'],
 'Payment confirmation notification'),

('payout_processed', 'email', 'Payout Processed - {{payout_reference}}',
 'Your payout of {{amount}} {{currency}} has been processed. Reference: {{payout_reference}}. Expected in your account within 1-3 business days.',
 ARRAY['email', 'in_app'], ARRAY['amount', 'currency', 'payout_reference'],
 'Payout processing notification'),

-- System notifications
('welcome_user', 'email', 'Welcome to Inflight Admin Dashboard',
 'Welcome {{user_name}}! Your account has been created successfully. You can now access the dashboard and start managing your business.',
 ARRAY['email'], ARRAY['user_name'],
 'Welcome message for new users'),

('password_reset', 'email', 'Password Reset Request',
 'A password reset has been requested for your account. Click the link to reset: {{reset_link}}. This link expires in 1 hour.',
 ARRAY['email'], ARRAY['reset_link'],
 'Password reset notification'),

-- Alert notifications
('system_alert', 'email', 'System Alert - {{alert_type}}',
 'System alert triggered: {{alert_description}}. Severity: {{severity}}. Please check the admin dashboard for details.',
 ARRAY['email', 'in_app'], ARRAY['alert_type', 'alert_description', 'severity'],
 'System alert notification');

-- ============================================================================
-- BUSINESS ALERTS
-- ============================================================================

INSERT INTO business_alerts (alert_type, alert_name, alert_description, metric_name, threshold_value, threshold_operator, severity, notification_channels) VALUES
-- Revenue alerts
('revenue_drop', 'Daily Revenue Drop', 'Alert when daily revenue drops by more than 20%', 'daily_revenue', 20, '<', 'warning', ARRAY['email', 'in_app']),
('low_revenue', 'Low Daily Revenue', 'Alert when daily revenue is below minimum threshold', 'daily_revenue', 10000, '<', 'warning', ARRAY['email']),

-- Booking alerts
('high_cancellation_rate', 'High Cancellation Rate', 'Alert when cancellation rate exceeds 15%', 'cancellation_rate', 15, '>', 'warning', ARRAY['email', 'in_app']),
('booking_spike', 'Booking Spike', 'Alert when hourly bookings exceed normal threshold', 'hourly_bookings', 50, '>', 'info', ARRAY['in_app']),

-- System alerts
('high_error_rate', 'High Error Rate', 'Alert when system error rate exceeds 5%', 'error_rate', 5, '>', 'critical', ARRAY['email', 'in_app']),
('low_driver_availability', 'Low Driver Availability', 'Alert when available drivers drop below threshold', 'available_drivers', 5, '<', 'warning', ARRAY['email']),

-- Performance alerts
('slow_api_response', 'Slow API Response', 'Alert when API response time exceeds threshold', 'api_response_time', 2000, '>', 'warning', ARRAY['email']),
('database_performance', 'Database Performance Issue', 'Alert when database response time is slow', 'db_response_time', 1000, '>', 'critical', ARRAY['email', 'in_app']);

-- ============================================================================
-- DASHBOARD WIDGETS
-- ============================================================================

INSERT INTO dashboard_widgets (widget_name, widget_type, widget_category, data_source, query_config, display_config, title, dashboard_page, grid_position, user_roles) VALUES
-- Overview widgets
('total_bookings_today', 'counter', 'overview', 'dashboard_metrics', 
 '{"query": "SELECT SUM(total_bookings) FROM dashboard_metrics WHERE metric_date = CURRENT_DATE"}',
 '{"color": "blue", "icon": "calendar", "format": "number"}',
 'Bookings Today', 'main', '{"x": 0, "y": 0, "w": 3, "h": 2}', ARRAY['admin']),

('revenue_today', 'counter', 'revenue', 'dashboard_metrics',
 '{"query": "SELECT SUM(total_revenue) FROM dashboard_metrics WHERE metric_date = CURRENT_DATE"}',
 '{"color": "green", "icon": "dollar", "format": "currency"}',
 'Revenue Today', 'main', '{"x": 3, "y": 0, "w": 3, "h": 2}', ARRAY['admin']),

('active_suppliers', 'counter', 'suppliers', 'suppliers',
 '{"query": "SELECT COUNT(*) FROM suppliers WHERE account_status = ''active''"}',
 '{"color": "purple", "icon": "users", "format": "number"}',
 'Active Suppliers', 'main', '{"x": 6, "y": 0, "w": 3, "h": 2}', ARRAY['admin']),

('available_drivers', 'counter', 'operational', 'drivers',
 '{"query": "SELECT COUNT(*) FROM drivers WHERE availability_status = ''available''"}',
 '{"color": "orange", "icon": "car", "format": "number"}',
 'Available Drivers', 'main', '{"x": 9, "y": 0, "w": 3, "h": 2}', ARRAY['admin']),

-- Chart widgets
('bookings_trend', 'chart', 'bookings', 'dashboard_metrics',
 '{"query": "SELECT metric_date, SUM(total_bookings) as bookings FROM dashboard_metrics WHERE metric_date >= CURRENT_DATE - INTERVAL ''7 days'' GROUP BY metric_date ORDER BY metric_date", "type": "line"}',
 '{"chart_type": "line", "x_axis": "metric_date", "y_axis": "bookings", "color": "blue"}',
 'Bookings Trend (7 Days)', 'main', '{"x": 0, "y": 2, "w": 6, "h": 4}', ARRAY['admin']),

('revenue_breakdown', 'chart', 'revenue', 'revenue_analytics',
 '{"query": "SELECT date_recorded, gross_revenue, net_revenue FROM revenue_analytics WHERE date_recorded >= CURRENT_DATE - INTERVAL ''30 days'' ORDER BY date_recorded", "type": "area"}',
 '{"chart_type": "area", "x_axis": "date_recorded", "y_axis": ["gross_revenue", "net_revenue"], "colors": ["green", "blue"]}',
 'Revenue Breakdown (30 Days)', 'main', '{"x": 6, "y": 2, "w": 6, "h": 4}', ARRAY['admin']);

-- ============================================================================
-- FEATURE FLAGS
-- ============================================================================

INSERT INTO feature_flags (flag_name, flag_key, is_enabled, rollout_percentage, description) VALUES
('Real-time Tracking', 'realtime_tracking', false, 0, 'Enable real-time GPS tracking for vehicles'),
('Advanced Analytics', 'advanced_analytics', true, 100, 'Enable advanced analytics dashboard'),
('Multi-language Support', 'multi_language', false, 0, 'Enable multi-language support'),
('Mobile App Integration', 'mobile_app', true, 100, 'Enable mobile app integration features'),
('Automated Payouts', 'auto_payouts', false, 10, 'Enable automated supplier payouts'),
('AI Recommendations', 'ai_recommendations', false, 0, 'Enable AI-powered recommendations'),
('Advanced Reporting', 'advanced_reporting', true, 50, 'Enable advanced reporting features'),
('API v2', 'api_v2', false, 0, 'Enable API version 2 features');

-- ============================================================================
-- DEFAULT ADMIN USER (OPTIONAL - COMMENT OUT FOR PRODUCTION)
-- ============================================================================

-- INSERT INTO users (email, password_hash, role, first_name, last_name, email_verified, status) VALUES
-- ('admin@inflight.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'System', 'Administrator', true, 'active');

-- ============================================================================
-- SAMPLE DASHBOARD METRICS (COMMENTED OUT - NO MOCKUP DATA)
-- ============================================================================

-- Sample metrics insertion commented out to keep database clean
-- Uncomment only for development/testing purposes
/*
DO $$
DECLARE
    i INTEGER;
    sample_date DATE;
BEGIN
    FOR i IN 0..6 LOOP
        sample_date := CURRENT_DATE - i;
        
        INSERT INTO dashboard_metrics (
            metric_date, total_bookings, completed_bookings, cancelled_bookings,
            total_revenue, completed_revenue, active_suppliers, active_drivers,
            average_rating, customer_satisfaction
        ) VALUES (
            sample_date,
            FLOOR(RANDOM() * 50 + 20)::INTEGER, -- 20-70 bookings
            FLOOR(RANDOM() * 40 + 15)::INTEGER, -- 15-55 completed
            FLOOR(RANDOM() * 5 + 1)::INTEGER,   -- 1-6 cancelled
            ROUND((RANDOM() * 50000 + 20000)::NUMERIC, 2), -- 20k-70k revenue
            ROUND((RANDOM() * 45000 + 18000)::NUMERIC, 2), -- 18k-63k completed
            FLOOR(RANDOM() * 20 + 10)::INTEGER, -- 10-30 suppliers
            FLOOR(RANDOM() * 50 + 25)::INTEGER, -- 25-75 drivers
            ROUND((RANDOM() * 1.5 + 3.5)::NUMERIC, 2), -- 3.5-5.0 rating
            ROUND((RANDOM() * 20 + 80)::NUMERIC, 2)  -- 80-100% satisfaction
        ) ON CONFLICT (metric_date, metric_hour) DO NOTHING;
    END LOOP;
END
$$;
*/

\echo 'Initial data seeding completed successfully!'; 