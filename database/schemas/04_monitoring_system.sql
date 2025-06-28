-- ============================================================================
-- MONITORING SYSTEM SCHEMA
-- File: 04_monitoring_system.sql
-- ============================================================================

-- ============================================================================
-- MONITORING EVENTS (PARTITIONED TABLE)
-- ============================================================================

-- Main monitoring events table (partitioned by created_at)
CREATE TABLE monitoring_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL CHECK (event_type IN ('system', 'business', 'security', 'performance')),
    event_category VARCHAR(100) NOT NULL CHECK (event_category IN ('error', 'warning', 'info', 'critical')),
    event_source VARCHAR(100) NOT NULL, -- 'api', 'database', 'payment', 'booking', 'auth'
    
    -- Event details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Related entities
    entity_type VARCHAR(50), -- 'booking', 'user', 'company', 'vehicle', 'supplier'
    entity_id INTEGER,
    
    -- Technical details
    error_code VARCHAR(50),
    error_message TEXT,
    stack_trace TEXT,
    request_id VARCHAR(100),
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    
    -- Request/response context
    http_method VARCHAR(10),
    request_url TEXT,
    response_code INTEGER,
    response_time DECIMAL(8,3), -- milliseconds
    
    -- Status and resolution
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed', 'ignored')),
    resolved_at TIMESTAMP,
    resolved_by INTEGER REFERENCES users(id),
    resolution_notes TEXT,
    
    -- Additional context
    metadata JSONB,
    tags TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for monitoring events
CREATE TABLE monitoring_events_2024_01 PARTITION OF monitoring_events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE monitoring_events_2024_02 PARTITION OF monitoring_events
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE monitoring_events_2024_03 PARTITION OF monitoring_events
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
CREATE TABLE monitoring_events_2024_04 PARTITION OF monitoring_events
    FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');
CREATE TABLE monitoring_events_2024_05 PARTITION OF monitoring_events
    FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');
CREATE TABLE monitoring_events_2024_06 PARTITION OF monitoring_events
    FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');
CREATE TABLE monitoring_events_2024_07 PARTITION OF monitoring_events
    FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');
CREATE TABLE monitoring_events_2024_08 PARTITION OF monitoring_events
    FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');
CREATE TABLE monitoring_events_2024_09 PARTITION OF monitoring_events
    FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');
CREATE TABLE monitoring_events_2024_10 PARTITION OF monitoring_events
    FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
CREATE TABLE monitoring_events_2024_11 PARTITION OF monitoring_events
    FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
CREATE TABLE monitoring_events_2024_12 PARTITION OF monitoring_events
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- ============================================================================
-- SYSTEM HEALTH MONITORING
-- ============================================================================

CREATE TABLE system_health (
    id SERIAL PRIMARY KEY,
    check_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Database health
    db_connection_count INTEGER,
    db_active_connections INTEGER,
    db_idle_connections INTEGER,
    db_response_time DECIMAL(8,3), -- milliseconds
    db_slow_queries INTEGER DEFAULT 0,
    db_deadlocks INTEGER DEFAULT 0,
    db_disk_usage DECIMAL(5,2), -- percentage
    
    -- API health
    api_response_time DECIMAL(8,3), -- milliseconds
    api_success_rate DECIMAL(5,2), -- percentage
    api_requests_per_minute INTEGER,
    api_error_rate DECIMAL(5,2), -- percentage
    api_timeout_rate DECIMAL(5,2), -- percentage
    
    -- Business health
    active_bookings INTEGER,
    pending_payments INTEGER,
    failed_payments_last_hour INTEGER DEFAULT 0,
    system_errors_last_hour INTEGER DEFAULT 0,
    critical_alerts_active INTEGER DEFAULT 0,
    
    -- External services health
    payment_gateway_status VARCHAR(20) CHECK (payment_gateway_status IN ('up', 'down', 'degraded')),
    payment_gateway_response_time DECIMAL(8,3),
    sms_service_status VARCHAR(20) CHECK (sms_service_status IN ('up', 'down', 'degraded')),
    sms_service_response_time DECIMAL(8,3),
    email_service_status VARCHAR(20) CHECK (email_service_status IN ('up', 'down', 'degraded')),
    email_service_response_time DECIMAL(8,3),
    
    -- System resources
    cpu_usage DECIMAL(5,2), -- percentage
    memory_usage DECIMAL(5,2), -- percentage
    disk_usage DECIMAL(5,2), -- percentage
    network_latency DECIMAL(8,3), -- milliseconds
    
    -- Overall health score (0-100)
    overall_health_score INTEGER CHECK (overall_health_score BETWEEN 0 AND 100),
    health_status VARCHAR(20) DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'warning', 'critical', 'down')),
    
    -- Additional metrics
    concurrent_users INTEGER,
    active_sessions INTEGER,
    cache_hit_rate DECIMAL(5,2), -- percentage
    
    notes TEXT
);

