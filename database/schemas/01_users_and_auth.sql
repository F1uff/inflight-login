-- ============================================================================
-- USER MANAGEMENT & AUTHENTICATION SCHEMA
-- File: 01_users_and_auth.sql
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ============================================================================
-- USERS TABLE
-- ============================================================================

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

-- ============================================================================
-- USER SESSIONS
-- ============================================================================

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

-- ============================================================================
-- USER PERMISSIONS
-- ============================================================================

CREATE TABLE user_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    permission_name VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    actions TEXT[], -- ['create', 'read', 'update', 'delete']
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by INTEGER REFERENCES users(id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Sessions indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;

-- Permissions indexes
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_resource ON user_permissions(resource);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
CREATE TRIGGER trigger_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECURITY FUNCTIONS
-- ============================================================================

-- Function to get current user ID (for RLS)
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS INTEGER AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_user_id', TRUE), '')::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY user_sessions_policy ON user_sessions
    FOR ALL TO authenticated_users
    USING (user_id = current_user_id());

-- Users can only see their own permissions
CREATE POLICY user_permissions_policy ON user_permissions
    FOR ALL TO authenticated_users
    USING (user_id = current_user_id()); 