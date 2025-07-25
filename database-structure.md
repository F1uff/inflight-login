# Database Structure Documentation - Inflight Login System

## 🗄️ **Database Overview**

- **Database Type**: PostgreSQL 14+
- **Encoding**: UTF-8
- **Collation**: en_US.UTF-8
- **Timezone**: UTC
- **Extensions**: uuid-ossp, pg_trgm, btree_gin
- **Connection Pool**: 20 connections
- **Backup Strategy**: Daily automated backups

## 📊 **Schema Architecture**

### **Core Modules**
1. **User Management & Authentication** (`01_users_and_auth.sql`)
2. **Companies & Suppliers** (`02_companies_and_suppliers.sql`)
3. **Dashboard Analytics** (`03_dashboard_analytics.sql`)
4. **Monitoring System** (`04_monitoring_system.sql`)
5. **Bookings & Transactions** (`05_bookings_and_transactions.sql`)
6. **System & Audit** (`06_system_and_audit.sql`)

## 👥 **User Management & Authentication**

### **Users Table**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'supplier', 'driver', 'customer')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_users_email` - Email lookup
- `idx_users_role` - Role-based queries
- `idx_users_status` - Status filtering
- `idx_users_created_at` - Time-based queries

### **User Sessions Table**
```sql
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_user_sessions_user_id` - User session lookup
- `idx_user_sessions_token` - Token validation
- `idx_user_sessions_expires` - Expiration cleanup
- `idx_user_sessions_active` - Active session filtering

### **User Permissions Table**
```sql
CREATE TABLE user_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    permission_name VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    actions TEXT[], -- ['create', 'read', 'update', 'delete']
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by INTEGER REFERENCES users(id)
);
```

## 🏢 **Companies & Suppliers**

### **Companies Table**
```sql
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE,
    tax_id VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    logo_url VARCHAR(500),
    
    -- Address information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Philippines',
    
    -- Business details
    business_type VARCHAR(100),
    industry VARCHAR(100),
    employee_count INTEGER,
    annual_revenue DECIMAL(15,2),
    
    -- Status and verification
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'suspended', 'pending', 'rejected')),
    verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'unverified', 'pending', 'rejected')),
    accreditation_status VARCHAR(20) DEFAULT 'none' CHECK (accreditation_status IN ('accredited', 'expired', 'pending', 'none')),
    accreditation_expiry DATE,
    
    -- Financial information
    credit_limit DECIMAL(15,2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 30, -- days
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);
```

**Indexes:**
- `idx_companies_name` - Company name search
- `idx_companies_status` - Status filtering
- `idx_companies_verification_status` - Verification status
- `idx_companies_created_at` - Time-based queries

### **Company Users Relationship**
```sql
CREATE TABLE company_users (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'employee')),
    permissions JSONB,
    is_primary BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, user_id)
);
```

