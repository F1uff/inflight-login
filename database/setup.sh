#!/bin/bash

# ============================================================================
# INFLIGHT ADMIN DASHBOARD - DATABASE SETUP SCRIPT
# Automated database installation and configuration
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DB_NAME="admin_dashboard"
DB_USER="${USER}"
DB_HOST="localhost"
DB_PORT="5432"
ENVIRONMENT="development"
SKIP_SAMPLE_DATA=false

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Options:
    -n, --name NAME         Database name (default: admin_dashboard)
    -u, --user USER         Database user (default: current user)
    -h, --host HOST         Database host (default: localhost)
    -p, --port PORT         Database port (default: 5432)
    -e, --env ENV           Environment: development|production (default: development)
    --skip-sample-data      Skip sample data installation
    --help                  Show this help message

Examples:
    # Development setup with sample data
    $0

    # Production setup
    $0 --env production --skip-sample-data

    # Custom database configuration
    $0 --name my_dashboard --user postgres --host db.example.com
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--name)
            DB_NAME="$2"
            shift 2
            ;;
        -u|--user)
            DB_USER="$2"
            shift 2
            ;;
        -h|--host)
            DB_HOST="$2"
            shift 2
            ;;
        -p|--port)
            DB_PORT="$2"
            shift 2
            ;;
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --skip-sample-data)
            SKIP_SAMPLE_DATA=true
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ "$ENVIRONMENT" != "development" && "$ENVIRONMENT" != "production" ]]; then
    print_error "Environment must be 'development' or 'production'"
    exit 1
fi

# Database connection string
DB_CONNECTION="postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}"

print_info "Starting Inflight Admin Dashboard database setup..."
print_info "Configuration:"
echo "  Database Name: $DB_NAME"
echo "  Database User: $DB_USER"
echo "  Database Host: $DB_HOST"
echo "  Database Port: $DB_PORT"
echo "  Environment: $ENVIRONMENT"
echo "  Skip Sample Data: $SKIP_SAMPLE_DATA"
echo ""

# Check if PostgreSQL is running
print_info "Checking PostgreSQL connection..."
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; then
    print_error "Cannot connect to PostgreSQL server at $DB_HOST:$DB_PORT"
    print_error "Please ensure PostgreSQL is running and accessible"
    exit 1
fi
print_success "PostgreSQL connection verified"

# Check if database exists
if psql "$DB_CONNECTION/postgres" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    print_warning "Database '$DB_NAME' already exists"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Dropping existing database..."
        dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
        print_success "Database dropped"
    else
        print_info "Using existing database"
    fi
fi

# Create database if it doesn't exist
if ! psql "$DB_CONNECTION/postgres" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    print_info "Creating database '$DB_NAME'..."
    createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
    print_success "Database created"
fi

# Change to database directory
cd "$(dirname "$0")"

# Install database schema
print_info "Installing database schema..."
if psql "$DB_CONNECTION/$DB_NAME" -f scripts/install.sql > /dev/null 2>&1; then
    print_success "Database schema installed successfully"
else
    print_error "Failed to install database schema"
    exit 1
fi

# Environment-specific configuration
if [[ "$ENVIRONMENT" == "production" ]]; then
    print_info "Applying production configuration..."
    
    # Set production-specific settings
    psql "$DB_CONNECTION/$DB_NAME" -c "
        UPDATE system_settings SET setting_value = 'true' WHERE setting_key = 'require_2fa';
        UPDATE system_settings SET setting_value = '10' WHERE setting_key = 'max_login_attempts';
        UPDATE system_settings SET setting_value = '1800' WHERE setting_key = 'session_timeout';
    " > /dev/null 2>&1
    
    print_success "Production configuration applied"
fi

# Install sample data for development
if [[ "$ENVIRONMENT" == "development" && "$SKIP_SAMPLE_DATA" == false ]]; then
    if [[ -f "seeds/sample_data.sql" ]]; then
        print_info "Installing sample data for development..."
        psql "$DB_CONNECTION/$DB_NAME" -f seeds/sample_data.sql > /dev/null 2>&1
        print_success "Sample data installed"
    else
        print_warning "Sample data file not found, skipping..."
    fi
fi

# Verify installation
print_info "Verifying installation..."
TABLE_COUNT=$(psql "$DB_CONNECTION/$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')

if [[ "$TABLE_COUNT" -gt 20 ]]; then
    print_success "Installation verified: $TABLE_COUNT tables created"
else
    print_error "Installation verification failed: only $TABLE_COUNT tables found"
    exit 1
fi

# Display summary
print_success "Database setup completed successfully!"
echo ""
print_info "Summary:"
echo "  Database: $DB_NAME"
echo "  Tables Created: $TABLE_COUNT"
echo "  Environment: $ENVIRONMENT"
echo ""
print_info "Connection string:"
echo "  postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo ""

if [[ "$ENVIRONMENT" == "development" ]]; then
    print_info "Development setup complete. You can now:"
    echo "  1. Connect to the database and explore the schema"
    echo "  2. Start your application development"
    echo "  3. Use the sample data for testing"
else
    print_info "Production setup complete. Next steps:"
    echo "  1. Configure your application connection string"
    echo "  2. Set up automated backups"
    echo "  3. Configure monitoring and alerting"
    echo "  4. Create your first admin user"
fi

echo ""
print_info "Documentation: See database/README.md for detailed information"
print_success "Setup complete! 🚀" 