// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Export to window for use in other scripts
if (typeof window !== 'undefined') {
    window.API_BASE_URL = API_BASE_URL;
}

// API Helper Functions
const api = {
    // Get request
    async get(endpoint, token = null) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: headers
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Có lỗi xảy ra');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Post request
    async post(endpoint, body, token = null) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Có lỗi xảy ra');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Put request
    async put(endpoint, body, token = null) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(body)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Có lỗi xảy ra');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Delete request
    async delete(endpoint, token = null) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: headers
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Có lỗi xảy ra');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};

// Auth Helper
const auth = {
    getToken() {
        // Check both localStorage and sessionStorage
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    },
    
    setToken(token, remember = true) {
        if (remember) {
            localStorage.setItem('token', token);
        } else {
            sessionStorage.setItem('token', token);
        }
    },
    
    removeToken() {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
    },
    
    isAuthenticated() {
        return !!this.getToken();
    },
    
    getUser() {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    }
};
