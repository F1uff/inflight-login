const API_BASE_URL = 'http://localhost:3001/api/v1';

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
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url);
    }

    // POST request
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // PUT request
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }

    // Dashboard API methods
    async getDashboardOverview() {
        return this.get('/dashboard/overview');
    }

    async getRevenueAnalytics(days = 7) {
        return this.get('/dashboard/revenue', { days });
    }

    async getBookingStats() {
        return this.get('/dashboard/booking-stats');
    }

    async getTopPerformers() {
        return this.get('/dashboard/top-performers');
    }

    // Suppliers API methods
    async getSuppliers(params = {}) {
        return this.get('/suppliers', params);
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
        return this.post('/suppliers', supplierData);
    }

    async updateSupplier(id, supplierData) {
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
        return this.post('/monitoring/health/update');
    }

    // Auth API methods
    async login(email, password) {
        const response = await this.post('/auth/login', { email, password });
        if (response.token) {
            this.token = response.token;
            localStorage.setItem('authToken', response.token);
        }
        return response;
    }

    async getUserProfile() {
        return this.get('/auth/profile');
    }

    async createDemoAdmin() {
        return this.post('/auth/create-demo-admin');
    }

    // Utility methods
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
        try {
            const response = await fetch(`${this.baseURL.replace('/api/v1', '')}/health`);
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'ERROR', message: error.message };
        }
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService; 