# API Structure Documentation - Inflight Login System

## 🌐 **Base Configuration**

- **Base URL**: `http://localhost:3001/api/v1`
- **API Version**: v1.0.0
- **Documentation**: `/api-docs` (Swagger UI)
- **Health Check**: `/health`

## 📋 **API Endpoints Overview**

### 🔐 **Authentication (`/auth`)**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/login` | User authentication | ❌ |
| `POST` | `/auth/register` | User registration | ❌ |
| `GET` | `/auth/profile` | Get user profile | ✅ |
| `POST` | `/auth/create-demo-admin` | Create demo admin user | ❌ |

### 🏠 **Dashboard (`/dashboard`)**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/dashboard/overview` | Dashboard overview metrics | ✅ |
| `GET` | `/dashboard/revenue` | Revenue analytics | ✅ |
| `GET` | `/dashboard/booking-stats` | Booking statistics | ✅ |
| `GET` | `/dashboard/top-performers` | Top performing suppliers | ✅ |

### 👨‍💼 **Admin (`/admin`)**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/admin/overview` | Admin dashboard overview | ✅ |
| `GET` | `/admin/bookings/analytics` | Booking analytics | ✅ |
| `GET` | `/admin/monitoring/realtime` | Real-time monitoring | ✅ |
| `GET` | `/admin/users` | Get all users | ✅ |
| `PUT` | `/admin/users/:id/status` | Update user status | ✅ |
| `GET` | `/admin/drivers` | Get all drivers | ✅ |
| `GET` | `/admin/vehicles` | Get all vehicles | ✅ |
| `GET` | `/admin/bookings` | Get all bookings | ✅ |
| `GET` | `/admin/activities` | Get system activities | ✅ |
| `GET` | `/admin/supplier-stats` | Supplier statistics | ✅ |

### 🏢 **Suppliers (`/suppliers`)**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/suppliers/analytics` | Supplier analytics | ✅ |
| `GET` | `/suppliers` | Get all suppliers | ✅ |
| `GET` | `/suppliers/portfolio-count` | Portfolio count | ✅ |
| `GET` | `/suppliers/performance` | Performance metrics | ✅ |
| `GET` | `/suppliers/:id` | Get supplier by ID | ✅ |
| `POST` | `/suppliers` | Create new supplier | ✅ |
| `PUT` | `/suppliers/:id` | Update supplier | ✅ |

### 👤 **User Dashboard (`/user-dashboard`)**

#### **Drivers Management**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/user-dashboard/drivers` | Get company drivers | ✅ |
| `POST` | `/user-dashboard/drivers` | Create new driver | ✅ |
| `POST` | `/user-dashboard/drivers/upload-documents` | Upload driver documents | ✅ |
| `PUT` | `/user-dashboard/drivers/:id` | Update driver | ✅ |
| `DELETE` | `/user-dashboard/drivers/:id` | Delete driver | ✅ |

#### **Vehicles Management**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/user-dashboard/vehicles` | Get company vehicles | ✅ |
| `POST` | `/user-dashboard/vehicles` | Create new vehicle | ✅ |
| `POST` | `/user-dashboard/vehicles/upload-documents` | Upload vehicle documents | ✅ |
| `PUT` | `/user-dashboard/vehicles/:id` | Update vehicle | ✅ |
| `DELETE` | `/user-dashboard/vehicles/:id` | Delete vehicle | ✅ |

#### **Bookings Management**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/user-dashboard/bookings` | Get company bookings | ✅ |
| `POST` | `/user-dashboard/bookings` | Create new booking | ✅ |
| `GET` | `/user-dashboard/bookings/:id` | Get booking by ID | ✅ |
| `PUT` | `/user-dashboard/bookings/:id` | Update booking | ✅ |
| `PUT` | `/user-dashboard/bookings/:id/status` | Update booking status | ✅ |
| `DELETE` | `/user-dashboard/bookings/:id` | Delete booking | ✅ |
| `PUT` | `/user-dashboard/bookings/:id/assign-driver` | Assign driver to booking | ✅ |
| `PUT` | `/user-dashboard/bookings/:id/assign-vehicle` | Assign vehicle to booking | ✅ |
| `PUT` | `/user-dashboard/bookings/:id/unassign-driver` | Unassign driver from booking | ✅ |
| `PUT` | `/user-dashboard/bookings/:id/unassign-vehicle` | Unassign vehicle from booking | ✅ |

#### **Company Management**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/user-dashboard/company-profile` | Get company profile | ✅ |
| `PUT` | `/user-dashboard/company-profile` | Update company profile | ✅ |
| `GET` | `/user-dashboard/users` | Get company users | ✅ |

