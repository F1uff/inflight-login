const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { getConnection, getDatabase } = require('../config/database');
const DataUtilityService = require('../services/DataUtilityService');
const { authenticateToken } = require('../middleware/auth');
const { validateInput, validationSchemas } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// Apply proper authentication middleware to all routes
router.use(authenticateToken);

// GET /api/v1/user-dashboard/drivers
router.get('/drivers', validateInput(validationSchemas.search), async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    
    // Use validated query parameters
    const { page = 1, limit = 50, status, search, timestamp } = req.validatedData || req.query;
    const company_id = req.user.company_id;
    
    // Check for polling request with timestamp
    if (timestamp) {
      const lastCheckTime = new Date(parseInt(timestamp));
      const checkQuery = `
        SELECT COUNT(*) as count 
        FROM drivers d 
        LEFT JOIN users u ON d.user_id = u.id 
        WHERE d.company_id = $1 AND (d.updated_at > $2 OR u.updated_at > $3)
      `;
      
      try {
        const result = await pool.query(checkQuery, [company_id, lastCheckTime.toISOString(), lastCheckTime.toISOString()]);
        const hasUpdates = result.rows[0].count > 0;
        
        if (!hasUpdates) {
          return res.json({
            success: true,
            hasUpdates: false,
            timestamp: new Date().toISOString()
          });
        }
        
        // If there are updates, fetch and return the current drivers data
        const queryData = DataUtilityService.buildDriverQuery({
          company_id,
          admin_view: false,
          status,
          search
        });

        const drivers = await pool.query(queryData.query, queryData.params);
        
        res.json({
          success: true,
          hasUpdates: true,
          drivers: drivers.rows || [],
          timestamp: new Date().toISOString()
        });
        return;
      } catch (err) {
        console.error('Drivers timestamp check error:', err);
        return res.status(500).json({
          success: false,
          error: { message: 'Failed to check for updates' },
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Regular data fetch (no timestamp parameter)
    // User sees only their company using shared logic
    const queryData = DataUtilityService.buildDriverQuery({
      company_id,
      admin_view: false,
      status,
      search
    });

    const offset = (page - 1) * limit;
    const driversQuery = queryData.query + ` LIMIT $${queryData.params.length + 1} OFFSET $${queryData.params.length + 2}`;
    const driversParams = [...queryData.params, limit, offset];

    try {
      const drivers = await pool.query(driversQuery, driversParams);
      const countResult = await pool.query(queryData.countQuery, queryData.countParams);

      // Get summary data for this company
      const summaryQueries = DataUtilityService.buildSummaryQueries({ company_id, admin_view: false });
      const summary = await pool.query(summaryQueries.drivers.query, summaryQueries.drivers.params);

      // Status counts query (company-specific)
      const statusQuery = `
        SELECT 
          d.status,
          COUNT(*) as count
        FROM drivers d
        WHERE d.company_id = $1
        GROUP BY d.status
      `;

      const statusCounts = await pool.query(statusQuery, [company_id]);

      // Format status counts
      const statusCountsObj = {
        active: 0,
        pending: 0,
        inactive: 0
      };

      statusCounts.rows.forEach(item => {
        if (Object.prototype.hasOwnProperty.call(statusCountsObj, item.status)) {
          statusCountsObj[item.status] = item.count;
        }
      });

      const response = DataUtilityService.formatResponse(
        true,
        {
          drivers: drivers.rows || [],
          summary: {
            regular: summary.rows[0]?.regular || 0,
            subcon: summary.rows[0]?.subcon || 0,
            total: summary.rows[0]?.total || 0
          },
          statusCounts: statusCountsObj,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: countResult.rows[0].total,
            totalPages: Math.ceil(countResult.rows[0].total / limit)
          }
        },
        null,
        'user'
      );

      res.json(response);
    } catch (err) {
      console.error('User drivers query error:', err);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch drivers data',
          details: err.message
        },
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Drivers endpoint error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        details: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/user-dashboard/vehicles
router.get('/vehicles', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const { page = 1, limit = 50, status, search, timestamp } = req.query;
    const company_id = req.user.company_id;
    
    // Check for polling request with timestamp
    if (timestamp) {
      const lastCheckTime = new Date(parseInt(timestamp));
      const checkQuery = `
        SELECT COUNT(*) as count 
        FROM vehicles v 
        WHERE v.company_id = $1 AND v.updated_at > $2
      `;
      
      try {
        const result = await pool.query(checkQuery, [company_id, lastCheckTime.toISOString()]);
        const hasUpdates = result.rows[0].count > 0;
        
        if (!hasUpdates) {
          return res.json({
            success: true,
            hasUpdates: false,
            timestamp: new Date().toISOString()
          });
        }
        
        // If there are updates, fetch and return the current vehicles data
        const queryData = DataUtilityService.buildVehicleQuery({
          company_id,
          admin_view: false,
          status,
          search
        });

        const vehicles = await pool.query(queryData.query, queryData.params);
        
        res.json({
          success: true,
          hasUpdates: true,
          vehicles: vehicles.rows || [],
          timestamp: new Date().toISOString()
        });
        return;
      } catch (err) {
        console.error('Vehicles timestamp check error:', err);
        return res.status(500).json({
          success: false,
          error: { message: 'Failed to check for updates' },
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Regular data fetch (no timestamp parameter)
    // User sees only their company using shared logic
    const queryData = DataUtilityService.buildVehicleQuery({
      company_id,
      admin_view: false,
      status,
      search
    });

    const offset = (page - 1) * limit;
    const vehiclesQuery = queryData.query + ` LIMIT $${queryData.params.length + 1} OFFSET $${queryData.params.length + 2}`;
    const vehiclesParams = [...queryData.params, limit, offset];

    try {
      const vehicles = await pool.query(vehiclesQuery, vehiclesParams);
      const countResult = await pool.query(queryData.countQuery, queryData.countParams);

      // Get summary data for this company
      const summaryQueries = DataUtilityService.buildSummaryQueries({ company_id, admin_view: false });
      const summary = await pool.query(summaryQueries.vehicles.query, summaryQueries.vehicles.params);

      // Status counts query (company-specific)
      const statusQuery = `
        SELECT 
          v.status,
          COUNT(*) as count
        FROM vehicles v
        WHERE v.company_id = $1
        GROUP BY v.status
      `;

      const statusCounts = await pool.query(statusQuery, [company_id]);

      // Format status counts
      const statusCountsObj = {
        active: 0,
        pending: 0,
        inactive: 0
      };

      statusCounts.rows.forEach(item => {
        if (Object.prototype.hasOwnProperty.call(statusCountsObj, item.status)) {
          statusCountsObj[item.status] = item.count;
        }
      });

      const response = DataUtilityService.formatResponse(
        true,
        {
          vehicles: vehicles.rows || [],
          summary: {
            company: summary.rows[0]?.company || 0,
            subcon: summary.rows[0]?.subcon || 0,
            total: summary.rows[0]?.total || 0
          },
          statusCounts: statusCountsObj,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: countResult.rows[0].total,
            totalPages: Math.ceil(countResult.rows[0].total / limit)
          }
        },
        null,
        'user'
      );

      res.json(response);
    } catch (err) {
      console.error('User vehicles query error:', err);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch vehicles data',
          details: err.message
        },
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Vehicles endpoint error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        details: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/user-dashboard/bookings
router.get('/bookings', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const { page = 1, limit = 50, status, date_from, date_to } = req.query;
    const company_id = req.user.company_id;
    
    // User sees only their company using shared logic
    const queryData = DataUtilityService.buildBookingQuery({
      company_id,
      admin_view: false,
      status,
      date_from,
      date_to
    });

    const offset = (page - 1) * limit;
    const bookingsQuery = queryData.query + ` LIMIT $${queryData.params.length + 1} OFFSET $${queryData.params.length + 2}`;
    const bookingsParams = [...queryData.params, limit, offset];

    try {
      const bookings = await pool.query(bookingsQuery, bookingsParams);
      const countResult = await pool.query(queryData.countQuery, queryData.countParams);

      // Get summary data for this company
      const summaryQueries = DataUtilityService.buildSummaryQueries({ company_id, admin_view: false });
      const summary = await pool.query(summaryQueries.bookings.query, summaryQueries.bookings.params);

      const response = DataUtilityService.formatResponse(
        true,
        {
          bookings: bookings.rows || [],
          summary: {
            total: summary.rows[0]?.total || 0,
            completed: summary.rows[0]?.completed || 0,
            pending: summary.rows[0]?.pending || 0,
            cancelled: summary.rows[0]?.cancelled || 0,
            active: summary.rows[0]?.active || 0,
            totalRevenue: parseFloat(summary.rows[0]?.total_revenue || 0).toFixed(2),
            pendingRevenue: parseFloat(summary.rows[0]?.pending_revenue || 0).toFixed(2)
          },
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: countResult.rows[0].total,
            totalPages: Math.ceil(countResult.rows[0].total / limit)
          }
        },
        null,
        'user'
      );

      res.json(response);
    } catch (err) {
      console.error('User bookings query error:', err);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch bookings data',
          details: err.message
        },
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('User bookings endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// GET /api/v1/user-dashboard/activities
router.get('/activities', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const { page = 1, limit = 20, days = 30 } = req.query;
    const company_id = req.user.company_id;
    
    // Calculate the date threshold for filtering activities
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    const dateThreshold = cutoffDate.toISOString();

    // Combined activities query with UNION
    const activitiesQuery = `
      SELECT * FROM (
        SELECT 
          DATE(d.created_at) as date,
          'Driver' as type,
          d.license_number || ' - ' || COALESCE(u.first_name || ' ' || u.last_name, 'Unknown Driver') as idName,
          'Registration' as action,
          d.status,
          d.created_at as sort_date,
          d.company_id
        FROM drivers d
        LEFT JOIN users u ON d.user_id = u.id
        WHERE d.company_id = $1 AND d.created_at >= $2
        
        UNION ALL
        
        SELECT 
          DATE(v.created_at) as date,
          'Vehicle' as type,
          v.plate_number || ' - ' || COALESCE(v.make || ' ' || v.model, 'Unknown Vehicle') as idName,
          'Registration' as action,
          v.status,
          v.created_at as sort_date,
          v.company_id
        FROM vehicles v
        WHERE v.company_id = $3 AND v.created_at >= $4
        
        UNION ALL
        
        SELECT 
          DATE(b.created_at) as date,
          'Booking' as type,
          b.booking_reference || ' - ' || COALESCE(b.contact_person_name, 'Unknown Passenger') as idName,
          'Created' as action,
          CASE 
            WHEN b.booking_status = 'completed' THEN 'active'
            WHEN b.booking_status = 'cancelled' THEN 'inactive'
            ELSE 'pending'
          END as status,
          b.created_at as sort_date,
          b.company_id
        FROM bookings b
        WHERE b.company_id = $5 AND b.created_at >= $6
      ) as activities
      ORDER BY sort_date DESC
      LIMIT $7 OFFSET $8
    `;

    const offset = (page - 1) * limit;
    const params = [
      company_id, dateThreshold,  // drivers
      company_id, dateThreshold,  // vehicles  
      company_id, dateThreshold,  // bookings
      limit, offset               // pagination
    ];
    
    const activities = await pool.query(activitiesQuery, params);
    
    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) as total FROM (
        SELECT 1 FROM drivers d WHERE d.company_id = $1 AND d.created_at >= $2
        UNION ALL
        SELECT 1 FROM vehicles v WHERE v.company_id = $3 AND v.created_at >= $4
        UNION ALL
        SELECT 1 FROM bookings b WHERE b.company_id = $5 AND b.created_at >= $6
      ) as activity_count
    `;
    
    const countParams = [
      company_id, dateThreshold,  // drivers
      company_id, dateThreshold,  // vehicles
      company_id, dateThreshold   // bookings
    ];
    
    const countResult = await pool.query(countQuery, countParams);

    const response = DataUtilityService.formatResponse(
      true,
      {
        activities: activities.rows || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.rows[0].total,
          totalPages: Math.ceil(countResult.rows[0].total / limit)
        },
        timeframe: parseInt(days)
      },
      null,
      'user'
    );

    res.json(response);

  } catch (error) {
    console.error('User activities endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * @swagger
 * /user-dashboard/drivers:
 *   post:
 *     summary: Create new driver
 *     description: Create a new driver and associated user account with secure password generation
 *     tags: [User Dashboard - Drivers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDriverRequest'
 *           example:
 *             firstName: "John"
 *             lastName: "Doe"
 *             email: "john.doe@example.com"
 *             phone: "+1234567890"
 *             licenseNumber: "DL123456789"
 *             address: "123 Main St, City, State 12345"
 *             ndaStatus: "Signed"
 *     responses:
 *       201:
 *         description: Driver created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 id: "DL123456789"
 *                 message: "Driver created successfully. Temporary password has been generated."
 *                 requiresPasswordReset: true
 *               timestamp: "2024-01-01T12:00:00.000Z"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/drivers', validateInput(validationSchemas.createDriver), asyncHandler(async (req, res) => {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const company_id = req.user.company_id;
    
    // Use validated and sanitized data from middleware
    const { firstName, lastName, email, phone, licenseNumber, address, ndaStatus } = req.validatedData;

    // Generate secure temporary password and hash it
    const tempPassword = crypto.randomBytes(12).toString('hex'); // 24 character secure password
    const hashedPassword = await bcrypt.hash(tempPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);

    // Create user first
    const userQuery = `
      INSERT INTO users (email, password_hash, role, first_name, last_name, phone, password_reset_required)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
    `;
    
    const userResult = await pool.query(userQuery, [email, hashedPassword, 'driver', firstName, lastName, phone || null, true]);
    const userId = userResult.rows[0].id;

    // Create driver
    const driverQuery = `
      INSERT INTO drivers (company_id, user_id, license_number, address, status, documents)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    const documents = JSON.stringify({ nda_status: ndaStatus || 'Pending' });
    await pool.query(driverQuery, [company_id, userId, licenseNumber, address || null, 'pending', documents]);

            // Send email with temporary password to user
    // In production, implement email service to send tempPassword to the user

    res.status(201).json({
      success: true,
      data: {
        id: licenseNumber,
        message: 'Driver created successfully. Temporary password has been generated.',
        requiresPasswordReset: true
      },
      timestamp: new Date().toISOString()
    });
}));

// POST /api/v1/user-dashboard/drivers/upload-documents - Upload driver documents
const { uploadDriverDocuments, handleMulterError } = require('../middleware/fileUpload');

router.post('/drivers/upload-documents', uploadDriverDocuments, handleMulterError, async (req, res) => {
    try {
        const { getConnection } = require('../config/database');
        const pool = getConnection();
        const company_id = req.user.company_id;
        
        const { driverId } = req.body;
        
        if (!driverId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_DRIVER_ID',
                    message: 'Driver ID is required'
                }
            });
        }

        // Verify driver belongs to the company
        const driverCheck = await pool.query(
            'SELECT id FROM drivers WHERE id = $1 AND company_id = $2',
            [driverId, company_id]
        );

        if (driverCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'DRIVER_NOT_FOUND',
                    message: 'Driver not found or access denied'
                }
            });
        }

        const uploadedFiles = {
            driverLicense: null,
            ndaDocument: null,
            additionalDocuments: []
        };

        // Process uploaded files
        if (req.files) {
            if (req.files.driverLicense) {
                uploadedFiles.driverLicense = {
                    originalName: req.files.driverLicense[0].originalname,
                    filename: req.files.driverLicense[0].filename,
                    path: req.files.driverLicense[0].path,
                    size: req.files.driverLicense[0].size
                };
            }

            if (req.files.ndaDocument) {
                uploadedFiles.ndaDocument = {
                    originalName: req.files.ndaDocument[0].originalname,
                    filename: req.files.ndaDocument[0].filename,
                    path: req.files.ndaDocument[0].path,
                    size: req.files.ndaDocument[0].size
                };
            }

            if (req.files.additionalDocuments) {
                uploadedFiles.additionalDocuments = req.files.additionalDocuments.map(file => ({
                    originalName: file.originalname,
                    filename: file.filename,
                    path: file.path,
                    size: file.size
                }));
            }
        }

        // Update driver with document information
        const documentsJson = JSON.stringify(uploadedFiles);
        await pool.query(
            'UPDATE drivers SET documents = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [documentsJson, driverId]
        );

        res.json({
            success: true,
            data: {
                message: 'Documents uploaded successfully',
                uploadedFiles: uploadedFiles
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Driver document upload error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'UPLOAD_ERROR',
                message: 'Failed to upload driver documents',
                details: error.message
            }
        });
         }
 });

 // POST /api/v1/user-dashboard/vehicles/upload-documents - Upload vehicle photos/documents
 router.post('/vehicles/upload-documents', uploadDriverDocuments, handleMulterError, async (req, res) => {
     try {
         const { getConnection } = require('../config/database');
         const pool = getConnection();
         const company_id = req.user.company_id;
         
         const { vehicleId } = req.body;
         
         if (!vehicleId) {
             return res.status(400).json({
                 success: false,
                 error: {
                     code: 'MISSING_VEHICLE_ID',
                     message: 'Vehicle ID is required'
                 }
             });
         }

         // Verify vehicle belongs to the company
         const vehicleCheck = await pool.query(
             'SELECT id FROM vehicles WHERE id = $1 AND company_id = $2',
             [vehicleId, company_id]
         );

         if (vehicleCheck.rows.length === 0) {
             return res.status(404).json({
                 success: false,
                 error: {
                     code: 'VEHICLE_NOT_FOUND',
                     message: 'Vehicle not found or access denied'
                 }
             });
         }

         const uploadedFiles = {
             exteriorPhoto: null,
             interiorPhoto: null,
             additionalDocuments: []
         };

         // Process uploaded files (using same field names as multer config)
         if (req.files) {
             if (req.files.driverLicense) { // Reusing driver license field for exterior photo
                 uploadedFiles.exteriorPhoto = {
                     originalName: req.files.driverLicense[0].originalname,
                     filename: req.files.driverLicense[0].filename,
                     path: req.files.driverLicense[0].path,
                     size: req.files.driverLicense[0].size
                 };
             }

             if (req.files.ndaDocument) { // Reusing NDA field for interior photo
                 uploadedFiles.interiorPhoto = {
                     originalName: req.files.ndaDocument[0].originalname,
                     filename: req.files.ndaDocument[0].filename,
                     path: req.files.ndaDocument[0].path,
                     size: req.files.ndaDocument[0].size
                 };
             }

             if (req.files.additionalDocuments) {
                 uploadedFiles.additionalDocuments = req.files.additionalDocuments.map(file => ({
                     originalName: file.originalname,
                     filename: file.filename,
                     path: file.path,
                     size: file.size
                 }));
             }
         }

         // Update vehicle with document information
         const documentsJson = JSON.stringify(uploadedFiles);
         await pool.query(
             'UPDATE vehicles SET documents = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
             [documentsJson, vehicleId]
         );

         res.json({
             success: true,
             data: {
                 message: 'Vehicle photos uploaded successfully',
                 uploadedFiles: uploadedFiles
             },
             timestamp: new Date().toISOString()
         });

     } catch (error) {
         console.error('Vehicle document upload error:', error);
         res.status(500).json({
             success: false,
             error: {
                 code: 'UPLOAD_ERROR',
                 message: 'Failed to upload vehicle photos',
                 details: error.message
             }
         });
     }
 });

 // PUT /api/v1/user-dashboard/drivers/:id - Update driver
