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

    async request(path, options = {}) {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) headers['Authorization'] = 'Bearer ' + this.token;

        console.log('Fetching', this.baseUrl + path, headers);

        const response = await fetch(this.baseUrl + path, { headers, ...options });
        console.log('Response status:', response.status);
        if (!response.ok) {
            const text = await response.text();
            console.error('API error:', text);
            throw new Error(text);
        }
        return response.json();
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
            const books = await this.request('/api/books');
            return books.map(book => ({
                ...book,
                rating: book.rating || this.calculateRatingFromReviews(book.reviews),
                type: this.normalizeBookType(book.type),
                price: book.price ? parseFloat(book.price) : 0.00
            }));
        } catch (error) {
            console.error('Failed to fetch books:', error);
            throw error;
        }
    }

    normalizeBookType(type) {
        console.log(type);
        if (!type) return 'physical';
        return type.toLowerCase();
    }

    calculateRatingFromReviews(reviews) {
        if (!reviews || reviews.length === 0) {
            return 0.0;
        }
        const sum = reviews.reduce((total, review) => total + (review.rating || 0), 0);
        return Math.round((sum / reviews.length) * 10) / 10;
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
        return this.request(`/api/reviews/book/${bookId}`);
    }

    // Media methods
    async getBookMedia(bookId) {
        try {
            return await this.request(`/api/media/book/${bookId}`);
        } catch (error) {
            console.error(`Failed to fetch media for book ${bookId}:`, error);
            return [];
        }
    }

    async addBookMedia(bookId, mediaData) {
        return this.request(`/api/media/book/${bookId}`, {
            method: 'POST',
            body: JSON.stringify(mediaData)
        });
    }

    async deleteMedia(mediaId) {
        return this.request(`/api/media/${mediaId}`, {
            method: 'DELETE'
        });
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
        const headers = {};
        if (this.token) headers['Authorization'] = 'Bearer ' + this.token;

        const response = await fetch(`${this.baseUrl}/api/wishlist/remove?bookId=${bookId}`, {
            method: 'DELETE',
            headers
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `HTTP error! status: ${response.status}`);
        }
    }

    async checkInWishlist(bookId) {
        return this.request(`/api/wishlist/check/${bookId}`);
    }

   // Orders methods
   async getUserOrders() {
       return this.request('/api/orders');
   }

   async createOrderFromCart() {
       return this.request('/api/orders/create-from-cart', {
           method: 'POST'
       });
   }

   async payOrder(orderId) {
       return this.request(`/api/orders/${orderId}/pay`, {
           method: 'POST'
       });
   }

   async deleteOrder(orderId) {
       return this.request(`/api/orders/${orderId}`, {
           method: 'DELETE'
       });
   }

}

const apiService = new ApiService();