const express = require('express');
const router = express.Router();
const { getDatabase } = require('../scripts/init-database');

// Get detailed supplier analytics for admin dashboard (must be before /:id routes)
router.get('/analytics', async (req, res) => {
    try {
        const db = getDatabase();
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
                COUNT(CASE WHEN s.updated_at >= DATE('now', '-7 days') THEN 1 END) as recently_updated
            FROM suppliers s
            GROUP BY s.supplier_type
            ORDER BY total_revenue DESC
        `;
        
        db.all(analyticsQuery, [], (err, analytics) => {
            if (err) {
                console.error('Supplier analytics error:', err);
                return res.status(500).json({ error: 'Failed to fetch supplier analytics' });
            }
            
            const response = {
                timeframe: `${timeframe} days`,
                analytics: analytics.map(item => ({
                    type: item.supplier_type,
                    metrics: {
                        total: item.total_suppliers,
                        active: item.active_suppliers,
                        pending: item.pending_suppliers,
                        inactive: item.inactive_suppliers,
                        recentlyUpdated: item.recently_updated
                    },
                    performance: {
                        avgRating: parseFloat(item.avg_rating || 0).toFixed(1),
                        totalRevenue: parseFloat(item.total_revenue || 0).toFixed(2),
                        totalTrips: item.total_trips || 0,
                        avgOnTime: parseFloat(item.avg_on_time || 0).toFixed(1),
                        excellent: item.excellent_performers || 0,
                        good: item.good_performers || 0,
                        needsImprovement: item.needs_improvement || 0
                    }
                })),
                lastUpdated: new Date().toISOString()
            };
            
            res.json(response);
            db.close();
        });
        
    } catch (error) {
        console.error('Supplier analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all suppliers with pagination
router.get('/', async (req, res) => {
    try {
        const db = getDatabase();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const status = req.query.status || 'all';
        
        let whereClause = '';
        if (status !== 'all') {
            whereClause = `WHERE s.account_status = '${status}'`;
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
                c.name as company_name,
                c.email as company_email,
                c.phone as company_phone,
                c.city as company_city,
                s.created_at,
                s.updated_at
            FROM suppliers s
            JOIN companies c ON s.company_id = c.id
            ${whereClause}
            ORDER BY s.overall_rating DESC, s.total_revenue_generated DESC
            LIMIT ${limit} OFFSET ${offset}
        `;
        
        const countQuery = `
            SELECT COUNT(*) as total
            FROM suppliers s
            JOIN companies c ON s.company_id = c.id
            ${whereClause}
        `;
        
        db.get(countQuery, [], (err, countResult) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch supplier count' });
            }
            
            db.all(query, [], (err, suppliers) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to fetch suppliers' });
                }
                
                const response = {
                    suppliers: suppliers.map(supplier => ({
                        id: supplier.id,
                        supplierCode: supplier.supplier_code,
                        supplierType: supplier.supplier_type,
                        rating: parseFloat(supplier.overall_rating).toFixed(1),
                        tripsCompleted: supplier.total_trips_completed,
                        revenueGenerated: parseFloat(supplier.total_revenue_generated).toFixed(2),
                        onTimePercentage: parseFloat(supplier.on_time_percentage).toFixed(1),
                        accountStatus: supplier.account_status,
                        company: {
                            name: supplier.company_name,
                            email: supplier.company_email,
                            phone: supplier.company_phone,
                            city: supplier.company_city
                        },
                        createdAt: supplier.created_at,
                        updatedAt: supplier.updated_at
                    })),
                    pagination: {
                        page: page,
                        limit: limit,
                        total: countResult.total,
                        pages: Math.ceil(countResult.total / limit)
                    },
                    lastUpdated: new Date().toISOString()
                };
                
                res.json(response);
                db.close();
            });
        });
        
    } catch (error) {
        console.error('Suppliers list error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get supplier portfolio counts by type
router.get('/portfolio-count', async (req, res) => {
    try {
        const db = getDatabase();
        
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
        
        db.all(query, [], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch supplier portfolio counts' });
            }
            
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
            db.close();
        });
        
    } catch (error) {
        console.error('Supplier portfolio count error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get supplier performance summary
router.get('/performance', async (req, res) => {
    try {
        const db = getDatabase();
        
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
        
        db.get(query, [], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch supplier performance' });
            }
            
            const response = {
                summary: {
                    totalSuppliers: result.total_suppliers,
                    averageRating: parseFloat(result.average_rating || 0).toFixed(1),
                    totalTrips: result.total_trips,
                    totalRevenue: parseFloat(result.total_revenue || 0).toFixed(2),
                    averageOnTime: parseFloat(result.average_on_time || 0).toFixed(1),
                    activeSuppliers: result.active_suppliers,
                    inactiveSuppliers: result.inactive_suppliers,
                    topRatedSuppliers: result.top_rated_suppliers
                },
                lastUpdated: new Date().toISOString()
            };
            
            res.json(response);
            db.close();
        });
        
    } catch (error) {
        console.error('Supplier performance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get specific supplier details
router.get('/:id', async (req, res) => {
    try {
        const db = getDatabase();
        const supplierId = req.params.id;
        
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
            WHERE s.id = ?
        `;
        
        db.get(query, [supplierId], (err, supplier) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch supplier details' });
            }
            
            if (!supplier) {
                return res.status(404).json({ error: 'Supplier not found' });
            }
            
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
                createdAt: supplier.created_at,
                updatedAt: supplier.updated_at
            };
            
            res.json(response);
            db.close();
        });
        
    } catch (error) {
        console.error('Supplier details error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new supplier
router.post('/', async (req, res) => {
    try {
        const db = getDatabase();
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
            creditTerms,
            remarks
        } = req.body;

        if (!companyName || !companyAddress || !contactNumber || !email) {
            return res.status(400).json({ 
                error: 'Missing required fields: companyName, companyAddress, contactNumber, email' 
            });
        }

        // First create the company
        const createCompanyQuery = `
            INSERT INTO companies (name, email, phone, address_line1, city, country, verification_status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'Philippines', 'pending', datetime('now'), datetime('now'))
        `;

        db.run(createCompanyQuery, [companyName, email, contactNumber, companyAddress, companyAddress], function(err) {
            if (err) {
                console.error('Error creating company:', err);
                return res.status(500).json({ error: 'Failed to create company' });
            }

            const companyId = this.lastID;
            
            // Generate supplier code
            const supplierCode = `SUP${String(Date.now()).slice(-6)}`;

            // Create the supplier
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
                    created_at, 
                    updated_at
                ) VALUES (?, ?, ?, 0.0, 0, 0.0, 0.0, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `;

            db.run(createSupplierQuery, [
                supplierCode, 
                companyId, 
                supplierType, 
                companyRepresentative,
                designation,
                telNumber,
                breakfastType,
                roomQuantity,
                modeOfPayment,
                creditTerms,
                remarks
            ], function(err) {
                if (err) {
                    console.error('Error creating supplier:', err);
                    return res.status(500).json({ error: 'Failed to create supplier' });
                }

                const supplierId = this.lastID;

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
                    WHERE s.id = ?
                `;

                db.get(selectQuery, [supplierId], (err, supplier) => {
                    if (err) {
                        console.error('Error fetching created supplier:', err);
                        return res.status(500).json({ error: 'Supplier created but failed to fetch details' });
                    }

                    const response = {
                        id: supplier.id,
                        supplierCode: supplier.supplier_code,
                        supplierType: supplier.supplier_type,
                        rating: parseFloat(supplier.overall_rating).toFixed(1),
                        accountStatus: supplier.account_status,
                        company: {
                            id: supplier.company_id,
                            name: supplier.company_name,
                            email: supplier.company_email,
                            phone: supplier.company_phone,
                            address: supplier.address_line1
                        },
                        createdAt: supplier.created_at,
                        updatedAt: supplier.updated_at
                    };

                    res.status(201).json({
                        message: 'Supplier created successfully',
                        supplier: response
                    });
                    
                    db.close();
                });
            });
        });

    } catch (error) {
        console.error('Create supplier error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update existing supplier
router.put('/:id', async (req, res) => {
    try {
        const db = getDatabase();
        const supplierId = req.params.id;
        const {
            representative_name,
            designation,
            tel_number,
            breakfast_type,
            room_quantity,
            mode_of_payment,
            credit_terms,
            remarks,
            account_status
        } = req.body;
        
        const updateQuery = `
            UPDATE suppliers 
            SET 
                representative_name = ?,
                designation = ?,
                tel_number = ?,
                breakfast_type = ?,
                room_quantity = ?,
                mode_of_payment = ?,
                credit_terms = ?,
                remarks = ?,
                account_status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        db.run(updateQuery, [
            representative_name,
            designation,
            tel_number,
            breakfast_type,
            room_quantity,
            mode_of_payment,
            credit_terms,
            remarks,
            account_status,
            supplierId
        ], function(err) {
            if (err) {
                console.error('Supplier update error:', err);
                return res.status(500).json({ error: 'Failed to update supplier' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Supplier not found' });
            }
            
            // Get updated supplier data
            const selectQuery = `
                SELECT 
                    s.*,
                    c.name as company_name,
                    c.email as company_email,
                    c.phone as company_phone
                FROM suppliers s
                JOIN companies c ON s.company_id = c.id
                WHERE s.id = ?
            `;
            
            db.get(selectQuery, [supplierId], (err, supplier) => {
                if (err) {
                    console.error('Supplier fetch error:', err);
                    return res.status(500).json({ error: 'Failed to fetch updated supplier' });
                }
                
                const response = {
                    success: true,
                    message: 'Supplier updated successfully',
                    supplier: {
                        id: supplier.id,
                        supplierCode: supplier.supplier_code,
                        supplierType: supplier.supplier_type,
                        representativeName: supplier.representative_name,
                        designation: supplier.designation,
                        telNumber: supplier.tel_number,
                        breakfastType: supplier.breakfast_type,
                        roomQuantity: supplier.room_quantity,
                        modeOfPayment: supplier.mode_of_payment,
                        creditTerms: supplier.credit_terms,
                        remarks: supplier.remarks,
                        accountStatus: supplier.account_status,
                        rating: parseFloat(supplier.overall_rating).toFixed(1),
                        company: {
                            name: supplier.company_name,
                            email: supplier.company_email,
                            phone: supplier.company_phone
                        },
                        updatedAt: supplier.updated_at
                    }
                };
                
                res.json(response);
                db.close();
            });
        });
        
    } catch (error) {
        console.error('Supplier update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router; 