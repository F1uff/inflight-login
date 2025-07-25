# API Structure Documentation - Inflight Login System

## 🌐 **Base Configuration**

- **Base URL**: `http://localhost:3001/api/v1`
- **API Version**: v1.0.0
- **Documentation**: `/api-docs` (Swagger UI)
- **Health Check**: `/health`
- **Environment**: Development/Production ready

## 📋 **API Endpoints Overview**

### 🔐 **Authentication (`/auth`)**

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| `POST` | `/auth/login` | User authentication | ❌ | 5/min |
| `POST` | `/auth/register` | User registration | ❌ | 3/min |
| `GET` | `/auth/profile` | Get user profile | ✅ | 60/min |
| `POST` | `/auth/create-demo-admin` | Create demo admin user | ❌ | 1/hour |
| `POST` | `/auth/logout` | User logout | ✅ | 60/min |
| `POST` | `/auth/refresh-token` | Refresh access token | ❌ | 10/min |
| `POST` | `/auth/forgot-password` | Request password reset | ❌ | 3/hour |
| `POST` | `/auth/reset-password` | Reset password | ❌ | 3/hour |
| `POST` | `/auth/verify-email` | Verify email address | ❌ | 5/min |

### 🏠 **Dashboard (`/dashboard`)**

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| `GET` | `/dashboard/overview` | Dashboard overview metrics | ✅ | 60/min |
| `GET` | `/dashboard/revenue` | Revenue analytics | ✅ | 60/min |
| `GET` | `/dashboard/booking-stats` | Booking statistics | ✅ | 60/min |
| `GET` | `/dashboard/top-performers` | Top performing suppliers | ✅ | 60/min |
| `GET` | `/dashboard/company-metrics` | Company-specific metrics | ✅ | 60/min |
| `GET` | `/dashboard/supplier-performance` | Supplier performance data | ✅ | 60/min |

### 👨‍💼 **Admin (`/admin`)**

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| `GET` | `/admin/overview` | Admin dashboard overview | ✅ | 60/min |
| `GET` | `/admin/bookings/analytics` | Booking analytics | ✅ | 60/min |
| `GET` | `/admin/monitoring/realtime` | Real-time monitoring | ✅ | 60/min |
| `GET` | `/admin/users` | Get all users | ✅ | 60/min |
| `PUT` | `/admin/users/:id/status` | Update user status | ✅ | 30/min |
| `GET` | `/admin/drivers` | Get all drivers | ✅ | 60/min |
| `GET` | `/admin/vehicles` | Get all vehicles | ✅ | 60/min |
| `GET` | `/admin/bookings` | Get all bookings | ✅ | 60/min |
| `GET` | `/admin/activities` | Get system activities | ✅ | 60/min |
| `GET` | `/admin/supplier-stats` | Supplier statistics | ✅ | 60/min |
| `GET` | `/admin/companies` | Get all companies | ✅ | 60/min |
| `PUT` | `/admin/companies/:id/status` | Update company status | ✅ | 30/min |
| `GET` | `/admin/system-metrics` | System performance metrics | ✅ | 60/min |
| `GET` | `/admin/audit-logs` | System audit logs | ✅ | 60/min |

### 🏢 **Suppliers (`/suppliers`)**

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| `GET` | `/suppliers/analytics` | Supplier analytics | ✅ | 60/min |
| `GET` | `/suppliers` | Get all suppliers | ✅ | 60/min |
| `GET` | `/suppliers/portfolio-count` | Portfolio count | ✅ | 60/min |
| `GET` | `/suppliers/performance` | Performance metrics | ✅ | 60/min |
| `GET` | `/suppliers/:id` | Get supplier by ID | ✅ | 60/min |
| `POST` | `/suppliers` | Create new supplier | ✅ | 30/min |
| `PUT` | `/suppliers/:id` | Update supplier | ✅ | 30/min |
| `DELETE` | `/suppliers/:id` | Delete supplier | ✅ | 10/min |
| `GET` | `/suppliers/:id/reviews` | Get supplier reviews | ✅ | 60/min |
| `POST` | `/suppliers/:id/reviews` | Add supplier review | ✅ | 10/min |
| `GET` | `/suppliers/:id/performance` | Get supplier performance | ✅ | 60/min |
| `GET` | `/suppliers/:id/contracts` | Get supplier contracts | ✅ | 60/min |

### 👤 **User Dashboard (`/user-dashboard`)**

