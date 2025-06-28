# PostgreSQL Implementation Guide

## Overview

Your AdminDashboard now supports both SQLite and PostgreSQL databases. This implementation provides:

- **Zero-risk migration** - SQLite continues to work unchanged
- **Environment-based switching** - Choose database via environment variables
- **Automatic schema creation** - PostgreSQL tables created automatically
- **Data migration tools** - Transfer existing SQLite data to PostgreSQL
- **Production-ready** - Connection pooling, error handling, and performance optimizations

## Prerequisites

1. **PostgreSQL Installation**
   ```bash
   # macOS (using Homebrew)
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # Create database and user
   CREATE DATABASE inflight_admin;
   CREATE USER inflight_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE inflight_admin TO inflight_user;
   \q
   ```

## Configuration

1. **Environment Setup**
   ```bash
   # Copy PostgreSQL environment template
   cp .env.postgresql .env
   
   # Edit .env file with your PostgreSQL credentials
   nano .env
   ```

2. **Environment Variables**
   ```env
   # Database Configuration
   DATABASE_TYPE=postgresql  # or 'sqlite'
   
   # PostgreSQL Settings
   PG_HOST=localhost
   PG_PORT=5432
   PG_DATABASE=inflight_admin
   PG_USER=inflight_user
   PG_PASSWORD=your_secure_password
   PG_SSL=false
   ```

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize PostgreSQL Database**
   ```bash
   # Option 1: Initialize fresh PostgreSQL database
   npm run init-postgresql
   
   # Option 2: Migrate existing SQLite data to PostgreSQL
   npm run migrate-to-postgresql
   ```

3. **Start Server with PostgreSQL**
   ```bash
   # Method 1: Using environment file
   npm start
   
   # Method 2: Direct command
   npm run start-postgresql
   
   # Method 3: Development mode
   DATABASE_TYPE=postgresql npm run dev
   ```

## Database Switching

You can switch between databases without code changes:

```bash
# Use SQLite (current setup)
npm run start-sqlite

# Use PostgreSQL
npm run start-postgresql

# Or set environment variable
export DATABASE_TYPE=postgresql
npm start
```

## Migration Process

### From SQLite to PostgreSQL

1. **Ensure PostgreSQL is running and configured**
2. **Run migration script**
   ```bash
   npm run migrate-to-postgresql
   ```
3. **Switch to PostgreSQL**
   ```bash
   DATABASE_TYPE=postgresql npm start
   ```

## Performance Benefits

### PostgreSQL Advantages

1. **Connection Pooling** - Efficient connection management
2. **Advanced Indexing** - Better query performance
3. **ACID Compliance** - Full transaction support
4. **Concurrent Access** - Multiple users simultaneously
5. **Scalability** - Handle larger datasets

## API Compatibility

All existing API endpoints work identically with both databases.

## Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   # Check if PostgreSQL is running
   brew services list | grep postgresql
   
   # Start PostgreSQL
   brew services start postgresql
   ```

2. **Authentication Failed**
   ```bash
   # Check user permissions
   psql -U inflight_user -d inflight_admin
   ```

---

**🎉 Your AdminDashboard now supports PostgreSQL with zero downtime migration!**
