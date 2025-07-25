-- ============================================================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- File: 002_performance_indexes.sql
-- Description: Add composite indexes for common query patterns
-- ============================================================================

-- Critical composite indexes for frequently queried combinations

-- 1. Drivers table - company_id with status and created_at
CREATE INDEX IF NOT EXISTS idx_drivers_company_status ON drivers(company_id, status);
CREATE INDEX IF NOT EXISTS idx_drivers_company_created_at ON drivers(company_id, created_at);
CREATE INDEX IF NOT EXISTS idx_drivers_company_status_created_at ON drivers(company_id, status, created_at);

-- 2. Vehicles table - company_id with status and created_at  
CREATE INDEX IF NOT EXISTS idx_vehicles_company_status ON vehicles(company_id, status);
CREATE INDEX IF NOT EXISTS idx_vehicles_company_created_at ON vehicles(company_id, created_at);
CREATE INDEX IF NOT EXISTS idx_vehicles_company_status_created_at ON vehicles(company_id, status, created_at);

-- 3. Bookings table - company_id with booking_status and created_at
CREATE INDEX IF NOT EXISTS idx_bookings_company_status ON bookings(company_id, booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_company_created_at ON bookings(company_id, created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_company_status_created_at ON bookings(company_id, booking_status, created_at);

-- 4. Bookings table - company_id with payment_status
CREATE INDEX IF NOT EXISTS idx_bookings_company_payment_status ON bookings(company_id, payment_status);

-- 5. File uploads - company_id with uploaded_by for access control
CREATE INDEX IF NOT EXISTS idx_file_uploads_company_user ON file_uploads(company_id, uploaded_by);

-- 6. Notifications - recipient_id with is_read and created_at (for marking as read)
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read_created ON notifications(recipient_id, is_read, created_at);

-- 7. Audit logs - user_id with action and created_at (for user activity tracking)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action_created ON audit_logs(user_id, action, created_at);

-- 8. Performance optimization for date range queries
CREATE INDEX IF NOT EXISTS idx_drivers_company_date_range ON drivers(company_id, created_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_vehicles_company_date_range ON vehicles(company_id, created_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_bookings_company_date_range ON bookings(company_id, created_at) WHERE booking_status != 'cancelled';

-- 9. User sessions optimization - user_id with is_active and expires_at
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active_expires ON user_sessions(user_id, is_active, expires_at);

-- 10. License number and plate number uniqueness within company (business logic enforcement)
CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_license_company_unique ON drivers(license_number, company_id) WHERE status != 'deleted';
CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicles_plate_company_unique ON vehicles(plate_number, company_id) WHERE status != 'deleted';

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS (if missing)
-- ============================================================================

-- Add missing foreign key constraints for data integrity
DO $$
BEGIN
    -- Check and add drivers.company_id foreign key if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'drivers' AND constraint_name = 'fk_drivers_company_id'
    ) THEN
        ALTER TABLE drivers ADD CONSTRAINT fk_drivers_company_id 
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;

    -- Check and add vehicles.company_id foreign key if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'vehicles' AND constraint_name = 'fk_vehicles_company_id'
    ) THEN
        ALTER TABLE vehicles ADD CONSTRAINT fk_vehicles_company_id 
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;

    -- Check and add bookings.company_id foreign key if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'bookings' AND constraint_name = 'fk_bookings_company_id'
    ) THEN
        ALTER TABLE bookings ADD CONSTRAINT fk_bookings_company_id 
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;

    -- Check and add drivers.user_id foreign key if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'drivers' AND constraint_name = 'fk_drivers_user_id'
    ) THEN
        ALTER TABLE drivers ADD CONSTRAINT fk_drivers_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    -- Check and add bookings.driver_id foreign key if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'bookings' AND constraint_name = 'fk_bookings_driver_id'
    ) THEN
        ALTER TABLE bookings ADD CONSTRAINT fk_bookings_driver_id 
        FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL;
    END IF;

    -- Check and add bookings.vehicle_id foreign key if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'bookings' AND constraint_name = 'fk_bookings_vehicle_id'
    ) THEN
        ALTER TABLE bookings ADD CONSTRAINT fk_bookings_vehicle_id 
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- CHECK CONSTRAINTS (for data integrity)
-- ============================================================================

-- Add missing check constraints if not already present
DO $$
BEGIN
    -- Email format validation for users table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'chk_users_email_format'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT chk_users_email_format 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');
    END IF;

    -- Phone format validation for users table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'chk_users_phone_format'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT chk_users_phone_format 
        CHECK (phone IS NULL OR phone ~ '^[\+]?[0-9\-\(\)\s]+$');
    END IF;

    -- Positive amounts for financial fields
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'chk_companies_credit_limit_positive'
    ) THEN
        ALTER TABLE companies ADD CONSTRAINT chk_companies_credit_limit_positive 
        CHECK (credit_limit >= 0);
    END IF;

    -- Date constraints
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'chk_companies_accreditation_expiry_future'
    ) THEN
        ALTER TABLE companies ADD CONSTRAINT chk_companies_accreditation_expiry_future 
        CHECK (accreditation_expiry IS NULL OR accreditation_expiry > CURRENT_DATE);
    END IF;
END $$;

-- ============================================================================
-- UPDATE TRIGGERS (for updated_at timestamps)
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for tables that have updated_at columns
DO $$
BEGIN
    -- Users table trigger
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_users_updated_at'
    ) THEN
        CREATE TRIGGER trigger_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Companies table trigger
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_companies_updated_at'
    ) THEN
        CREATE TRIGGER trigger_companies_updated_at
            BEFORE UPDATE ON companies
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Drivers table trigger
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_drivers_updated_at'
    ) THEN
        CREATE TRIGGER trigger_drivers_updated_at
            BEFORE UPDATE ON drivers
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Vehicles table trigger
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_vehicles_updated_at'
    ) THEN
        CREATE TRIGGER trigger_vehicles_updated_at
            BEFORE UPDATE ON vehicles
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Bookings table trigger
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_bookings_updated_at'
    ) THEN
        CREATE TRIGGER trigger_bookings_updated_at
            BEFORE UPDATE ON bookings
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================================================
-- PERFORMANCE ANALYSIS
-- ============================================================================

-- Create a view for analyzing slow queries (requires pg_stat_statements extension)
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    min_time,
    max_time,
    stddev_time,
    rows
FROM pg_stat_statements 
WHERE mean_time > 100  -- queries taking more than 100ms on average
ORDER BY mean_time DESC;

-- Grant permissions for monitoring
GRANT SELECT ON slow_queries TO PUBLIC;

COMMENT ON VIEW slow_queries IS 'Monitor slow queries for performance optimization'; 