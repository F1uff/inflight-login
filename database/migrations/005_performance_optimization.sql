-- ============================================================================
-- MIGRATION: Performance Optimization Indexes
-- File: 005_performance_optimization.sql
-- Description: Adds critical indexes for performance optimization
-- ============================================================================

-- Critical composite indexes for suppliers
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_company_status 
ON suppliers(company_id, account_status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_type_status 
ON suppliers(supplier_type, account_status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_rating_status 
ON suppliers(overall_rating, account_status);

-- Critical composite indexes for bookings
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_company_status_date 
ON bookings(company_id, booking_status, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_status_date 
ON bookings(booking_status, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_driver_status 
ON bookings(driver_id, booking_status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_vehicle_status 
ON bookings(vehicle_id, booking_status);

-- Critical composite indexes for transactions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_booking_status_date 
ON transactions(booking_id, status, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_account_status 
ON transactions(account_id, status);

-- Critical composite indexes for companies
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_status_verification 
ON companies(status, verification_status);

-- Critical composite indexes for users
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_status 
ON users(role, status);

-- Critical composite indexes for drivers
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drivers_company_status 
ON drivers(company_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drivers_availability_status 
ON drivers(availability_status, status);

-- Critical composite indexes for vehicles
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicles_company_status 
ON vehicles(company_id, status);

-- Performance optimization for dashboard queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dashboard_metrics_date_hour 
ON dashboard_metrics(metric_date, metric_hour);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_health_check_time_status 
ON system_health(check_time, health_status);

-- Partial indexes for active records (most common queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_active 
ON suppliers(company_id, supplier_type, overall_rating) 
WHERE account_status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_active 
ON bookings(company_id, booking_status, created_at) 
WHERE booking_status IN ('confirmed', 'in_progress', 'assigned');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drivers_available 
ON drivers(company_id, availability_status) 
WHERE availability_status = 'available' AND status = 'active';

-- Text search indexes for better search performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_name_search 
ON companies USING gin(to_tsvector('english', name));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_search 
ON suppliers USING gin(to_tsvector('english', supplier_code));

-- Update table statistics for query planner
ANALYZE suppliers;
ANALYZE bookings;
ANALYZE transactions;
ANALYZE companies;
ANALYZE users;
ANALYZE drivers;
ANALYZE vehicles;
ANALYZE dashboard_metrics;
ANALYZE system_health;

-- Add comments for documentation
COMMENT ON INDEX idx_suppliers_company_status IS 'Optimizes supplier queries by company and status';
COMMENT ON INDEX idx_bookings_company_status_date IS 'Optimizes booking queries by company, status and date';
COMMENT ON INDEX idx_transactions_booking_status_date IS 'Optimizes transaction queries by booking, status and date';
COMMENT ON INDEX idx_suppliers_active IS 'Optimizes queries for active suppliers only';
COMMENT ON INDEX idx_bookings_active IS 'Optimizes queries for active bookings only';
COMMENT ON INDEX idx_drivers_available IS 'Optimizes queries for available drivers only'; 