-- ============================================================================
-- PERFORMANCE MONITORING
-- ============================================================================

-- Performance logs (partitioned table)
CREATE TABLE performance_logs (
    id SERIAL PRIMARY KEY,
    log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Request identification
    request_id VARCHAR(100),
    session_id VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    
    -- Request details
    endpoint VARCHAR(255) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    request_size INTEGER, -- bytes
    response_size INTEGER, -- bytes
    
    -- Performance metrics
    response_time DECIMAL(8,3) NOT NULL, -- milliseconds
    database_time DECIMAL(8,3), -- milliseconds spent on database queries
    external_api_time DECIMAL(8,3), -- milliseconds spent on external APIs
    processing_time DECIMAL(8,3), -- milliseconds spent on business logic
    
    -- Status and errors
    status_code INTEGER NOT NULL,
    error_count INTEGER DEFAULT 0,
    warning_count INTEGER DEFAULT 0,
    
    -- Resource usage
    memory_usage INTEGER, -- bytes
    cpu_time DECIMAL(8,3), -- milliseconds
    
    -- Additional context
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    query_count INTEGER DEFAULT 0,
    cache_hits INTEGER DEFAULT 0,
    cache_misses INTEGER DEFAULT 0,
    
    metadata JSONB
) PARTITION BY RANGE (log_time);

-- Create daily partitions for performance logs (sample for current month)
CREATE TABLE performance_logs_2024_01_01 PARTITION OF performance_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-01-02');
CREATE TABLE performance_logs_2024_01_02 PARTITION OF performance_logs
    FOR VALUES FROM ('2024-01-02') TO ('2024-01-03');
-- Additional partitions would be created by automated scripts

-- ============================================================================
-- ERROR TRACKING
-- ============================================================================

CREATE TABLE error_tracking (
    id SERIAL PRIMARY KEY,
    error_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 of error signature
    
    -- Error details
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    error_class VARCHAR(255),
    file_path VARCHAR(500),
    line_number INTEGER,
    function_name VARCHAR(255),
    
    -- Occurrence tracking
    first_occurrence TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_occurrence TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    occurrence_count INTEGER DEFAULT 1,
    
    -- Context
    environment VARCHAR(50) DEFAULT 'production',
    service_name VARCHAR(100),
    version VARCHAR(50),
    
    -- Status
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ignored', 'investigating')),
    assigned_to INTEGER REFERENCES users(id),
    
    -- Resolution
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    
    -- Additional data
    stack_trace TEXT,
    user_context JSONB,
    request_context JSONB,
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Error occurrences (detailed instances)
CREATE TABLE error_occurrences (
    id SERIAL PRIMARY KEY,
    error_tracking_id INTEGER REFERENCES error_tracking(id) ON DELETE CASCADE,
    
    -- Occurrence details
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id),
    session_id VARCHAR(100),
    request_id VARCHAR(100),
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    http_method VARCHAR(10),
    request_url TEXT,
    
    -- Additional context
    user_context JSONB,
    request_context JSONB,
    stack_trace TEXT,
    metadata JSONB
);

