// Use environment variable for API base URL with fallback for backward compatibility
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

// Log the current API URL configuration during development
if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_API === 'true') {
    console.log(`API configured with base URL: ${API_BASE_URL}`);
}

// Simple in-memory cache for API responses
class ApiCache {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes
    }

    set(key, value, ttl = this.defaultTTL) {
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl
        });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        const isExpired = Date.now() - item.timestamp > item.ttl;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    clear() {
        this.cache.clear();
    }

    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

const apiCache = new ApiCache();

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('authToken');
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        // Add auth token if available
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            // Check for network connection before making request
            if (!navigator.onLine) {
                throw new Error('NETWORK_ERROR: No internet connection available');
            }
            
            // Set timeout to prevent indefinite waiting
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            config.signal = controller.signal;
            
            // Add request ID for tracking
            const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            config.headers['X-Request-ID'] = requestId;
            
            if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_API === 'true') {
                console.log(`🌐 API Request [${requestId}]: ${config.method || 'GET'} ${url}`);
            }
            
            const response = await fetch(url, config);
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                // Handle specific HTTP status codes
                if (response.status === 401) {
                    // Authentication error
                    localStorage.removeItem('authToken'); // Clear invalid token
                    throw new Error('AUTH_ERROR: Authentication failed, please login again');
                } else if (response.status === 403) {
                    throw new Error('PERMISSION_ERROR: You don\'t have permission to access this resource');
                } else if (response.status === 429) {
                    throw new Error('RATE_LIMIT: Too many requests, please try again later');
                } else if (response.status >= 500) {
                    throw new Error(`SERVER_ERROR: Server is currently unavailable (${response.status})`);
                }
                
                // Try to parse error data from response
                const errorData = await response.json().catch(() => ({}));
                // Handle nested error structure from backend
                let errorMessage = `HTTP error! status: ${response.status}`;
                
                if (errorData.error) {
                    if (typeof errorData.error === 'string') {
                        errorMessage = errorData.error;
                    } else if (errorData.error.message) {
                        errorMessage = errorData.error.message;
                    } else if (errorData.error.details) {
                        errorMessage = errorData.error.details;
                    }
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
                
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            // Handle aborted requests
            if (error.name === 'AbortError') {
                console.error(`API request timeout: ${endpoint}`);
                throw new Error('TIMEOUT_ERROR: Request took too long to complete');
            }
            
            // Handle fetch errors (network issues)
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                console.error(`API connection error: ${endpoint}`, error);
                throw new Error('CONNECTION_ERROR: Unable to connect to the API server');
            }
            
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // HTTP method helpers
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(fullEndpoint);
    }

    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Dashboard API methods
    async getDashboardOverview() {
        return this.get('/dashboard/overview');
    }

    async getRevenueAnalytics(days = 7) {
        return this.get('/dashboard/revenue', { days });
    }

    async getBookingStats() {
        return this.get('/dashboard/bookings');
    }

    async getTopPerformers() {
        return this.get('/dashboard/performers');
    }

    // Supplier API methods
    async getSuppliers(params = {}) {
        const cacheKey = `suppliers:${JSON.stringify(params)}`;
        const cached = apiCache.get(cacheKey);
        if (cached) {
            console.log('📦 Using cached suppliers data');
            return cached;
        }

        const data = await this.get('/suppliers', params);
        apiCache.set(cacheKey, data, 2 * 60 * 1000); // Cache for 2 minutes
        if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_API === 'true') {
            console.log('📦 Using cached suppliers data');
        }
        return data;
    }

    async getSupplierPerformance() {
        return this.get('/suppliers/performance');
    }

    async getSupplierDetails(id) {
        return this.get(`/suppliers/${id}`);
    }

    async getSupplierPortfolioCount() {
        return this.get('/suppliers/portfolio-count');
    }

    async getSupplierAnalytics(timeframe = 30) {
        return this.get('/suppliers/analytics', { timeframe });
    }

    async createSupplier(supplierData) {
        // Clear suppliers cache after create
        const cacheKeys = Array.from(apiCache.cache.keys()).filter(key => key.startsWith('suppliers:'));
        cacheKeys.forEach(key => apiCache.cache.delete(key));
        return this.post('/suppliers', supplierData);
    }

    async updateSupplier(id, supplierData) {
        // Clear suppliers cache after update
        const cacheKeys = Array.from(apiCache.cache.keys()).filter(key => key.startsWith('suppliers:'));
        cacheKeys.forEach(key => apiCache.cache.delete(key));
        return this.put(`/suppliers/${id}`, supplierData);
    }

    // Admin API methods
    async getAdminOverview() {
        return this.get('/admin/overview');
    }

    async getBookingAnalytics(timeframe = 30) {
        return this.get('/admin/bookings/analytics', { timeframe });
    }

    async getRealtimeMonitoring() {
        return this.get('/admin/monitoring/realtime');
    }

    async getUsers(params = {}) {
        return this.get('/admin/users', params);
    }

    async updateUserStatus(userId, status, reason = '') {
        return this.put(`/admin/users/${userId}/status`, { status, reason });
    }

    // Monitoring API methods
    async getSystemHealth() {
        return this.get('/monitoring/health');
    }

    async getSystemMetrics(hours = 24) {
        return this.get('/monitoring/metrics', { hours });
    }

    async updateSystemHealth() {
        return this.post('/monitoring/health/refresh');
    }

    // User Dashboard API methods
    async getUserDashboardDrivers(params = {}) {
        return this.get('/user-dashboard/drivers', params);
    }

    async getUserDashboardVehicles(params = {}) {
        return this.get('/user-dashboard/vehicles', params);
    }

    async getUserDashboardBookings(params = {}) {
        return this.get('/user-dashboard/bookings', params);
    }

    async getUserDashboardActivities(params = {}) {
        return this.get('/user-dashboard/activities', params);
    }

    // Driver CRUD operations
    async createDriver(driverData) {
        return this.post('/user-dashboard/drivers', driverData);
    }

    async uploadDriverDocuments(driverId, files) {
        const formData = new FormData();
        formData.append('driverId', driverId);
        
        if (files.driverLicense) {
            formData.append('driverLicense', files.driverLicense);
        }
        if (files.ndaDocument) {
            formData.append('ndaDocument', files.ndaDocument);
        }
        if (files.additionalDocuments) {
            files.additionalDocuments.forEach(file => {
                formData.append('additionalDocuments', file);
            });
        }

        return this.request('/user-dashboard/drivers/upload-documents', {
            method: 'POST',
            body: formData,
            headers: {
                // Don't set Content-Type, let browser set it with boundary for FormData
                'Authorization': `Bearer ${this.token}`
            }
        });
    }

    async updateDriver(driverId, driverData) {
        return this.put(`/user-dashboard/drivers/${driverId}`, driverData);
    }

    async deleteDriver(driverId) {
        return this.delete(`/user-dashboard/drivers/${driverId}`);
    }

    // Vehicle CRUD operations
    async createVehicle(vehicleData) {
        return this.post('/user-dashboard/vehicles', vehicleData);
    }

    async uploadVehicleDocuments(vehicleId, files) {
        const formData = new FormData();
        formData.append('vehicleId', vehicleId);
        
        // Map vehicle files to the expected field names
        if (files.exteriorPhoto) {
            formData.append('driverLicense', files.exteriorPhoto); // Reusing driver license field
        }
        if (files.interiorPhoto) {
            formData.append('ndaDocument', files.interiorPhoto); // Reusing NDA field  
        }
        if (files.additionalDocuments && files.additionalDocuments.length > 0) {
            files.additionalDocuments.forEach(file => {
                formData.append('additionalDocuments', file);
            });
        }

        return this.request('/user-dashboard/vehicles/upload-documents', {
            method: 'POST',
            body: formData,
            headers: {
                // Don't set Content-Type, let browser set it with boundary for FormData
                'Authorization': `Bearer ${this.token}`
            }
        });
    }

    async updateVehicle(vehicleId, vehicleData) {
        return this.put(`/user-dashboard/vehicles/${vehicleId}`, vehicleData);
    }

    async deleteVehicle(vehicleId) {
        return this.delete(`/user-dashboard/vehicles/${vehicleId}`);
    }

    // Booking assignment operations
    async assignDriverToBooking(bookingId, driverId) {
        return this.put(`/user-dashboard/bookings/${bookingId}/assign-driver`, { driverId });
    }

    async assignVehicleToBooking(bookingId, vehicleId) {
        return this.put(`/user-dashboard/bookings/${bookingId}/assign-vehicle`, { vehicleId });
    }

    async unassignDriverFromBooking(bookingId) {
        return this.put(`/user-dashboard/bookings/${bookingId}/unassign-driver`);
    }

    async unassignVehicleFromBooking(bookingId) {
        return this.put(`/user-dashboard/bookings/${bookingId}/unassign-vehicle`);
    }

    // Booking status operations
    async updateBookingStatus(bookingId, status) {
        return this.put(`/user-dashboard/bookings/${bookingId}/status`, { status });
    }

    // Admin supplier statistics
    async getSupplierStats() {
        return this.get('/admin/supplier-stats');
    }

    // Authentication methods
    async login(email, password) {
        const response = await this.post('/auth/login', { email, password });
        if (response.token) {
            this.setToken(response.token);
        }
        return response;
    }

    async register(userData) {
        const response = await this.post('/auth/register', userData);
        if (response.token) {
            this.setToken(response.token);
        }
        return response;
    }

    async getUserProfile() {
        return this.get('/auth/profile');
    }

    async createDemoAdmin() {
        return this.post('/auth/create-demo-admin');
    }

    // Token management
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    isAuthenticated() {
        return !!this.token;
    }

    // Health check
    async healthCheck() {
        return this.get('/health');
    }
}

export default new ApiService(); 