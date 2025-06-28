-- ============================================================================
-- DASHBOARD ANALYTICS SCHEMA
-- File: 03_dashboard_analytics.sql
-- ============================================================================

-- ============================================================================
-- DASHBOARD METRICS AGGREGATION
-- ============================================================================

CREATE TABLE dashboard_metrics (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    metric_hour INTEGER, -- 0-23 for hourly metrics, NULL for daily aggregates
    
    -- Core business metrics
    total_bookings INTEGER DEFAULT 0,
    completed_bookings INTEGER DEFAULT 0,
    cancelled_bookings INTEGER DEFAULT 0,
    pending_bookings INTEGER DEFAULT 0,
    in_progress_bookings INTEGER DEFAULT 0,
    
    -- Revenue metrics
    total_revenue DECIMAL(15,2) DEFAULT 0,
    completed_revenue DECIMAL(15,2) DEFAULT 0,
    pending_revenue DECIMAL(15,2) DEFAULT 0,
    refunded_revenue DECIMAL(15,2) DEFAULT 0,
    
    -- Supplier metrics
    active_suppliers INTEGER DEFAULT 0,
    new_suppliers INTEGER DEFAULT 0,
    suspended_suppliers INTEGER DEFAULT 0,
    total_supplier_earnings DECIMAL(15,2) DEFAULT 0,
    
    -- Vehicle and driver metrics
    total_vehicles INTEGER DEFAULT 0,
    active_vehicles INTEGER DEFAULT 0,
    maintenance_vehicles INTEGER DEFAULT 0,
    total_drivers INTEGER DEFAULT 0,
    active_drivers INTEGER DEFAULT 0,
    available_drivers INTEGER DEFAULT 0,
    busy_drivers INTEGER DEFAULT 0,
    
    -- Performance metrics
    average_trip_duration DECIMAL(8,2), -- in minutes
    average_rating DECIMAL(3,2),
    customer_satisfaction DECIMAL(5,2), -- percentage
    on_time_percentage DECIMAL(5,2),
    cancellation_rate DECIMAL(5,2),
    
    -- System metrics
    total_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    active_sessions INTEGER DEFAULT 0,
    api_requests INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, metric_hour)
);

-- ============================================================================
-- REAL-TIME DASHBOARD COUNTERS
-- ============================================================================

CREATE TABLE dashboard_counters (
    id SERIAL PRIMARY KEY,
    counter_name VARCHAR(100) UNIQUE NOT NULL,
    counter_value BIGINT DEFAULT 0,
    counter_type VARCHAR(50) NOT NULL CHECK (counter_type IN ('cumulative', 'current', 'average', 'percentage')),
    counter_category VARCHAR(50) NOT NULL CHECK (counter_category IN ('business', 'financial', 'operational', 'system')),
    description TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- ============================================================================
-- REVENUE ANALYTICS
-- ============================================================================

CREATE TABLE revenue_analytics (
    id SERIAL PRIMARY KEY,
    date_recorded DATE NOT NULL,
    
    -- Revenue breakdown
    gross_revenue DECIMAL(15,2) DEFAULT 0,
    net_revenue DECIMAL(15,2) DEFAULT 0,
    commission_revenue DECIMAL(15,2) DEFAULT 0,
    platform_fees DECIMAL(15,2) DEFAULT 0,
    payment_processing_fees DECIMAL(15,2) DEFAULT 0,
    refunds_issued DECIMAL(15,2) DEFAULT 0,
    chargebacks DECIMAL(15,2) DEFAULT 0,
    
    -- Revenue by source
    web_bookings_revenue DECIMAL(15,2) DEFAULT 0,
    mobile_bookings_revenue DECIMAL(15,2) DEFAULT 0,
    api_bookings_revenue DECIMAL(15,2) DEFAULT 0,
    phone_bookings_revenue DECIMAL(15,2) DEFAULT 0,
    
    -- Revenue by service type
    airport_transfer_revenue DECIMAL(15,2) DEFAULT 0,
    city_tour_revenue DECIMAL(15,2) DEFAULT 0,
    point_to_point_revenue DECIMAL(15,2) DEFAULT 0,
    rental_revenue DECIMAL(15,2) DEFAULT 0,
    
    -- Revenue by supplier type
    transport_supplier_revenue DECIMAL(15,2) DEFAULT 0,
    logistics_supplier_revenue DECIMAL(15,2) DEFAULT 0,
    tour_supplier_revenue DECIMAL(15,2) DEFAULT 0,
    
    -- Payment method breakdown
    cash_revenue DECIMAL(15,2) DEFAULT 0,
    credit_card_revenue DECIMAL(15,2) DEFAULT 0,
    digital_wallet_revenue DECIMAL(15,2) DEFAULT 0,
    bank_transfer_revenue DECIMAL(15,2) DEFAULT 0,
    
    -- Currency and exchange
    currency VARCHAR(3) DEFAULT 'PHP',
    usd_exchange_rate DECIMAL(10,6) DEFAULT 1.0,
    revenue_usd DECIMAL(15,2) DEFAULT 0,
    
    -- Growth metrics
    daily_growth_rate DECIMAL(5,2), -- percentage compared to previous day
    weekly_growth_rate DECIMAL(5,2), -- percentage compared to same day last week
    monthly_growth_rate DECIMAL(5,2), -- percentage compared to same day last month
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date_recorded)
);