#### **Drivers Management**
| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| `GET` | `/user-dashboard/drivers` | Get company drivers | ✅ | 60/min |
| `POST` | `/user-dashboard/drivers` | Create new driver | ✅ | 30/min |
| `POST` | `/user-dashboard/drivers/upload-documents` | Upload driver documents | ✅ | 10/min |
| `PUT` | `/user-dashboard/drivers/:id` | Update driver | ✅ | 30/min |
| `DELETE` | `/user-dashboard/drivers/:id` | Delete driver | ✅ | 10/min |
| `GET` | `/user-dashboard/drivers/:id/documents` | Get driver documents | ✅ | 60/min |
| `PUT` | `/user-dashboard/drivers/:id/status` | Update driver status | ✅ | 30/min |

#### **Vehicles Management**
| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| `GET` | `/user-dashboard/vehicles` | Get company vehicles | ✅ | 60/min |
| `POST` | `/user-dashboard/vehicles` | Create new vehicle | ✅ | 30/min |
| `POST` | `/user-dashboard/vehicles/upload-documents` | Upload vehicle documents | ✅ | 10/min |
| `PUT` | `/user-dashboard/vehicles/:id` | Update vehicle | ✅ | 30/min |
| `DELETE` | `/user-dashboard/vehicles/:id` | Delete vehicle | ✅ | 10/min |
| `GET` | `/user-dashboard/vehicles/:id/documents` | Get vehicle documents | ✅ | 60/min |
| `PUT` | `/user-dashboard/vehicles/:id/status` | Update vehicle status | ✅ | 30/min |

#### **Bookings Management**
| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| `GET` | `/user-dashboard/bookings` | Get company bookings | ✅ | 60/min |
| `POST` | `/user-dashboard/bookings` | Create new booking | ✅ | 30/min |
| `GET` | `/user-dashboard/bookings/:id` | Get booking by ID | ✅ | 60/min |
| `PUT` | `/user-dashboard/bookings/:id` | Update booking | ✅ | 30/min |
| `PUT` | `/user-dashboard/bookings/:id/status` | Update booking status | ✅ | 30/min |
| `DELETE` | `/user-dashboard/bookings/:id` | Delete booking | ✅ | 10/min |
| `PUT` | `/user-dashboard/bookings/:id/assign-driver` | Assign driver to booking | ✅ | 30/min |
| `PUT` | `/user-dashboard/bookings/:id/assign-vehicle` | Assign vehicle to booking | ✅ | 30/min |
| `PUT` | `/user-dashboard/bookings/:id/unassign-driver` | Unassign driver from booking | ✅ | 30/min |
| `PUT` | `/user-dashboard/bookings/:id/unassign-vehicle` | Unassign vehicle from booking | ✅ | 30/min |
| `GET` | `/user-dashboard/bookings/:id/invoice` | Get booking invoice | ✅ | 60/min |
| `POST` | `/user-dashboard/bookings/:id/payment` | Process booking payment | ✅ | 30/min |

#### **Company Management**
| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| `GET` | `/user-dashboard/company-profile` | Get company profile | ✅ | 60/min |
| `PUT` | `/user-dashboard/company-profile` | Update company profile | ✅ | 30/min |
| `GET` | `/user-dashboard/users` | Get company users | ✅ | 60/min |
| `POST` | `/user-dashboard/users` | Add company user | ✅ | 30/min |
| `PUT` | `/user-dashboard/users/:id` | Update company user | ✅ | 30/min |
| `DELETE` | `/user-dashboard/users/:id` | Remove company user | ✅ | 10/min |

#### **Documents Management**
| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| `GET` | `/user-dashboard/documents` | Get company documents | ✅ | 60/min |
| `GET` | `/user-dashboard/documents/:id` | Get document by ID | ✅ | 60/min |
| `POST` | `/user-dashboard/documents` | Upload document | ✅ | 10/min |
| `PUT` | `/user-dashboard/documents/:id` | Update document | ✅ | 30/min |
| `DELETE` | `/user-dashboard/documents/:id` | Delete document | ✅ | 10/min |
| `GET` | `/user-dashboard/documents/:id/download` | Download document | ✅ | 60/min |
| `POST` | `/user-dashboard/documents/bulk-upload` | Bulk upload documents | ✅ | 5/min |

