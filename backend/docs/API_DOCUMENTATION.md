# Inflight Admin API Documentation

## Overview

The Inflight Admin API is a RESTful API service that provides comprehensive management capabilities for the Inflight dashboard system. This API supports user authentication, driver management, vehicle tracking, document management, and dashboard analytics.

## Base URL

- **Development**: `http://localhost:3001/api/v1`
- **Production**: `https://api.inflight.com/api/v1`

## Interactive Documentation

Access the interactive Swagger UI documentation at:
- **Local**: http://localhost:3001/api-docs
- **Production**: https://api.inflight.com/api-docs

## Authentication

All API endpoints (except authentication endpoints) require Bearer token authentication using JWT.

### Getting a Token

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@inflight.com",
    "password": "your_password"
  }'
```

### Using the Token

Include the token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/v1/dashboard/overview
```

## API Endpoints Overview

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get user profile
- `POST /auth/create-demo-admin` - Create demo admin (dev only)

### Dashboard
- `GET /dashboard/overview` - Get dashboard metrics
- `GET /dashboard/revenue` - Get revenue data
- `GET /dashboard/booking-stats` - Get booking statistics
- `GET /dashboard/top-performers` - Get top performing entities

### User Dashboard
- `GET /user-dashboard/profile` - Get user profile
- `GET /user-dashboard/statistics` - Get user statistics
- `POST /user-dashboard/drivers` - Create new driver
- `GET /user-dashboard/drivers` - List drivers
- `PUT /user-dashboard/drivers/:id` - Update driver
- `DELETE /user-dashboard/drivers/:id` - Delete driver
- `GET /user-dashboard/vehicles` - List vehicles
- `POST /user-dashboard/vehicles` - Create vehicle
- `GET /user-dashboard/documents` - List documents
- `POST /user-dashboard/documents` - Upload document

### Suppliers
- `GET /suppliers` - List suppliers
- `POST /suppliers` - Create supplier
- `GET /suppliers/:id` - Get supplier details
- `PUT /suppliers/:id` - Update supplier
- `DELETE /suppliers/:id` - Delete supplier

### Monitoring
- `GET /monitoring/health` - System health check
- `GET /monitoring/metrics` - System metrics

### Admin
- `GET /admin/users` - List users (admin only)
- `GET /admin/system-stats` - System statistics (admin only)

## Request/Response Format

### Standard Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "statusCode": 400
  }
}
```

## Common HTTP Status Codes

- `200` - OK: Request successful
- `201` - Created: Resource created successfully
- `400` - Bad Request: Invalid request data
- `401` - Unauthorized: Authentication required
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `429` - Too Many Requests: Rate limit exceeded
- `500` - Internal Server Error: Server error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per 15 minutes
- **API endpoints**: 100 requests per 15 minutes
- **File upload endpoints**: 10 requests per hour

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit for the time window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## Security Features

### Input Validation
- All inputs are validated using Joi schemas
- SQL injection protection via parameterized queries
- XSS protection through input sanitization

### Security Headers
- CSRF protection
- Security headers (HSTS, CSP, etc.)
- Request sanitization

### Authentication Security
- JWT tokens with secure secret
- Password hashing with bcrypt
- Rate limiting on auth endpoints

## Pagination

List endpoints support pagination using query parameters:

```
GET /api/v1/suppliers?page=1&limit=10&sort=created_at&order=desc
```

**Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Sort field (default: created_at)
- `order`: Sort direction (asc/desc, default: desc)

**Response includes pagination metadata:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "pages": 15
    }
  }
}
```

## Filtering and Search

Many endpoints support filtering and search:

```
GET /api/v1/drivers?status=active&search=john&date_from=2024-01-01
```

Common filters:
- `status`: Filter by status
- `search`: Text search in relevant fields
- `date_from` / `date_to`: Date range filtering
- `type`: Filter by type/category

## Error Handling

### Validation Errors
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Invalid email format",
      "password": "Password too short"
    },
    "statusCode": 400
  }
}
```

### Authentication Errors
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid credentials",
    "statusCode": 401
  }
}
```

## Examples

### Create a Driver
```bash
curl -X POST http://localhost:3001/api/v1/user-dashboard/drivers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "licenseNumber": "DL123456789",
    "address": "123 Main St",
    "ndaStatus": "Signed"
  }'
```

### Get Dashboard Overview
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/v1/dashboard/overview
```

### List Suppliers with Pagination
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/v1/suppliers?page=1&limit=5&status=active"
```

## Development

### Testing the API

Use the interactive Swagger UI at `/api-docs` for testing endpoints directly in the browser.

For automated testing:
```bash
cd backend
npm test
```

### Adding New Endpoints

1. Add route handlers in appropriate route files
2. Add JSDoc Swagger annotations
3. Update schemas in `docs/swagger.js` if needed
4. Add tests for new endpoints
5. Update this documentation

### Swagger Annotations Format

```javascript
/**
 * @swagger
 * /endpoint:
 *   post:
 *     summary: Brief description
 *     description: Detailed description
 *     tags: [Tag Name]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SchemaName'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseSchema'
 */
```

## Support

For API support or questions:
- Documentation: Check the interactive Swagger UI
- Issues: Create an issue in the project repository
- Contact: dev@inflight.com 