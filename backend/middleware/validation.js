const validator = require('validator');
const { ValidationError } = require('./errorHandler');

// Input validation rules
const validationRules = {
    // User input validation
    email: {
        required: true,
        type: 'email',
        maxLength: 255
    },
    password: {
        required: true,
        type: 'string',
        minLength: 8,
        maxLength: 128
    },
    phone: {
        required: false,
        type: 'phone',
        maxLength: 20
    },
    name: {
        required: true,
        type: 'string',
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s\-']+$/
    },
    
    // Search and filter validation
    search: {
        required: false,
        type: 'string',
        maxLength: 100,
        sanitize: true
    },
    status: {
        required: false,
        type: 'enum',
        values: ['active', 'inactive', 'pending', 'completed', 'cancelled']
    },
    
    // Pagination validation
    page: {
        required: false,
        type: 'number',
        min: 1,
        max: 10000,
        default: 1
    },
    limit: {
        required: false,
        type: 'number',
        min: 1,
        max: 100,
        default: 20
    },
    
    // Date validation
    date: {
        required: false,
        type: 'date'
    },
    
    // ID validation
    id: {
        required: true,
        type: 'number',
        min: 1
    },
    
    // File validation
    filename: {
        required: false,
        type: 'string',
        maxLength: 255,
        pattern: /^[a-zA-Z0-9\s\-_.]+$/
    }
};

