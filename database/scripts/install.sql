-- ============================================================================
-- INFLIGHT ADMIN DASHBOARD - DATABASE INSTALLATION SCRIPT
-- This script installs the complete database schema
-- ============================================================================

-- Create database (uncomment if creating from scratch)
-- CREATE DATABASE admin_dashboard;
-- \c admin_dashboard;

\echo 'Starting database installation...'

-- ============================================================================
-- STEP 1: USERS AND AUTHENTICATION
-- ============================================================================
\echo 'Installing users and authentication schema...'
\i schemas/01_users_and_auth.sql

-- ============================================================================
-- STEP 2: COMPANIES AND SUPPLIERS
-- ============================================================================
\echo 'Installing companies and suppliers schema...'
\i schemas/02_companies_and_suppliers.sql

-- ============================================================================
-- STEP 3: DASHBOARD ANALYTICS
-- ============================================================================
\echo 'Installing dashboard analytics schema...'
\i schemas/03_dashboard_analytics.sql

-- ============================================================================
-- STEP 4: MONITORING SYSTEM
-- ============================================================================
\echo 'Installing monitoring system schema...'
\i schemas/04_monitoring_system.sql

-- ============================================================================
-- STEP 5: BOOKINGS AND TRANSACTIONS
-- ============================================================================
\echo 'Installing bookings and transactions schema...'
\i schemas/05_bookings_and_transactions.sql

-- ============================================================================
-- STEP 6: SYSTEM AND AUDIT
-- ============================================================================
\echo 'Installing system and audit schema...'
\i schemas/06_system_and_audit.sql

-- ============================================================================
-- STEP 7: INITIAL DATA
-- ============================================================================
\echo 'Installing initial data...'
\i seeds/initial_data.sql

-- ============================================================================
-- STEP 8: PERFORMANCE OPTIMIZATION
-- ============================================================================
\echo 'Applying performance optimizations...'

-- Update table statistics
ANALYZE;

-- Create additional composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_company_status_date 
    ON bookings(company_id, booking_status, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_status_rating 
    ON suppliers(account_status, overall_rating);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_booking_status_date 
    ON transactions(booking_id, status, created_at);

-- ============================================================================
-- STEP 9: SECURITY SETUP
-- ============================================================================
\echo 'Setting up security...'

-- Create roles
DO $$
BEGIN
    -- Admin role
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin_role') THEN
        CREATE ROLE admin_role;
    END IF;
    
    -- Supplier role
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supplier_role') THEN
        CREATE ROLE supplier_role;
    END IF;
    
    -- Driver role
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'driver_role') THEN
        CREATE ROLE driver_role;
    END IF;
    
    -- Customer role
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'customer_role') THEN
        CREATE ROLE customer_role;
    END IF;
    
    -- API role
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'api_role') THEN
        CREATE ROLE api_role;
    END IF;
END
$$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO admin_role;
GRANT SELECT, INSERT, UPDATE ON suppliers, supplier_performance, supplier_reviews TO supplier_role;
GRANT SELECT, INSERT, UPDATE ON drivers, bookings, booking_status_history TO driver_role;
GRANT SELECT, INSERT ON bookings, transactions TO customer_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO api_role;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO admin_role, supplier_role, driver_role, customer_role, api_role;

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================
\echo 'Verifying installation...'

-- Check if all tables exist
DO $$
DECLARE
    expected_tables TEXT[] := ARRAY[
        'users', 'companies', 'suppliers', 'vehicles', 'drivers', 'bookings', 
        'transactions', 'dashboard_metrics', 'monitoring_events', 'notifications',
        'audit_logs', 'system_settings'
    ];
    table_name TEXT;
    missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = table_name) THEN
            missing_tables := missing_tables || table_name;
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE 'All tables created successfully!';
    END IF;
END
$$;

-- Display installation summary
SELECT 
    schemaname,
    COUNT(*) as table_count
FROM pg_tables 
WHERE schemaname = 'public'
GROUP BY schemaname;

\echo 'Database installation completed successfully!'
\echo 'Next steps:'
\echo '1. Run seeds/sample_data.sql for development data'
\echo '2. Configure your application connection string'
\echo '3. Set up automated backups'
\echo '4. Configure monitoring alerts' 