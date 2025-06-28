-- ============================================================================
-- BOOKINGS & TRANSACTIONS SCHEMA
-- File: 05_bookings_and_transactions.sql
-- ============================================================================

-- ============================================================================
-- VEHICLES
-- ============================================================================

CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Vehicle identification
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    vin_number VARCHAR(50) UNIQUE,
    
    -- Vehicle details
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER CHECK (year BETWEEN 1990 AND 2030),
    color VARCHAR(50),
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('sedan', 'suv', 'van', 'bus', 'truck', 'motorcycle')),
    fuel_type VARCHAR(20) DEFAULT 'gasoline' CHECK (fuel_type IN ('gasoline', 'diesel', 'electric', 'hybrid', 'cng')),
    
    -- Capacity and specifications
    passenger_capacity INTEGER CHECK (passenger_capacity > 0),
    cargo_capacity DECIMAL(8,2), -- in cubic meters
    weight_capacity DECIMAL(8,2), -- in tons
    
    -- Registration and insurance
    registration_number VARCHAR(100),
    registration_expiry DATE,
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(100),
    insurance_expiry DATE,
    
    -- Status and condition
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'retired', 'repair')),
    condition VARCHAR(20) DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    
    -- Maintenance tracking
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    maintenance_notes TEXT,
    odometer_reading INTEGER DEFAULT 0, -- in kilometers
    
    -- Features and amenities
    features TEXT[], -- ['air_conditioning', 'wifi', 'gps', 'child_seat']
    amenities JSONB,
    
    -- Images and documents
    images JSONB, -- Array of image URLs
    documents JSONB, -- Registration, insurance docs, etc.
    
    -- Location tracking
    current_location JSONB, -- {"lat": 14.5995, "lng": 120.9842, "address": "..."}
    home_base_location JSONB,
    
    -- Metadata
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- DRIVERS
-- ============================================================================

CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- License information
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_type VARCHAR(20) NOT NULL CHECK (license_type IN ('professional', 'non_professional', 'student')),
    license_class VARCHAR(10), -- A, B, C, etc.
    license_issue_date DATE,
    license_expiry_date DATE,
    license_restrictions TEXT,
    
    -- Personal information
    date_of_birth DATE,
    nationality VARCHAR(100) DEFAULT 'Filipino',
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    -- Professional details
    years_of_experience INTEGER DEFAULT 0,
    specializations TEXT[], -- ['long_haul', 'city_driving', 'hazmat', 'tour_guide']
    certifications TEXT[], -- ['defensive_driving', 'first_aid', 'tour_guide']
    languages_spoken TEXT[] DEFAULT ARRAY['Filipino', 'English'],
    
    -- Performance metrics
    total_trips INTEGER DEFAULT 0,
    completed_trips INTEGER DEFAULT 0,
    cancelled_trips INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    safety_score INTEGER DEFAULT 100 CHECK (safety_score BETWEEN 0 AND 100), -- 0-100
    
    -- Financial information
    base_salary DECIMAL(10,2),
    commission_rate DECIMAL(5,4), -- percentage
    total_earnings DECIMAL(15,2) DEFAULT 0,
    
    -- Status and availability
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'on_leave', 'terminated')),
    availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'off_duty', 'break')),
    
    -- Vehicle assignment
    assigned_vehicle_id INTEGER REFERENCES vehicles(id),
    assignment_date DATE,
    
    -- Location tracking
    current_location JSONB,
    last_location_update TIMESTAMP,
    
    -- Documents and certifications
    documents JSONB,
    medical_certificate_expiry DATE,
    drug_test_date DATE,
    
    -- Work schedule
    work_schedule JSONB, -- {"monday": {"start": "06:00", "end": "18:00"}}
    
    -- Metadata
    notes TEXT,
    tags TEXT[],
    hired_date DATE,
    termination_date DATE,
    termination_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- BOOKINGS