#### **Notifications**
| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| `GET` | `/user-dashboard/notifications` | Get user notifications | ✅ | 60/min |
| `GET` | `/user-dashboard/notifications/unread-count` | Get unread count | ✅ | 60/min |
| `POST` | `/user-dashboard/notifications/mark-read` | Mark notifications as read | ✅ | 30/min |
| `DELETE` | `/user-dashboard/notifications/:id` | Delete notification | ✅ | 30/min |
| `POST` | `/user-dashboard/notifications/clear-all` | Clear all notifications | ✅ | 10/min |
| `PUT` | `/user-dashboard/notifications/:id/read` | Mark specific notification as read | ✅ | 30/min |

#### **Profile Management**
| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| `GET` | `/user-dashboard/profile` | Get user profile | ✅ | 60/min |
| `PUT` | `/user-dashboard/profile` | Update user profile | ✅ | 30/min |
| `GET` | `/user-dashboard/profile/preferences` | Get user preferences | ✅ | 60/min |
| `PUT` | `/user-dashboard/profile/preferences` | Update user preferences | ✅ | 30/min |
| `POST` | `/user-dashboard/profile/avatar` | Upload profile avatar | ✅ | 10/min |
| `DELETE` | `/user-dashboard/profile/avatar` | Remove profile avatar | ✅ | 10/min |

#### **File Management**
| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| `GET` | `/user-dashboard/files` | Get user files | ✅ | 60/min |
| `POST` | `/user-dashboard/files/upload` | Upload file | ✅ | 10/min |
| `GET` | `/user-dashboard/files/:id` | Get file by ID | ✅ | 60/min |
| `PUT` | `/user-dashboard/files/:id` | Update file | ✅ | 30/min |
| `DELETE` | `/user-dashboard/files/:id` | Delete file | ✅ | 10/min |
| `GET` | `/user-dashboard/files/:id/download` | Download file | ✅ | 60/min |

#### **Analytics**
| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| `GET` | `/user-dashboard/analytics/dashboard-metrics` | Dashboard metrics | ✅ | 60/min |
| `GET` | `/user-dashboard/analytics/performance-kpis` | Performance KPIs | ✅ | 60/min |
| `GET` | `/user-dashboard/analytics/revenue` | Revenue analytics | ✅ | 60/min |
| `GET` | `/user-dashboard/analytics/summary` | Analytics summary | ✅ | 60/min |
| `GET` | `/user-dashboard/analytics/trends` | Trend analysis | ✅ | 60/min |
| `GET` | `/user-dashboard/analytics/forecasting` | Forecasting data | ✅ | 60/min |
| `GET` | `/user-dashboard/analytics/correlations` | Correlation analysis | ✅ | 60/min |
| `GET` | `/user-dashboard/analytics/export` | Export analytics data | ✅ | 10/min |

#### **Settings & Payments**
| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| `GET` | `/user-dashboard/settings` | Get company settings | ✅ | 60/min |
| `PUT` | `/user-dashboard/settings` | Update company settings | ✅ | 30/min |
| `GET` | `/user-dashboard/payments` | Get payment history | ✅ | 60/min |
| `PUT` | `/user-dashboard/bookings/:id/payment` | Update booking payment | ✅ | 30/min |
| `GET` | `/user-dashboard/payments/:id/invoice` | Get payment invoice | ✅ | 60/min |
| `POST` | `/user-dashboard/payments/process` | Process payment | ✅ | 30/min |

### 📊 **Monitoring (`/monitoring`)**

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| `GET` | `/monitoring/health` | System health status | ✅ | 60/min |
| `GET` | `/monitoring/metrics` | System metrics | ✅ | 60/min |
| `POST` | `/monitoring/health/update` | Update health metrics | ✅ | 30/min |
| `GET` | `/monitoring/performance` | Performance metrics | ✅ | 60/min |
| `GET` | `/monitoring/errors` | Error statistics | ✅ | 60/min |
| `GET` | `/monitoring/realtime` | Real-time monitoring | ✅ | 60/min |
| `GET` | `/monitoring/trends` | Trend analysis | ✅ | 60/min |
| `GET` | `/monitoring/alerts` | System alerts | ✅ | 60/min |
| `GET` | `/monitoring/logs` | System logs | ✅ | 60/min |
| `POST` | `/monitoring/alerts/acknowledge` | Acknowledge alert | ✅ | 30/min |

## 🔧 **Middleware Stack**

### **Security Middleware**
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Configurable per endpoint
- **Request Validation**: Input sanitization and validation
- **Authentication**: JWT token verification
- **Authorization**: Role-based access control