router.put('/drivers/:id', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const company_id = req.user.company_id;
    const licenseNumber = req.params.id;
    const { firstName, lastName, email, phone, address, ndaStatus, status } = req.body;

    // Check if driver exists and belongs to company
    const checkQuery = `
      SELECT d.id, d.user_id FROM drivers d 
      WHERE d.license_number = $1 AND d.company_id = $2
    `;

    const driverResult = await pool.query(checkQuery, [licenseNumber, company_id]);
    
    if (driverResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Driver not found or access denied'
        },
        timestamp: new Date().toISOString()
      });
    }

    const driver = driverResult.rows[0];

    // Update user info
    const userQuery = `
      UPDATE users 
      SET first_name = $1, last_name = $2, email = $3, phone = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
    `;

    await pool.query(userQuery, [firstName, lastName, email, phone, driver.user_id]);

    // Update driver info
    const documents = JSON.stringify({ nda_status: ndaStatus || 'Pending' });
    const driverQuery = `
      UPDATE drivers 
      SET address = $1, status = $2, documents = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `;

    await pool.query(driverQuery, [address, status || 'pending', documents, driver.id]);

    res.json({
      success: true,
      data: {
        id: licenseNumber,
        message: 'Driver updated successfully'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        details: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/user-dashboard/drivers/:id - Delete driver
router.delete('/drivers/:id', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const company_id = req.user.company_id;
    const licenseNumber = req.params.id;

    // Check if driver exists and belongs to company
    const checkQuery = `
      SELECT d.id, d.user_id FROM drivers d 
      WHERE d.license_number = $1 AND d.company_id = $2
    `;

    const driverResult = await pool.query(checkQuery, [licenseNumber, company_id]);
    
    if (driverResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Driver not found or access denied'
        },
        timestamp: new Date().toISOString()
      });
    }

    const driver = driverResult.rows[0];

    // Delete driver (this will cascade to user if no other references)
    const deleteQuery = `DELETE FROM drivers WHERE id = $1`;

    await pool.query(deleteQuery, [driver.id]);

    res.json({
      success: true,
      data: {
        id: licenseNumber,
        message: 'Driver deleted successfully'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        details: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/user-dashboard/vehicles - Create new vehicle
router.post('/vehicles', validateInput(validationSchemas.createVehicle), async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const company_id = req.user.company_id;
    
    // Use validated and sanitized data from middleware
    const { plateNumber, make, model, year, color, vehicleType, features } = req.validatedData;

    const vehicleQuery = `
      INSERT INTO vehicles (company_id, plate_number, make, model, year, color, vehicle_type, features, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    const featuresJson = JSON.stringify(features || []);
    const vehicleParams = [
      company_id, 
      plateNumber, 
      make, 
      model, 
      year || null, 
      color || null, 
      vehicleType, 
      featuresJson, 
      'pending'
    ];

    await pool.query(vehicleQuery, vehicleParams);

    res.status(201).json({
      success: true,
      data: {
        id: plateNumber,
        message: 'Vehicle created successfully'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        details: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/user-dashboard/vehicles/:id - Update vehicle
router.put('/vehicles/:id', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const company_id = req.user.company_id;
    const plateNumber = req.params.id;
    const { make, model, year, color, vehicleType, features, status } = req.body;

    // Check if vehicle exists and belongs to company
    const checkQuery = `
      SELECT id FROM vehicles 
      WHERE plate_number = $1 AND company_id = $2
    `;

    const vehicleResult = await pool.query(checkQuery, [plateNumber, company_id]);
    
    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Vehicle not found or access denied'
        },
        timestamp: new Date().toISOString()
      });
    }

    const vehicle = vehicleResult.rows[0];
    const featuresJson = JSON.stringify(features || []);
    const updateQuery = `
      UPDATE vehicles 
      SET make = $1, model = $2, year = $3, color = $4, vehicle_type = $5, features = $6, status = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
    `;

    await pool.query(updateQuery, [make, model, year, color, vehicleType, featuresJson, status || 'pending', vehicle.id]);

    res.json({
      success: true,
      data: {
        id: plateNumber,
        message: 'Vehicle updated successfully'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        details: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/user-dashboard/vehicles/:id - Delete vehicle
router.delete('/vehicles/:id', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const company_id = req.user.company_id;
    const plateNumber = req.params.id;

    // Check if vehicle exists and belongs to company
    const checkQuery = `
      SELECT id FROM vehicles 
      WHERE plate_number = $1 AND company_id = $2
    `;

    const vehicleResult = await pool.query(checkQuery, [plateNumber, company_id]);
    
    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Vehicle not found or access denied'
        },
        timestamp: new Date().toISOString()
      });
    }

    const vehicle = vehicleResult.rows[0];
    const deleteQuery = `DELETE FROM vehicles WHERE id = $1`;

    await pool.query(deleteQuery, [vehicle.id]);

    res.json({
      success: true,
      data: {
        id: plateNumber,
        message: 'Vehicle deleted successfully'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        details: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================================
// CRITICAL MISSING ENDPOINTS - PRIORITY 1
// ============================================================================

// ============================================================================
// BOOKINGS CRUD OPERATIONS
// ============================================================================

// POST /api/v1/user-dashboard/bookings - Create new booking
router.post('/bookings', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const company_id = req.user.company_id;
    const {
      tripType, serviceType, pickupAddress, destinationAddress,
      pickupDateTime, passengerCount, contactPersonName, contactPersonPhone,
      specialRequests, passengerNames, totalAmount
    } = req.body;

    // Validation
    if (!tripType || !serviceType || !pickupAddress || !destinationAddress || !pickupDateTime || !totalAmount) {
      return res.status(400).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 
        'Required fields missing: tripType, serviceType, pickupAddress, destinationAddress, pickupDateTime, totalAmount'
      ));
    }

    // Generate booking reference
    const bookingReference = 'BK' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();

    const bookingQuery = `
      INSERT INTO bookings (
        booking_reference, company_id, trip_type, service_type,
        pickup_address, destination_address, pickup_datetime,
        passenger_count, contact_person_name, contact_person_phone,
        special_requests, passenger_names, total_amount,
        booking_status, payment_status, currency
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id
    `;

    const bookingParams = [
      bookingReference, company_id, tripType, serviceType,
      pickupAddress, destinationAddress, pickupDateTime,
      passengerCount || 1, contactPersonName, contactPersonPhone,
      specialRequests, JSON.stringify(passengerNames || []), totalAmount,
      'request', 'pending', 'PHP'
    ];

    const result = await pool.query(bookingQuery, bookingParams);
    const bookingId = result.rows[0].id;

    // Fetch the created booking
    const fetchQuery = `
      SELECT 
        b.id, b.booking_reference, b.trip_type, b.service_type,
        b.pickup_address, b.destination_address, b.pickup_datetime,
        b.passenger_count, b.contact_person_name, b.contact_person_phone,
        b.special_requests, b.total_amount, b.booking_status, b.payment_status,
        b.created_at
      FROM bookings b
      WHERE b.id = $1
    `;

    const fetchResult = await pool.query(fetchQuery, [bookingId]);

    res.status(201).json(DataUtilityService.formatResponse(
      true,
      {
        booking: fetchResult.rows[0],
        message: 'Booking created successfully'
      },
      null,
      'user'
    ));

  } catch (error) {
    console.error('Create booking endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// GET /api/v1/user-dashboard/bookings/:id - Get single booking details
router.get('/bookings/:id', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const company_id = req.user.company_id;
    const bookingId = req.params.id;

    const bookingQuery = `
      SELECT 
        b.*,
        COALESCE(u.first_name || ' ' || u.last_name, 'Unassigned') as driver_name,
        COALESCE(u.phone, 'N/A') as driver_contact,
        COALESCE(v.plate_number, 'Unassigned') as vehicle_plate,
        COALESCE(v.make || ' ' || v.model, 'Unknown Vehicle') as vehicle_info
      FROM bookings b
      LEFT JOIN drivers d ON b.driver_id = d.id
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.id = ? AND b.company_id = ?
    `;

    const bookingResult = await pool.query(bookingQuery.replace(/\?/g, (match, index) => `$${index + 1}`), [bookingId, company_id]);
    
    if (bookingResult.rows.length === 0) {
      return res.status(404).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Booking not found'
      ));
    }

    const booking = bookingResult.rows[0];

    // Get booking status history (optional)
    let history = [];
    try {
      const historyQuery = `
        SELECT * FROM booking_status_history 
        WHERE booking_id = $1 
        ORDER BY created_at DESC
      `;
      const historyResult = await pool.query(historyQuery, [bookingId]);
      history = historyResult.rows;
    } catch (historyError) {
      console.log('Status history table not available:', historyError.message);
    }

    res.json(DataUtilityService.formatResponse(
      true,
      {
        booking: booking,
        statusHistory: history
      },
      null,
      'user'
    ));

  } catch (error) {
    console.error('Booking details endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// PUT /api/v1/user-dashboard/bookings/:id - Update booking
router.put('/bookings/:id', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const company_id = req.user.company_id;
    const bookingId = req.params.id;
    const updateData = req.body;

    // Check if booking exists and belongs to company
    const checkQuery = `
      SELECT id, booking_status FROM bookings 
      WHERE id = $1 AND company_id = $2
    `;

    const existingResult = await pool.query(checkQuery, [bookingId, company_id]);
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Booking not found'
      ));
    }

    const existingBooking = existingResult.rows[0];

    // Prevent updates to completed or cancelled bookings
    if (['done_service', 'cancelled'].includes(existingBooking.booking_status)) {
      return res.status(400).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Cannot update completed or cancelled bookings'
      ));
    }

    // Build update query dynamically
    const allowedFields = [
      'pickup_address', 'destination_address', 'pickup_datetime',
      'passenger_count', 'contact_person_name', 'contact_person_phone',
      'special_requests', 'passenger_names', 'total_amount'
    ];

    const updateFields = [];
    const updateParams = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(field => {
      if (allowedFields.includes(field) && updateData[field] !== undefined) {
        updateFields.push(`${field} = $${paramCount}`);
        updateParams.push(field === 'passenger_names' ? JSON.stringify(updateData[field]) : updateData[field]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'No valid fields to update'
      ));
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateParams.push(bookingId, company_id);

    const updateQuery = `
      UPDATE bookings 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount} AND company_id = $${paramCount + 1}
    `;

    const result = await pool.query(updateQuery, updateParams);

    if (result.rowCount === 0) {
      return res.status(404).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Booking not found or no changes made'
      ));
    }

    // Fetch updated booking
    const fetchQuery = `
      SELECT * FROM bookings WHERE id = $1 AND company_id = $2
    `;

    const updatedResult = await pool.query(fetchQuery, [bookingId, company_id]);

    res.json(DataUtilityService.formatResponse(
      true,
      {
        booking: updatedResult.rows[0],
        message: 'Booking updated successfully'
      },
      null,
      'user'
    ));

  } catch (error) {
    console.error('Update booking endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// PUT /api/v1/user-dashboard/bookings/:id/status - Update booking status
router.put('/bookings/:id/status', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const company_id = req.user.company_id;
    const bookingId = req.params.id;
    const { status, reason } = req.body;

    const allowedStatuses = ['request', 'on_going', 'done_service', 'cancelled'];
    
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json(DataUtilityService.formatResponse(
        false, null, null, 'user', `Status must be one of: ${allowedStatuses.join(', ')}`
      ));
    }

    // Check if booking exists
    const checkQuery = `
      SELECT id, booking_status FROM bookings 
      WHERE id = $1 AND company_id = $2
    `;

    const existingBooking = await pool.query(checkQuery, [bookingId, company_id]);
    
    if (existingBooking.rows.length === 0) {
      return res.status(404).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Booking not found'
      ));
    }

    const booking = existingBooking.rows[0];

    // Update booking status
    const updateQuery = `
      UPDATE bookings 
      SET booking_status = $1
      WHERE id = $2 AND company_id = $3
    `;

    await pool.query(updateQuery, [status, bookingId, company_id]);

    // Status history will be handled by database trigger if table exists

    res.json(DataUtilityService.formatResponse(
      true,
      {
        bookingId: bookingId,
        oldStatus: booking.booking_status,
        newStatus: status,
        reason: reason,
        message: 'Booking status updated successfully'
      },
      null,
      'user'
    ));

  } catch (error) {
    console.error('Update booking status endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// DELETE /api/v1/user-dashboard/bookings/:id - Cancel booking
router.delete('/bookings/:id', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const company_id = req.user.company_id;
    const bookingId = req.params.id;
    const { reason } = req.body;

    // Check if booking exists and can be cancelled
    const checkQuery = `
      SELECT id, booking_status, total_amount FROM bookings 
      WHERE id = $1 AND company_id = $2
    `;

    const checkResult = await pool.query(checkQuery, [bookingId, company_id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Booking not found'
      ));
    }

    const existingBooking = checkResult.rows[0];

    // Prevent cancellation of already completed bookings
    if (existingBooking.booking_status === 'done_service') {
      return res.status(400).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Cannot cancel completed bookings'
      ));
    }

    if (existingBooking.booking_status === 'cancelled') {
      return res.status(400).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Booking is already cancelled'
      ));
    }

    // Update booking status to cancelled
    const updateQuery = `
      UPDATE bookings 
      SET booking_status = 'cancelled', 
          cancellation_reason = $1
      WHERE id = $2 AND company_id = $3
    `;

    await pool.query(updateQuery, [reason || 'Cancelled by user', bookingId, company_id]);

    res.json(DataUtilityService.formatResponse(
      true,
      {
        bookingId: bookingId,
        status: 'cancelled',
        reason: reason || 'Cancelled by user',
        message: 'Booking cancelled successfully'
      },
      null,
      'user'
    ));

  } catch (error) {
    console.error('Cancel booking endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// ============================================================================
// ASSIGNMENT ENDPOINTS - Driver and Vehicle Assignment
// ============================================================================

// PUT /api/v1/user-dashboard/bookings/:id/assign-driver - Assign driver to booking
router.put('/bookings/:id/assign-driver', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const company_id = req.user.company_id;
    const bookingId = req.params.id;
    const { driverId } = req.body;

    // Validate driverId
    if (!driverId || isNaN(parseInt(driverId))) {
      return res.status(400).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Valid driver ID is required'
      ));
    }

    // Check if driver exists and belongs to company
    const driverCheck = await pool.query(
      'SELECT id, status FROM drivers WHERE id = $1 AND company_id = $2',
      [driverId, company_id]
    );

    if (driverCheck.rows.length === 0 || !['active', 'pending'].includes(driverCheck.rows[0].status)) {
      return res.status(404).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Driver not found or inactive'
      ));
    }

    // Check if driver is already assigned to an active booking
    const conflictCheck = await pool.query(
      `SELECT COUNT(*) as count FROM bookings 
       WHERE driver_id = $1 AND company_id = $2 
       AND booking_status IN ('pending', 'confirmed', 'assigned', 'driver_en_route', 'in_progress')
       AND id != $3`,
      [driverId, company_id, bookingId]
    );

    if (parseInt(conflictCheck.rows[0].count) > 0) {
      return res.status(409).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Driver is already assigned to another active booking'
      ));
    }

    // Assign driver to booking
    await pool.query(
      'UPDATE bookings SET driver_id = $1 WHERE id = $2 AND company_id = $3',
      [driverId, bookingId, company_id]
    );

    res.json(DataUtilityService.formatResponse(
      true, { message: 'Driver assigned successfully' }, null, 'user'
    ));
  } catch (error) {
    console.error('Assign driver error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Server error'));
  }
});

// PUT /api/v1/user-dashboard/bookings/:id/assign-vehicle - Assign vehicle to booking
router.put('/bookings/:id/assign-vehicle', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const company_id = req.user.company_id;
    const bookingId = req.params.id;
    const { vehicleId } = req.body;

    // Validate vehicleId
    if (!vehicleId || isNaN(parseInt(vehicleId))) {
      return res.status(400).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Valid vehicle ID is required'
      ));
    }

    // Check if vehicle exists and belongs to company
    const vehicleCheck = await pool.query(
      'SELECT id, status FROM vehicles WHERE id = $1 AND company_id = $2',
      [vehicleId, company_id]
    );

    if (vehicleCheck.rows.length === 0 || !['active', 'pending'].includes(vehicleCheck.rows[0].status)) {
      return res.status(404).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Vehicle not found or inactive'
      ));
    }

    // Check if vehicle is already assigned to an active booking
    const conflictCheck = await pool.query(
      `SELECT COUNT(*) as count FROM bookings 
       WHERE vehicle_id = $1 AND company_id = $2 
       AND booking_status IN ('pending', 'confirmed', 'assigned', 'driver_en_route', 'in_progress')
       AND id != $3`,
      [vehicleId, company_id, bookingId]
    );

    if (parseInt(conflictCheck.rows[0].count) > 0) {
      return res.status(409).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Vehicle is already assigned to another active booking'
      ));
    }

    // Assign vehicle to booking
    await pool.query(
      'UPDATE bookings SET vehicle_id = $1 WHERE id = $2 AND company_id = $3',
      [vehicleId, bookingId, company_id]
    );

    res.json(DataUtilityService.formatResponse(
      true, { message: 'Vehicle assigned successfully' }, null, 'user'
    ));
  } catch (error) {
    console.error('Assign vehicle error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Server error'));
  }
});

// PUT /api/v1/user-dashboard/bookings/:id/unassign-driver - Unassign driver from booking
router.put('/bookings/:id/unassign-driver', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const company_id = req.user.company_id;
    const bookingId = req.params.id;

    await pool.query(
      'UPDATE bookings SET driver_id = NULL WHERE id = $1 AND company_id = $2',
      [bookingId, company_id]
    );

    res.json(DataUtilityService.formatResponse(
      true, { message: 'Driver unassigned successfully' }, null, 'user'
    ));
  } catch (error) {
    console.error('Unassign driver error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Server error'));
  }
});

// PUT /api/v1/user-dashboard/bookings/:id/unassign-vehicle - Unassign vehicle from booking
router.put('/bookings/:id/unassign-vehicle', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const company_id = req.user.company_id;
    const bookingId = req.params.id;

    await pool.query(
      'UPDATE bookings SET vehicle_id = NULL WHERE id = $1 AND company_id = $2',
      [bookingId, company_id]
    );

    res.json(DataUtilityService.formatResponse(
      true, { message: 'Vehicle unassigned successfully' }, null, 'user'
    ));
  } catch (error) {
    console.error('Unassign vehicle error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Server error'));
  }
});

// ============================================================================
// TEMPORARY TESTING ENDPOINTS - Update Driver Status
// ============================================================================

// PUT /api/v1/user-dashboard/test/driver-status/:id - Update driver status for testing
router.put('/test/driver-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'pending', 'inactive'].includes(status)) {
      return res.status(400).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Invalid status'));
    }
    
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    
    await pool.query('UPDATE drivers SET status = $1 WHERE id = $2', [status, id]);
    
    res.json(DataUtilityService.formatResponse(true, { message: `Driver ${id} updated to ${status}` }, null, 'user'));
  } catch (error) {
    console.error('Update driver status error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// ============================================================================
// COMPANY PROFILE MANAGEMENT
// ============================================================================

// GET /api/v1/user-dashboard/company-profile - Get company profile
router.get('/company-profile', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const company_id = req.user.company_id;

    const companyQuery = `
      SELECT 
        c.id, c.company_name, c.industry, c.business_registration,
        c.contact_email, c.contact_phone, c.address, c.website,
        c.status, c.created_at, c.updated_at,
        COUNT(d.id) as driver_count,
        COUNT(v.id) as vehicle_count,
        COUNT(b.id) as booking_count
      FROM companies c
      LEFT JOIN drivers d ON c.id = d.company_id AND d.status = 'active'
      LEFT JOIN vehicles v ON c.id = v.company_id AND v.status = 'active'
      LEFT JOIN bookings b ON c.id = b.company_id
      WHERE c.id = $1
      GROUP BY c.id
    `;

    try {
      const result = await pool.query(companyQuery, [company_id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json(DataUtilityService.formatResponse(
          false, null, null, 'user', 'Company not found'
        ));
      }

      const company = result.rows[0];

      res.json(DataUtilityService.formatResponse(
        true,
        {
          company: company
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Company profile query error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to fetch company profile'
      ));
    }

  } catch (error) {
    console.error('Company profile endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// PUT /api/v1/user-dashboard/company-profile - Update company profile
router.put('/company-profile', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const company_id = req.user.company_id;
    const { 
      company_name, industry, business_registration,
      contact_email, contact_phone, address, website 
    } = req.body;

    // Validation
    if (!company_name || !contact_email) {
      return res.status(400).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Company name and contact email are required'
      ));
    }

    const updateQuery = `
      UPDATE companies 
      SET company_name = $1, industry = $2, business_registration = $3,
          contact_email = $4, contact_phone = $5, address = $6, 
          website = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
    `;

    const updateParams = [
      company_name, industry || null, business_registration || null,
      contact_email, contact_phone || null, address || null,
      website || null, company_id
    ];

    try {
      await pool.query(updateQuery, updateParams);

      // Get the updated company data
      const fetchQuery = `
        SELECT 
          id, company_name, industry, business_registration,
          contact_email, contact_phone, address, website,
          status, created_at, updated_at
        FROM companies 
        WHERE id = $1
      `;

      const result = await pool.query(fetchQuery, [company_id]);

      res.json(DataUtilityService.formatResponse(
        true,
        {
          message: 'Company profile updated successfully',
          company: result.rows[0]
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Update company profile error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to update company profile'
      ));
    }

  } catch (error) {
    console.error('Update company profile endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// ============================================================================
// DOCUMENT MANAGEMENT
// ============================================================================

// GET /api/v1/user-dashboard/documents - Get documents with filters
router.get('/documents', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const company_id = req.user.company_id;
    const { 
      page = 1, limit = 20, type, status, 
      date_from, date_to, search 
    } = req.query;

    let whereConditions = ['company_id = $1'];
    let queryParams = [company_id];
    let paramIndex = 2;

    if (type) {
      whereConditions.push(`document_type = $${paramIndex}`);
      queryParams.push(type);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(document_name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (date_from) {
      whereConditions.push(`DATE(created_at) >= $${paramIndex}`);
      queryParams.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      whereConditions.push(`DATE(created_at) <= $${paramIndex}`);
      queryParams.push(date_to);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');
    const offset = (page - 1) * limit;

    const documentsQuery = `
      SELECT 
        id, document_name, document_type, file_path, file_size,
        description, status, uploaded_by, created_at, updated_at
      FROM documents
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM documents
      WHERE ${whereClause}
    `;

    const documentsParams = [...queryParams, limit, offset];
    const countParams = queryParams;

    try {
      const [documentsResult, countResult] = await Promise.all([
        pool.query(documentsQuery, documentsParams),
        pool.query(countQuery, countParams)
      ]);

      const documents = documentsResult.rows || [];
      const total = parseInt(countResult.rows[0].total);

      res.json(DataUtilityService.formatResponse(
        true,
        {
          documents: documents,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: total,
            pages: Math.ceil(total / limit)
          }
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Documents query error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to fetch documents'
      ));
    }

  } catch (error) {
    console.error('Documents endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// GET /api/v1/user-dashboard/documents/:id - Get specific document
router.get('/documents/:id', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const documentId = req.params.id;

    const fetchQuery = `
      SELECT 
        id, document_name, document_type, file_path, file_size,
        description, status, uploaded_by, created_at, updated_at
      FROM documents 
      WHERE id = $1
    `;

    try {
      const result = await pool.query(fetchQuery, [documentId]);

      if (result.rows.length === 0) {
        return res.status(404).json(DataUtilityService.formatResponse(
          false, null, null, 'user', 'Document not found'
        ));
      }

      res.json(DataUtilityService.formatResponse(
        true,
        {
          document: result.rows[0]
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Document fetch query error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to fetch document'
      ));
    }

  } catch (error) {
    console.error('Document fetch endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// POST /api/v1/user-dashboard/documents - Upload new document
router.post('/documents', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const company_id = req.user.company_id;
    const user_id = req.user.id;
    const {
      document_name, document_type, file_path, file_size,
      description
    } = req.body;

    // Validation
    if (!document_name || !document_type || !file_path) {
      return res.status(400).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Document name, type, and file path are required'
      ));
    }

    const documentQuery = `
      INSERT INTO documents (
        document_name, document_type, file_path, file_size,
        description, company_id, uploaded_by, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    const documentParams = [
      document_name, document_type, file_path, file_size || 0,
      description || null, company_id, user_id, 'active'
    ];

    try {
      const result = await pool.query(documentQuery, documentParams);

      res.status(201).json(DataUtilityService.formatResponse(
        true,
        {
          message: 'Document uploaded successfully',
          documentId: result.rows[0].id
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Document upload error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to upload document'
      ));
    }

  } catch (error) {
    console.error('Document upload endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// PUT /api/v1/user-dashboard/documents/:id - Update document
router.put('/documents/:id', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const documentId = req.params.id;
    const company_id = req.user.company_id;
    const { document_name, description, status } = req.body;

    // Check if document exists and belongs to company
    const checkQuery = `
      SELECT id FROM documents 
      WHERE id = $1 AND company_id = $2
    `;

    try {
      const checkResult = await pool.query(checkQuery, [documentId, company_id]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json(DataUtilityService.formatResponse(
          false, null, null, 'user', 'Document not found'
        ));
      }

      // Build update query dynamically
      let updateFields = [];
      let updateParams = [];
      let paramIndex = 1;

      if (document_name) {
        updateFields.push(`document_name = $${paramIndex}`);
        updateParams.push(document_name);
        paramIndex++;
      }

      if (description !== undefined) {
        updateFields.push(`description = $${paramIndex}`);
        updateParams.push(description);
        paramIndex++;
      }

      if (status) {
        updateFields.push(`status = $${paramIndex}`);
        updateParams.push(status);
        paramIndex++;
      }

      if (updateFields.length === 0) {
        return res.status(400).json(DataUtilityService.formatResponse(
          false, null, null, 'user', 'No fields to update'
        ));
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      updateParams.push(documentId);
      
      const updateQuery = `
        UPDATE documents 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
      `;

      await pool.query(updateQuery, updateParams);

      res.json(DataUtilityService.formatResponse(
        true,
        {
          message: 'Document updated successfully'
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Update document error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to update document'
      ));
    }

  } catch (error) {
    console.error('Update document endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// DELETE /api/v1/user-dashboard/documents/:id - Delete document
router.delete('/documents/:id', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const documentId = req.params.id;
    const company_id = req.user.company_id;

    const deleteQuery = `
      DELETE FROM documents 
      WHERE id = $1 AND company_id = $2
    `;

    try {
      const result = await pool.query(deleteQuery, [documentId, company_id]);

      if (result.rowCount === 0) {
        return res.status(404).json(DataUtilityService.formatResponse(
          false, null, null, 'user', 'Document not found'
        ));
      }

      res.json(DataUtilityService.formatResponse(
        true,
        {
          message: 'Document deleted successfully'
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Delete document error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to delete document'
      ));
    }

  } catch (error) {
    console.error('Delete document endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// ============================================================================
// USER MANAGEMENT (Admin functionality)
// ============================================================================

// GET /api/v1/user-dashboard/users - Get company users
router.get('/users', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const company_id = req.user.company_id;
    const { 
      page = 1, limit = 20, role, status, 
      date_from, date_to, search 
    } = req.query;

    let whereConditions = ['company_id = $1'];
    let queryParams = [company_id];
    let paramIndex = 2;

    if (role) {
      whereConditions.push(`role = $${paramIndex}`);
      queryParams.push(role);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (date_from) {
      whereConditions.push(`DATE(created_at) >= $${paramIndex}`);
      queryParams.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      whereConditions.push(`DATE(created_at) <= $${paramIndex}`);
      queryParams.push(date_to);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');
    const offset = (page - 1) * limit;

    const usersQuery = `
      SELECT 
        id, email, role, first_name, last_name, phone,
        status, email_verified, phone_verified, last_login,
        created_at, updated_at
      FROM users
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM users
      WHERE ${whereClause}
    `;

    const usersParams = [...queryParams, limit, offset];
    const countParams = queryParams;

    try {
      const [usersResult, countResult] = await Promise.all([
        pool.query(usersQuery, usersParams),
        pool.query(countQuery, countParams)
      ]);

      const users = usersResult.rows || [];
      const total = parseInt(countResult.rows[0].total);

      res.json(DataUtilityService.formatResponse(
        true,
        {
          users: users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: total,
            pages: Math.ceil(total / limit)
          }
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Users query error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to fetch users'
      ));
    }

  } catch (error) {
    console.error('Users endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// ============================================================================
// TRAVEL BOOKING PAYMENT TRACKING - Simplified approach
// ============================================================================
// 
// REMOVED COMPLEX ACCOUNTING FEATURES:
// - Company accounts & balances
// - Transaction ledgers (debit/credit entries)  
// - Payment method management (credit cards, etc.)
//
// FOR TRAVEL BOOKINGS, WE ONLY NEED:
// - Simple payment_status field on each booking: paid|pending|cancelled|refunded
// - Basic revenue reporting from booking totals
// - Optional: payment_method field for cash|card|transfer tracking
//
// This keeps it simple and focused on travel booking management!

// ============================================================================
// NOTIFICATIONS SYSTEM
// ============================================================================

// GET /api/v1/user-dashboard/notifications - Get user notifications
router.get('/notifications', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const user_id = req.user.id;
    const { 
      page = 1, limit = 20, type, status, 
      date_from, date_to, unread_only 
    } = req.query;

    let whereConditions = ['user_id = $1'];
    let queryParams = [user_id];
    let paramIndex = 2;

    if (type) {
      whereConditions.push(`type = $${paramIndex}`);
      queryParams.push(type);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (unread_only === 'true') {
      whereConditions.push('is_read = FALSE');
    }

    if (date_from) {
      whereConditions.push(`DATE(created_at) >= $${paramIndex}`);
      queryParams.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      whereConditions.push(`DATE(created_at) <= $${paramIndex}`);
      queryParams.push(date_to);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');
    const offset = (page - 1) * limit;

    const notificationsQuery = `
      SELECT 
        id, type, title, message, priority, status,
        is_read, metadata, created_at, read_at
      FROM notifications
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM notifications
      WHERE ${whereClause}
    `;

    const notificationsParams = [...queryParams, limit, offset];
    const countParams = queryParams;

    try {
      const [notificationsResult, countResult] = await Promise.all([
        pool.query(notificationsQuery, notificationsParams),
        pool.query(countQuery, countParams)
      ]);

      const notifications = notificationsResult.rows || [];
      const total = parseInt(countResult.rows[0].total);

      res.json(DataUtilityService.formatResponse(
        true,
        {
          notifications: notifications,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: total,
            pages: Math.ceil(total / limit)
          }
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Notifications query error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to fetch notifications'
      ));
    }

  } catch (error) {
    console.error('Notifications endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// GET /api/v1/user-dashboard/notifications/unread-count - Get unread notification count
router.get('/notifications/unread-count', async (req, res) => {
  try {
    const pool = getConnection();
    const user_id = req.user.id;

    const countQuery = `
      SELECT 
        COUNT(*) as total_unread,
        COUNT(CASE WHEN priority = 'high' OR priority = 'urgent' THEN 1 END) as high_priority_unread
      FROM notifications
      WHERE user_id = $1 AND is_read = FALSE
    `;

    try {
      const result = await pool.query(countQuery, [user_id]);
      const counts = result.rows[0];

      res.json(DataUtilityService.formatResponse(
        true,
        {
          unreadCount: counts.total_unread || 0,
          highPriorityUnread: counts.high_priority_unread || 0
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Unread count query error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to get unread count'
      ));
    }

  } catch (error) {
    console.error('Unread count endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// POST /api/v1/user-dashboard/notifications/mark-read - Mark notifications as read
router.post('/notifications/mark-read', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const user_id = req.user.id;
    const { notification_ids, mark_all } = req.body;

    let updateQuery;
    let updateParams;

    if (mark_all) {
      // Mark all unread notifications as read
      updateQuery = `
        UPDATE notifications 
        SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND is_read = FALSE
      `;
      updateParams = [user_id];
    } else if (notification_ids && Array.isArray(notification_ids) && notification_ids.length > 0) {
      // Mark specific notifications as read
      const placeholders = notification_ids.map((_, index) => `$${index + 2}`).join(',');
      updateQuery = `
        UPDATE notifications 
        SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND id IN (${placeholders})
      `;
      updateParams = [user_id, ...notification_ids];
    } else {
      return res.status(400).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Either notification_ids array or mark_all flag is required'
      ));
    }

    try {
      const result = await pool.query(updateQuery, updateParams);

      res.json(DataUtilityService.formatResponse(
        true,
        {
          markedCount: result.rowCount,
          message: `${result.rowCount} notification(s) marked as read`
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Mark notifications read error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to mark notifications as read'
      ));
    }

  } catch (error) {
    console.error('Mark notifications read endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// DELETE /api/v1/user-dashboard/notifications/:id - Delete notification
router.delete('/notifications/:id', async (req, res) => {
  try {
    const pool = getConnection();
    const user_id = req.user.id;
    const notificationId = req.params.id;

    // Check if notification exists and belongs to user
    const checkQuery = `
      SELECT id, title FROM notifications 
      WHERE id = $1 AND user_id = $2
    `;

    try {
      const checkResult = await pool.query(checkQuery, [notificationId, user_id]);
      const existingNotification = checkResult.rows[0];

      if (!existingNotification) {
        return res.status(404).json(DataUtilityService.formatResponse(
          false, null, null, 'user', 'Notification not found'
        ));
      }

      // Delete the notification
      const deleteQuery = `
        DELETE FROM notifications 
        WHERE id = $1 AND user_id = $2
      `;

      await pool.query(deleteQuery, [notificationId, user_id]);

      res.json(DataUtilityService.formatResponse(
        true,
        {
          notificationId: notificationId,
          title: existingNotification.title,
          message: 'Notification deleted successfully'
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Notification check/deletion error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to delete notification'
      ));
    }

  } catch (error) {
    console.error('Delete notification endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// POST /api/v1/user-dashboard/notifications/clear-all - Clear all read notifications
router.post('/notifications/clear-all', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const user_id = req.user.id;

    const deleteQuery = `
      DELETE FROM notifications 
      WHERE user_id = $1 AND is_read = TRUE
    `;

    try {
      const result = await pool.query(deleteQuery, [user_id]);

      res.json(DataUtilityService.formatResponse(
        true,
        {
          deletedCount: result.rowCount,
          message: `${result.rowCount} read notification(s) cleared`
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Clear notifications error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to clear notifications'
      ));
    }

  } catch (error) {
    console.error('Clear notifications endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// ============================================================================
// PRIORITY 2 ENDPOINTS - IMPORTANT FEATURES
// ============================================================================

// ============================================================================
// USER PROFILE MANAGEMENT
// ============================================================================

// GET /api/v1/user-dashboard/profile - Get user profile
router.get('/profile', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const user_id = req.user.id;

    const profileQuery = `
      SELECT 
        u.id, u.email, u.role, u.first_name, u.last_name, u.phone,
        u.status, u.email_verified, u.phone_verified, u.last_login,
        u.created_at, u.updated_at,
        c.company_name, c.industry, c.contact_email as company_email,
        COUNT(DISTINCT d.id) as driver_count,
        COUNT(DISTINCT v.id) as vehicle_count,
        COUNT(DISTINCT b.id) as booking_count
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      LEFT JOIN drivers d ON c.id = d.company_id AND d.status = 'active'
      LEFT JOIN vehicles v ON c.id = v.company_id AND v.status = 'active'
      LEFT JOIN bookings b ON c.id = b.company_id
      WHERE u.id = $1
      GROUP BY u.id, u.email, u.role, u.first_name, u.last_name, u.phone,
               u.status, u.email_verified, u.phone_verified, u.last_login,
               u.created_at, u.updated_at, c.company_name, c.industry, c.contact_email
    `;

    try {
      const result = await pool.query(profileQuery, [user_id]);

      if (result.rows.length === 0) {
        return res.status(404).json(DataUtilityService.formatResponse(
          false, null, null, 'user', 'User profile not found'
        ));
      }

      const profile = result.rows[0];

      // Remove sensitive information
      delete profile.password_hash;
      delete profile.reset_token;
      delete profile.verification_token;

      // Get user preferences
      const preferencesQuery = `
        SELECT * FROM user_preferences 
        WHERE user_id = $1
      `;

      try {
        const preferencesResult = await pool.query(preferencesQuery, [user_id]);
        const preferences = preferencesResult.rows[0];

        res.json(DataUtilityService.formatResponse(
          true,
          {
            profile: profile,
            preferences: preferences || {},
            stats: {
              driverCount: profile.driver_count || 0,
              vehicleCount: profile.vehicle_count || 0,
              bookingCount: profile.booking_count || 0
            }
          },
          null,
          'user'
        ));
      } catch (preferencesErr) {
        console.error('User preferences query error:', preferencesErr);
        // Continue without preferences if query fails
        res.json(DataUtilityService.formatResponse(
          true,
          {
            profile: profile,
            preferences: {},
            stats: {
              driverCount: profile.driver_count || 0,
              vehicleCount: profile.vehicle_count || 0,
              bookingCount: profile.booking_count || 0
            }
          },
          null,
          'user'
        ));
      }
    } catch (err) {
      console.error('User profile query error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to fetch user profile'
      ));
    }

  } catch (error) {
    console.error('User profile endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// GET /api/v1/user-dashboard/profile/preferences - Get user preferences
router.get('/profile/preferences', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const pool = getConnection();
    const user_id = req.user.id;

    const preferencesQuery = `
      SELECT * FROM user_preferences 
      WHERE user_id = $1
    `;

    try {
      const result = await pool.query(preferencesQuery, [user_id]);
      const preferences = result.rows[0];

      // Return default preferences if none exist
      const defaultPreferences = {
        language: 'en',
        timezone: 'Asia/Manila',
        currency: 'PHP',
        date_format: 'MM/DD/YYYY',
        time_format: '12h',
        notifications_enabled: true,
        email_notifications: true,
        sms_notifications: false,
        theme: 'light'
      };

      res.json(DataUtilityService.formatResponse(
        true,
        {
          preferences: preferences || defaultPreferences
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('User preferences query error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to fetch user preferences'
      ));
    }

  } catch (error) {
    console.error('User preferences endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// PUT /api/v1/user-dashboard/profile/preferences - Update user preferences
router.put('/profile/preferences', async (req, res) => {
  try {
    const pool = getConnection();
    const user_id = req.user.id;
    const preferences = req.body;

    try {
      // Check if preferences exist
      const checkQuery = `
        SELECT id FROM user_preferences WHERE user_id = $1
      `;

      const checkResult = await pool.query(checkQuery, [user_id]);
      const existing = checkResult.rows[0];

      const preferencesData = JSON.stringify(preferences);

      if (existing) {
        // Update existing preferences
        const updateQuery = `
          UPDATE user_preferences 
          SET preferences = $1, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $2
        `;

        await pool.query(updateQuery, [preferencesData, user_id]);

        res.json(DataUtilityService.formatResponse(
          true,
          {
            preferences: preferences,
            message: 'User preferences updated successfully'
          },
          null,
          'user'
        ));
      } else {
        // Create new preferences
        const insertQuery = `
          INSERT INTO user_preferences (user_id, preferences)
          VALUES ($1, $2)
        `;

        await pool.query(insertQuery, [user_id, preferencesData]);

        res.json(DataUtilityService.formatResponse(
          true,
          {
            preferences: preferences,
            message: 'User preferences created successfully'
          },
          null,
          'user'
        ));
      }
    } catch (err) {
      console.error('Update preferences error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to update preferences'
      ));
    }

  } catch (error) {
    console.error('Update preferences endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// ============================================================================
// FILE MANAGEMENT
// ============================================================================

// GET /api/v1/user-dashboard/files - Get user files
router.get('/files', async (req, res) => {
  try {
    const db = getDatabase();
    const user_id = req.user.id;
    const company_id = req.user.company_id;
    const { 
      page = 1, limit = 20, file_type, file_category,
      date_from, date_to, search_term 
    } = req.query;

    let whereConditions = ['(uploaded_by = ? OR company_id = ?)'];
    let queryParams = [user_id, company_id];

    if (file_type) {
      whereConditions.push('file_type = ?');
      queryParams.push(file_type);
    }

    if (file_category) {
      whereConditions.push('file_category = ?');
      queryParams.push(file_category);
    }

    if (search_term) {
      whereConditions.push('(original_filename LIKE ? OR file_description LIKE ?)');
      queryParams.push(`%${search_term}%`, `%${search_term}%`);
    }

    if (date_from) {
      whereConditions.push('DATE(created_at) >= DATE(?)');
      queryParams.push(date_from);
    }

    if (date_to) {
      whereConditions.push('DATE(created_at) <= DATE(?)');
      queryParams.push(date_to);
    }

    const whereClause = whereConditions.join(' AND ');
    const offset = (page - 1) * limit;

    const filesQuery = `
      SELECT 
        fu.*,
        u.first_name || ' ' || u.last_name as uploaded_by_name,
        c.name as company_name
      FROM file_uploads fu
      LEFT JOIN users u ON fu.uploaded_by = u.id
      LEFT JOIN companies c ON fu.company_id = c.id
      WHERE ${whereClause}
      ORDER BY fu.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM file_uploads fu
      WHERE ${whereClause}
    `;

    const filesParams = [...queryParams, limit, offset];
    const countParams = queryParams;

    db.all(filesQuery, filesParams, (err, files) => {
      if (err) {
        console.error('Files query error:', err);
        return res.status(500).json(DataUtilityService.formatResponse(
          false, null, null, 'user', 'Failed to fetch files'
        ));
      }

      db.get(countQuery, countParams, (err, countResult) => {
        if (err) {
          console.error('Files count error:', err);
          return res.status(500).json(DataUtilityService.formatResponse(
            false, null, null, 'user', 'Failed to count files'
          ));
        }

        // Calculate summary
        const summary = {
          totalFiles: countResult.total,
          totalSize: 0,
          fileTypes: {},
          recentUploads: 0
        };

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        files.forEach(file => {
          summary.totalSize += parseInt(file.file_size || 0);
          
          if (!summary.fileTypes[file.file_type]) {
            summary.fileTypes[file.file_type] = 0;
          }
          summary.fileTypes[file.file_type]++;
          
          if (new Date(file.created_at) > oneWeekAgo) {
            summary.recentUploads++;
          }
        });

        res.json(DataUtilityService.formatResponse(
          true,
          {
            files: files || [],
            summary: summary,
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total: countResult.total,
              totalPages: Math.ceil(countResult.total / limit)
            }
          },
          null,
          'user'
        ));
        db.close();
      });
    });

  } catch (error) {
    console.error('Files endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// POST /api/v1/user-dashboard/files/upload - Upload file metadata
router.post('/files/upload', async (req, res) => {
  try {
    const db = getDatabase();
    const user_id = req.user.id;
    const company_id = req.user.company_id;
    const {
      original_filename, file_type, file_size, file_url,
      file_category, file_description, metadata,
      is_public, expiry_date
    } = req.body;

    // Validation
    if (!original_filename || !file_type || !file_url) {
      return res.status(400).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 
        'Required fields missing: original_filename, file_type, file_url'
      ));
    }

    // Generate unique filename
    const fileExtension = original_filename.split('.').pop();
    const uniqueFilename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;

    const uploadQuery = `
      INSERT INTO file_uploads (
        original_filename, unique_filename, file_type, file_size,
        file_url, file_category, file_description, metadata,
        uploaded_by, company_id, is_public, expiry_date,
        upload_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const uploadParams = [
      original_filename, uniqueFilename, file_type, file_size,
      file_url, file_category, file_description, JSON.stringify(metadata || {}),
      user_id, company_id, is_public || false, expiry_date,
      'completed'
    ];

    db.run(uploadQuery, uploadParams, function(err) {
      if (err) {
        console.error('File upload error:', err);
        return res.status(500).json(DataUtilityService.formatResponse(
          false, null, null, 'user', 'Failed to upload file metadata'
        ));
      }

      const fileId = this.lastID;

      // Fetch the created file record
      const fetchQuery = `
        SELECT 
          fu.*,
          u.first_name || ' ' || u.last_name as uploaded_by_name
        FROM file_uploads fu
        LEFT JOIN users u ON fu.uploaded_by = u.id
        WHERE fu.id = ?
      `;

      db.get(fetchQuery, [fileId], (err, file) => {
        if (err) {
          console.error('Fetch file error:', err);
          return res.status(500).json(DataUtilityService.formatResponse(
            false, null, null, 'user', 'File uploaded but failed to fetch details'
          ));
        }

        res.status(201).json(DataUtilityService.formatResponse(
          true,
          {
            file: file,
            message: 'File uploaded successfully'
          },
          null,
          'user'
        ));
        db.close();
      });
    });

  } catch (error) {
    console.error('Upload file endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// GET /api/v1/user-dashboard/files/:id - Get file details
router.get('/files/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const user_id = req.user.id;
    const company_id = req.user.company_id;
    const fileId = req.params.id;

    const fileQuery = `
      SELECT 
        fu.*,
        u.first_name || ' ' || u.last_name as uploaded_by_name,
        c.name as company_name
      FROM file_uploads fu
      LEFT JOIN users u ON fu.uploaded_by = u.id
      LEFT JOIN companies c ON fu.company_id = c.id
      WHERE fu.id = ? AND (fu.uploaded_by = ? OR fu.company_id = ? OR fu.is_public = TRUE)
    `;

    db.get(fileQuery, [fileId, user_id, company_id], (err, file) => {
      if (err) {
        console.error('File details query error:', err);
        return res.status(500).json(DataUtilityService.formatResponse(
          false, null, null, 'user', 'Failed to fetch file details'
        ));
      }

      if (!file) {
        return res.status(404).json(DataUtilityService.formatResponse(
          false, null, null, 'user', 'File not found'
        ));
      }

      res.json(DataUtilityService.formatResponse(
        true,
        {
          file: file
        },
        null,
        'user'
      ));
      db.close();
    });

  } catch (error) {
    console.error('File details endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// PUT /api/v1/user-dashboard/files/:id - Update file metadata
router.put('/files/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const user_id = req.user.id;
    const company_id = req.user.company_id;
    const fileId = req.params.id;
    const updateData = req.body;

    // Check if file exists and user has permission
    const checkQuery = `
      SELECT id, original_filename FROM file_uploads 
      WHERE id = ? AND (uploaded_by = ? OR company_id = ?)
    `;

    db.get(checkQuery, [fileId, user_id, company_id], (err, existingFile) => {
      if (err) {
        console.error('File check error:', err);
        return res.status(500).json(DataUtilityService.formatResponse(
          false, null, null, 'user', 'Failed to check file'
        ));
      }

      if (!existingFile) {
        return res.status(404).json(DataUtilityService.formatResponse(
          false, null, null, 'user', 'File not found or no permission'
        ));
      }

      // Define allowed fields for update
      const allowedFields = [
        'file_category', 'file_description', 'metadata',
        'is_public', 'expiry_date'
      ];

      const updateFields = [];
      const updateParams = [];

      Object.keys(updateData).forEach(field => {
        if (allowedFields.includes(field) && updateData[field] !== undefined) {
          if (field === 'metadata') {
            updateFields.push(`${field} = ?`);
            updateParams.push(JSON.stringify(updateData[field]));
          } else {
            updateFields.push(`${field} = ?`);
            updateParams.push(updateData[field]);
          }
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json(DataUtilityService.formatResponse(
          false, null, null, 'user', 'No valid fields to update'
        ));
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateParams.push(fileId);

      const updateQuery = `
        UPDATE file_uploads 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;

      db.run(updateQuery, updateParams, function(err) {
        if (err) {
          console.error('File update error:', err);
          return res.status(500).json(DataUtilityService.formatResponse(
            false, null, null, 'user', 'Failed to update file'
          ));
        }

        // Fetch updated file
        const fetchQuery = `
          SELECT 
            fu.*,
            u.first_name || ' ' || u.last_name as uploaded_by_name
          FROM file_uploads fu
          LEFT JOIN users u ON fu.uploaded_by = u.id
          WHERE fu.id = ?
        `;

        db.get(fetchQuery, [fileId], (err, updatedFile) => {
          if (err) {
            console.error('Fetch updated file error:', err);
            return res.status(500).json(DataUtilityService.formatResponse(
              false, null, null, 'user', 'File updated but failed to fetch details'
            ));
          }

          res.json(DataUtilityService.formatResponse(
            true,
            {
              file: updatedFile,
              message: 'File updated successfully'
            },
            null,
            'user'
          ));
          db.close();
        });
      });
    });

  } catch (error) {
    console.error('Update file endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// DELETE /api/v1/user-dashboard/files/:id - Delete file
router.delete('/files/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const user_id = req.user.id;
    const company_id = req.user.company_id;
    const fileId = req.params.id;

    // Check if file exists and user has permission
    const checkQuery = `
      SELECT id, original_filename, uploaded_by FROM file_uploads 
      WHERE id = ? AND (uploaded_by = ? OR company_id = ?)
    `;

    db.get(checkQuery, [fileId, user_id, company_id], (err, existingFile) => {
      if (err) {
        console.error('File check error:', err);
        return res.status(500).json(DataUtilityService.formatResponse(
          false, null, null, 'user', 'Failed to check file'
        ));
      }

      if (!existingFile) {
        return res.status(404).json(DataUtilityService.formatResponse(
          false, null, null, 'user', 'File not found or no permission'
        ));
      }

      // Only allow file owner to delete
      if (existingFile.uploaded_by !== user_id) {
        return res.status(403).json(DataUtilityService.formatResponse(
          false, null, null, 'user', 'Only file owner can delete files'
        ));
      }

      // Delete the file record
      const deleteQuery = `
        DELETE FROM file_uploads 
        WHERE id = ?
      `;

      db.run(deleteQuery, [fileId], function(err) {
        if (err) {
          console.error('File deletion error:', err);
          return res.status(500).json(DataUtilityService.formatResponse(
            false, null, null, 'user', 'Failed to delete file'
          ));
        }

        res.json(DataUtilityService.formatResponse(
          true,
          {
            fileId: fileId,
            filename: existingFile.original_filename,
            message: 'File deleted successfully'
          },
          null,
          'user'
        ));
        db.close();
      });
    });

  } catch (error) {
    console.error('Delete file endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

// GET /api/v1/user-dashboard/analytics/dashboard-metrics - Get dashboard metrics
router.get('/analytics/dashboard-metrics', async (req, res) => {
  try {
    const pool = getConnection();
    const { date_from, date_to } = req.query;

    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (date_from) {
      whereConditions.push(`metric_date >= $${paramIndex}`);
      queryParams.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      whereConditions.push(`metric_date <= $${paramIndex}`);
      queryParams.push(date_to);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const metricsQuery = `
      SELECT 
        metric_date,
        total_bookings,
        completed_bookings,
        cancelled_bookings,
        total_revenue,
        active_suppliers,
        active_drivers,
        average_rating,
        customer_satisfaction,
        created_at
      FROM dashboard_metrics
      ${whereClause}
      ORDER BY metric_date DESC
      LIMIT 30
    `;

    try {
      const result = await pool.query(metricsQuery, queryParams);
      const rawMetrics = result.rows;

      // Transform the data to a more useful format
      const metrics = {
        bookings: [],
        revenue: [],
        suppliers: [],
        drivers: [],
        ratings: []
      };

      const summary = {
        totalRecords: rawMetrics.length,
        latestDate: null,
        totalBookings: 0,
        totalRevenue: 0,
        averageRating: 0,
        averageSatisfaction: 0
      };

      rawMetrics.forEach(row => {
        const date = row.metric_date;
        
        metrics.bookings.push({
          date: date,
          total: row.total_bookings,
          completed: row.completed_bookings,
          cancelled: row.cancelled_bookings
        });

        metrics.revenue.push({
          date: date,
          amount: parseFloat(row.total_revenue || 0)
        });

        metrics.suppliers.push({
          date: date,
          active: row.active_suppliers
        });

        metrics.drivers.push({
          date: date,
          active: row.active_drivers
        });

        metrics.ratings.push({
          date: date,
          rating: parseFloat(row.average_rating || 0),
          satisfaction: parseFloat(row.customer_satisfaction || 0)
        });

        summary.totalBookings += row.total_bookings || 0;
        summary.totalRevenue += parseFloat(row.total_revenue || 0);
        
        if (!summary.latestDate || new Date(date) > new Date(summary.latestDate)) {
          summary.latestDate = date;
        }
      });

      summary.averageRating = rawMetrics.length > 0 
        ? rawMetrics.reduce((sum, row) => sum + (parseFloat(row.average_rating) || 0), 0) / rawMetrics.length 
        : 0;
      summary.averageSatisfaction = rawMetrics.length > 0 
        ? rawMetrics.reduce((sum, row) => sum + (parseFloat(row.customer_satisfaction) || 0), 0) / rawMetrics.length 
        : 0;

      res.json(DataUtilityService.formatResponse(
        true,
        {
          metrics: metrics,
          summary: summary,
          rawMetrics: rawMetrics
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Dashboard metrics query error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to fetch dashboard metrics'
      ));
    }

  } catch (error) {
    console.error('Dashboard metrics endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// GET /api/v1/user-dashboard/analytics/performance-kpis - Get performance KPIs
router.get('/analytics/performance-kpis', async (req, res) => {
  try {
    // Generate mock KPI data based on actual company data
    const pool = getConnection();
    const company_id = req.user?.company_id || 1;
    
    // Get actual company metrics using simpler queries
    const driversQuery = `SELECT COUNT(*) as total_drivers FROM drivers WHERE company_id = $1`;
    const vehiclesQuery = `SELECT COUNT(*) as total_vehicles FROM vehicles WHERE company_id = $1`;
    const bookingsQuery = `SELECT COUNT(*) as total_bookings, 
                           COUNT(CASE WHEN booking_status = 'completed' THEN 1 END) as completed_bookings
                           FROM bookings WHERE company_id = $1`;

    try {
      // Execute the queries in parallel
      const [driversResult, vehiclesResult, bookingsResult] = await Promise.all([
        pool.query(driversQuery, [company_id]),
        pool.query(vehiclesQuery, [company_id]),
        pool.query(bookingsQuery, [company_id])
      ]);

      const totalDrivers = parseInt(driversResult.rows[0].total_drivers) || 0;
      const totalVehicles = parseInt(vehiclesResult.rows[0].total_vehicles) || 0;
      const totalBookings = parseInt(bookingsResult.rows[0].total_bookings) || 0;
      const completedBookings = parseInt(bookingsResult.rows[0].completed_bookings) || 0;
      const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
      
      // Generate realistic KPI data
      const kpis = [
        {
          kpi_name: 'Fleet Utilization Rate',
          kpi_value: Math.round((totalBookings / Math.max(totalVehicles, 1)) * 100) / 100,
          target_value: 75.0,
          kpi_category: 'operations',
          unit_of_measurement: 'percentage',
          recorded_at: new Date().toISOString()
        },
        {
          kpi_name: 'Driver Efficiency',
          kpi_value: Math.round((totalBookings / Math.max(totalDrivers, 1)) * 100) / 100,
          target_value: 10.0,
          kpi_category: 'operations',
          unit_of_measurement: 'bookings_per_driver',
          recorded_at: new Date().toISOString()
        },
        {
          kpi_name: 'Service Completion Rate',
          kpi_value: Math.round(completionRate * 100) / 100,
          target_value: 90.0,
          kpi_category: 'quality',
          unit_of_measurement: 'percentage',
          recorded_at: new Date().toISOString()
        }
      ];

      // Calculate performance analysis
      const analysis = {
        totalKpis: kpis.length,
        onTarget: 0,
        aboveTarget: 0,
        belowTarget: 0,
        categories: {},
        trends: {}
      };

      kpis.forEach(kpi => {
        const kpiValue = parseFloat(kpi.kpi_value);
        const targetValue = parseFloat(kpi.target_value);
        
        if (kpiValue >= targetValue) {
          analysis.aboveTarget++;
        } else if (kpiValue >= targetValue * 0.9) {
          analysis.onTarget++;
        } else {
          analysis.belowTarget++;
        }

        if (!analysis.categories[kpi.kpi_category]) {
          analysis.categories[kpi.kpi_category] = {
            count: 0,
            avgPerformance: 0,
            totalValue: 0,
            totalTarget: 0
          };
        }
        
        const category = analysis.categories[kpi.kpi_category];
        category.count++;
        category.totalValue += kpiValue;
        category.totalTarget += targetValue;
        category.avgPerformance = (category.totalValue / category.totalTarget) * 100;
      });

      res.json(DataUtilityService.formatResponse(
        true,
        {
          kpis: kpis,
          analysis: analysis
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Performance KPIs query error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to fetch performance KPIs'
      ));
    }

  } catch (error) {
    console.error('Performance KPIs endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// GET /api/v1/user-dashboard/analytics/revenue - Get revenue analytics
router.get('/analytics/revenue', async (req, res) => {
  try {
    // Generate revenue data based on actual bookings data
    const pool = getConnection();
    const company_id = req.user?.company_id || 1;

    // Get actual booking data to calculate realistic revenue
    const revenueQuery = `
      SELECT 
        DATE_TRUNC('month', created_at) as period_start,
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN booking_status = 'completed' THEN 1 END) as completed_bookings,
        SUM(CASE WHEN booking_status = 'completed' THEN total_amount ELSE 0 END) as total_revenue
      FROM bookings
      WHERE company_id = $1
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY period_start DESC
      LIMIT 12
    `;

    try {
      const result = await pool.query(revenueQuery, [company_id]);
      const monthlyData = result.rows;

      // Generate revenue data with realistic calculations
      const revenueData = monthlyData.map((row, index) => {
        const totalRevenue = parseFloat(row.total_revenue || 0);
        const expenses = totalRevenue * (0.7 + Math.random() * 0.2); // 70-90% expenses
        const netRevenue = totalRevenue - expenses;
        const profitMargin = totalRevenue > 0 ? (netRevenue / totalRevenue) * 100 : 0;
        
        // Calculate growth rate compared to previous month
        let growthRate = 0;
        if (index < monthlyData.length - 1) {
          const prevRevenue = parseFloat(monthlyData[index + 1].total_revenue || 0);
          if (prevRevenue > 0) {
            growthRate = ((totalRevenue - prevRevenue) / prevRevenue) * 100;
          }
        }

        const periodStart = new Date(row.period_start);
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        periodEnd.setDate(0); // Last day of month

        return {
          period_start: periodStart.toISOString().split('T')[0],
          period_end: periodEnd.toISOString().split('T')[0],
          total_revenue: Math.round(totalRevenue * 100) / 100,
          gross_revenue: Math.round(totalRevenue * 100) / 100,
          net_revenue: Math.round(netRevenue * 100) / 100,
          revenue_breakdown: JSON.stringify({
            bookings: row.total_bookings,
            completed: row.completed_bookings,
            avg_per_booking: row.completed_bookings > 0 ? Math.round((totalRevenue / row.completed_bookings) * 100) / 100 : 0
          }),
          expenses: Math.round(expenses * 100) / 100,
          profit_margin: Math.round(profitMargin * 100) / 100,
          growth_rate: Math.round(growthRate * 100) / 100,
          recorded_at: new Date().toISOString()
        };
      });

      // Calculate revenue summary
      const summary = {
        totalRecords: revenueData.length,
        totalRevenue: 0,
        totalExpenses: 0,
        averageProfitMargin: 0,
        averageGrowthRate: 0,
        highestRevenuePeriod: null,
        lowestRevenuePeriod: null
      };

      let totalProfitMargin = 0;
      let totalGrowthRate = 0;
      let validMarginCount = 0;
      let validGrowthCount = 0;

      revenueData.forEach(record => {
        const revenue = parseFloat(record.total_revenue || 0);
        const expenses = parseFloat(record.expenses || 0);
        const profitMargin = parseFloat(record.profit_margin || 0);
        const growthRate = parseFloat(record.growth_rate || 0);

        summary.totalRevenue += revenue;
        summary.totalExpenses += expenses;

        if (profitMargin !== 0) {
          totalProfitMargin += profitMargin;
          validMarginCount++;
        }

        if (growthRate !== 0) {
          totalGrowthRate += growthRate;
          validGrowthCount++;
        }

        if (!summary.highestRevenuePeriod || revenue > parseFloat(summary.highestRevenuePeriod.total_revenue)) {
          summary.highestRevenuePeriod = record;
        }

        if (!summary.lowestRevenuePeriod || revenue < parseFloat(summary.lowestRevenuePeriod.total_revenue)) {
          summary.lowestRevenuePeriod = record;
        }
      });

      summary.averageProfitMargin = validMarginCount > 0 ? totalProfitMargin / validMarginCount : 0;
      summary.averageGrowthRate = validGrowthCount > 0 ? totalGrowthRate / validGrowthCount : 0;
      summary.netProfit = summary.totalRevenue - summary.totalExpenses;

      // Calculate trends
      const trends = [];
      if (revenueData.length > 1) {
        for (let i = 1; i < revenueData.length; i++) {
          const current = parseFloat(revenueData[i-1].total_revenue);
          const previous = parseFloat(revenueData[i].total_revenue);
          const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
          
          trends.push({
            period: revenueData[i-1].period_start,
            revenue: current,
            changePercent: Math.round(change * 100) / 100
          });
        }
      }

      res.json(DataUtilityService.formatResponse(
        true,
        {
          revenueData: revenueData,
          summary: summary,
          trends: trends
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Revenue analytics query error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to fetch revenue analytics'
      ));
    }

  } catch (error) {
    console.error('Revenue analytics endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// GET /api/v1/user-dashboard/analytics/summary - Get comprehensive analytics summary
router.get('/analytics/summary', async (req, res) => {
  // TEMPORARILY DISABLED: Endpoint under maintenance
  res.status(501).json(DataUtilityService.formatResponse(
    false, null, null, 'user', 'Analytics endpoint temporarily under maintenance'
  ));
});

// ============================================================================
// PRIORITY 3 ENDPOINTS - ENHANCEMENT FEATURES  
// ============================================================================

// GET /api/v1/user-dashboard/suppliers - Get company suppliers list
router.get('/suppliers', async (req, res) => {
  try {
    const pool = getConnection();
    const company_id = req.user?.company_id || 1;
    const { page = 1, limit = 20, status, search } = req.query;

    let whereConditions = ['s.company_id = $1'];
    let queryParams = [company_id];
    let paramIndex = 2;

    if (status && status !== 'all') {
      whereConditions.push(`s.account_status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(s.supplier_code ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex + 1})`);
      queryParams.push(`%${search}%`, `%${search}%`);
      paramIndex += 2;
    }

    const whereClause = whereConditions.join(' AND ');
    const offset = (page - 1) * limit;

    const suppliersQuery = `
      SELECT 
        s.id,
        s.supplier_code,
        s.supplier_type,
        s.overall_rating,
        s.total_trips_completed,
        s.total_revenue_generated,
        s.on_time_percentage,
        s.account_status,
        s.created_at,
        s.updated_at,
        c.name as company_name,
        c.email as company_email,
        c.phone as company_phone
      FROM suppliers s
      JOIN companies c ON s.company_id = c.id
      WHERE ${whereClause}
      ORDER BY s.overall_rating DESC, s.total_revenue_generated DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM suppliers s
      JOIN companies c ON s.company_id = c.id
      WHERE ${whereClause}
    `;

    try {
      const [suppliersResult, countResult] = await Promise.all([
        pool.query(suppliersQuery, [...queryParams, limit, offset]),
        pool.query(countQuery, queryParams)
      ]);

      const suppliers = suppliersResult.rows;
      const total = parseInt(countResult.rows[0].total);

      // Calculate summary
      const summary = {
        total: total,
        active: 0,
        pending: 0,
        inactive: 0,
        averageRating: 0,
        totalRevenue: 0
      };

      suppliers.forEach(supplier => {
        if (supplier.account_status === 'active') summary.active++;
        else if (supplier.account_status === 'pending') summary.pending++;
        else if (supplier.account_status === 'inactive') summary.inactive++;
        
        summary.averageRating += parseFloat(supplier.overall_rating || 0);
        summary.totalRevenue += parseFloat(supplier.total_revenue_generated || 0);
      });

      if (suppliers.length > 0) {
        summary.averageRating = summary.averageRating / suppliers.length;
      }

      res.json(DataUtilityService.formatResponse(
        true,
        {
          suppliers: suppliers.map(supplier => ({
            id: supplier.id,
            supplierCode: supplier.supplier_code,
            supplierType: supplier.supplier_type,
            rating: parseFloat(supplier.overall_rating || 0).toFixed(1),
            tripsCompleted: supplier.total_trips_completed || 0,
            revenueGenerated: parseFloat(supplier.total_revenue_generated || 0).toFixed(2),
            onTimePercentage: parseFloat(supplier.on_time_percentage || 0).toFixed(1),
            accountStatus: supplier.account_status,
            companyName: supplier.company_name,
            companyEmail: supplier.company_email,
            companyPhone: supplier.company_phone,
            createdAt: supplier.created_at,
            updatedAt: supplier.updated_at
          })),
          summary: {
            total: summary.total,
            active: summary.active,
            pending: summary.pending,
            inactive: summary.inactive,
            averageRating: summary.averageRating.toFixed(1),
            totalRevenue: summary.totalRevenue.toFixed(2)
          },
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: total,
            totalPages: Math.ceil(total / limit)
          }
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Suppliers query error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to fetch suppliers'
      ));
    }

  } catch (error) {
    console.error('Suppliers endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// GET /api/v1/user-dashboard/suppliers/:id - Get supplier details
router.get('/suppliers/:id', async (req, res) => {
  try {
    const pool = getConnection();
    const company_id = req.user?.company_id || 1;
    const supplierId = req.params.id;

    const supplierQuery = `
      SELECT 
        s.*,
        c.name as company_name,
        c.email as company_email,
        c.phone as company_phone,
        c.address_line1,
        c.city as company_city
      FROM suppliers s
      JOIN companies c ON s.company_id = c.id
      WHERE s.id = $1 AND s.company_id = $2
    `;

    try {
      const result = await pool.query(supplierQuery, [supplierId, company_id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json(DataUtilityService.formatResponse(
          false, null, null, 'user', 'Supplier not found'
        ));
      }

      const supplier = result.rows[0];

      res.json(DataUtilityService.formatResponse(
        true,
        {
          supplier: {
            id: supplier.id,
            supplierCode: supplier.supplier_code,
            supplierType: supplier.supplier_type,
            rating: parseFloat(supplier.overall_rating || 0).toFixed(1),
            tripsCompleted: supplier.total_trips_completed || 0,
            revenueGenerated: parseFloat(supplier.total_revenue_generated || 0).toFixed(2),
            onTimePercentage: parseFloat(supplier.on_time_percentage || 0).toFixed(1),
            accountStatus: supplier.account_status,
            representativeName: supplier.representative_name,
            designation: supplier.designation,
            telNumber: supplier.tel_number,
            breakfastType: supplier.breakfast_type,
            roomQuantity: supplier.room_quantity,
            modeOfPayment: supplier.mode_of_payment,
            creditTerms: supplier.credit_terms,
            remarks: supplier.remarks,
            company: {
              name: supplier.company_name,
              email: supplier.company_email,
              phone: supplier.company_phone,
              address: supplier.address_line1,
              city: supplier.company_city
            },
            createdAt: supplier.created_at,
            updatedAt: supplier.updated_at
          },
          analytics: {
            totalOrders: 0, // Placeholder since supplier_orders table doesn't exist
            totalSpent: 0,
            averageOrderValue: 0,
            relationshipDuration: supplier.created_at ? 
              Math.ceil((new Date() - new Date(supplier.created_at)) / (1000 * 60 * 60 * 24)) : 0
          }
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Supplier details query error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to fetch supplier details'
      ));
    }

  } catch (error) {
    console.error('Supplier details endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// Supplier management endpoints removed - use admin API instead

// ============================================================================
// SYSTEM SETTINGS
// ============================================================================

// GET /api/v1/user-dashboard/settings - Get user/company settings
router.get('/settings', async (req, res) => {
  try {
    const pool = getConnection();
    const user_id = req.user.id;
    const company_id = req.user.company_id;
    const { category } = req.query;

    let whereConditions = ['(user_id = $1 OR company_id = $2)'];
    let queryParams = [user_id, company_id];
    let paramIndex = 3;

    if (category) {
      whereConditions.push(`setting_category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const settingsQuery = `
      SELECT 
        setting_key,
        setting_value,
        setting_category,
        data_type,
        is_system_setting,
        is_user_configurable,
        user_id,
        company_id,
        updated_at
      FROM system_settings
      WHERE ${whereClause}
      ORDER BY setting_category, setting_key
    `;

    try {
      const result = await pool.query(settingsQuery, queryParams);
      const settings = result.rows;

      // Group settings by category
      const groupedSettings = {};
      const summary = {
        totalSettings: settings.length,
        userSettings: 0,
        companySettings: 0,
        systemSettings: 0,
        categories: new Set()
      };

      settings.forEach(setting => {
        if (!groupedSettings[setting.setting_category]) {
          groupedSettings[setting.setting_category] = [];
        }
        
        // Parse setting value based on data type
        let parsedValue = setting.setting_value;
        try {
          if (setting.data_type === 'json') {
            parsedValue = JSON.parse(setting.setting_value);
          } else if (setting.data_type === 'boolean') {
            parsedValue = setting.setting_value === 'true' || setting.setting_value === '1';
          } else if (setting.data_type === 'number') {
            parsedValue = parseFloat(setting.setting_value);
          }
        } catch (e) {
          // Keep original value if parsing fails
        }

        groupedSettings[setting.setting_category].push({
          ...setting,
          setting_value: parsedValue
        });

        summary.categories.add(setting.setting_category);
        
        if (setting.user_id) {
          summary.userSettings++;
        } else if (setting.company_id) {
          summary.companySettings++;
        } else {
          summary.systemSettings++;
        }
      });

      summary.categories = Array.from(summary.categories);

      res.json(DataUtilityService.formatResponse(
        true,
        {
          settings: groupedSettings,
          summary: summary
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Settings query error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to fetch settings'
      ));
    }

  } catch (error) {
    console.error('Settings endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// PUT /api/v1/user-dashboard/settings - Update settings
router.put('/settings', async (req, res) => {
  try {
    const pool = getConnection();
    const user_id = req.user.id;
    const company_id = req.user.company_id;
    const { settings } = req.body;

    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Settings array is required'
      ));
    }

    if (settings.length === 0) {
      return res.status(400).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'No settings to update'
      ));
    }

    const updateResults = [];

    for (const settingUpdate of settings) {
      const { setting_key, setting_value, setting_category, scope } = settingUpdate;

      if (!setting_key || setting_value === undefined) {
        updateResults.push({
          setting_key: setting_key,
          success: false,
          error: 'Missing setting_key or setting_value'
        });
        continue;
      }

      // Determine if this is a user or company setting
      const isUserSetting = scope === 'user';
      const targetUserId = isUserSetting ? user_id : null;
      const targetCompanyId = isUserSetting ? null : company_id;

      try {
        // Check if setting exists and is user-configurable
        const checkQuery = `
          SELECT id, is_user_configurable, data_type
          FROM system_settings 
          WHERE setting_key = $1 AND setting_category = $2 
          AND (user_id = $3 OR company_id = $4 OR (user_id IS NULL AND company_id IS NULL))
          LIMIT 1
        `;

        const checkResult = await pool.query(checkQuery, [setting_key, setting_category, targetUserId, targetCompanyId]);
        const existingSetting = checkResult.rows[0];

        if (!existingSetting) {
          updateResults.push({
            setting_key: setting_key,
            success: false,
            error: 'Setting not found or not accessible'
          });
          continue;
        }

        if (!existingSetting.is_user_configurable) {
          updateResults.push({
            setting_key: setting_key,
            success: false,
            error: 'Setting is not user-configurable'
          });
          continue;
        }

        // Format value based on data type
        let formattedValue = setting_value;
        if (existingSetting.data_type === 'json') {
          formattedValue = JSON.stringify(setting_value);
        } else if (existingSetting.data_type === 'boolean') {
          formattedValue = setting_value ? 'true' : 'false';
        } else {
          formattedValue = String(setting_value);
        }

        // Update or insert setting using PostgreSQL upsert
        const upsertQuery = `
          INSERT INTO system_settings 
          (setting_key, setting_value, setting_category, data_type, 
           is_system_setting, is_user_configurable, user_id, company_id)
          VALUES ($1, $2, $3, $4, false, true, $5, $6)
          ON CONFLICT (setting_key, COALESCE(user_id, 0), COALESCE(company_id, 0)) 
          DO UPDATE SET 
            setting_value = EXCLUDED.setting_value,
            updated_at = CURRENT_TIMESTAMP
        `;

        await pool.query(upsertQuery, [
          setting_key, formattedValue, setting_category, 
          existingSetting.data_type, targetUserId, targetCompanyId
        ]);

        updateResults.push({
          setting_key: setting_key,
          success: true,
          message: 'Setting updated successfully'
        });

      } catch (err) {
        console.error('Setting update error:', err);
        updateResults.push({
          setting_key: setting_key,
          success: false,
          error: 'Failed to update setting'
        });
      }
    }

    const successCount = updateResults.filter(r => r.success).length;
    const failureCount = updateResults.filter(r => !r.success).length;

    res.json(DataUtilityService.formatResponse(
      successCount > 0,
      {
        updateResults: updateResults,
        summary: {
          total: settings.length,
          successful: successCount,
          failed: failureCount
        }
      },
      null,
      'user'
    ));

  } catch (error) {
    console.error('Update settings endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// ============================================================================
// ADVANCED ANALYTICS
// ============================================================================

// GET /api/v1/user-dashboard/analytics/trends - Get trend analysis
router.get('/analytics/trends', async (req, res) => {
  try {
    const pool = getConnection();
    const company_id = req.user.company_id;
    const { 
      metric_type = 'bookings', 
      period = 'daily', 
      date_from, 
      date_to
    } = req.query;

    // Set default date range
    const endDate = date_to || new Date().toISOString().split('T')[0];
    const startDate = date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let groupByClause;
    
    switch (period) {
      case 'hourly':
        groupByClause = "DATE_TRUNC('hour', created_at)";
        break;
      case 'weekly':
        groupByClause = "DATE_TRUNC('week', created_at)";
        break;
      case 'monthly':
        groupByClause = "DATE_TRUNC('month', created_at)";
        break;
      default: // daily
        groupByClause = "DATE_TRUNC('day', created_at)";
    }

    let trendsQuery;
    let valueColumn;

    switch (metric_type) {
      case 'revenue':
        trendsQuery = `
          SELECT 
            ${groupByClause} as period,
            COUNT(*) as count,
            COALESCE(SUM(total_amount), 0) as value,
            COALESCE(AVG(total_amount), 0) as average_value
          FROM bookings
          WHERE company_id = $1 AND DATE(created_at) BETWEEN $2 AND $3
          GROUP BY ${groupByClause}
          ORDER BY period
        `;
        valueColumn = 'value';
        break;
      case 'vehicles':
        trendsQuery = `
          SELECT 
            ${groupByClause} as period,
            COUNT(*) as count,
            COUNT(*) as value
          FROM vehicles
          WHERE company_id = $1 AND DATE(created_at) BETWEEN $2 AND $3
          GROUP BY ${groupByClause}
          ORDER BY period
        `;
        valueColumn = 'count';
        break;
      case 'drivers':
        trendsQuery = `
          SELECT 
            ${groupByClause} as period,
            COUNT(*) as count,
            COUNT(*) as value
          FROM drivers
          WHERE company_id = $1 AND DATE(created_at) BETWEEN $2 AND $3
          GROUP BY ${groupByClause}
          ORDER BY period
        `;
        valueColumn = 'count';
        break;
      default: // bookings
        trendsQuery = `
          SELECT 
            ${groupByClause} as period,
            COUNT(*) as count,
            COUNT(*) as value,
            COUNT(CASE WHEN booking_status = 'completed' THEN 1 END) as completed_count,
            COUNT(CASE WHEN booking_status = 'cancelled' THEN 1 END) as cancelled_count
          FROM bookings
          WHERE company_id = $1 AND DATE(created_at) BETWEEN $2 AND $3
          GROUP BY ${groupByClause}
          ORDER BY period
        `;
        valueColumn = 'count';
    }

    try {
      const result = await pool.query(trendsQuery, [company_id, startDate, endDate]);
      const trends = result.rows;

      // Calculate trend analysis
      const analysis = {
        totalPeriods: trends.length,
        totalValue: 0,
        averageValue: 0,
        growthRate: 0,
        trend: 'stable',
        peaks: [],
        valleys: []
      };

      if (trends.length > 0) {
        analysis.totalValue = trends.reduce((sum, t) => sum + parseFloat(t[valueColumn] || 0), 0);
        analysis.averageValue = analysis.totalValue / trends.length;

        // Calculate growth rate (last vs first)
        if (trends.length > 1) {
          const firstValue = parseFloat(trends[0][valueColumn] || 0);
          const lastValue = parseFloat(trends[trends.length - 1][valueColumn] || 0);
          
          if (firstValue > 0) {
            analysis.growthRate = ((lastValue - firstValue) / firstValue) * 100;
            
            if (analysis.growthRate > 5) {
              analysis.trend = 'growing';
            } else if (analysis.growthRate < -5) {
              analysis.trend = 'declining';
            }
          }
        }

        // Find peaks and valleys
        for (let i = 1; i < trends.length - 1; i++) {
          const prev = parseFloat(trends[i-1][valueColumn] || 0);
          const current = parseFloat(trends[i][valueColumn] || 0);
          const next = parseFloat(trends[i+1][valueColumn] || 0);

          if (current > prev && current > next) {
            analysis.peaks.push({
              period: trends[i].period,
              value: current
            });
          } else if (current < prev && current < next) {
            analysis.valleys.push({
              period: trends[i].period,
              value: current
            });
          }
        }
      }

      res.json(DataUtilityService.formatResponse(
        true,
        {
          trends: trends,
          analysis: analysis,
          parameters: {
            metric_type,
            period,
            date_range: { startDate, endDate }
          }
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Trends query error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to fetch trend data'
      ));
    }

  } catch (error) {
    console.error('Trends analysis endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// GET /api/v1/user-dashboard/analytics/forecasting - Get forecasting data
router.get('/analytics/forecasting', async (req, res) => {
  try {
    const pool = getConnection();
    const company_id = req.user.company_id;
    const { 
      metric_type = 'bookings', 
      forecast_periods = 7,
      base_periods = 30 
    } = req.query;

    // Get historical data for forecasting
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - parseInt(base_periods) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let historicalQuery;
    let valueColumn;

    switch (metric_type) {
      case 'revenue':
        historicalQuery = `
          SELECT 
            DATE(created_at) as date,
            COALESCE(SUM(total_amount), 0) as value
          FROM bookings
          WHERE company_id = $1 AND DATE(created_at) BETWEEN $2 AND $3
          GROUP BY DATE(created_at)
          ORDER BY date
        `;
        valueColumn = 'value';
        break;
      default: // bookings
        historicalQuery = `
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as value
          FROM bookings
          WHERE company_id = $1 AND DATE(created_at) BETWEEN $2 AND $3
          GROUP BY DATE(created_at)
          ORDER BY date
        `;
        valueColumn = 'value';
    }

    try {
      const result = await pool.query(historicalQuery, [company_id, startDate, endDate]);
      const historical = result.rows;

      // Simple linear forecasting
      const forecast = [];
      
      // Calculate forecast accuracy metrics
      const accuracy = {
        mae: 0, // Mean Absolute Error
        rmse: 0, // Root Mean Square Error
        mape: 0, // Mean Absolute Percentage Error
        r_squared: 0
      };
      
      if (historical.length >= 7) {
        // Calculate trend from last 7 days
        const recentData = historical.slice(-7);
        const values = recentData.map(d => parseFloat(d[valueColumn] || 0));
        
        // Simple moving average
        const average = values.reduce((sum, val) => sum + val, 0) / values.length;
        
        // Calculate trend (slope)
        let trend = 0;
        if (values.length > 1) {
          const firstHalf = values.slice(0, Math.floor(values.length / 2));
          const secondHalf = values.slice(Math.floor(values.length / 2));
          
          const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
          
          trend = (secondAvg - firstAvg) / firstHalf.length;
        }

        // Generate forecast
        for (let i = 1; i <= parseInt(forecast_periods); i++) {
          const forecastDate = new Date(endDate);
          forecastDate.setDate(forecastDate.getDate() + i);
          
          const forecastValue = Math.max(0, average + (trend * i));
          
          forecast.push({
            date: forecastDate.toISOString().split('T')[0],
            predicted_value: Math.round(forecastValue * 100) / 100,
            confidence_interval: {
              lower: Math.round(forecastValue * 0.8 * 100) / 100,
              upper: Math.round(forecastValue * 1.2 * 100) / 100
            }
          });
        }

        // Calculate forecast accuracy metrics if we have enough data
        if (historical.length >= 14) {
          // Use last 7 days for accuracy calculation
          const testData = historical.slice(-7);
          
          let totalError = 0;
          let totalPercentError = 0;
          
          testData.forEach((actual, index) => {
            const predicted = average + (trend * (index + 1));
            const error = Math.abs(parseFloat(actual[valueColumn]) - predicted);
            totalError += error;
            
            if (parseFloat(actual[valueColumn]) > 0) {
              totalPercentError += (error / parseFloat(actual[valueColumn])) * 100;
            }
          });

          accuracy.mae = totalError / testData.length;
          accuracy.mape = totalPercentError / testData.length;
        }
      }

      res.json(DataUtilityService.formatResponse(
        true,
        {
          historical: historical,
          forecast: forecast,
          accuracy: accuracy,
          parameters: {
            metric_type,
            forecast_periods: parseInt(forecast_periods),
            base_periods: parseInt(base_periods)
          }
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Forecasting query error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to fetch forecasting data'
      ));
    }

  } catch (error) {
    console.error('Forecasting endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// GET /api/v1/user-dashboard/analytics/correlations - Get correlation analysis
router.get('/analytics/correlations', async (req, res) => {
  try {
    const pool = getConnection();
    const company_id = req.user.company_id;
    const { date_from, date_to } = req.query;

    // Set default date range
    const endDate = date_to || new Date().toISOString().split('T')[0];
    const startDate = date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get daily aggregated data
    const correlationQuery = `
      SELECT 
        DATE(b.created_at) as date,
        COUNT(b.id) as daily_bookings,
        COALESCE(SUM(b.total_amount), 0) as daily_revenue,
        COUNT(DISTINCT b.driver_id) as active_drivers,
        COUNT(DISTINCT b.vehicle_id) as active_vehicles,
        COUNT(CASE WHEN b.booking_status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN b.booking_status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COALESCE(AVG(b.total_amount), 0) as avg_booking_value
      FROM bookings b
      WHERE b.company_id = $1 AND DATE(b.created_at) BETWEEN $2 AND $3
      GROUP BY DATE(b.created_at)
      ORDER BY date
    `;

    try {
      const result = await pool.query(correlationQuery, [company_id, startDate, endDate]);
      const dailyData = result.rows;

      // Calculate correlations between different metrics
      const correlations = [];
      
      if (dailyData.length > 3) {
        const metrics = [
          { name: 'Daily Bookings', field: 'daily_bookings' },
          { name: 'Daily Revenue', field: 'daily_revenue' },
          { name: 'Active Drivers', field: 'active_drivers' },
          { name: 'Active Vehicles', field: 'active_vehicles' },
          { name: 'Completed Bookings', field: 'completed_bookings' },
          { name: 'Average Booking Value', field: 'avg_booking_value' }
        ];

        for (let i = 0; i < metrics.length; i++) {
          for (let j = i + 1; j < metrics.length; j++) {
            const metric1 = metrics[i];
            const metric2 = metrics[j];
            
            const coefficient = calculateCorrelation(dailyData, metric1.field, metric2.field);
            
            correlations.push({
              metric1: metric1.name,
              metric2: metric2.name,
              correlation_coefficient: coefficient,
              strength: getCorrelationStrength(coefficient),
              relationship: coefficient > 0 ? 'positive' : 'negative'
            });
          }
        }
      }

      res.json(DataUtilityService.formatResponse(
        true,
        {
          dailyData: dailyData,
          correlations: correlations,
          parameters: {
            date_range: { startDate, endDate },
            data_points: dailyData.length
          }
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Correlation query error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to fetch correlation data'
      ));
    }

  } catch (error) {
    console.error('Correlation analysis endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Helper function to calculate correlation coefficient
function calculateCorrelation(data, metric1, metric2) {
  if (data.length < 2) return 0;

  const values1 = data.map(d => parseFloat(d[metric1] || 0));
  const values2 = data.map(d => parseFloat(d[metric2] || 0));

  const mean1 = values1.reduce((sum, val) => sum + val, 0) / values1.length;
  const mean2 = values2.reduce((sum, val) => sum + val, 0) / values2.length;

  let numerator = 0;
  let sum1 = 0;
  let sum2 = 0;

  for (let i = 0; i < values1.length; i++) {
    const diff1 = values1[i] - mean1;
    const diff2 = values2[i] - mean2;
    
    numerator += diff1 * diff2;
    sum1 += diff1 * diff1;
    sum2 += diff2 * diff2;
  }

  const denominator = Math.sqrt(sum1 * sum2);
  return denominator === 0 ? 0 : numerator / denominator;
}

function getCorrelationStrength(coefficient) {
  const abs = Math.abs(coefficient);
  if (abs >= 0.8) return 'very strong';
  if (abs >= 0.6) return 'strong';
  if (abs >= 0.4) return 'moderate';
  if (abs >= 0.2) return 'weak';
  return 'very weak';
}

// ============================================================================
// PAYMENT TRACKING - Simple payment management for travel bookings
// ============================================================================

// GET /api/v1/user-dashboard/payments - Get payment status for bookings
router.get('/payments', async (req, res) => {
  try {
    const pool = getConnection();
    const company_id = req.user?.company_id || 1;
    const { page = 1, limit = 20, status, date_from, date_to } = req.query;

    let whereConditions = ['company_id = $1'];
    let queryParams = [company_id];
    let paramIndex = 2;

    if (status && status !== 'all') {
      whereConditions.push(`payment_status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (date_from) {
      whereConditions.push(`DATE(created_at) >= $${paramIndex}`);
      queryParams.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      whereConditions.push(`DATE(created_at) <= $${paramIndex}`);
      queryParams.push(date_to);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');
    const offset = (page - 1) * limit;

    const paymentsQuery = `
      SELECT 
        booking_reference,
        contact_person_name,
        total_amount,
        payment_status,
        booking_status,
        pickup_address,
        destination_address,
        pickup_datetime,
        created_at
      FROM bookings
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const summaryQuery = `
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_bookings,
        COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_bookings,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN payment_status = 'pending' THEN total_amount ELSE 0 END) as pending_revenue
      FROM bookings
      WHERE ${whereClause}
    `;

    try {
      const [paymentsResult, summaryResult] = await Promise.all([
        pool.query(paymentsQuery, [...queryParams, limit, offset]),
        pool.query(summaryQuery, queryParams)
      ]);

      const payments = paymentsResult.rows || [];
      const summary = summaryResult.rows[0];

      res.json(DataUtilityService.formatResponse(
        true,
        {
          payments: payments.map(payment => ({
            bookingReference: payment.booking_reference,
            customerName: payment.contact_person_name,
            amount: parseFloat(payment.total_amount).toFixed(2),
            paymentStatus: payment.payment_status,
            bookingStatus: payment.booking_status,
            route: `${payment.pickup_address} → ${payment.destination_address}`,
            tripDate: payment.pickup_datetime,
            createdAt: payment.created_at
          })),
          summary: {
            totalBookings: parseInt(summary.total_bookings),
            paidBookings: parseInt(summary.paid_bookings),
            pendingBookings: parseInt(summary.pending_bookings),
            totalRevenue: parseFloat(summary.total_revenue || 0).toFixed(2),
            pendingRevenue: parseFloat(summary.pending_revenue || 0).toFixed(2)
          },
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: payments.length,
            totalPages: Math.ceil(payments.length / limit)
          }
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Payments query error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to fetch payment data'
      ));
    }

  } catch (error) {
    console.error('Payments endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

// PUT /api/v1/user-dashboard/bookings/:id/payment - Update payment status for a booking
router.put('/bookings/:id/payment', async (req, res) => {
  try {
    const pool = getConnection();
    const company_id = req.user?.company_id || 1;
    const bookingId = req.params.id;
    const { payment_status, payment_method, payment_notes } = req.body;

    const allowedStatuses = ['pending', 'paid', 'cancelled', 'refunded'];
    
    if (!payment_status || !allowedStatuses.includes(payment_status)) {
      return res.status(400).json(DataUtilityService.formatResponse(
        false, null, null, 'user', `Payment status must be one of: ${allowedStatuses.join(', ')}`
      ));
    }

    try {
      // Update payment status
      const updateQuery = `
        UPDATE bookings 
        SET payment_status = $1, 
            payment_method = $2,
            payment_notes = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 AND company_id = $5
      `;

      const result = await pool.query(updateQuery, [payment_status, payment_method, payment_notes, bookingId, company_id]);

      if (result.rowCount === 0) {
        return res.status(404).json(DataUtilityService.formatResponse(
          false, null, null, 'user', 'Booking not found'
        ));
      }

      res.json(DataUtilityService.formatResponse(
        true,
        {
          bookingId: bookingId,
          newPaymentStatus: payment_status,
          paymentMethod: payment_method,
          message: 'Payment status updated successfully'
        },
        null,
        'user'
      ));
    } catch (err) {
      console.error('Payment update query error:', err);
      return res.status(500).json(DataUtilityService.formatResponse(
        false, null, null, 'user', 'Failed to update payment status'
      ));
    }

  } catch (error) {
    console.error('Update payment status endpoint error:', error);
    res.status(500).json(DataUtilityService.formatResponse(false, null, null, 'user', 'Internal server error'));
  }
});

module.exports = router; 