#### **Documents Management**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/user-dashboard/documents` | Get company documents | ✅ |
| `GET` | `/user-dashboard/documents/:id` | Get document by ID | ✅ |
| `POST` | `/user-dashboard/documents` | Upload document | ✅ |
| `PUT` | `/user-dashboard/documents/:id` | Update document | ✅ |
| `DELETE` | `/user-dashboard/documents/:id` | Delete document | ✅ |

#### **Notifications**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/user-dashboard/notifications` | Get user notifications | ✅ |
| `GET` | `/user-dashboard/notifications/unread-count` | Get unread count | ✅ |
| `POST` | `/user-dashboard/notifications/mark-read` | Mark notifications as read | ✅ |
| `DELETE` | `/user-dashboard/notifications/:id` | Delete notification | ✅ |
| `POST` | `/user-dashboard/notifications/clear-all` | Clear all notifications | ✅ |

#### **Profile Management**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/user-dashboard/profile` | Get user profile | ✅ |
| `GET` | `/user-dashboard/profile/preferences` | Get user preferences | ✅ |
| `PUT` | `/user-dashboard/profile/preferences` | Update user preferences | ✅ |

#### **File Management**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/user-dashboard/files` | Get user files | ✅ |
| `POST` | `/user-dashboard/files/upload` | Upload file | ✅ |
| `GET` | `/user-dashboard/files/:id` | Get file by ID | ✅ |
| `PUT` | `/user-dashboard/files/:id` | Update file | ✅ |
| `DELETE` | `/user-dashboard/files/:id` | Delete file | ✅ |

#### **Analytics**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/user-dashboard/analytics/dashboard-metrics` | Dashboard metrics | ✅ |
| `GET` | `/user-dashboard/analytics/performance-kpis` | Performance KPIs | ✅ |
| `GET` | `/user-dashboard/analytics/revenue` | Revenue analytics | ✅ |
| `GET` | `/user-dashboard/analytics/summary` | Analytics summary | ✅ |
| `GET` | `/user-dashboard/analytics/trends` | Trend analysis | ✅ |
| `GET` | `/user-dashboard/analytics/forecasting` | Forecasting data | ✅ |
| `GET` | `/user-dashboard/analytics/correlations` | Correlation analysis | ✅ |

#### **Settings & Payments**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/user-dashboard/settings` | Get company settings | ✅ |
| `PUT` | `/user-dashboard/settings` | Update company settings | ✅ |
| `GET` | `/user-dashboard/payments` | Get payment history | ✅ |
| `PUT` | `/user-dashboard/bookings/:id/payment` | Update booking payment | ✅ |

### 📊 **Monitoring (`/monitoring`)**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/monitoring/health` | System health status | ✅ |
| `GET` | `/monitoring/metrics` | System metrics | ✅ |
| `POST` | `/monitoring/health/update` | Update health metrics | ✅ |
| `GET` | `/monitoring/performance` | Performance metrics | ✅ |
| `GET` | `/monitoring/errors` | Error statistics | ✅ |
| `GET` | `/monitoring/realtime` | Real-time monitoring | ✅ |
| `GET` | `/monitoring/trends` | Trend analysis | ✅ |
| `GET` | `/monitoring/alerts` | System alerts | ✅ |

## 🔧 **Detailed API Specifications**

### **Authentication Endpoints**

#### **POST /auth/login**
```json
{
  "email": "admin@inflight.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@inflight.com",
    "role": "admin",
    "firstName": "Admin",
    "lastName": "User"
  }
}
```

#### **POST /auth/register**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "user",
  "companyName": "Example Corp"
}
```

### **Dashboard Endpoints**

#### **GET /dashboard/overview**
**Query Parameters:**
- `timeframe` (optional): "7d", "30d", "90d"

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalBookings": 1250,
      "completedBookings": 1100,
      "totalRevenue": 125000.50,
      "activeSuppliers": 45,
      "activeDrivers": 120
    },
    "recentBookings": [],
    "topSuppliers": []
  }
}
```

### **Admin Endpoints**

#### **GET /admin/overview**
**Response:**
```json
{
  "success": true,
  "overview": {
    "bookings": {
      "completed": 1100,
      "pending": 150,
      "cancelled": 50,
      "active": 100,
      "today": 25,
      "week": 175,
      "month": 750
    },
    "revenue": {
      "total": 125000.50,
      "pending": 15000.00,
      "paid": 110000.50
    },
    "companies": {
      "total": 45,
      "active": 40,
      "pending": 3,
      "inactive": 2
    },
    "users": {
      "total": 120,
      "active": 115,
      "admin": 5,
      "regular": 110
    }
  }
}
```