### **Performance Middleware**
- **Compression**: Response compression
- **Caching**: API response caching
- **Request Logging**: Performance tracking
- **Error Handling**: Centralized error management

### **File Upload Middleware**
- **Multer**: File upload handling
- **File Validation**: Type and size validation
- **Virus Scanning**: File security checks
- **Storage Management**: Organized file storage

## 🔒 **Security Features**

### **Authentication**
- **JWT Tokens**: Bearer token authentication with refresh tokens
- **Password Security**: bcrypt with configurable salt rounds
- **Session Management**: IP tracking and user agent logging
- **Multi-factor Authentication**: TOTP support (planned)

### **Authorization**
- **Role-Based Access Control**: admin, supplier, driver, customer
- **Permission System**: Granular permissions per resource
- **Company Isolation**: Multi-tenant data separation
- **Resource Ownership**: User-specific data access

### **Security Headers**
- **CORS**: Configurable allowed origins
- **Helmet**: Comprehensive security headers
- **CSRF Protection**: Token-based protection
- **Request Sanitization**: Input validation and sanitization
- **SQL Injection Prevention**: Parameterized queries

### **Rate Limiting**
- **Endpoint-specific limits**: Different limits per endpoint
- **User-based tracking**: Per-user rate limiting
- **IP-based fallback**: IP address tracking
- **Configurable windows**: Flexible time windows

## 📊 **Response Formats**

### **Success Response**
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123456789"
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
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123456789"
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
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### **File Upload Response**
```json
{
  "success": true,
  "data": {
    "fileId": "file_123456789",
    "filename": "document.pdf",
    "size": 1024000,
    "mimeType": "application/pdf",
    "url": "/uploads/documents/document.pdf",
    "uploadedAt": "2024-01-15T10:30:00Z"
  },
  "message": "File uploaded successfully"
}
```

## 🚀 **Performance Features**

### **Caching Strategy**
- **API Response Caching**: In-memory cache with TTL
- **Database Query Optimization**: Prepared statements and indexing
- **Connection Pooling**: Efficient database connections
- **Static Asset Caching**: CDN-ready asset serving

### **Monitoring & Analytics**
- **Request/Response Logging**: Comprehensive performance tracking
- **Error Tracking**: Detailed error logging and reporting
- **Health Checks**: System status monitoring
- **Metrics Collection**: Performance analytics and alerting

### **Optimization Techniques**
- **Lazy Loading**: Component-based loading
- **Data Pagination**: Efficient data retrieval
- **Polling Optimization**: Timestamp-based updates
- **Compression**: Response compression (gzip/brotli)
- **Database Indexing**: Optimized query performance

## 📝 **API Documentation**

### **Swagger UI**
- **URL**: `/api-docs`
- **Interactive Documentation**: Test endpoints directly
- **Schema Definitions**: Complete request/response schemas
- **Authentication**: Bearer token support
- **Examples**: Request/response examples

### **Health Check**
- **URL**: `/health`
- **Database Status**: Connection verification
- **System Metrics**: Memory, CPU, uptime
- **Environment Info**: Configuration details
- **Dependencies**: External service status

## 🔄 **WebSocket Support**

### **Real-time Features**
- **Connection Status**: WebSocket health monitoring
- **Real-time Updates**: Live data synchronization
- **Event Broadcasting**: System-wide notifications
- **Status Indicators**: Connection state management
- **Reconnection Logic**: Automatic reconnection handling

### **WebSocket Events**
```javascript
// Connection events
'connect'           // Client connected
'disconnect'        // Client disconnected
'reconnect'         // Client reconnected

// Data events
'booking_update'    // Booking status changes
'notification'      // New notifications
'system_alert'      // System alerts
'status_change'     // Status updates
```

## 🛠 **Development Tools**

### **Environment Configuration**
- **Development**: `.env.development`
- **Production**: `.env.production`
- **Testing**: `.env.test`
- **Local Override**: `.env.local`

### **Database Management**
- **Migrations**: Automated schema updates
- **Seeds**: Initial data population
- **Backup**: Automated database backups
- **Monitoring**: Query performance tracking

### **Testing Support**
- **Unit Tests**: Jest framework
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full workflow testing
- **Performance Tests**: Load testing support

This comprehensive API structure provides a robust, scalable, and secure foundation for the inflight-login system with proper authentication, authorization, monitoring, and performance optimization features. 