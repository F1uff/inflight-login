-- ============================================================================
-- COMPANIES & SUPPLIERS SCHEMA
-- File: 02_companies_and_suppliers.sql
-- ============================================================================

-- ============================================================================
-- COMPANIES TABLE
-- ============================================================================

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

-- ============================================================================
-- COMPANY USERS RELATIONSHIP
-- ============================================================================

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

-- ============================================================================
-- COMPANY DOCUMENTS
-- ============================================================================

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

-- ============================================================================
-- SUPPLIERS TABLE (ENHANCED)
-- ============================================================================

CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Supplier-specific information
    supplier_code VARCHAR(50) UNIQUE NOT NULL,
    supplier_type VARCHAR(50) NOT NULL CHECK (supplier_type IN ('transport', 'logistics', 'tour', 'rental')),
    service_categories TEXT[] NOT NULL, -- ['airport_transfer', 'city_tour', 'cargo']
    
    -- Business capacity
    max_daily_bookings INTEGER DEFAULT 100,
    max_concurrent_trips INTEGER DEFAULT 10,
    service_radius_km INTEGER DEFAULT 50,
    operating_hours JSONB, -- {"monday": {"start": "06:00", "end": "22:00"}}
    
    -- Service areas
    service_cities TEXT[],
    service_airports TEXT[],
    coverage_areas JSONB, -- Geographic polygons or circles
    
    -- Ratings and performance
    overall_rating DECIMAL(3,2) DEFAULT 0,
    service_rating DECIMAL(3,2) DEFAULT 0,
    reliability_rating DECIMAL(3,2) DEFAULT 0,
    communication_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    
    -- Performance metrics
    total_trips_completed INTEGER DEFAULT 0,
    total_revenue_generated DECIMAL(15,2) DEFAULT 0,
    average_trip_duration DECIMAL(8,2),
    on_time_percentage DECIMAL(5,2) DEFAULT 0,
    cancellation_rate DECIMAL(5,2) DEFAULT 0,
    customer_satisfaction DECIMAL(5,2) DEFAULT 0,
    
    -- Financial information
    commission_rate DECIMAL(5,4) DEFAULT 0.15, -- 15% default
    payment_terms INTEGER DEFAULT 30, -- days
    minimum_payout DECIMAL(10,2) DEFAULT 1000,
    current_balance DECIMAL(15,2) DEFAULT 0,
    pending_payouts DECIMAL(15,2) DEFAULT 0,
    
    -- Compliance and certification
    business_license_number VARCHAR(100),
    business_license_expiry DATE,
    insurance_policy_number VARCHAR(100),
    insurance_expiry DATE,
    dot_certification VARCHAR(100),
    dot_expiry DATE,
    
    -- Onboarding and verification
    onboarding_status VARCHAR(20) DEFAULT 'pending' CHECK (onboarding_status IN (
        'pending', 'documents_submitted', 'under_review', 'approved', 'rejected', 'completed'
    )),
    verification_level VARCHAR(20) DEFAULT 'basic' CHECK (verification_level IN (
        'basic', 'verified', 'premium', 'enterprise'
    )),
    verification_date DATE,
    verified_by INTEGER REFERENCES users(id),
    
    -- Account status
    account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN (
        'active', 'inactive', 'suspended', 'terminated', 'pending_approval'
    )),
    suspension_reason TEXT,
    suspended_until DATE,
    
    -- Communication preferences
    notification_preferences JSONB DEFAULT '{"email": true, "sms": true, "push": true}',
    preferred_contact_method VARCHAR(20) DEFAULT 'email',
    
    -- Additional data
    notes TEXT,
    tags TEXT[],
    metadata JSONB,
    
    -- Timestamps
    joined_date DATE DEFAULT CURRENT_DATE,
    last_activity TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SUPPLIER PERFORMANCE TRACKING
-- ============================================================================

