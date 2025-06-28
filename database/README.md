# Inflight Admin Dashboard - Database Documentation

## 📋 Overview

This database schema is designed for the Inflight Admin Dashboard, a comprehensive management system for transportation and logistics services. The schema focuses on three core areas:

- **Dashboard Analytics** - Real-time metrics, KPIs, and business intelligence
- **Monitoring System** - System health, performance tracking, and alerting
- **Supplier Management** - Comprehensive supplier operations and performance

## 🗂️ Directory Structure

```
database/
├── schemas/                    # Schema definition files
│   ├── 01_users_and_auth.sql      # User management & authentication
│   ├── 02_companies_and_suppliers.sql # Companies & enhanced suppliers
│   ├── 03_dashboard_analytics.sql     # Dashboard metrics & analytics
│   ├── 04_monitoring_system.sql       # System monitoring & health
│   ├── 05_bookings_and_transactions.sql # Business operations
│   └── 06_system_and_audit.sql        # System settings & audit logs
├── migrations/                 # Database migrations (future use)
├── seeds/                     # Initial and sample data
│   ├── initial_data.sql           # Essential system data
│   └── sample_data.sql            # Development sample data
├── scripts/                   # Utility scripts
│   ├── install.sql                # Main installation script
│   ├── backup.sh                  # Backup script
│   └── maintenance.sql            # Maintenance procedures
└── README.md                  # This documentation
```

## 🚀 Quick Start

### Prerequisites

- PostgreSQL 13+ installed
- Database user with CREATE privileges
- Command line access to PostgreSQL

### Installation

1. **Clone and navigate to database directory:**
   ```bash
   cd database
   ```

2. **Create database and run installation:**
   ```bash
   # Create database
   createdb admin_dashboard
   
   # Run installation script
   psql -d admin_dashboard -f scripts/install.sql
   ```

3. **Verify installation:**
   ```bash
   psql -d admin_dashboard -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
   ```

## 📊 Database Schema Overview

### Core Tables Summary

| Table | Purpose | Records Est. |
|-------|---------|-------------|
| `users` | User authentication & profiles | 10K+ |
| `companies` | Business entities | 1K+ |
| `suppliers` | Enhanced supplier management | 500+ |
| `vehicles` | Fleet management | 2K+ |
| `drivers` | Driver profiles & performance | 1K+ |
| `bookings` | Trip bookings & reservations | 100K+ |
| `transactions` | Financial transactions | 500K+ |
| `dashboard_metrics` | Daily/hourly business metrics | 365+ daily |
| `monitoring_events` | System events & logs | 1M+ (partitioned) |
| `notifications` | User notifications | 100K+ |

### Key Features

#### 🔐 Security & Authentication
- Row-level security (RLS)
- User sessions with JWT support
- Granular permissions system
- Audit logging for all changes

#### 📈 Dashboard Analytics
- Real-time business metrics
- Revenue analytics with growth tracking
- Performance KPIs and benchmarks
- Configurable dashboard widgets
- Materialized views for fast queries

#### 🔍 Monitoring System
- Comprehensive event logging
- System health monitoring
- Performance tracking
- Business alerts with thresholds
- Uptime monitoring

#### 🚚 Supplier Management
- Complete supplier lifecycle
- Performance tracking and ratings
- Contract management
- Review and feedback system
- Automated payout processing

## 🛠️ Advanced Setup

### Environment-Specific Configuration

#### Development Setup
```bash
# Install with sample data
psql -d admin_dashboard -f scripts/install.sql
psql -d admin_dashboard -f seeds/sample_data.sql
```

#### Production Setup
```bash
# Install without sample data
psql -d admin_dashboard -f scripts/install.sql

# Set production configurations
psql -d admin_dashboard -c "
UPDATE system_settings 
SET setting_value = 'true' 
WHERE setting_key = 'require_2fa';
"
```

### Performance Optimization

#### Partitioning Setup
The schema includes partitioned tables for high-volume data:

- `monitoring_events` - Monthly partitions
- `audit_logs` - Monthly partitions  
- `performance_logs` - Daily partitions