-- ============================================================================
-- UPTIME MONITORING
-- ============================================================================

CREATE TABLE uptime_checks (
    id SERIAL PRIMARY KEY,
    check_name VARCHAR(100) NOT NULL,
    check_type VARCHAR(50) NOT NULL CHECK (check_type IN ('http', 'tcp', 'database', 'service')),
    endpoint VARCHAR(500) NOT NULL,
    
    -- Check configuration
    check_interval INTEGER DEFAULT 300, -- seconds
    timeout_seconds INTEGER DEFAULT 30,
    expected_status_code INTEGER DEFAULT 200,
    expected_response_text TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    current_status VARCHAR(20) DEFAULT 'unknown' CHECK (current_status IN ('up', 'down', 'degraded', 'unknown')),
    last_check TIMESTAMP,
    last_success TIMESTAMP,
    last_failure TIMESTAMP,
    
    -- Statistics
    uptime_percentage DECIMAL(5,2) DEFAULT 100.0,
    total_checks INTEGER DEFAULT 0,
    successful_checks INTEGER DEFAULT 0,
    failed_checks INTEGER DEFAULT 0,
    
    -- Alerting
    alert_on_failure BOOLEAN DEFAULT TRUE,
    alert_threshold INTEGER DEFAULT 3, -- consecutive failures before alert
    consecutive_failures INTEGER DEFAULT 0,
    
    -- Metadata
    description TEXT,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Uptime check results
CREATE TABLE uptime_results (
    id SERIAL PRIMARY KEY,
    check_id INTEGER REFERENCES uptime_checks(id) ON DELETE CASCADE,
    
    -- Check result
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL CHECK (status IN ('up', 'down', 'timeout', 'error')),
    response_time DECIMAL(8,3), -- milliseconds
    status_code INTEGER,
    response_body TEXT,
    error_message TEXT,
    
    -- Additional metrics
    dns_time DECIMAL(8,3),
    connect_time DECIMAL(8,3),
    ssl_time DECIMAL(8,3),
    
    metadata JSONB
) PARTITION BY RANGE (checked_at);

-- ============================================================================
-- MONITORING DASHBOARDS
-- ============================================================================

CREATE TABLE monitoring_dashboards (
    id SERIAL PRIMARY KEY,
    dashboard_name VARCHAR(100) NOT NULL,
    dashboard_type VARCHAR(50) NOT NULL CHECK (dashboard_type IN ('system', 'business', 'custom')),
    
    -- Configuration
    layout_config JSONB NOT NULL, -- Grid layout and widget positions
    refresh_interval INTEGER DEFAULT 60, -- seconds
    auto_refresh BOOLEAN DEFAULT TRUE,
    
    -- Access control
    is_public BOOLEAN DEFAULT FALSE,
    allowed_roles TEXT[],
    allowed_users INTEGER[],
    
    -- Metadata
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dashboard widgets
CREATE TABLE monitoring_widgets (
    id SERIAL PRIMARY KEY,
    dashboard_id INTEGER REFERENCES monitoring_dashboards(id) ON DELETE CASCADE,
    
    -- Widget configuration
    widget_name VARCHAR(100) NOT NULL,
    widget_type VARCHAR(50) NOT NULL CHECK (widget_type IN ('metric', 'chart', 'table', 'alert', 'status')),
    data_source VARCHAR(100) NOT NULL,
    query_config JSONB NOT NULL,
    display_config JSONB NOT NULL,
    
    -- Layout
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    
    -- Behavior
    refresh_interval INTEGER DEFAULT 60, -- seconds
    is_visible BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Monitoring events indexes
CREATE INDEX idx_monitoring_events_created_at ON monitoring_events(created_at);
CREATE INDEX idx_monitoring_events_event_type ON monitoring_events(event_type);
CREATE INDEX idx_monitoring_events_severity ON monitoring_events(severity);
CREATE INDEX idx_monitoring_events_status ON monitoring_events(status);
CREATE INDEX idx_monitoring_events_entity ON monitoring_events(entity_type, entity_id);
CREATE INDEX idx_monitoring_events_source ON monitoring_events(event_source);

-- System health indexes
CREATE INDEX idx_system_health_check_time ON system_health(check_time);
CREATE INDEX idx_system_health_status ON system_health(health_status);
CREATE INDEX idx_system_health_score ON system_health(overall_health_score);

-- Performance logs indexes
CREATE INDEX idx_performance_logs_log_time ON performance_logs(log_time);
CREATE INDEX idx_performance_logs_endpoint ON performance_logs(endpoint);
CREATE INDEX idx_performance_logs_response_time ON performance_logs(response_time);
CREATE INDEX idx_performance_logs_status_code ON performance_logs(status_code);
CREATE INDEX idx_performance_logs_user_id ON performance_logs(user_id);

-- Error tracking indexes
CREATE INDEX idx_error_tracking_hash ON error_tracking(error_hash);
CREATE INDEX idx_error_tracking_type ON error_tracking(error_type);
CREATE INDEX idx_error_tracking_status ON error_tracking(status);
CREATE INDEX idx_error_tracking_occurrence_count ON error_tracking(occurrence_count);
CREATE INDEX idx_error_tracking_last_occurrence ON error_tracking(last_occurrence);

-- Error occurrences indexes
CREATE INDEX idx_error_occurrences_tracking_id ON error_occurrences(error_tracking_id);
CREATE INDEX idx_error_occurrences_occurred_at ON error_occurrences(occurred_at);
CREATE INDEX idx_error_occurrences_user_id ON error_occurrences(user_id);

-- Uptime checks indexes
CREATE INDEX idx_uptime_checks_active ON uptime_checks(is_active) WHERE is_active = true;
CREATE INDEX idx_uptime_checks_status ON uptime_checks(current_status);
CREATE INDEX idx_uptime_checks_last_check ON uptime_checks(last_check);

-- Uptime results indexes
CREATE INDEX idx_uptime_results_check_id ON uptime_results(check_id);
CREATE INDEX idx_uptime_results_checked_at ON uptime_results(checked_at);
CREATE INDEX idx_uptime_results_status ON uptime_results(status);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER trigger_error_tracking_updated_at 
    BEFORE UPDATE ON error_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_uptime_checks_updated_at 
    BEFORE UPDATE ON uptime_checks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_monitoring_dashboards_updated_at 
    BEFORE UPDATE ON monitoring_dashboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MONITORING FUNCTIONS
-- ============================================================================

-- Function to log monitoring event
CREATE OR REPLACE FUNCTION log_monitoring_event(
    p_event_type VARCHAR(100),
    p_event_category VARCHAR(100),
    p_event_source VARCHAR(100),
    p_title VARCHAR(255),
    p_description TEXT DEFAULT NULL,
    p_severity VARCHAR(20) DEFAULT 'medium',
    p_entity_type VARCHAR(50) DEFAULT NULL,
    p_entity_id INTEGER DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    event_id INTEGER;
BEGIN
    INSERT INTO monitoring_events (
        event_type, event_category, event_source, title, description,
        severity, entity_type, entity_id, metadata
    ) VALUES (
        p_event_type, p_event_category, p_event_source, p_title, p_description,
        p_severity, p_entity_type, p_entity_id, p_metadata
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to track error occurrence
CREATE OR REPLACE FUNCTION track_error(
    p_error_type VARCHAR(100),
    p_error_message TEXT,
    p_stack_trace TEXT DEFAULT NULL,
    p_user_id INTEGER DEFAULT NULL,
    p_request_context JSONB DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    error_hash VARCHAR(64);
    tracking_id INTEGER;
BEGIN
    -- Generate error hash for deduplication
    error_hash := encode(sha256((p_error_type || p_error_message)::bytea), 'hex');
    
    -- Insert or update error tracking
    INSERT INTO error_tracking (error_hash, error_type, error_message, stack_trace)
    VALUES (error_hash, p_error_type, p_error_message, p_stack_trace)
    ON CONFLICT (error_hash) 
    DO UPDATE SET 
        last_occurrence = CURRENT_TIMESTAMP,
        occurrence_count = error_tracking.occurrence_count + 1
    RETURNING id INTO tracking_id;
    
    -- Insert error occurrence
    INSERT INTO error_occurrences (
        error_tracking_id, user_id, request_context, stack_trace
    ) VALUES (
        tracking_id, p_user_id, p_request_context, p_stack_trace
    );
    
    RETURN tracking_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update uptime check result
CREATE OR REPLACE FUNCTION update_uptime_check(
    p_check_id INTEGER,
    p_status VARCHAR(20),
    p_response_time DECIMAL(8,3) DEFAULT NULL,
    p_status_code INTEGER DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    current_consecutive_failures INTEGER;
BEGIN
    -- Update the check result
    UPDATE uptime_checks 
    SET 
        current_status = p_status,
        last_check = CURRENT_TIMESTAMP,
        total_checks = total_checks + 1,
        successful_checks = CASE WHEN p_status = 'up' THEN successful_checks + 1 ELSE successful_checks END,
        failed_checks = CASE WHEN p_status != 'up' THEN failed_checks + 1 ELSE failed_checks END,
        consecutive_failures = CASE 
            WHEN p_status = 'up' THEN 0 
            ELSE consecutive_failures + 1 
        END,
        last_success = CASE WHEN p_status = 'up' THEN CURRENT_TIMESTAMP ELSE last_success END,
        last_failure = CASE WHEN p_status != 'up' THEN CURRENT_TIMESTAMP ELSE last_failure END,
        uptime_percentage = ROUND(
            (successful_checks::DECIMAL / GREATEST(total_checks, 1)) * 100, 2
        )
    WHERE id = p_check_id
    RETURNING consecutive_failures INTO current_consecutive_failures;
    
    -- Insert result record
    INSERT INTO uptime_results (
        check_id, status, response_time, status_code, error_message
    ) VALUES (
        p_check_id, p_status, p_response_time, p_status_code, p_error_message
    );
    
    -- Check if we need to trigger an alert
    IF current_consecutive_failures >= (
        SELECT alert_threshold FROM uptime_checks WHERE id = p_check_id
    ) THEN
        -- Log monitoring event for alert
        PERFORM log_monitoring_event(
            'system',
            'critical',
            'uptime_monitor',
            'Uptime Check Failed',
            'Check ' || (SELECT check_name FROM uptime_checks WHERE id = p_check_id) || ' has failed ' || current_consecutive_failures || ' consecutive times',
            'critical',
            'uptime_check',
            p_check_id
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to clean old monitoring data
CREATE OR REPLACE FUNCTION cleanup_monitoring_data(
    p_days_to_keep INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    cutoff_date TIMESTAMP;
BEGIN
    cutoff_date := CURRENT_TIMESTAMP - (p_days_to_keep || ' days')::INTERVAL;
    
    -- Clean old monitoring events
    DELETE FROM monitoring_events WHERE created_at < cutoff_date;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Clean old performance logs
    DELETE FROM performance_logs WHERE log_time < cutoff_date;
    
    -- Clean old system health records (keep more recent data)
    DELETE FROM system_health WHERE check_time < (CURRENT_TIMESTAMP - INTERVAL '30 days');
    
    -- Clean old uptime results (keep more recent data)
    DELETE FROM uptime_results WHERE checked_at < (CURRENT_TIMESTAMP - INTERVAL '30 days');
    
    -- Clean old error occurrences (keep error tracking records)
    DELETE FROM error_occurrences WHERE occurred_at < cutoff_date;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql; 