CREATE TABLE supplier_performance (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    performance_date DATE NOT NULL,
    
    -- Daily metrics
    bookings_received INTEGER DEFAULT 0,
    bookings_accepted INTEGER DEFAULT 0,
    bookings_completed INTEGER DEFAULT 0,
    bookings_cancelled INTEGER DEFAULT 0,
    
    -- Response times
    average_response_time DECIMAL(8,2), -- minutes
    average_arrival_time DECIMAL(8,2), -- minutes from booking
    
    -- Quality metrics
    customer_ratings_received INTEGER DEFAULT 0,
    average_daily_rating DECIMAL(3,2),
    complaints_received INTEGER DEFAULT 0,
    compliments_received INTEGER DEFAULT 0,
    
    -- Financial metrics
    revenue_generated DECIMAL(15,2) DEFAULT 0,
    commission_earned DECIMAL(15,2) DEFAULT 0,
    
    -- Efficiency metrics
    vehicle_utilization DECIMAL(5,2), -- percentage
    driver_utilization DECIMAL(5,2), -- percentage
    fuel_efficiency DECIMAL(8,2), -- km per liter
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(supplier_id, performance_date)
);

-- ============================================================================
-- SUPPLIER CONTRACTS
-- ============================================================================

CREATE TABLE supplier_contracts (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    
    -- Contract details
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    contract_type VARCHAR(50) NOT NULL CHECK (contract_type IN ('service_agreement', 'partnership', 'exclusive')),
    contract_title VARCHAR(255) NOT NULL,
    
    -- Terms and conditions
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renewal BOOLEAN DEFAULT FALSE,
    renewal_period INTEGER, -- months
    
    -- Financial terms
    commission_structure JSONB, -- Complex commission rules
    minimum_monthly_revenue DECIMAL(15,2),
    performance_bonuses JSONB,
    penalty_structure JSONB,
    
    -- Service level agreements
    minimum_acceptance_rate DECIMAL(5,2), -- percentage
    maximum_response_time INTEGER, -- minutes
    minimum_rating_threshold DECIMAL(3,2),
    uptime_requirement DECIMAL(5,2), -- percentage
    
    -- Contract status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending_approval', 'active', 'suspended', 'terminated', 'expired'
    )),
    
    -- Document management
    contract_document_url VARCHAR(500),
    signed_date DATE,
    signed_by_supplier INTEGER REFERENCES users(id),
    signed_by_admin INTEGER REFERENCES users(id),
    
    -- Additional terms
    terms_and_conditions TEXT,
    special_clauses JSONB,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SUPPLIER REVIEWS
-- ============================================================================

CREATE TABLE supplier_reviews (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    booking_id INTEGER,
    reviewer_id INTEGER REFERENCES users(id), -- customer who left review
    
    -- Review details
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    service_rating INTEGER CHECK (service_rating BETWEEN 1 AND 5),
    punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    vehicle_condition_rating INTEGER CHECK (vehicle_condition_rating BETWEEN 1 AND 5),
    
    -- Written feedback
    review_title VARCHAR(255),
    review_text TEXT,
    positive_aspects TEXT[],
    areas_for_improvement TEXT[],
    
    -- Review metadata
    review_type VARCHAR(20) DEFAULT 'customer' CHECK (review_type IN ('customer', 'admin', 'system')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    
    -- Response from supplier
    supplier_response TEXT,
    supplier_response_date TIMESTAMP,
    
    -- Moderation
    is_moderated BOOLEAN DEFAULT FALSE,
    moderated_by INTEGER REFERENCES users(id),
    moderation_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SUPPLIER PAYOUTS
-- ============================================================================

CREATE TABLE supplier_payouts (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    
    -- Payout details
    payout_reference VARCHAR(50) UNIQUE NOT NULL,
    payout_period_start DATE NOT NULL,
    payout_period_end DATE NOT NULL,
    
    -- Financial breakdown
    gross_revenue DECIMAL(15,2) NOT NULL,
    platform_commission DECIMAL(15,2) NOT NULL,
    processing_fees DECIMAL(15,2) DEFAULT 0,
    adjustments DECIMAL(15,2) DEFAULT 0,
    penalties DECIMAL(15,2) DEFAULT 0,
    bonuses DECIMAL(15,2) DEFAULT 0,
    net_payout DECIMAL(15,2) NOT NULL,
    
    -- Currency and exchange
    currency VARCHAR(3) DEFAULT 'PHP',
    exchange_rate DECIMAL(10,6) DEFAULT 1.0,
    
    -- Payment details
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('bank_transfer', 'check', 'digital_wallet')),
    bank_account_number VARCHAR(100),
    bank_name VARCHAR(255),
    payment_reference VARCHAR(255),
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'paid', 'failed', 'cancelled', 'on_hold'
    )),
    processed_date DATE,
    paid_date DATE,
    
    -- Trip breakdown
    total_trips INTEGER DEFAULT 0,
    trip_details JSONB, -- Array of trip IDs and amounts
    
    -- Additional information
    notes TEXT,
    internal_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Companies indexes
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_verification_status ON companies(verification_status);
CREATE INDEX idx_companies_created_at ON companies(created_at);