### **Company Documents**
```sql
CREATE TABLE company_documents (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- 'business_permit', 'tax_certificate', 'insurance', etc.
    document_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('approved', 'rejected', 'pending', 'expired')),
    expiry_date DATE,
    uploaded_by INTEGER REFERENCES users(id),
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Suppliers Table**
```sql
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Supplier-specific information
    supplier_code VARCHAR(50) UNIQUE NOT NULL,
    supplier_type VARCHAR(50) NOT NULL CHECK (supplier_type IN ('transport', 'logistics', 'tour', 'rental')),
    service_categories TEXT[] NOT NULL, -- ['airport_transfer', 'city_tour', 'cargo']
    service_cities TEXT[] NOT NULL, -- ['Manila', 'Cebu', 'Davao']
    
    -- Contact information
    contact_person VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    emergency_contact VARCHAR(20),
    
    -- Business details
    business_license VARCHAR(100),
    tax_clearance VARCHAR(100),
    insurance_coverage DECIMAL(15,2),
    insurance_expiry DATE,
    
    -- Service capabilities
    fleet_size INTEGER DEFAULT 0,
    driver_count INTEGER DEFAULT 0,
    service_radius INTEGER, -- in kilometers
    operating_hours JSONB, -- {'monday': {'start': '06:00', 'end': '22:00'}}
    
    -- Performance metrics
    overall_rating DECIMAL(3,2) DEFAULT 0,
    total_trips_completed INTEGER DEFAULT 0,
    total_revenue_generated DECIMAL(15,2) DEFAULT 0,
    response_time_avg INTEGER, -- in minutes
    cancellation_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Account status
    account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended', 'pending')),
    commission_rate DECIMAL(5,2) DEFAULT 10.00, -- percentage
    payment_method VARCHAR(50),
    bank_details JSONB,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_suppliers_company_id` - Company relationship
- `idx_suppliers_supplier_code` - Supplier code lookup
- `idx_suppliers_supplier_type` - Type filtering
- `idx_suppliers_account_status` - Status filtering
- `idx_suppliers_overall_rating` - Rating-based queries
- `idx_suppliers_service_categories` - GIN index for array search
- `idx_suppliers_service_cities` - GIN index for array search

### **Supplier Performance**
```sql
CREATE TABLE supplier_performance (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    performance_date DATE NOT NULL,
    
    -- Daily metrics
    trips_completed INTEGER DEFAULT 0,
    trips_cancelled INTEGER DEFAULT 0,
    revenue_generated DECIMAL(15,2) DEFAULT 0,
    average_rating DECIMAL(3,2),
    response_time_avg INTEGER, -- minutes
    customer_satisfaction DECIMAL(3,2),
    
    -- Quality metrics
    on_time_delivery_rate DECIMAL(5,2),
    vehicle_cleanliness_rating DECIMAL(3,2),
    driver_professionalism_rating DECIMAL(3,2),
    overall_service_rating DECIMAL(3,2),
    
    -- Financial metrics
    commission_earned DECIMAL(15,2) DEFAULT 0,
    penalties_incurred DECIMAL(15,2) DEFAULT 0,
    net_earnings DECIMAL(15,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(supplier_id, performance_date)
);
```

### **Supplier Reviews**
```sql
CREATE TABLE supplier_reviews (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    booking_id INTEGER, -- Will reference bookings table
    customer_id INTEGER REFERENCES users(id),
    
    -- Rating breakdown
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    service_quality INTEGER CHECK (service_quality >= 1 AND service_quality <= 5),
    punctuality INTEGER CHECK (punctuality >= 1 AND punctuality <= 5),
    vehicle_condition INTEGER CHECK (vehicle_condition >= 1 AND vehicle_condition <= 5),
    driver_professionalism INTEGER CHECK (driver_professionalism >= 1 AND driver_professionalism <= 5),
    
    -- Review content
    review_text TEXT,
    review_title VARCHAR(255),
    
    -- Metadata
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Supplier Contracts**
```sql
CREATE TABLE supplier_contracts (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    contract_number VARCHAR(100) UNIQUE NOT NULL,
    contract_type VARCHAR(50) NOT NULL, -- 'standard', 'premium', 'enterprise'
    
    -- Contract terms
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    minimum_commitment DECIMAL(15,2),
    payment_terms INTEGER DEFAULT 30, -- days
    
    -- Service terms
    service_areas TEXT[],
    vehicle_requirements JSONB,
    driver_requirements JSONB,
    insurance_requirements JSONB,
    
    -- Financial terms
    advance_payment_required BOOLEAN DEFAULT FALSE,
    advance_payment_amount DECIMAL(15,2),
    penalty_terms JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated', 'pending')),
    signed_by INTEGER REFERENCES users(id),
    signed_at TIMESTAMP,
    
    -- Metadata
    terms_and_conditions TEXT,
    special_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Supplier Payouts**
```sql
CREATE TABLE supplier_payouts (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    payout_number VARCHAR(100) UNIQUE NOT NULL,
    
    -- Payout period
    payout_period_start DATE NOT NULL,
    payout_period_end DATE NOT NULL,
    
    -- Financial details
    gross_amount DECIMAL(15,2) NOT NULL,
    commission_amount DECIMAL(15,2) NOT NULL,
    penalties_amount DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    
    -- Payment details
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    payment_date DATE,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed')),
    
    -- Metadata
    notes TEXT,
    processed_by INTEGER REFERENCES users(id),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📊 **Dashboard Analytics**

### **Dashboard Metrics**
```sql
CREATE TABLE dashboard_metrics (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
    
    -- Booking metrics
    total_bookings INTEGER DEFAULT 0,
    completed_bookings INTEGER DEFAULT 0,
    cancelled_bookings INTEGER DEFAULT 0,
    pending_bookings INTEGER DEFAULT 0,
    
    -- Revenue metrics
    total_revenue DECIMAL(15,2) DEFAULT 0,
    pending_revenue DECIMAL(15,2) DEFAULT 0,
    commission_earned DECIMAL(15,2) DEFAULT 0,
    
    -- User metrics
    active_users INTEGER DEFAULT 0,
    new_registrations INTEGER DEFAULT 0,
    user_engagement_rate DECIMAL(5,2),
    
    -- Supplier metrics
    active_suppliers INTEGER DEFAULT 0,
    supplier_performance_avg DECIMAL(3,2),
    supplier_satisfaction_rate DECIMAL(5,2),
    
    -- System metrics
    system_uptime DECIMAL(5,2),
    average_response_time INTEGER, -- milliseconds
    error_rate DECIMAL(5,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, metric_type)
);
```

### **Analytics Events**
```sql
CREATE TABLE analytics_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    user_id INTEGER REFERENCES users(id),
    company_id INTEGER REFERENCES companies(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    
    -- Event data
    event_data JSONB,
    event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Session data
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    
    -- Page/feature tracking
    page_url VARCHAR(500),
    feature_name VARCHAR(100),
    
    -- Performance data
    load_time INTEGER, -- milliseconds
    response_time INTEGER, -- milliseconds
    error_message TEXT
);
```

## 🔍 **Monitoring System**

### **System Health**
```sql
CREATE TABLE system_health (
    id SERIAL PRIMARY KEY,
    check_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Health scores
    overall_health_score INTEGER CHECK (overall_health_score >= 0 AND overall_health_score <= 100),
    database_health_score INTEGER CHECK (database_health_score >= 0 AND database_health_score <= 100),
    api_health_score INTEGER CHECK (api_health_score >= 0 AND api_health_score <= 100),
    frontend_health_score INTEGER CHECK (frontend_health_score >= 0 AND frontend_health_score <= 100),
    
    -- Performance metrics
    database_response_time INTEGER, -- milliseconds
    api_response_time INTEGER, -- milliseconds
    memory_usage_percent DECIMAL(5,2),
    cpu_usage_percent DECIMAL(5,2),
    disk_usage_percent DECIMAL(5,2),
    
    -- Connection metrics
    active_connections INTEGER,
    active_sessions INTEGER,
    concurrent_users INTEGER,
    
    -- Error metrics
    error_count INTEGER DEFAULT 0,
    warning_count INTEGER DEFAULT 0,
    critical_errors INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'healthy' CHECK (status IN ('healthy', 'warning', 'critical', 'down'))
);
```

### **System Alerts**
```sql
CREATE TABLE system_alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL, -- 'error', 'warning', 'info', 'critical'
    alert_category VARCHAR(50), -- 'database', 'api', 'frontend', 'security'
    alert_title VARCHAR(255) NOT NULL,
    alert_message TEXT,
    
    -- Alert details
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    source VARCHAR(100),
    error_code VARCHAR(50),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
    acknowledged_by INTEGER REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Performance Logs**
```sql
CREATE TABLE performance_logs (
    id SERIAL PRIMARY KEY,
    endpoint VARCHAR(255),
    method VARCHAR(10),
    user_id INTEGER REFERENCES users(id),
    
    -- Timing data
    request_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_timestamp TIMESTAMP,
    total_duration INTEGER, -- milliseconds
    database_duration INTEGER, -- milliseconds
    processing_duration INTEGER, -- milliseconds
    
    -- Request data
    request_size INTEGER, -- bytes
    response_size INTEGER, -- bytes
    status_code INTEGER,
    
    -- Performance indicators
    is_slow_query BOOLEAN DEFAULT FALSE,
    is_error BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    
    -- Additional data
    ip_address INET,
    user_agent TEXT,
    request_params JSONB
);
```

## 📋 **Bookings & Transactions**

### **Bookings Table**
```sql
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    booking_number VARCHAR(100) UNIQUE NOT NULL,
    company_id INTEGER REFERENCES companies(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    
    -- Customer information
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_address TEXT,
    
    -- Trip details
    trip_type VARCHAR(50) NOT NULL, -- 'airport_transfer', 'city_tour', 'cargo', 'charter'
    pickup_location VARCHAR(255) NOT NULL,
    dropoff_location VARCHAR(255) NOT NULL,
    pickup_datetime TIMESTAMP NOT NULL,
    dropoff_datetime TIMESTAMP,
    
    -- Vehicle and driver
    vehicle_type VARCHAR(50),
    vehicle_requirements JSONB,
    driver_requirements JSONB,
    assigned_driver_id INTEGER, -- Will reference drivers table
    assigned_vehicle_id INTEGER, -- Will reference vehicles table
    
    -- Pricing
    base_fare DECIMAL(10,2) NOT NULL,
    distance_fare DECIMAL(10,2),
    time_fare DECIMAL(10,2),
    additional_charges DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
    
    -- Metadata
    special_instructions TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Transactions Table**
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    transaction_number VARCHAR(100) UNIQUE NOT NULL,
    booking_id INTEGER, -- Will reference bookings table
    company_id INTEGER REFERENCES companies(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    
    -- Transaction details
    transaction_type VARCHAR(50) NOT NULL, -- 'payment', 'refund', 'commission', 'penalty'
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PHP',
    
    -- Payment method
    payment_method VARCHAR(50),
    payment_gateway VARCHAR(50),
    gateway_transaction_id VARCHAR(255),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    
    -- Metadata
    description TEXT,
    processed_by INTEGER REFERENCES users(id),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 **System & Audit**

### **Audit Logs**
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    company_id INTEGER REFERENCES companies(id),
    
    -- Action details
    action_type VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout'
    resource_type VARCHAR(50), -- 'user', 'booking', 'supplier', 'company'
    resource_id INTEGER,
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Metadata
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT
);
```

### **System Configuration**
```sql
CREATE TABLE system_configuration (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    config_type VARCHAR(50) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    description TEXT,
    is_sensitive BOOLEAN DEFAULT FALSE,
    category VARCHAR(50),
    
    -- Metadata
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📈 **Database Indexes & Performance**

### **Primary Indexes**
- All primary keys are automatically indexed
- Foreign key relationships are indexed for join performance
- Unique constraints create unique indexes

### **Performance Indexes**
```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_bookings_company_status ON bookings(company_id, status);
CREATE INDEX idx_bookings_supplier_status ON bookings(supplier_id, status);
CREATE INDEX idx_bookings_pickup_datetime ON bookings(pickup_datetime);
CREATE INDEX idx_transactions_booking_type ON transactions(booking_id, transaction_type);
CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs(user_id, action_timestamp);
CREATE INDEX idx_analytics_events_type_timestamp ON analytics_events(event_type, event_timestamp);
```

### **Full-Text Search Indexes**
```sql
-- Enable full-text search on relevant fields
CREATE INDEX idx_companies_name_fts ON companies USING gin(to_tsvector('english', name));
CREATE INDEX idx_suppliers_search_fts ON suppliers USING gin(to_tsvector('english', supplier_code || ' ' || contact_person));
CREATE INDEX idx_users_name_fts ON users USING gin(to_tsvector('english', first_name || ' ' || last_name));
```

## 🔄 **Database Triggers & Functions**

### **Automatic Timestamp Updates**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### **Supplier Rating Updates**
```sql
CREATE OR REPLACE FUNCTION update_supplier_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE suppliers 
    SET overall_rating = (
        SELECT AVG(overall_rating)::DECIMAL(3,2)
        FROM supplier_reviews 
        WHERE supplier_id = NEW.supplier_id
    )
    WHERE id = NEW.supplier_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### **Audit Trail Function**
```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action_type, resource_type, resource_id, new_values)
        VALUES (current_user_id(), 'create', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action_type, resource_type, resource_id, old_values, new_values, changed_fields)
        VALUES (current_user_id(), 'update', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW), 
                ARRAY(SELECT unnest(akeys(to_jsonb(NEW))) EXCEPT SELECT unnest(akeys(to_jsonb(OLD)))));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action_type, resource_type, resource_id, old_values)
        VALUES (current_user_id(), 'delete', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

## 🛡️ **Security Features**

### **Row Level Security (RLS)**
```sql
-- Enable RLS on sensitive tables
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY user_sessions_policy ON user_sessions
    FOR ALL TO authenticated_users
    USING (user_id = current_user_id());

-- Company users can only see their company data
CREATE POLICY company_users_policy ON company_users
    FOR ALL TO authenticated_users
    USING (user_id = current_user_id());
```

### **Data Encryption**
- Sensitive fields are encrypted at rest
- Passwords are hashed using bcrypt
- API keys and tokens are encrypted
- Database connections use SSL/TLS

## 📊 **Database Maintenance**

### **Regular Maintenance Tasks**
```sql
-- Update table statistics
ANALYZE;

-- Vacuum tables to reclaim space
VACUUM ANALYZE;

-- Reindex tables for optimal performance
REINDEX TABLE users;
REINDEX TABLE bookings;
REINDEX TABLE suppliers;
```

### **Backup Strategy**
- **Full Backup**: Daily at 2:00 AM
- **Incremental Backup**: Every 4 hours
- **Transaction Log Backup**: Every 15 minutes
- **Retention**: 30 days for full backups, 7 days for incremental

### **Monitoring Queries**
```sql
-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Check slow queries
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## 🚀 **Migration Management**

### **Migration Files**
- `001_enhance_admin_dashboard.sql` - Admin dashboard enhancements
- `002_performance_indexes.sql` - Performance optimization indexes
- `003_add_supplier_contact_fields.sql` - Supplier contact information
- `004_add_hotel_supplier_fields.sql` - Hotel supplier support
- `005_performance_optimization.sql` - Additional performance optimizations

### **Migration Process**
1. **Development**: Test migrations in development environment
2. **Staging**: Apply migrations to staging environment
3. **Production**: Apply migrations during maintenance window
4. **Rollback**: Maintain rollback scripts for critical migrations

### **Version Control**
- All schema changes are version controlled
- Migration files are numbered sequentially
- Each migration is atomic and reversible
- Database state is tracked in version table

This comprehensive database structure provides a robust, scalable, and secure foundation for the inflight-login system with proper indexing, security, and maintenance procedures. 