-- ============================================================================
-- PERFORMANCE KPIs
-- ============================================================================

CREATE TABLE performance_kpis (
    id SERIAL PRIMARY KEY,
    kpi_date DATE NOT NULL,
    
    -- Service quality metrics
    average_response_time DECIMAL(8,2), -- minutes to assign driver
    average_pickup_time DECIMAL(8,2), -- minutes from booking to pickup
    average_trip_duration DECIMAL(8,2), -- minutes
    on_time_pickup_rate DECIMAL(5,2), -- percentage
    on_time_arrival_rate DECIMAL(5,2), -- percentage
    early_arrival_rate DECIMAL(5,2), -- percentage
    late_arrival_rate DECIMAL(5,2), -- percentage
    
    -- Customer satisfaction
    average_customer_rating DECIMAL(3,2),
    five_star_rate DECIMAL(5,2), -- percentage of 5-star ratings
    customer_complaints INTEGER DEFAULT 0,
    complaint_resolution_time DECIMAL(8,2), -- hours
    repeat_customer_rate DECIMAL(5,2), -- percentage
    customer_retention_rate DECIMAL(5,2), -- percentage
    
    -- Operational efficiency
    vehicle_utilization_rate DECIMAL(5,2), -- percentage
    driver_utilization_rate DECIMAL(5,2), -- percentage
    booking_conversion_rate DECIMAL(5,2), -- percentage
    cancellation_rate DECIMAL(5,2), -- percentage
    no_show_rate DECIMAL(5,2), -- percentage
    
    -- Supplier performance
    supplier_acceptance_rate DECIMAL(5,2), -- percentage
    supplier_response_time DECIMAL(8,2), -- minutes
    supplier_cancellation_rate DECIMAL(5,2), -- percentage
    top_performing_suppliers INTEGER DEFAULT 0,
    underperforming_suppliers INTEGER DEFAULT 0,
    
    -- Financial performance
    revenue_per_booking DECIMAL(10,2),
    revenue_per_customer DECIMAL(10,2),
    cost_per_acquisition DECIMAL(10,2),
    profit_margin DECIMAL(5,2), -- percentage
    commission_rate DECIMAL(5,2), -- average percentage
    
    -- System performance
    system_uptime DECIMAL(5,2), -- percentage
    api_response_time DECIMAL(8,3), -- milliseconds
    database_response_time DECIMAL(8,3), -- milliseconds
    error_rate DECIMAL(5,2), -- percentage
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(kpi_date)
);

-- ============================================================================
-- DASHBOARD WIDGETS CONFIGURATION
-- ============================================================================

