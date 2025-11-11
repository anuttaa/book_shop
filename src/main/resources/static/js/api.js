class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:8080';
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
        console.log('Token saved:', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('token');
        console.log('Token removed');
    }

    async request(endpoint, options = {}) {
        const url = this.baseUrl + endpoint;
        console.log('API Request:', url, options);

        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };

        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            console.log('API Response status:', response.status);

            if (response.status === 401) {
                this.removeToken();
                window.location.href = '/pages/login.html';
                throw new Error('Authentication required');
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                throw new Error(errorText || `HTTP error! status: ${response.status}`);
            }

            if (response.status === 204) {
                return null;
            }

            const result = await response.json();
            console.log('API Response data:', result);
            return result;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Auth methods
    async login(username, password) {
        console.log('Login attempt with:', { username });
        const response = await fetch(this.baseUrl + '/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        console.log('Login response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Login error response:', errorText);
            throw new Error(errorText || 'Login failed');
        }

        const result = await response.json();
        console.log('Login successful, token received');
        return result;
    }

    async register(userData) {
        console.log('Register attempt with:', userData);
        const response = await fetch(this.baseUrl + '/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        console.log('Register response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Register error response:', errorText);
            throw new Error(errorText || 'Registration failed');
        }

        return await response.json();
    }

    // Book methods
    async getBooks() {
        try {
            return await this.request('/api/books');
        } catch (error) {
            console.error('Failed to fetch books:', error);
            throw error;
        }
    }

    async getBookById(id) {
        return this.request(`/api/books/${id}`);
    }

    async getRecommendedBooks() {
        return this.request('/api/books/recommended');
    }

    async getPopularBooks() {
        return this.request('/api/books/popular');
    }

    async getBookReviews(bookId) {
        return this.request(`/api/books/${bookId}/reviews`);
    }

    // Cart methods
    async addToCart(bookId, quantity = 1) {
        return this.request('/api/cart/add', {
            method: 'POST',
            body: JSON.stringify({ bookId, quantity })
        });
    }

    async getCart() {
        return this.request('/api/cart');
    }

    async removeFromCart(bookId) {
        return this.request(`/api/cart/remove/${bookId}`, {
            method: 'DELETE'
        });
    }

    // Wishlist methods
    async addToWishlist(bookId) {
        return this.request('/api/wishlist/add?bookId=' + bookId, {
            method: 'POST'
        });
    }

    async getWishlist() {
        return this.request('/api/wishlist');
    }

    async removeFromWishlist(bookId) {
        return this.request('/api/wishlist/remove?bookId=' + bookId, {
            method: 'DELETE'
        });
    }

    async checkInWishlist(bookId) {
        return this.request('/api/wishlist/check?bookId=' + bookId);
    }
}

const apiService = new ApiService();