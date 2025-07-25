const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inflight Admin API',
      version: '1.0.0',
      description: 'API documentation for the Inflight Admin Dashboard system',
      contact: {
        name: 'Inflight Development Team',
        email: 'dev@inflight.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://api.inflight.com/api/v1',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Dashboard',
        description: 'Dashboard metrics and analytics endpoints'
      },
      {
        name: 'User Dashboard - Drivers',
        description: 'Driver management endpoints for user dashboard'
      },
      {
        name: 'User Dashboard - Vehicles',
        description: 'Vehicle management endpoints for user dashboard'
      },
      {
        name: 'User Dashboard - Documents',
        description: 'Document management endpoints for user dashboard'
      },
      {
        name: 'Suppliers',
        description: 'Supplier management endpoints'
      },
      {
        name: 'Monitoring',
        description: 'System monitoring and health check endpoints'
      },
      {
        name: 'Admin',
        description: 'Administrative endpoints (admin role required)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['user', 'admin', 'driver'] },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            status: { type: 'string', enum: ['active', 'inactive'] },
            company_id: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['email', 'role']
        },
        Supplier: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            supplier_name: { type: 'string' },
            contact_email: { type: 'string', format: 'email' },
            contact_phone: { type: 'string' },
            address: { type: 'string' },
            status: { type: 'string', enum: ['active', 'pending', 'suspended'] },
            portfolio_details: { type: 'object' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['supplier_name', 'contact_email']
        },
        Driver: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            company_id: { type: 'integer' },
            user_id: { type: 'integer' },
            license_number: { type: 'string' },
            address: { type: 'string' },
            status: { type: 'string', enum: ['active', 'pending', 'suspended'] },
            documents: { type: 'object' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['license_number', 'company_id']
        },
        Vehicle: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            company_id: { type: 'integer' },
            vehicle_number: { type: 'string' },
            vehicle_type: { type: 'string' },
            capacity: { type: 'integer' },
            status: { type: 'string', enum: ['active', 'maintenance', 'retired'] },
            driver_id: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['vehicle_number', 'company_id']
        },
        Document: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            document_name: { type: 'string' },
            document_type: { type: 'string' },
            file_path: { type: 'string' },
            file_size: { type: 'integer' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['active', 'archived'] },
            uploaded_by: { type: 'integer' },
            company_id: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['document_name', 'document_type', 'file_path']
        },
        DashboardStats: {
          type: 'object',
          properties: {
            totalSuppliers: { type: 'integer' },
            activeSuppliers: { type: 'integer' },
            pendingSuppliers: { type: 'integer' },
            totalDrivers: { type: 'integer' },
            activeDrivers: { type: 'integer' },
            totalVehicles: { type: 'integer' },
            totalRevenue: { type: 'number', format: 'float' },
            monthlyGrowth: { type: 'number', format: 'float' }
          }
        },
        SystemHealth: {
          type: 'object',
          properties: {
            healthScore: { type: 'number', format: 'float' },
            dbResponseTime: { type: 'string' },
            apiResponseTime: { type: 'string' },
            activeSessions: { type: 'integer' },
            systemErrors: { type: 'integer' },
            status: { type: 'string', enum: ['healthy', 'warning', 'critical'] },
            lastCheck: { type: 'string', format: 'date-time' }
          }
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' }
          },
          required: ['email', 'password']
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        CreateDriverRequest: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            licenseNumber: { type: 'string' },
            address: { type: 'string' },
            ndaStatus: { type: 'string', enum: ['Signed', 'Pending', 'Rejected'] }
          },
          required: ['firstName', 'lastName', 'email', 'licenseNumber']
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            pages: { type: 'integer' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                statusCode: { type: 'integer' }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.js']
};

const specs = swaggerJSDoc(options);

module.exports = specs; 