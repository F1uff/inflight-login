/**
 * DataUtilityService - Shared query builders for admin and user dashboards
 * 
 * This service provides reusable query logic that can be used by both
 * admin routes (see all companies) and user routes (see specific company)
 */
class DataUtilityService {
    
    /**
     * Build driver queries with flexible filtering
     * @param {Object} filters - Query filters
     * @param {number} filters.company_id - Company ID for filtering
     * @param {boolean} filters.admin_view - If true, shows all companies
     * @param {string} filters.status - Status filter (active/pending/inactive)
     * @param {string} filters.search - Search term
     * @returns {Object} Query object with main query, count query, and params
     */
    static buildDriverQuery(filters = {}) {
        const { company_id, admin_view = false, status, search } = filters;
        
        let whereConditions = [];
        let queryParams = [];
        let paramIndex = 1;

        // Company filtering - admin sees all, users see their company
        if (!admin_view && company_id) {
            whereConditions.push(`d.company_id = $${paramIndex++}`);
            queryParams.push(company_id);
        }

        if (status) {
            whereConditions.push(`d.status = $${paramIndex++}`);
            queryParams.push(status);
        }

        if (search) {
            whereConditions.push(`(u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex + 1} OR d.license_number ILIKE $${paramIndex + 2})`);
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
            paramIndex += 3;
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        return {
            query: `
                SELECT 
                    d.id,
                    d.license_number,
                    COALESCE(u.first_name || ' ' || u.last_name, 'Unknown Driver') as name,
                    COALESCE(d.address, 'Not specified') as area,
                    COALESCE(u.phone, 'N/A') as contact,
                    'Pending' as nda,
                    d.status,
                    d.company_id,
                    'regular' as type
                FROM drivers d
                LEFT JOIN users u ON d.user_id = u.id
                ${whereClause}
                ORDER BY d.created_at DESC
            `,
            countQuery: `
                SELECT COUNT(*) as total
                FROM drivers d
                LEFT JOIN users u ON d.user_id = u.id
                ${whereClause}
            `,
            params: queryParams,
            countParams: queryParams
        };
    }

    /**
     * Build vehicle queries with flexible filtering
     * @param {Object} filters - Query filters
     * @param {number} filters.company_id - Company ID for filtering
     * @param {boolean} filters.admin_view - If true, shows all companies
     * @param {string} filters.status - Status filter (active/pending/inactive)
     * @param {string} filters.search - Search term
     * @returns {Object} Query object with main query, count query, and params
     */
    static buildVehicleQuery(filters = {}) {
        const { company_id, admin_view = false, status, search } = filters;
        
        let whereConditions = [];
        let queryParams = [];
        let paramIndex = 1;

        if (!admin_view && company_id) {
            whereConditions.push(`v.company_id = $${paramIndex++}`);
            queryParams.push(company_id);
        }

        if (status) {
            whereConditions.push(`v.status = $${paramIndex++}`);
            queryParams.push(status);
        }

        if (search) {
            whereConditions.push(`(v.plate_number ILIKE $${paramIndex} OR v.make ILIKE $${paramIndex + 1} OR v.model ILIKE $${paramIndex + 2} OR v.vehicle_type ILIKE $${paramIndex + 3})`);
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
            paramIndex += 4;
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        return {
            query: `
                SELECT 
                    v.id,
                    v.plate_number,
                    v.vehicle_type as type,
                    COALESCE(v.make || ' ' || v.model, v.model, 'Unknown Model') as model,
                    COALESCE(v.year::TEXT, 'Unknown') as year,
                    COALESCE(v.color, 'Unknown') as color,
                    'Complete' as safety,
                    v.status,
                    v.company_id,
                    'company' as ownership
                FROM vehicles v
                ${whereClause}
                ORDER BY v.created_at DESC
            `,
            countQuery: `
                SELECT COUNT(*) as total
                FROM vehicles v
                ${whereClause}
            `,
            params: queryParams,
            countParams: queryParams
        };
    }

    /**
     * Build booking queries with flexible filtering
     * @param {Object} filters - Query filters
     * @param {number} filters.company_id - Company ID for filtering
     * @param {boolean} filters.admin_view - If true, shows all companies
     * @param {string} filters.status - Status filter
     * @param {string} filters.date_from - Start date filter
     * @param {string} filters.date_to - End date filter
     * @returns {Object} Query object with main query, count query, and params
     */
    static buildBookingQuery(filters = {}) {
        const { company_id, admin_view = false, status, date_from, date_to } = filters;
        
        let whereConditions = [];
        let queryParams = [];
        let paramIndex = 1;

        if (!admin_view && company_id) {
            whereConditions.push(`b.company_id = $${paramIndex++}`);
            queryParams.push(company_id);
        }

        if (status) {
            whereConditions.push(`b.booking_status = $${paramIndex++}`);
            queryParams.push(status);
        }

        if (date_from) {
            whereConditions.push(`DATE(b.pickup_datetime) >= DATE($${paramIndex++})`);
            queryParams.push(date_from);
        }

        if (date_to) {
            whereConditions.push(`DATE(b.pickup_datetime) <= DATE($${paramIndex++})`);
            queryParams.push(date_to);
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        return {
            query: `
                SELECT 
                    b.id,
                    b.booking_reference as voucher,
                    b.booking_status,
                    b.company_id,
                    b.total_amount
                FROM bookings b
                ${whereClause}
                ORDER BY b.id DESC
            `,
            countQuery: `
                SELECT COUNT(*) as total
                FROM bookings b
                ${whereClause}
            `,
            params: queryParams,
            countParams: queryParams
        };
    }

    /**
     * Build summary queries for dashboard cards
     * @param {Object} filters - Query filters
     * @param {number} filters.company_id - Company ID for filtering
     * @param {boolean} filters.admin_view - If true, shows all companies
     * @returns {Object} Summary queries for drivers, vehicles, and bookings
     */
    static buildSummaryQueries(filters = {}) {
        const { company_id, admin_view = false } = filters;
        
        if (admin_view) {
            return {
                drivers: {
                    query: `
                        SELECT 
                            COUNT(*) as total,
                            COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                            COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
                            COUNT(*) as regular,
                            0 as subcon
                        FROM drivers
                    `,
                    params: []
                },
                vehicles: {
                    query: `
                        SELECT 
                            COUNT(*) as total,
                            COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                            COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
                            COUNT(*) as company,
                            0 as subcon
                        FROM vehicles
                    `,
                    params: []
                },
                bookings: {
                    query: `
                        SELECT 
                            COUNT(*) as total,
                            COUNT(CASE WHEN booking_status = 'completed' THEN 1 END) as completed,
                            COUNT(CASE WHEN booking_status NOT IN ('completed', 'cancelled', 'in_progress') THEN 1 END) as pending,
                            COUNT(CASE WHEN booking_status = 'cancelled' THEN 1 END) as cancelled,
                            COUNT(CASE WHEN booking_status = 'in_progress' THEN 1 END) as active,
                            SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue,
                            SUM(CASE WHEN payment_status = 'pending' THEN total_amount ELSE 0 END) as pending_revenue
                        FROM bookings
                    `,
                    params: []
                }
            };
        } else {
            return {
                drivers: {
                    query: `
                        SELECT 
                            COUNT(*) as total,
                            COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                            COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
                            COUNT(CASE WHEN company_id = $2 THEN 1 END) as regular,
                            COUNT(CASE WHEN company_id != $3 THEN 1 END) as subcon
                        FROM drivers 
                        WHERE company_id = $1
                    `,
                    params: [company_id, company_id, company_id]
                },
                vehicles: {
                    query: `
                        SELECT 
                            COUNT(*) as total,
                            COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                            COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
                            COUNT(CASE WHEN company_id = $2 THEN 1 END) as company,
                            COUNT(CASE WHEN company_id != $3 THEN 1 END) as subcon
                        FROM vehicles 
                        WHERE company_id = $1
                    `,
                    params: [company_id, company_id, company_id]
                },
                bookings: {
                    query: `
                        SELECT 
                            COUNT(*) as total,
                            COUNT(CASE WHEN booking_status = 'completed' THEN 1 END) as completed,
                            COUNT(CASE WHEN booking_status NOT IN ('completed', 'cancelled', 'in_progress') THEN 1 END) as pending,
                            COUNT(CASE WHEN booking_status = 'cancelled' THEN 1 END) as cancelled,
                            COUNT(CASE WHEN booking_status = 'in_progress' THEN 1 END) as active,
                            SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue,
                            SUM(CASE WHEN payment_status = 'pending' THEN total_amount ELSE 0 END) as pending_revenue
                        FROM bookings 
                        WHERE company_id = $1
                    `,
                    params: [company_id]
                }
            };
        }
    }

    /**
     * Build activity/audit log queries
     * @param {Object} filters - Query filters
     * @param {number} filters.company_id - Company ID for filtering
     * @param {boolean} filters.admin_view - If true, shows all companies
     * @param {number} filters.days - Number of days to look back
     * @returns {Object} Query object for recent activities
     */
    static buildActivityQuery(filters = {}) {
        const { company_id, admin_view = false, days = 30 } = filters;
        
        let queryParams = [];
        let paramIndex = 1;

        // Calculate the date threshold (using NOW() instead of CURRENT_DATE for more flexibility)
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const dateThreshold = cutoffDate.toISOString();

        let whereConditions = [];
        
        if (!admin_view && company_id) {
            whereConditions.push(`company_id = $${paramIndex}`);
            queryParams.push(company_id);
            paramIndex++;
        }

        // Add date filter
        whereConditions.push(`created_at >= $${paramIndex}`);
        queryParams.push(dateThreshold);

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        return {
            query: `
                SELECT 
                    act.date,
                    act.type,
                    act.idName,
                    act.action,
                    act.status,
                    act.sort_date,
                    act.company_id
                FROM (
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
                    ${whereClause.replace('company_id', 'd.company_id').replace('created_at', 'd.created_at')}
                    
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
                    ${whereClause.replace('company_id', 'v.company_id').replace('created_at', 'v.created_at')}
                    
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
                    ${whereClause.replace('company_id', 'b.company_id').replace('created_at', 'b.created_at')}
                ) as act
                ORDER BY act.sort_date DESC
            `,
            countQuery: `
                SELECT COUNT(*) as total FROM (
                    SELECT 1 FROM drivers d ${whereClause.replace('company_id', 'd.company_id').replace('created_at', 'd.created_at')}
                    UNION ALL
                    SELECT 1 FROM vehicles v ${whereClause.replace('company_id', 'v.company_id').replace('created_at', 'v.created_at')}
                    UNION ALL
                    SELECT 1 FROM bookings b ${whereClause.replace('company_id', 'b.company_id').replace('created_at', 'b.created_at')}
                ) as activity_count
            `,
            params: queryParams,
            countParams: queryParams
        };
    }

    /**
     * Helper function to format response consistently
     * @param {boolean} success - Whether the operation was successful
     * @param {*} data - Response data
     * @param {Object} pagination - Pagination info
     * @param {string} userRole - User role (admin/user)
     * @param {string} error - Error message if any
     * @returns {Object} Formatted response
     */
    static formatResponse(success, data = null, pagination = null, userRole = 'user', error = null) {
        const response = {
            success,
            timestamp: new Date().toISOString()
        };

        if (success) {
            response.data = data;
            if (pagination) {
                response.pagination = pagination;
            }
            response.userRole = userRole;
        } else {
            response.error = error || 'Unknown error occurred';
        }

        return response;
    }
}

module.exports = DataUtilityService; 