-- Suppliers indexes
CREATE INDEX idx_suppliers_company_id ON suppliers(company_id);
CREATE INDEX idx_suppliers_supplier_code ON suppliers(supplier_code);
CREATE INDEX idx_suppliers_supplier_type ON suppliers(supplier_type);
CREATE INDEX idx_suppliers_account_status ON suppliers(account_status);
CREATE INDEX idx_suppliers_overall_rating ON suppliers(overall_rating);
CREATE INDEX idx_suppliers_service_categories ON suppliers USING GIN(service_categories);
CREATE INDEX idx_suppliers_service_cities ON suppliers USING GIN(service_cities);

-- Performance indexes
CREATE INDEX idx_supplier_performance_supplier_date ON supplier_performance(supplier_id, performance_date);
CREATE INDEX idx_supplier_performance_date ON supplier_performance(performance_date);

-- Reviews indexes
CREATE INDEX idx_supplier_reviews_supplier_id ON supplier_reviews(supplier_id);
CREATE INDEX idx_supplier_reviews_rating ON supplier_reviews(overall_rating);
CREATE INDEX idx_supplier_reviews_created_at ON supplier_reviews(created_at);

-- Payouts indexes
CREATE INDEX idx_supplier_payouts_supplier_id ON supplier_payouts(supplier_id);
CREATE INDEX idx_supplier_payouts_status ON supplier_payouts(status);
CREATE INDEX idx_supplier_payouts_period ON supplier_payouts(payout_period_start, payout_period_end);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER trigger_companies_updated_at 
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_suppliers_updated_at 
    BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_supplier_contracts_updated_at 
    BEFORE UPDATE ON supplier_contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_supplier_payouts_updated_at 
    BEFORE UPDATE ON supplier_payouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- BUSINESS LOGIC FUNCTIONS
-- ============================================================================

-- Function to update supplier ratings
CREATE OR REPLACE FUNCTION update_supplier_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE suppliers 
    SET 
        overall_rating = (
            SELECT AVG(overall_rating::DECIMAL) 
            FROM supplier_reviews 
            WHERE supplier_id = NEW.supplier_id AND overall_rating IS NOT NULL
        ),
        service_rating = (
            SELECT AVG(service_rating::DECIMAL) 
            FROM supplier_reviews 
            WHERE supplier_id = NEW.supplier_id AND service_rating IS NOT NULL
        ),
        communication_rating = (
            SELECT AVG(communication_rating::DECIMAL) 
            FROM supplier_reviews 
            WHERE supplier_id = NEW.supplier_id AND communication_rating IS NOT NULL
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM supplier_reviews 
            WHERE supplier_id = NEW.supplier_id
        )
    WHERE id = NEW.supplier_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply rating trigger
CREATE TRIGGER trigger_update_supplier_rating
    AFTER INSERT OR UPDATE ON supplier_reviews
    FOR EACH ROW EXECUTE FUNCTION update_supplier_rating();

-- Function to generate supplier code
CREATE OR REPLACE FUNCTION generate_supplier_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.supplier_code IS NULL THEN
        NEW.supplier_code = 'SUP' || LPAD(NEW.id::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply supplier code trigger
CREATE TRIGGER trigger_generate_supplier_code
    BEFORE INSERT ON suppliers
    FOR EACH ROW EXECUTE FUNCTION generate_supplier_code(); 