// Sanitization functions
const sanitizers = {
    string: (value) => {
        if (typeof value !== 'string') return '';
        return value.trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/['";]/g, '') // Remove SQL injection characters
            .replace(/\\/g, ''); // Remove backslashes
    },
    
    search: (value) => {
        if (typeof value !== 'string') return '';
        return value.trim()
            .replace(/[<>'"`;\\]/g, '') // Remove dangerous characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .substring(0, 100); // Limit length
    },
    
    sql: (value) => {
        if (typeof value !== 'string') return '';
        return value.replace(/['"`;\\]/g, '');
    }
};

// Validation functions
const validators = {
    email: (value) => {
        return validator.isEmail(value);
    },
    
    phone: (value) => {
        if (!value) return true; // Optional field
        return validator.isMobilePhone(value, 'any');
    },
    
    number: (value, min, max) => {
        const num = parseInt(value);
        if (isNaN(num)) return false;
        if (min !== undefined && num < min) return false;
        if (max !== undefined && num > max) return false;
        return true;
    },
    
    string: (value, minLength, maxLength, pattern) => {
        if (typeof value !== 'string') return false;
        if (minLength && value.length < minLength) return false;
        if (maxLength && value.length > maxLength) return false;
        if (pattern && !pattern.test(value)) return false;
        return true;
    },
    
    enum: (value, allowedValues) => {
        return allowedValues.includes(value);
    },
    
    date: (value) => {
        if (!value) return true; // Optional field
        return validator.isDate(value);
    }
};

// Main validation middleware
function validateInput(schema) {
    return (req, res, next) => {
        const errors = [];
        const sanitizedData = {};
        
        for (const [field, rules] of Object.entries(schema)) {
            const value = req.body[field] || req.query[field] || req.params[field];
            
            // Check required fields
            if (rules.required && (!value || value === '')) {
                errors.push({
                    field,
                    message: `${field} is required`
                });
                continue;
            }
            
            // Skip validation for optional empty fields
            if (!rules.required && (!value || value === '')) {
                sanitizedData[field] = rules.default || null;
                continue;
            }
            
            // Sanitize input
            let sanitizedValue = value;
            if (rules.sanitize) {
                sanitizedValue = sanitizers.search(value);
            } else if (rules.type === 'string') {
                sanitizedValue = sanitizers.string(value);
            }
            
            // Validate based on type
            let isValid = true;
            switch (rules.type) {
                case 'email':
                    isValid = validators.email(sanitizedValue);
                    break;
                case 'phone':
                    isValid = validators.phone(sanitizedValue);
                    break;
                case 'number':
                    isValid = validators.number(sanitizedValue, rules.min, rules.max);
                    if (isValid) {
                        sanitizedValue = parseInt(sanitizedValue);
                    }
                    break;
                case 'string':
                    isValid = validators.string(sanitizedValue, rules.minLength, rules.maxLength, rules.pattern);
                    break;
                case 'enum':
                    isValid = validators.enum(sanitizedValue, rules.values);
                    break;
                case 'date':
                    isValid = validators.date(sanitizedValue);
                    break;
            }
            
            if (!isValid) {
                errors.push({
                    field,
                    message: `${field} is invalid`
                });
            } else {
                sanitizedData[field] = sanitizedValue;
            }
        }
        
        if (errors.length > 0) {
            throw new ValidationError('Input validation failed', { 
                code: 'VALIDATION_ERROR',
                details: errors
            });
        }
        
        // Attach sanitized data to request
        req.validatedData = sanitizedData;
        next();
    };
}

// SQL injection protection utilities
const sqlSafetyUtils = {
    // Allowed column names for ORDER BY and WHERE clauses
    allowedColumns: {
        users: ['id', 'email', 'role', 'first_name', 'last_name', 'status', 'created_at', 'updated_at'],
        drivers: ['id', 'license_number', 'status', 'created_at', 'updated_at'],
        vehicles: ['id', 'plate_number', 'status', 'make', 'model', 'created_at', 'updated_at'],
        bookings: ['id', 'booking_reference', 'booking_status', 'payment_status', 'pickup_datetime', 'created_at', 'updated_at'],
        documents: ['id', 'document_name', 'document_type', 'status', 'created_at', 'updated_at']
    },
    
    // Validate column names to prevent SQL injection
    validateColumn: (table, column) => {
        const allowed = sqlSafetyUtils.allowedColumns[table];
        return allowed && allowed.includes(column);
    },
    
    // Build safe WHERE clause with parameterized queries
    buildSafeWhereClause: (conditions) => {
        const safeClauses = [];
        const safeParams = [];
        let paramIndex = 1;
        
        for (const condition of conditions) {
            if (condition.type === 'equals') {
                safeClauses.push(`${condition.column} = $${paramIndex}`);
                safeParams.push(condition.value);
                paramIndex++;
            } else if (condition.type === 'ilike') {
                safeClauses.push(`${condition.column} ILIKE $${paramIndex}`);
                safeParams.push(`%${condition.value}%`);
                paramIndex++;
            } else if (condition.type === 'in') {
                const placeholders = condition.values.map(() => `$${paramIndex++}`).join(', ');
                safeClauses.push(`${condition.column} IN (${placeholders})`);
                safeParams.push(...condition.values);
            } else if (condition.type === 'date_range') {
                if (condition.from) {
                    safeClauses.push(`DATE(${condition.column}) >= $${paramIndex}`);
                    safeParams.push(condition.from);
                    paramIndex++;
                }
                if (condition.to) {
                    safeClauses.push(`DATE(${condition.column}) <= $${paramIndex}`);
                    safeParams.push(condition.to);
                    paramIndex++;
                }
            }
        }
        
        return {
            whereClause: safeClauses.length > 0 ? `WHERE ${safeClauses.join(' AND ')}` : '',
            params: safeParams
        };
    },
    
    // Validate and sanitize ORDER BY clause
    sanitizeOrderBy: (table, orderBy, orderDirection = 'ASC') => {
        if (!orderBy) return 'ORDER BY created_at DESC';
        
        const column = orderBy.replace(/[^a-zA-Z0-9_]/g, '');
        const direction = orderDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        
        if (!sqlSafetyUtils.validateColumn(table, column)) {
            return 'ORDER BY created_at DESC';
        }
        
        return `ORDER BY ${column} ${direction}`;
    }
};

// Pre-defined validation schemas
const validationSchemas = {
    login: {
        email: validationRules.email,
        password: validationRules.password
    },
    
    register: {
        email: validationRules.email,
        password: validationRules.password,
        firstName: validationRules.name,
        lastName: validationRules.name,
        phone: validationRules.phone
    },
    
    search: {
        search: validationRules.search,
        page: validationRules.page,
        limit: validationRules.limit,
        status: validationRules.status
    },
    
    dateRange: {
        date_from: validationRules.date,
        date_to: validationRules.date,
        page: validationRules.page,
        limit: validationRules.limit
    },
    
    createDriver: {
        firstName: validationRules.name,
        lastName: validationRules.name,
        email: validationRules.email,
        phone: validationRules.phone,
        licenseNumber: {
            required: true,
            type: 'string',
            minLength: 5,
            maxLength: 50,
            pattern: /^[a-zA-Z0-9-]+$/
        }
    },
    
    createVehicle: {
        plateNumber: {
            required: true,
            type: 'string',
            minLength: 5,
            maxLength: 20,
            pattern: /^[a-zA-Z0-9-]+$/
        },
        make: validationRules.name,
        model: validationRules.name,
        vehicleType: {
            required: false,
            type: 'enum',
            values: ['sedan', 'suv', 'van', 'truck', 'bus', 'motorcycle', 'other'],
            default: 'sedan'
        },
        year: {
            required: false,
            type: 'number',
            min: 1990,
            max: new Date().getFullYear() + 1
        },
        color: {
            required: false,
            type: 'string',
            maxLength: 50
        }
    }
};

module.exports = {
    validateInput,
    validationSchemas,
    sqlSafetyUtils,
    sanitizers
}; 