### **Suppliers Endpoints**

#### **GET /suppliers**
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status

**Response:**
```json
{
  "suppliers": [
    {
      "id": 1,
      "supplier_code": "SUP001",
      "supplier_type": "transport",
      "overall_rating": 4.5,
      "total_trips_completed": 150,
      "total_revenue_generated": 25000.00,
      "account_status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

### **User Dashboard Endpoints**

#### **GET /user-dashboard/drivers**
**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `search` (optional): Search term
- `timestamp` (optional): For polling updates

**Response:**
```json
{
  "success": true,
  "drivers": [
    {
      "id": 1,
      "license_number": "DL123456",
      "first_name": "John",
      "last_name": "Doe",
      "status": "active",
      "availability_status": "available",
      "total_trips": 50,
      "average_rating": 4.5
    }
  ],
  "summary": {
    "total": 25,
    "active": 20,
    "available": 15,
    "busy": 5
  },
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "pages": 1
  }
}
```

#### **POST /user-dashboard/drivers**
```json
{
  "license_number": "DL123456",
  "first_name": "John",
  "last_name": "Doe",
  "license_type": "professional",
  "license_class": "A",
  "date_of_birth": "1990-01-01",
  "phone": "+1234567890",
  "email": "john.doe@example.com",
  "address": "123 Main St, City",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+1234567891"
}
```

### **Monitoring Endpoints**

#### **GET /monitoring/health**
**Response:**
```json
{
  "healthScore": 95,
  "dbResponseTime": 12.5,
  "apiResponseTime": 45.2,
  "activeSessions": 25,
  "systemErrors": 0,
  "status": "healthy",
  "lastCheck": "2024-01-15T10:30:00Z"
}
```

#### **GET /monitoring/metrics**
**Query Parameters:**
- `hours` (optional): Time range in hours (default: 24)

**Response:**
```json
{
  "period": "24 hours",
  "metrics": [
    {
      "timestamp": "2024-01-15T10:00:00Z",
      "healthScore": 95,
      "dbResponseTime": 12.5,
      "apiResponseTime": 45.2,
      "activeSessions": 25,
      "systemErrors": 0
    }
  ],
  "averages": {
    "healthScore": 94.5,
    "dbResponseTime": 13.2,
    "apiResponseTime": 48.1,
    "activeSessions": 23,
    "systemErrors": 0.5
  }
}
```

## 🔒 **Security Features**

### **Authentication**
- **JWT Tokens**: Bearer token authentication
- **Rate Limiting**: Configurable per endpoint
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: IP tracking and user agent logging

### **Authorization**
- **Role-Based Access Control**: admin, supplier, driver, customer
- **Permission System**: Granular permissions per resource
- **Company Isolation**: Multi-tenant data separation

### **Security Headers**
- **CORS**: Configurable allowed origins
- **Helmet**: Security headers
- **CSRF Protection**: Token-based protection
- **Request Sanitization**: Input validation and sanitization

## 📊 **Response Formats**

### **Success Response**
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### **Error Response**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "statusCode": 400,
    "details": {}
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### **Pagination Response**
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🚀 **Performance Features**

### **Caching**
- **API Response Caching**: In-memory cache with TTL
- **Database Query Optimization**: Prepared statements
- **Connection Pooling**: Efficient database connections

### **Monitoring**
- **Request/Response Logging**: Performance tracking
- **Error Tracking**: Comprehensive error logging
- **Health Checks**: System status monitoring
- **Metrics Collection**: Performance analytics

### **Optimization**
- **Lazy Loading**: Component-based loading
- **Data Pagination**: Efficient data retrieval
- **Polling Optimization**: Timestamp-based updates
- **Compression**: Response compression

## 📝 **API Documentation**

### **Swagger UI**
- **URL**: `/api-docs`
- **Interactive Documentation**: Test endpoints directly
- **Schema Definitions**: Complete request/response schemas
- **Authentication**: Bearer token support

### **Health Check**
- **URL**: `/health`
- **Database Status**: Connection verification
- **System Metrics**: Memory, CPU, uptime
- **Environment Info**: Configuration details

## 🔄 **WebSocket Support**

### **Real-time Features**
- **Connection Status**: WebSocket health monitoring
- **Real-time Updates**: Live data synchronization
- **Event Broadcasting**: System-wide notifications
- **Status Indicators**: Connection state management

This comprehensive API structure provides a robust foundation for the inflight-login system with proper authentication, authorization, monitoring, and performance optimization features. 