#### Index Optimization
```sql
-- Create additional indexes for your specific queries
CREATE INDEX CONCURRENTLY idx_custom_bookings_date_status 
ON bookings(pickup_datetime, booking_status) 
WHERE booking_status IN ('confirmed', 'in_progress');
```

#### Materialized Views
```sql
-- Refresh materialized views (run via cron)
SELECT refresh_dashboard_views();
```

## 📝 Database Operations

### Regular Maintenance

#### Daily Tasks
```sql
-- Update table statistics
ANALYZE;

-- Refresh materialized views
SELECT refresh_dashboard_views();

-- Clean old notification data
SELECT cleanup_old_data(90);
```

#### Weekly Tasks
```sql
-- Vacuum tables
VACUUM ANALYZE;

-- Check for unused indexes
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE schemaname = 'public';
```

#### Monthly Tasks
```sql
-- Clean old monitoring data
SELECT cleanup_monitoring_data(90);

-- Archive old audit logs
-- (Custom archival script recommended)
```

### Backup & Recovery

#### Automated Backup Script
```bash
#!/bin/bash
# backup.sh - Place in scripts/ directory

DB_NAME="admin_dashboard"
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
pg_dump -Fc $DB_NAME > "$BACKUP_DIR/admin_dashboard_$DATE.backup"

# Keep only last 7 days
find $BACKUP_DIR -name "admin_dashboard_*.backup" -mtime +7 -delete
```

#### Restore from Backup
```bash
# Restore database
pg_restore -d admin_dashboard /path/to/backup.backup
```

## 🔧 Customization

### Adding Custom Tables

1. Create migration file in `migrations/` directory
2. Follow naming convention: `YYYYMMDD_HHMMSS_description.sql`
3. Include both UP and DOWN migrations

### Custom Dashboard Widgets

```sql
-- Add custom widget
INSERT INTO dashboard_widgets (
    widget_name, widget_type, widget_category, data_source,
    query_config, display_config, title, user_roles
) VALUES (
    'custom_metric', 'counter', 'custom', 'your_table',
    '{"query": "SELECT COUNT(*) FROM your_table"}',
    '{"color": "blue", "icon": "chart", "format": "number"}',
    'Custom Metric', ARRAY['admin']
);
```

### Custom Business Alerts

```sql
-- Add custom alert
INSERT INTO business_alerts (
    alert_type, alert_name, metric_name, threshold_value, 
    threshold_operator, severity
) VALUES (
    'custom_alert', 'Custom Threshold Alert', 'your_metric', 
    100, '>', 'warning'
);
```

## 📊 Monitoring & Analytics

### Key Metrics Queries

#### Daily Business Summary
```sql
SELECT 
    metric_date,
    total_bookings,
    completed_bookings,
    total_revenue,
    average_rating
FROM dashboard_metrics 
WHERE metric_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY metric_date DESC;
```

#### Supplier Performance
```sql
SELECT 
    c.name,
    s.overall_rating,
    s.total_trips_completed,
    s.on_time_percentage
FROM suppliers s
JOIN companies c ON s.company_id = c.id
WHERE s.account_status = 'active'
ORDER BY s.overall_rating DESC;
```

#### System Health Check
```sql
SELECT 
    check_time,
    overall_health_score,
    db_response_time,
    api_response_time
FROM system_health 
ORDER BY check_time DESC 
LIMIT 24;
```

## 🚨 Troubleshooting

### Common Issues

#### High Database Load
```sql
-- Check active queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```

#### Storage Issues
```sql
-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Performance Issues
```sql
-- Check slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## 📞 Support

### Getting Help

1. **Check Logs**: Review PostgreSQL logs for errors
2. **Monitor Metrics**: Use built-in dashboard metrics
3. **Performance**: Use pg_stat_statements for query analysis
4. **Documentation**: Refer to PostgreSQL official documentation

### Best Practices

- **Backup**: Implement automated daily backups
- **Monitoring**: Set up alerts for key metrics
- **Maintenance**: Run regular VACUUM and ANALYZE
- **Security**: Keep PostgreSQL updated
- **Performance**: Monitor query performance regularly

---

**Database Version**: 1.0.0  
**PostgreSQL Compatibility**: 13+  
**Last Updated**: 2024  
**Maintainer**: Inflight Development Team 