const express = require('express');
const router = express.Router();
const { getConnection, executeQuery, executeQuerySingle } = require('../config/database');

// Get detailed supplier analytics for admin dashboard (must be before /:id routes)
router.get('/analytics', async (req, res) => {
    try {
        const pool = getConnection();
        const timeframe = req.query.timeframe || '30'; // days
        
        const analyticsQuery = `
            SELECT 
                s.supplier_type,
                COUNT(*) as total_suppliers,
                COUNT(CASE WHEN s.account_status = 'active' THEN 1 END) as active_suppliers,
                COUNT(CASE WHEN s.account_status = 'pending' THEN 1 END) as pending_suppliers,
                COUNT(CASE WHEN s.account_status = 'inactive' THEN 1 END) as inactive_suppliers,
                AVG(s.overall_rating) as avg_rating,
                SUM(s.total_revenue_generated) as total_revenue,
                SUM(s.total_trips_completed) as total_trips,
                AVG(s.on_time_percentage) as avg_on_time,
                COUNT(CASE WHEN s.overall_rating >= 4.5 THEN 1 END) as excellent_performers,
                COUNT(CASE WHEN s.overall_rating >= 4.0 AND s.overall_rating < 4.5 THEN 1 END) as good_performers,
                COUNT(CASE WHEN s.overall_rating < 4.0 THEN 1 END) as needs_improvement,
                COUNT(CASE WHEN s.updated_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recently_updated
            FROM suppliers s
            GROUP BY s.supplier_type
            ORDER BY total_revenue DESC
        `;
        
        const result = await pool.query(analyticsQuery);
        const analytics = result.rows;
        
        const response = {
            timeframe: `${timeframe} days`,
            analytics: analytics.map(item => ({
                type: item.supplier_type,
                metrics: {
                    total: parseInt(item.total_suppliers),
                    active: parseInt(item.active_suppliers),
                    pending: parseInt(item.pending_suppliers),
                    inactive: parseInt(item.inactive_suppliers),
                    recentlyUpdated: parseInt(item.recently_updated)
                },
                performance: {
                    avgRating: parseFloat(item.avg_rating || 0).toFixed(1),
                    totalRevenue: parseFloat(item.total_revenue || 0).toFixed(2),
                    totalTrips: parseInt(item.total_trips || 0),
                    avgOnTime: parseFloat(item.avg_on_time || 0).toFixed(1),
                    excellent: parseInt(item.excellent_performers || 0),
                    good: parseInt(item.good_performers || 0),
                    needsImprovement: parseInt(item.needs_improvement || 0)
                }
            })),
            lastUpdated: new Date().toISOString()
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('Supplier analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all suppliers with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const status = req.query.status || 'all';
        
        let whereClause = '';
        let queryParams = [];
        if (status !== 'all') {
            whereClause = 'WHERE s.account_status = $1';
            queryParams.push(status);
        }
        
        const query = `
            SELECT 
                s.id,
                s.supplier_code,
                s.supplier_type,
                s.overall_rating,
                s.total_trips_completed,
                s.total_revenue_generated,
                s.on_time_percentage,
                s.account_status,
                s.representative_name,
                s.designation,
                s.tel_number,
                s.breakfast_type,
                s.room_quantity,
                s.mode_of_payment,
                s.credit_terms,
                s.remarks,
                s.frontdesk_phone,
                s.frontdesk_email,
                s.security_deposit,
                s.location,
                s.property_name,
                s.contracted_rates_date,
                s.corporate_rates_date,
                s.accreditation,
                c.name as company_name,
                c.email as company_email,
                c.phone as company_phone,
                c.city as company_city,
                c.address_line1 as company_address,
                s.created_at,
                s.updated_at
            FROM suppliers s
            JOIN companies c ON s.company_id = c.id
            ${whereClause}
            ORDER BY s.overall_rating DESC, s.total_revenue_generated DESC
            LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
        `;
        
        const countQuery = `
            SELECT COUNT(*) as total
            FROM suppliers s
            JOIN companies c ON s.company_id = c.id
            ${whereClause}
        `;
        
        // Add limit and offset parameters
        queryParams.push(limit, offset);
        
        // Get count first
        const countParams = status !== 'all' ? [status] : [];
        const countResult = await executeQuerySingle(countQuery, countParams);
        
        // Get suppliers
        const suppliers = await executeQuery(query, queryParams);
        
        const response = {
            suppliers: suppliers.map(supplier => ({
                id: supplier.id,
                supplierCode: supplier.supplier_code,
                supplierType: supplier.supplier_type,
                rating: parseFloat(supplier.overall_rating || 0).toFixed(1),
                tripsCompleted: supplier.total_trips_completed || 0,
                revenueGenerated: parseFloat(supplier.total_revenue_generated || 0).toFixed(2),
                onTimePercentage: parseFloat(supplier.on_time_percentage || 0).toFixed(1),
                accountStatus: supplier.account_status,
                company: {
                    name: supplier.company_name,
                    email: supplier.company_email,
                    phone: supplier.company_phone,
                    city: supplier.company_city,
                    address: supplier.company_address
                },
                // Add the updated fields
                representative: supplier.representative_name,
                designation: supplier.designation,
                telNumber: supplier.tel_number,
                breakfastType: supplier.breakfast_type,
                roomQuantity: supplier.room_quantity,
                modeOfPayment: supplier.mode_of_payment,
                creditTerms: supplier.credit_terms,
                remarks: supplier.remarks,
                frontdeskPhone: supplier.frontdesk_phone,
                frontdeskEmail: supplier.frontdesk_email,
                securityDeposit: supplier.security_deposit,
                location: supplier.location,
                propertyName: supplier.property_name,
                contractedRatesDate: supplier.contracted_rates_date,
                corporateRatesDate: supplier.corporate_rates_date,
                accreditation: supplier.accreditation,
                createdAt: supplier.created_at,
                updatedAt: supplier.updated_at
            })),
            pagination: {
                page: page,
                limit: limit,
                total: parseInt(countResult.total),
                pages: Math.ceil(countResult.total / limit)
            },
            lastUpdated: new Date().toISOString()
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('Suppliers list error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Get supplier portfolio counts by type
router.get('/portfolio-count', async (req, res) => {
    try {
        const query = `
            SELECT 
                supplier_type,
                COUNT(*) as count,
                COUNT(CASE WHEN account_status = 'active' THEN 1 END) as active_count,
                COUNT(CASE WHEN account_status = 'inactive' THEN 1 END) as inactive_count,
                COUNT(CASE WHEN account_status = 'pending' THEN 1 END) as pending_count
            FROM suppliers
            GROUP BY supplier_type
            ORDER BY count DESC
        `;
        
        const pool = getConnection();
        const result = await pool.query(query);
        const results = result.rows;
        
        // Initialize default counts
        const portfolioCounts = {
            hotel: 0,
            transfer: 0,
            airline: 0,
            travel_operator: 0
        };
        
        // Map database results to portfolio counts
        results.forEach(row => {
            const type = row.supplier_type.toLowerCase().replace(/[^a-z]/g, '_');
            if (Object.prototype.hasOwnProperty.call(portfolioCounts, type)) {
                portfolioCounts[type] = row.count;
            } else if (type.includes('hotel')) {
                portfolioCounts.hotel += row.count;
            } else if (type.includes('transfer') || type.includes('transport')) {
                portfolioCounts.transfer += row.count;
            } else if (type.includes('airline') || type.includes('flight')) {
                portfolioCounts.airline += row.count;
            } else if (type.includes('travel') || type.includes('operator')) {
                portfolioCounts.travel_operator += row.count;
            }
        });
        
        const response = {
            portfolioCounts: {
                hotel: portfolioCounts.hotel,
                transfer: portfolioCounts.transfer,
                airline: portfolioCounts.airline,
                travelOperator: portfolioCounts.travel_operator
            },
            details: results.map(row => ({
                type: row.supplier_type,
                total: row.count,
                active: row.active_count,
                inactive: row.inactive_count,
                pending: row.pending_count
            })),
            lastUpdated: new Date().toISOString()
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('Supplier portfolio count error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get supplier performance summary
router.get('/performance', async (req, res) => {
    try {
        const { getConnection } = require('../config/database');
        const pool = getConnection();
        
        const query = `
            SELECT 
                COUNT(*) as total_suppliers,
                AVG(overall_rating) as average_rating,
                SUM(total_trips_completed) as total_trips,
                SUM(total_revenue_generated) as total_revenue,
                AVG(on_time_percentage) as average_on_time,
                COUNT(CASE WHEN account_status = 'active' THEN 1 END) as active_suppliers,
                COUNT(CASE WHEN account_status = 'inactive' THEN 1 END) as inactive_suppliers,
                COUNT(CASE WHEN overall_rating >= 4.5 THEN 1 END) as top_rated_suppliers
            FROM suppliers
        `;
        
        const result = await pool.query(query);
        const data = result.rows[0];
        
        const response = {
            summary: {
                totalSuppliers: parseInt(data.total_suppliers),
                averageRating: parseFloat(data.average_rating || 0).toFixed(1),
                totalTrips: parseInt(data.total_trips || 0),
                totalRevenue: parseFloat(data.total_revenue || 0).toFixed(2),
                averageOnTime: parseFloat(data.average_on_time || 0).toFixed(1),
                activeSuppliers: parseInt(data.active_suppliers),
                inactiveSuppliers: parseInt(data.inactive_suppliers),
                topRatedSuppliers: parseInt(data.top_rated_suppliers)
            },
            lastUpdated: new Date().toISOString()
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('Supplier performance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get supplier details
router.get('/:id', async (req, res) => {
    try {
        const pool = getConnection();
        const supplierId = req.params.id;
        
        if (!supplierId) {
            return res.status(400).json({ error: 'Supplier ID is required' });
        }
        
        const query = `
            SELECT 
                s.*,
                c.name as company_name,
                c.email as company_email,
                c.phone as company_phone,
                c.address_line1,
                c.city as company_city,
                c.country as company_country,
                c.verification_status
            FROM suppliers s
            JOIN companies c ON s.company_id = c.id
            WHERE s.id = $1
        `;
        
        const result = await pool.query(query, [supplierId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Supplier not found' });
        }
        
        const supplier = result.rows[0];
        const response = {
            id: supplier.id,
            supplierCode: supplier.supplier_code,
            supplierType: supplier.supplier_type,
            rating: parseFloat(supplier.overall_rating).toFixed(1),
            tripsCompleted: supplier.total_trips_completed,
            revenueGenerated: parseFloat(supplier.total_revenue_generated).toFixed(2),
            onTimePercentage: parseFloat(supplier.on_time_percentage).toFixed(1),
            accountStatus: supplier.account_status,
            company: {
                id: supplier.company_id,
                name: supplier.company_name,
                email: supplier.company_email,
                phone: supplier.company_phone,
                address: supplier.address_line1,
                city: supplier.company_city,
                country: supplier.company_country,
                verificationStatus: supplier.verification_status
            },
            // Add missing fields
            representative: supplier.representative_name,
            designation: supplier.designation,
            telNumber: supplier.tel_number,
            breakfastType: supplier.breakfast_type,
            roomQuantity: supplier.room_quantity,
            modeOfPayment: supplier.mode_of_payment,
            creditTerms: supplier.credit_terms,
            remarks: supplier.remarks,
            frontdeskPhone: supplier.frontdesk_phone,
            frontdeskEmail: supplier.frontdesk_email,
            securityDeposit: supplier.security_deposit,
            location: supplier.location,
            propertyName: supplier.property_name,
            contractedRatesDate: supplier.contracted_rates_date,
            corporateRatesDate: supplier.corporate_rates_date,
            accreditation: supplier.accreditation,
            createdAt: supplier.created_at,
            updatedAt: supplier.updated_at
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('Supplier details error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new supplier
router.post('/', async (req, res) => {
    try {
        const pool = getConnection();
        const {
            companyName,
            companyAddress,
            contactNumber,
            email,
            supplierType = 'transport',
            companyRepresentative,
            designation,
            telNumber,
            breakfastType,
            roomQuantity,
            modeOfPayment,
            paymentMode, // New field name
            creditTerms,
            remarks,
            // Hotel-specific fields
            frontdeskPhone,
            frontdeskEmail,
            securityDeposit,
            // New fields
            location,
            propertyName,
            contractedRatesDate,
            corporateRatesDate,
            accreditation
        } = req.body;

        // Use new field name if available, fallback to old field name
        const finalPaymentMode = paymentMode || modeOfPayment;

        // Convert empty strings to null for integer fields
        const sanitizedRoomQuantity = roomQuantity === '' || roomQuantity === null || roomQuantity === undefined ? null : parseInt(roomQuantity);

        if (!companyName || !companyAddress || !contactNumber || !email) {
            return res.status(400).json({ 
                error: 'Missing required fields: companyName, companyAddress, contactNumber, email' 
            });
        }

        // First create the company
        const createCompanyQuery = `
            INSERT INTO companies (name, email, phone, address_line1, city, country, verification_status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, 'Philippines', 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id
        `;

        const companyResult = await pool.query(createCompanyQuery, [companyName, email, contactNumber, companyAddress, companyAddress]);
        const companyId = companyResult.rows[0].id;
        
        // Generate supplier code
        const supplierCode = `SUP${String(Date.now()).slice(-6)}`;

        // Create the supplier with new fields
        const createSupplierQuery = `
            INSERT INTO suppliers (
                supplier_code, 
                company_id, 
                supplier_type, 
                overall_rating, 
                total_trips_completed, 
                total_revenue_generated, 
                on_time_percentage, 
                account_status,
                representative_name,
                designation,
                tel_number,
                breakfast_type,
                room_quantity,
                mode_of_payment,
                credit_terms,
                remarks,
                frontdesk_phone,
                frontdesk_email,
                security_deposit,
                location,
                property_name,
                contracted_rates_date,
                corporate_rates_date,
                accreditation,
                created_at, 
                updated_at
            ) VALUES ($1, $2, $3, 0.0, 0, 0.0, 0.0, 'pending', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id
        `;

        const supplierResult = await pool.query(createSupplierQuery, [
            supplierCode, 
            companyId, 
            supplierType, 
            companyRepresentative,
            designation,
            telNumber,
            breakfastType,
            sanitizedRoomQuantity,
            finalPaymentMode,
            creditTerms,
            remarks,
            frontdeskPhone,
            frontdeskEmail,
            securityDeposit,
            location, // Use location field only
            propertyName || companyName,  // Use propertyName or fallback to companyName
            contractedRatesDate,
            corporateRatesDate,
            accreditation
        ]);

        const supplierId = supplierResult.rows[0].id;

        // Return the created supplier
        const selectQuery = `
            SELECT 
                s.*,
                c.name as company_name,
                c.email as company_email,
                c.phone as company_phone,
                c.address_line1
            FROM suppliers s
            JOIN companies c ON s.company_id = c.id
            WHERE s.id = $1
        `;

        const createdSupplierResult = await pool.query(selectQuery, [supplierId]);
        const supplier = createdSupplierResult.rows[0];

        const response = {
            success: true,
            message: 'Supplier created successfully',
            supplier: {
                id: supplier.id,
                supplierCode: supplier.supplier_code,
                supplierType: supplier.supplier_type,
                companyName: supplier.company_name,
                companyAddress: supplier.address_line1,
                contactNumber: supplier.company_phone,
                email: supplier.company_email,
                representative: supplier.representative_name,
                designation: supplier.designation,
                telNumber: supplier.tel_number,
                breakfastType: supplier.breakfast_type,
                roomQuantity: supplier.room_quantity,
                paymentMode: supplier.mode_of_payment,
                creditTerms: supplier.credit_terms,
                remarks: supplier.remarks,
                frontdeskPhone: supplier.frontdesk_phone,
                frontdeskEmail: supplier.frontdesk_email,
                securityDeposit: supplier.security_deposit,
                location: supplier.location,
                propertyName: supplier.property_name,
                contractedRatesDate: supplier.contracted_rates_date,
                corporateRatesDate: supplier.corporate_rates_date,
                accreditation: supplier.accreditation,
                accountStatus: supplier.account_status,
                overallRating: supplier.overall_rating,
                totalTripsCompleted: supplier.total_trips_completed,
                totalRevenueGenerated: supplier.total_revenue_generated,
                onTimePercentage: supplier.on_time_percentage,
                createdAt: supplier.created_at,
                updatedAt: supplier.updated_at
            }
        };

        res.status(201).json(response);
        
    } catch (error) {
        console.error('Create supplier error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
});

// Update existing supplier
router.put('/:id', async (req, res) => {
    try {
        const pool = getConnection();
        const supplierId = req.params.id;
        const {
            companyRepresentative,
            designation,
            telNumber,
            breakfastType,
            roomQuantity,
            modeOfPayment,
            paymentMode, // New field name
            creditTerms,
            remarks,
            accountStatus,
            // Company fields
            contactNumber,
            email,
            companyAddress,
            // Hotel-specific fields
            frontdeskPhone,
            frontdeskEmail,
            securityDeposit,
            // New fields
            location,
            contractedRatesDate,
            corporateRatesDate,
            accreditation
        } = req.body;

        // Use new field name if available, fallback to old field name
        const finalPaymentMode = paymentMode || modeOfPayment;

        // Convert empty strings to null for integer fields
        const sanitizedRoomQuantity = roomQuantity === '' || roomQuantity === null || roomQuantity === undefined ? null : parseInt(roomQuantity);

        if (!supplierId) {
            return res.status(400).json({ error: 'Supplier ID is required' });
        }

        // First get the company_id for this supplier
        const supplierQuery = `SELECT company_id FROM suppliers WHERE id = $1`;
        const supplierResult = await pool.query(supplierQuery, [supplierId]);
        
        if (supplierResult.rows.length === 0) {
            return res.status(404).json({ error: 'Supplier not found' });
        }
        
        const companyId = supplierResult.rows[0].company_id;

        // Update company fields if provided
        if (contactNumber || email || companyAddress) {
            const companyUpdateQuery = `
                UPDATE companies 
                SET 
                    phone = COALESCE($1, phone),
                    email = COALESCE($2, email),
                    address_line1 = COALESCE($3, address_line1),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $4
            `;
            
            await pool.query(companyUpdateQuery, [
                contactNumber || null,
                email || null,
                companyAddress || null,
                companyId
            ]);
        }

        // Update supplier fields with new hotel-specific fields
        const updateQuery = `
            UPDATE suppliers 
            SET 
                representative_name = $1,
                designation = $2,
                tel_number = $3,
                breakfast_type = $4,
                room_quantity = $5,
                mode_of_payment = $6,
                credit_terms = $7,
                remarks = $8,
                account_status = $9,
                frontdesk_phone = $10,
                frontdesk_email = $11,
                security_deposit = $12,
                location = $13,
                contracted_rates_date = $14,
                corporate_rates_date = $15,
                accreditation = $16,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $17
        `;

        await pool.query(updateQuery, [
            companyRepresentative,
            designation,
            telNumber,
            breakfastType,
            sanitizedRoomQuantity,
            finalPaymentMode,
            creditTerms,
            remarks,
            accountStatus,
            frontdeskPhone,
            frontdeskEmail,
            securityDeposit,
            location,
            contractedRatesDate,
            corporateRatesDate,
            accreditation,
            supplierId
        ]);

        // Return the updated supplier
        const selectQuery = `
            SELECT 
                s.*,
                c.name as company_name,
                c.email as company_email,
                c.phone as company_phone,
                c.address_line1
            FROM suppliers s
            JOIN companies c ON s.company_id = c.id
            WHERE s.id = $1
        `;

        const updatedSupplierResult = await pool.query(selectQuery, [supplierId]);
        const supplier = updatedSupplierResult.rows[0];

        const response = {
            success: true,
            message: 'Supplier updated successfully',
            supplier: {
                id: supplier.id,
                supplierCode: supplier.supplier_code,
                supplierType: supplier.supplier_type,
                companyName: supplier.company_name,
                companyAddress: supplier.address_line1,
                contactNumber: supplier.company_phone,
                email: supplier.company_email,
                representative: supplier.representative_name,
                designation: supplier.designation,
                telNumber: supplier.tel_number,
                breakfastType: supplier.breakfast_type,
                roomQuantity: supplier.room_quantity,
                paymentMode: supplier.mode_of_payment,
                creditTerms: supplier.credit_terms,
                remarks: supplier.remarks,
                frontdeskPhone: supplier.frontdesk_phone,
                frontdeskEmail: supplier.frontdesk_email,
                securityDeposit: supplier.security_deposit,
                location: supplier.location,
                propertyName: supplier.property_name,
                contractedRatesDate: supplier.contracted_rates_date,
                corporateRatesDate: supplier.corporate_rates_date,
                accreditation: supplier.accreditation,
                accountStatus: supplier.account_status,
                overallRating: supplier.overall_rating,
                totalTripsCompleted: supplier.total_trips_completed,
                totalRevenueGenerated: supplier.total_revenue_generated,
                onTimePercentage: supplier.on_time_percentage,
                createdAt: supplier.created_at,
                updatedAt: supplier.updated_at
            }
        };

        res.json(response);
        
    } catch (error) {
        console.error('Update supplier error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
});

module.exports = router; 