CREATE TABLE dashboard_widgets (
    id SERIAL PRIMARY KEY,
    widget_name VARCHAR(100) NOT NULL,
    widget_type VARCHAR(50) NOT NULL CHECK (widget_type IN (
        'counter', 'chart', 'table', 'map', 'gauge', 'progress', 'list'
    )),
    widget_category VARCHAR(50) NOT NULL CHECK (widget_category IN (
        'overview', 'revenue', 'bookings', 'suppliers', 'performance', 'system'
    )),
    
    -- Configuration
    data_source VARCHAR(100) NOT NULL, -- table or view name
    query_config JSONB NOT NULL, -- SQL query parameters
    display_config JSONB NOT NULL, -- Chart/display configuration
    refresh_interval INTEGER DEFAULT 300, -- seconds
    
    -- Positioning and layout
    dashboard_page VARCHAR(50) DEFAULT 'main',
    grid_position JSONB, -- {"x": 0, "y": 0, "w": 4, "h": 3}
    is_visible BOOLEAN DEFAULT TRUE,
    
    -- Access control
    required_permissions TEXT[],
    user_roles TEXT[], -- which roles can see this widget
    
    -- Metadata
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- BUSINESS ALERTS CONFIGURATION
-- ============================================================================

CREATE TABLE business_alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(100) NOT NULL, -- 'revenue_drop', 'booking_spike', 'supplier_issue'
    alert_name VARCHAR(255) NOT NULL,
    alert_description TEXT,
    
    -- Trigger conditions
    metric_name VARCHAR(100) NOT NULL,
    threshold_value DECIMAL(15,4),
    threshold_operator VARCHAR(10) NOT NULL CHECK (threshold_operator IN ('>', '<', '>=', '<=', '=', '!=')),
    current_value DECIMAL(15,4),
    comparison_period VARCHAR(20) DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
    
    -- Alert configuration
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    is_active BOOLEAN DEFAULT TRUE,
    notification_channels TEXT[] DEFAULT ARRAY['email', 'in_app'],
    notification_recipients TEXT[], -- email addresses or user IDs
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'muted')),
    acknowledged_at TIMESTAMP,
    acknowledged_by INTEGER REFERENCES users(id),
    resolved_at TIMESTAMP,
    
    -- Frequency control
    last_triggered TIMESTAMP,
    trigger_count INTEGER DEFAULT 0,
    cooldown_minutes INTEGER DEFAULT 60,
    max_triggers_per_day INTEGER DEFAULT 10,
    
    -- Conditions for auto-resolution
    auto_resolve_after_minutes INTEGER,
    auto_resolve_condition JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- ============================================================================
-- ALERT HISTORY
-- ============================================================================