-- ============================================================================

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    company_id INTEGER REFERENCES companies(id) ON DELETE RESTRICT,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE RESTRICT,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE RESTRICT,
    customer_id INTEGER REFERENCES users(id),
    
    -- Trip details
    trip_type VARCHAR(20) NOT NULL CHECK (trip_type IN ('one_way', 'round_trip', 'multi_stop', 'hourly')),
    service_type VARCHAR(50) NOT NULL, -- 'airport_transfer', 'city_tour', 'point_to_point', 'rental'
    
    -- Locations
    pickup_address TEXT NOT NULL,
    pickup_coordinates JSONB, -- {"lat": 14.5995, "lng": 120.9842}
    destination_address TEXT NOT NULL,
    destination_coordinates JSONB,
    waypoints JSONB, -- Array of intermediate stops
    
    -- Schedule
    pickup_datetime TIMESTAMP NOT NULL,
    estimated_arrival TIMESTAMP,
    actual_pickup_time TIMESTAMP,
    actual_arrival_time TIMESTAMP,
    
    -- Trip duration and distance
    estimated_duration INTEGER, -- minutes
    actual_duration INTEGER, -- minutes
    estimated_distance DECIMAL(8,2), -- kilometers
    actual_distance DECIMAL(8,2), -- kilometers
    
    -- Passenger information
    passenger_count INTEGER NOT NULL DEFAULT 1 CHECK (passenger_count > 0),
    passenger_names TEXT[],
    contact_person_name VARCHAR(255),
    contact_person_phone VARCHAR(20),
    special_requests TEXT,
    
    -- Pricing
    base_fare DECIMAL(10,2),
    distance_fare DECIMAL(10,2),
    time_fare DECIMAL(10,2),
    surge_multiplier DECIMAL(3,2) DEFAULT 1.0,
    additional_charges DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PHP',
    
    -- Status tracking
    booking_status VARCHAR(20) DEFAULT 'pending' CHECK (booking_status IN (
        'pending', 'confirmed', 'assigned', 'driver_en_route', 'arrived', 
        'in_progress', 'completed', 'cancelled', 'no_show'
    )),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'paid', 'partial', 'refunded', 'failed', 'disputed'
    )),
    
    -- Business logic fields
    booking_source VARCHAR(50) DEFAULT 'web', -- 'web', 'mobile', 'phone', 'walk_in', 'api'
    priority_level VARCHAR(20) DEFAULT 'normal' CHECK (priority_level IN ('low', 'normal', 'high', 'urgent')),
    
    -- Cancellation and modifications
    cancellation_deadline TIMESTAMP,
    auto_cancel_at TIMESTAMP,
    cancellation_reason TEXT,
    cancelled_by INTEGER REFERENCES users(id),
    cancelled_at TIMESTAMP,
    
    -- Customer feedback
    customer_rating INTEGER CHECK (customer_rating BETWEEN 1 AND 5),
    customer_feedback TEXT,
    feedback_date TIMESTAMP,
    
    -- Driver feedback
    driver_rating INTEGER CHECK (driver_rating BETWEEN 1 AND 5),
    driver_feedback TEXT,
    
    -- Additional information
    special_instructions TEXT,
    internal_notes TEXT,
    
    -- Metadata
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- ============================================================================
-- BOOKING STATUS HISTORY
-- ============================================================================

CREATE TABLE booking_status_history (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    
    -- Status change details
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    status_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by INTEGER REFERENCES users(id),
    
    -- Additional context
    reason TEXT,
    notes TEXT,
    location JSONB,
    metadata JSONB
);

-- ============================================================================
-- ACCOUNTS
-- ============================================================================

CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('receivable', 'payable', 'cash', 'credit', 'expense', 'revenue')),
    account_name VARCHAR(255) NOT NULL,
    
    -- Balance information
    current_balance DECIMAL(15,2) DEFAULT 0,
    available_balance DECIMAL(15,2) DEFAULT 0,
    credit_limit DECIMAL(15,2) DEFAULT 0,
    
    -- Terms and conditions
    payment_terms INTEGER DEFAULT 30, -- days
    interest_rate DECIMAL(5,4) DEFAULT 0, -- percentage
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'closed', 'frozen')),
    
    -- Parent account for hierarchical structure
    parent_account_id INTEGER REFERENCES accounts(id),
    
    -- Metadata
    description TEXT,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TRANSACTIONS
-- ============================================================================

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    transaction_reference VARCHAR(50) UNIQUE NOT NULL,
    account_id INTEGER REFERENCES accounts(id),
    booking_id INTEGER REFERENCES bookings(id),
    related_transaction_id INTEGER REFERENCES transactions(id), -- For refunds, reversals
    
    -- Transaction details
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN (
        'payment', 'refund', 'fee', 'commission', 'adjustment', 'penalty', 'bonus', 'withdrawal', 'deposit'
    )),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PHP',
    exchange_rate DECIMAL(10,6) DEFAULT 1.0,
    
    -- Payment information
    payment_method VARCHAR(50), -- 'cash', 'credit_card', 'bank_transfer', 'gcash', 'paymaya', 'paypal'
    payment_reference VARCHAR(255),
    payment_gateway VARCHAR(50),
    gateway_transaction_id VARCHAR(255),
    
    -- Card details (if applicable)
    card_last_four VARCHAR(4),
    card_brand VARCHAR(20),
    
    -- Status and processing
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'disputed'
    )),
    processed_at TIMESTAMP,
    
    -- Fees and charges
    processing_fee DECIMAL(10,2) DEFAULT 0,
    gateway_fee DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(15,2), -- amount minus fees
    
    -- Reconciliation
    reconciled BOOLEAN DEFAULT FALSE,
    reconciled_at TIMESTAMP,
    reconciled_by INTEGER REFERENCES users(id),
    
    -- Additional information
    description TEXT,
    notes TEXT,
    metadata JSONB,
    
    -- Audit trail
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_by INTEGER REFERENCES users(id)
);

-- ============================================================================
-- PAYMENT METHODS
-- ============================================================================

CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- Payment method details
    method_type VARCHAR(50) NOT NULL CHECK (method_type IN ('credit_card', 'debit_card', 'bank_account', 'digital_wallet')),
    provider VARCHAR(50), -- 'visa', 'mastercard', 'gcash', 'paymaya', 'bpi', etc.
    
    -- Card/account information (encrypted)
    last_four VARCHAR(4),
    expiry_month INTEGER CHECK (expiry_month BETWEEN 1 AND 12),
    expiry_year INTEGER,
    holder_name VARCHAR(255),
    
    -- Digital wallet information
    wallet_id VARCHAR(255),
    wallet_email VARCHAR(255),
    
    -- Bank account information
    bank_name VARCHAR(255),
    account_number_encrypted TEXT, -- encrypted
    routing_number VARCHAR(50),
    
    -- Status and verification
    is_verified BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'blocked')),
    
    -- Security
    token VARCHAR(255), -- tokenized representation
    fingerprint VARCHAR(64), -- for deduplication
    
    -- Metadata
    nickname VARCHAR(100),
    billing_address JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Vehicles indexes
CREATE INDEX idx_vehicles_company_id ON vehicles(company_id);
CREATE INDEX idx_vehicles_plate_number ON vehicles(plate_number);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_type ON vehicles(vehicle_type);

-- Drivers indexes
CREATE INDEX idx_drivers_company_id ON drivers(company_id);
CREATE INDEX idx_drivers_user_id ON drivers(user_id);
CREATE INDEX idx_drivers_license_number ON drivers(license_number);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_availability ON drivers(availability_status);
CREATE INDEX idx_drivers_assigned_vehicle ON drivers(assigned_vehicle_id);

-- Bookings indexes
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_company_id ON bookings(company_id);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_pickup_datetime ON bookings(pickup_datetime);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_bookings_service_type ON bookings(service_type);

-- Booking status history indexes
CREATE INDEX idx_booking_status_history_booking_id ON booking_status_history(booking_id);
CREATE INDEX idx_booking_status_history_changed_at ON booking_status_history(status_changed_at);

-- Accounts indexes
CREATE INDEX idx_accounts_company_id ON accounts(company_id);
CREATE INDEX idx_accounts_account_number ON accounts(account_number);
CREATE INDEX idx_accounts_account_type ON accounts(account_type);
CREATE INDEX idx_accounts_status ON accounts(status);
CREATE INDEX idx_accounts_parent_account ON accounts(parent_account_id);

-- Transactions indexes
CREATE INDEX idx_transactions_reference ON transactions(transaction_reference);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_booking_id ON transactions(booking_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_processed_at ON transactions(processed_at);
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method);

-- Payment methods indexes
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_type ON payment_methods(method_type);
CREATE INDEX idx_payment_methods_status ON payment_methods(status);
CREATE INDEX idx_payment_methods_default ON payment_methods(is_default) WHERE is_default = true;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER trigger_vehicles_updated_at 
    BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_drivers_updated_at 
    BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_bookings_updated_at 
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_accounts_updated_at 
    BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_transactions_updated_at 
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_payment_methods_updated_at 
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- BUSINESS LOGIC FUNCTIONS
-- ============================================================================

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_reference IS NULL OR NEW.booking_reference = '' THEN
        NEW.booking_reference = 'BK' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || LPAD(NEW.id::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply booking reference trigger
CREATE TRIGGER trigger_generate_booking_reference
    BEFORE INSERT ON bookings
    FOR EACH ROW EXECUTE FUNCTION generate_booking_reference();

-- Function to track booking status changes
CREATE OR REPLACE FUNCTION track_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.booking_status IS DISTINCT FROM NEW.booking_status THEN
        INSERT INTO booking_status_history (
            booking_id, previous_status, new_status, changed_by
        ) VALUES (
            NEW.id, OLD.booking_status, NEW.booking_status, 
            NULLIF(current_setting('app.current_user_id', TRUE), '')::INTEGER
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply booking status tracking trigger
CREATE TRIGGER trigger_track_booking_status_change
    AFTER UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION track_booking_status_change();

-- Function to generate transaction reference
CREATE OR REPLACE FUNCTION generate_transaction_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_reference IS NULL OR NEW.transaction_reference = '' THEN
        NEW.transaction_reference = 'TXN' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || LPAD(NEW.id::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply transaction reference trigger
CREATE TRIGGER trigger_generate_transaction_reference
    BEFORE INSERT ON transactions
    FOR EACH ROW EXECUTE FUNCTION generate_transaction_reference();

-- Function to update account balance
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Update account balance when transaction is completed
        UPDATE accounts 
        SET current_balance = current_balance + NEW.amount
        WHERE id = NEW.account_id;
    ELSIF OLD.status = 'completed' AND NEW.status != 'completed' THEN
        -- Reverse balance update if transaction is no longer completed
        UPDATE accounts 
        SET current_balance = current_balance - OLD.amount
        WHERE id = OLD.account_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply account balance trigger
CREATE TRIGGER trigger_update_account_balance
    AFTER INSERT OR UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_account_balance(); 