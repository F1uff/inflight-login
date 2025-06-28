-- ============================================================================
-- SYSTEM & AUDIT SCHEMA
-- File: 06_system_and_audit.sql
-- ============================================================================

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    recipient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id),
    
    -- Notification content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'booking', 'payment', 'system', 'alert', 'promotion'
    category VARCHAR(50), -- 'info', 'warning', 'error', 'success'
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Status tracking
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    is_delivered BOOLEAN DEFAULT FALSE,
    delivered_at TIMESTAMP,
    delivery_attempts INTEGER DEFAULT 0,
    
    -- Related entities
    related_entity_type VARCHAR(50), -- 'booking', 'company', 'vehicle', 'driver', 'transaction'
    related_entity_id INTEGER,
    
    -- Actions
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    action_data JSONB,
    
    -- Delivery channels
    channels TEXT[] DEFAULT ARRAY['in_app'], -- 'in_app', 'email', 'sms', 'push'
    email_sent BOOLEAN DEFAULT FALSE,
    sms_sent BOOLEAN DEFAULT FALSE,
    push_sent BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    metadata JSONB,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- NOTIFICATION TEMPLATES
-- ============================================================================

CREATE TABLE notification_templates (
    id SERIAL PRIMARY KEY,
    template_name VARCHAR(100) UNIQUE NOT NULL,
    template_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push', 'in_app'
    
    -- Template content
    subject_template VARCHAR(255),
    body_template TEXT NOT NULL,
    html_template TEXT, -- For email notifications
    
    -- Template configuration
    is_active BOOLEAN DEFAULT TRUE,
    supported_channels TEXT[],
    required_variables TEXT[], -- Variables that must be provided
    
    -- Metadata
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SYSTEM SETTINGS
-- ============================================================================

CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    setting_type VARCHAR(50) NOT NULL CHECK (setting_type IN ('string', 'number', 'boolean', 'object', 'array')),
    category VARCHAR(50), -- 'general', 'payment', 'notification', 'security', 'api'
    
    -- Configuration
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Can be accessed by non-admin users
    is_encrypted BOOLEAN DEFAULT FALSE, -- Sensitive settings
    
    -- Validation
    validation_rules JSONB, -- JSON schema for validation
    default_value JSONB,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id)
);

-- ============================================================================
-- AUDIT LOGS (PARTITIONED)
-- ============================================================================

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', 'view'
    entity_type VARCHAR(50) NOT NULL, -- 'user', 'company', 'booking', 'transaction', etc.
    entity_id INTEGER,
    
    -- Change details
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[], -- List of fields that changed
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    request_id VARCHAR(100),
    
    -- Additional context
    reason TEXT, -- Why the action was performed
    notes TEXT,
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for audit logs
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE audit_logs_2024_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE audit_logs_2024_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
CREATE TABLE audit_logs_2024_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');
CREATE TABLE audit_logs_2024_05 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');
CREATE TABLE audit_logs_2024_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');
CREATE TABLE audit_logs_2024_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');
CREATE TABLE audit_logs_2024_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');
CREATE TABLE audit_logs_2024_09 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');
CREATE TABLE audit_logs_2024_10 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
CREATE TABLE audit_logs_2024_11 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
CREATE TABLE audit_logs_2024_12 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- ============================================================================
-- FILE UPLOADS
-- ============================================================================

CREATE TABLE file_uploads (
    id SERIAL PRIMARY KEY,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_hash VARCHAR(64), -- SHA-256 hash for integrity and deduplication
    
    -- Related entity
    entity_type VARCHAR(50), -- 'user', 'company', 'vehicle', 'document', 'booking'
    entity_id INTEGER,
    
    -- File categorization
    file_category VARCHAR(50), -- 'avatar', 'document', 'image', 'attachment'
    file_purpose VARCHAR(100), -- 'profile_picture', 'business_permit', 'vehicle_photo'
    
    -- Access control
    is_public BOOLEAN DEFAULT FALSE,
    access_permissions JSONB, -- Who can access this file
    
    -- Processing status
    processing_status VARCHAR(20) DEFAULT 'completed' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    processing_error TEXT,
    
    -- Virus scanning
    virus_scan_status VARCHAR(20) DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'infected', 'error')),
    virus_scan_date TIMESTAMP,
    
    -- Metadata
    metadata JSONB,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- API KEYS
-- ============================================================================

CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    api_secret VARCHAR(255),
    
    -- Ownership
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Permissions and limits
    permissions TEXT[], -- List of allowed operations
    rate_limit_per_minute INTEGER DEFAULT 60,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    rate_limit_per_day INTEGER DEFAULT 10000,
    
    -- Usage tracking
    total_requests INTEGER DEFAULT 0,
    last_used TIMESTAMP,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    
    -- IP restrictions
    allowed_ips INET[],
    allowed_domains TEXT[],
    
    -- Metadata
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SYSTEM JOBS
-- ============================================================================

CREATE TABLE system_jobs (
    id SERIAL PRIMARY KEY,
    job_name VARCHAR(100) NOT NULL,
    job_type VARCHAR(50) NOT NULL, -- 'scheduled', 'immediate', 'recurring'
    
    -- Job configuration
    job_class VARCHAR(255) NOT NULL, -- Class or function to execute
    job_data JSONB, -- Parameters for the job
    
    -- Scheduling
    scheduled_at TIMESTAMP,
    cron_expression VARCHAR(100), -- For recurring jobs
    
    -- Execution tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Results
    result JSONB,
    error_message TEXT,
    execution_time DECIMAL(8,3), -- milliseconds
    
    -- Retry logic
    max_retries INTEGER DEFAULT 3,
    retry_count INTEGER DEFAULT 0,
    retry_delay INTEGER DEFAULT 60, -- seconds
    
    -- Priority
    priority INTEGER DEFAULT 0, -- Higher numbers = higher priority
    
    -- Metadata
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- FEATURE FLAGS
-- ============================================================================

CREATE TABLE feature_flags (
    id SERIAL PRIMARY KEY,
    flag_name VARCHAR(100) UNIQUE NOT NULL,
    flag_key VARCHAR(100) UNIQUE NOT NULL,
    
    -- Flag configuration
    is_enabled BOOLEAN DEFAULT FALSE,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
    
    -- Targeting
    target_users INTEGER[], -- Specific user IDs
    target_companies INTEGER[], -- Specific company IDs
    target_roles TEXT[], -- User roles
    
    -- Conditions
    conditions JSONB, -- Complex targeting conditions
    
    -- Metadata
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SYSTEM MAINTENANCE
-- ============================================================================

CREATE TABLE maintenance_windows (
    id SERIAL PRIMARY KEY,
    maintenance_type VARCHAR(50) NOT NULL, -- 'scheduled', 'emergency', 'update'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Schedule
    scheduled_start TIMESTAMP NOT NULL,
    scheduled_end TIMESTAMP NOT NULL,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    
    -- Status
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    
    -- Impact
    affected_services TEXT[],
    impact_level VARCHAR(20) DEFAULT 'medium' CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
    
    -- Notifications
    notify_users BOOLEAN DEFAULT TRUE,
    notification_sent BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Notifications indexes
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at);
CREATE INDEX idx_notifications_entity ON notifications(related_entity_type, related_entity_id);

-- System settings indexes
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE INDEX idx_system_settings_public ON system_settings(is_public) WHERE is_public = true;

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_session_id ON audit_logs(session_id);

-- File uploads indexes
CREATE INDEX idx_file_uploads_entity ON file_uploads(entity_type, entity_id);
CREATE INDEX idx_file_uploads_uploaded_by ON file_uploads(uploaded_by);
CREATE INDEX idx_file_uploads_hash ON file_uploads(file_hash);
CREATE INDEX idx_file_uploads_category ON file_uploads(file_category);
CREATE INDEX idx_file_uploads_created_at ON file_uploads(created_at);

-- API keys indexes
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_company_id ON api_keys(company_id);
CREATE INDEX idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;
CREATE INDEX idx_api_keys_expires_at ON api_keys(expires_at);

-- System jobs indexes
CREATE INDEX idx_system_jobs_status ON system_jobs(status);
CREATE INDEX idx_system_jobs_scheduled_at ON system_jobs(scheduled_at);
CREATE INDEX idx_system_jobs_priority ON system_jobs(priority);
CREATE INDEX idx_system_jobs_type ON system_jobs(job_type);

-- Feature flags indexes
CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled) WHERE is_enabled = true;
CREATE INDEX idx_feature_flags_key ON feature_flags(flag_key);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER trigger_notification_templates_updated_at 
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_system_settings_updated_at 
    BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_api_keys_updated_at 
    BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_system_jobs_updated_at 
    BEFORE UPDATE ON system_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_feature_flags_updated_at 
    BEFORE UPDATE ON feature_flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_maintenance_windows_updated_at 
    BEFORE UPDATE ON maintenance_windows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to log audit event
CREATE OR REPLACE FUNCTION log_audit_event(
    p_user_id INTEGER,
    p_action VARCHAR(100),
    p_entity_type VARCHAR(50),
    p_entity_id INTEGER DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    audit_id INTEGER;
BEGIN
    INSERT INTO audit_logs (
        user_id, action, entity_type, entity_id, old_values, new_values, reason,
        ip_address, user_agent, session_id
    ) VALUES (
        p_user_id, p_action, p_entity_type, p_entity_id, p_old_values, p_new_values, p_reason,
        NULLIF(current_setting('app.client_ip', TRUE), '')::INET,
        NULLIF(current_setting('app.user_agent', TRUE), ''),
        NULLIF(current_setting('app.session_id', TRUE), '')
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql;

-- Function to send notification
CREATE OR REPLACE FUNCTION send_notification(
    p_recipient_id INTEGER,
    p_title VARCHAR(255),
    p_message TEXT,
    p_type VARCHAR(50),
    p_channels TEXT[] DEFAULT ARRAY['in_app'],
    p_related_entity_type VARCHAR(50) DEFAULT NULL,
    p_related_entity_id INTEGER DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    notification_id INTEGER;
BEGIN
    INSERT INTO notifications (
        recipient_id, title, message, notification_type, channels,
        related_entity_type, related_entity_id, metadata
    ) VALUES (
        p_recipient_id, p_title, p_message, p_type, p_channels,
        p_related_entity_type, p_related_entity_id, p_metadata
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get system setting
CREATE OR REPLACE FUNCTION get_system_setting(
    p_setting_key VARCHAR(100),
    p_default_value JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    setting_value JSONB;
BEGIN
    SELECT setting_value INTO setting_value
    FROM system_settings 
    WHERE setting_key = p_setting_key;
    
    RETURN COALESCE(setting_value, p_default_value);
END;
$$ LANGUAGE plpgsql;

-- Function to check feature flag
CREATE OR REPLACE FUNCTION is_feature_enabled(
    p_flag_key VARCHAR(100),
    p_user_id INTEGER DEFAULT NULL,
    p_company_id INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    flag_record RECORD;
    user_role VARCHAR(50);
BEGIN
    SELECT * INTO flag_record
    FROM feature_flags 
    WHERE flag_key = p_flag_key;
    
    -- If flag doesn't exist, return false
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- If flag is disabled, return false
    IF NOT flag_record.is_enabled THEN
        RETURN FALSE;
    END IF;
    
    -- Check specific user targeting
    IF p_user_id IS NOT NULL AND flag_record.target_users IS NOT NULL THEN
        IF p_user_id = ANY(flag_record.target_users) THEN
            RETURN TRUE;
        END IF;
    END IF;
    
    -- Check company targeting
    IF p_company_id IS NOT NULL AND flag_record.target_companies IS NOT NULL THEN
        IF p_company_id = ANY(flag_record.target_companies) THEN
            RETURN TRUE;
        END IF;
    END IF;
    
    -- Check role targeting
    IF p_user_id IS NOT NULL AND flag_record.target_roles IS NOT NULL THEN
        SELECT role INTO user_role FROM users WHERE id = p_user_id;
        IF user_role = ANY(flag_record.target_roles) THEN
            RETURN TRUE;
        END IF;
    END IF;
    
    -- Check rollout percentage (simple random)
    IF flag_record.rollout_percentage > 0 THEN
        IF (RANDOM() * 100) <= flag_record.rollout_percentage THEN
            RETURN TRUE;
        END IF;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to clean old data
CREATE OR REPLACE FUNCTION cleanup_old_data(
    p_days_to_keep INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    cutoff_date TIMESTAMP;
BEGIN
    cutoff_date := CURRENT_TIMESTAMP - (p_days_to_keep || ' days')::INTERVAL;
    
    -- Clean old notifications
    DELETE FROM notifications WHERE created_at < cutoff_date AND is_read = true;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Clean old audit logs (keep longer retention)
    DELETE FROM audit_logs WHERE created_at < (CURRENT_TIMESTAMP - INTERVAL '1 year');
    
    -- Clean old completed jobs
    DELETE FROM system_jobs WHERE completed_at < cutoff_date AND status = 'completed';
    
    -- Clean old file uploads (orphaned files)
    DELETE FROM file_uploads WHERE created_at < cutoff_date AND entity_id IS NULL;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql; 