CREATE TABLE alert_history (
    id SERIAL PRIMARY KEY,
    alert_id INTEGER REFERENCES business_alerts(id) ON DELETE CASCADE,
    
    -- Alert instance details
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trigger_value DECIMAL(15,4),
    threshold_value DECIMAL(15,4),
    severity VARCHAR(20) NOT NULL,
    
    -- Notification details
    notifications_sent JSONB, -- Which channels were notified
    notification_status VARCHAR(20) DEFAULT 'sent',
    
    -- Resolution details
    resolved_at TIMESTAMP,
    resolution_type VARCHAR(20), -- 'manual', 'auto', 'timeout'
    resolution_notes TEXT,
    resolved_by INTEGER REFERENCES users(id),
    
    -- Additional context
    context_data JSONB,
    related_entities JSONB -- Related bookings, suppliers, etc.
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Dashboard metrics indexes
CREATE INDEX idx_dashboard_metrics_date ON dashboard_metrics(metric_date);
CREATE INDEX idx_dashboard_metrics_date_hour ON dashboard_metrics(metric_date, metric_hour);
CREATE INDEX idx_dashboard_metrics_created_at ON dashboard_metrics(created_at);

-- Revenue analytics indexes
CREATE INDEX idx_revenue_analytics_date ON revenue_analytics(date_recorded);
CREATE INDEX idx_revenue_analytics_gross_revenue ON revenue_analytics(gross_revenue);
CREATE INDEX idx_revenue_analytics_created_at ON revenue_analytics(created_at);

-- Performance KPIs indexes
CREATE INDEX idx_performance_kpis_date ON performance_kpis(kpi_date);
CREATE INDEX idx_performance_kpis_customer_rating ON performance_kpis(average_customer_rating);
CREATE INDEX idx_performance_kpis_created_at ON performance_kpis(created_at);

-- Dashboard counters indexes
CREATE INDEX idx_dashboard_counters_name ON dashboard_counters(counter_name);
CREATE INDEX idx_dashboard_counters_type ON dashboard_counters(counter_type);
CREATE INDEX idx_dashboard_counters_category ON dashboard_counters(counter_category);
CREATE INDEX idx_dashboard_counters_updated ON dashboard_counters(last_updated);

-- Business alerts indexes
CREATE INDEX idx_business_alerts_type ON business_alerts(alert_type);
CREATE INDEX idx_business_alerts_severity ON business_alerts(severity);
CREATE INDEX idx_business_alerts_status ON business_alerts(status);
CREATE INDEX idx_business_alerts_active ON business_alerts(is_active) WHERE is_active = true;

-- Alert history indexes
CREATE INDEX idx_alert_history_alert_id ON alert_history(alert_id);
CREATE INDEX idx_alert_history_triggered_at ON alert_history(triggered_at);
CREATE INDEX idx_alert_history_severity ON alert_history(severity);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER trigger_dashboard_widgets_updated_at 
    BEFORE UPDATE ON dashboard_widgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_business_alerts_updated_at 
    BEFORE UPDATE ON business_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MATERIALIZED VIEWS FOR FAST QUERIES
-- ============================================================================

-- Daily summary view
CREATE MATERIALIZED VIEW daily_dashboard_summary AS
SELECT 
    metric_date,
    SUM(total_bookings) as total_bookings,
    SUM(completed_bookings) as completed_bookings,
    SUM(total_revenue) as total_revenue,
    AVG(average_rating) as average_rating,
    AVG(customer_satisfaction) as customer_satisfaction,
    COUNT(DISTINCT CASE WHEN metric_hour IS NOT NULL THEN metric_hour END) as hours_recorded
FROM dashboard_metrics 
WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY metric_date
ORDER BY metric_date DESC;

-- Create index on materialized view
CREATE INDEX idx_daily_dashboard_summary_date ON daily_dashboard_summary(metric_date);

-- Weekly summary view
CREATE MATERIALIZED VIEW weekly_dashboard_summary AS
SELECT 
    DATE_TRUNC('week', metric_date) as week_start,
    SUM(total_bookings) as total_bookings,
    SUM(completed_bookings) as completed_bookings,
    SUM(total_revenue) as total_revenue,
    AVG(average_rating) as average_rating,
    AVG(customer_satisfaction) as customer_satisfaction
FROM dashboard_metrics 
WHERE metric_date >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', metric_date)
ORDER BY week_start DESC;

-- ============================================================================
-- FUNCTIONS FOR DASHBOARD OPERATIONS
-- ============================================================================

-- Function to update dashboard counter
CREATE OR REPLACE FUNCTION update_dashboard_counter(
    p_counter_name VARCHAR(100),
    p_counter_value BIGINT,
    p_operation VARCHAR(10) DEFAULT 'set' -- 'set', 'increment', 'decrement'
)
RETURNS VOID AS $$
BEGIN
    IF p_operation = 'set' THEN
        INSERT INTO dashboard_counters (counter_name, counter_value, last_updated)
        VALUES (p_counter_name, p_counter_value, CURRENT_TIMESTAMP)
        ON CONFLICT (counter_name) 
        DO UPDATE SET 
            counter_value = p_counter_value,
            last_updated = CURRENT_TIMESTAMP;
    ELSIF p_operation = 'increment' THEN
        INSERT INTO dashboard_counters (counter_name, counter_value, last_updated)
        VALUES (p_counter_name, p_counter_value, CURRENT_TIMESTAMP)
        ON CONFLICT (counter_name) 
        DO UPDATE SET 
            counter_value = dashboard_counters.counter_value + p_counter_value,
            last_updated = CURRENT_TIMESTAMP;
    ELSIF p_operation = 'decrement' THEN
        INSERT INTO dashboard_counters (counter_name, counter_value, last_updated)
        VALUES (p_counter_name, -p_counter_value, CURRENT_TIMESTAMP)
        ON CONFLICT (counter_name) 
        DO UPDATE SET 
            counter_value = GREATEST(0, dashboard_counters.counter_value - p_counter_value),
            last_updated = CURRENT_TIMESTAMP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_dashboard_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_dashboard_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY weekly_dashboard_summary;
END;
$$ LANGUAGE plpgsql; 