class ApiService {
  constructor() {
    this.baseUrl = 'http://localhost:8080';
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    if (!token) {
      this.token = null;
      localStorage.removeItem('token');
      return;
    }

    this.token = token;
    localStorage.setItem('token', token);
  }


  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(path, options = {}, expectJson = true) {
    const headers = { 'Content-Type': 'application/json' };

    if (this.token) {
      headers['Authorization'] = 'Bearer ' + this.token;
    } else {
      
    }
    try {
      const response = await fetch(this.baseUrl + path, {
        headers,
        ...options,
        credentials: 'include'
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
      }

      return expectJson && text ? JSON.parse(text) : text;
    } catch (error) {
      
      throw error;
    }
  }

  async reorder(orderId) {
    try {
      const orders = await this.getUserOrders();
      const order = orders.find(o => o.id == orderId);

           if (!order || !order.orderItems) {
               throw new Error("Order not found or has no items");
           }

      for (const item of order.orderItems) {
        if (item.book && item.book.id) {
          await this.addToCart(item.book.id, item.quantity || 1);
        }
      }

      return { success: true, message: "Items added to cart" };
    } catch (error) {
      
      throw error;
    }
  }

  async login(username, password) {
    const response = await fetch(this.baseUrl + '/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Login failed');
    }

        const result = await response.json();
        return result;
    }

    async register(userData) {
        
        const response = await fetch(this.baseUrl + '/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Register error response:', errorText);
            throw new Error(errorText || 'Registration failed');
        }

        return await response.json();
    }

   // User methods
    async getProfile() {
        return this.request('/api/users/me');
    }

    async updateProfile(profileData) {
        return this.request('/api/users/me', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async changePassword(currentPassword, newPassword) {
        return this.request('/api/users/me/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword })
        }, false);
    }

    async getSubscription() {
        return this.request('/api/users/me/subscription');
    }

    async updateSubscription(subscribed) {
        return this.request('/api/users/me/subscription', {
            method: 'PUT',
            body: JSON.stringify({ subscribed })
        });
    }

    async deleteAccount() {
        return this.request('/api/users/me', {
            method: 'DELETE'
        }, false);
    }

    async getUsers() {
        return this.request('/api/users/admin/all', {
            method: 'GET'
        });
    }

    async blockUser(userId) {
        return this.request(`/api/users/admin/${userId}/block`, {
            method: 'PUT'
        });
    }

    async unblockUser(userId) {
        return this.request(`/api/users/admin/${userId}/unblock`, {
            method: 'PUT'
        });
    }

    async updateUserRole(userId, role) {
        return this.request(`/api/users/admin/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        });
    }

    async createUser(userData) {
        return this.request('/api/users/admin', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async updateUser(userId, userData) {
        return this.request(`/api/users/admin/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async deleteUser(userId) {
        return this.request(`/api/users/admin/${userId}`, {
            method: 'DELETE'
        }, false);
    }

    async resetUserPassword(userId, newPassword) {
        return this.request(`/api/users/admin/${userId}/reset-password`, {
            method: 'POST',
            body: JSON.stringify({ newPassword })
        }, false);
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

    async getBookReviews(bookId) {
        return this.request(`/api/reviews/book/${bookId}`);
    }

    async searchBooks(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/books/search?${query}`);
    }

    async createBook(book) {
        return this.request('/api/books', {
            method: 'POST',
            body: JSON.stringify(book)
        });
    }

    async updateBook(id, book) {
        return this.request(`/api/books/${id}`, {
            method: 'PUT',
            body: JSON.stringify(book)
        });
    }

    async deleteBook(id) {
        return this.request(`/api/books/${id}`, {
            method: 'DELETE'
        }, false);
    }

    async getRecommendedBooks() {
            return this.request('/api/books/recommended');
        }

    async getPopularBooks() {
        return this.request('/api/books/popular');
    }

    async getTopRatedBooks() {
        return this.request('/api/books/top-rated');
    }

    async getBooksByGenre(genre) {
        return this.request(`/api/books/genre/${genre}`);
    }

    async getNewArrivals() {
        return this.request('/api/books/new-arrivals');
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

   async getOrders() {
       return this.request('/api/orders/admin/all');
   }

   async createOrderFromCart() {
       return this.request('/api/orders/create-from-cart', {
           method: 'POST'
       });
   }
   async updateOrder(orderId, orderData) {
        return this.request(`/api/orders/${orderId}`, {
            method: 'PUT',
            body: JSON.stringify(orderData)
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

   // Review methods
   async addReview(bookId, reviewData) {
       return this.request(`/api/reviews?bookId=${bookId}`, {
           method: 'POST',
           body: JSON.stringify(reviewData)
       });
   }

   async updateReview(reviewId, reviewData) {
       return this.request(`/api/reviews/${reviewId}`, {
           method: 'PUT',
           body: JSON.stringify(reviewData)
       });
   }

   async deleteReview(reviewId) {
       return this.request(`/api/reviews/${reviewId}`, {
           method: 'DELETE'
       }, false);
   }

   async getUserReviews() {
       return this.request('/api/reviews/my');
   }

   // Avatar methods
    async getMyAvatar() {
        try {
            const response = await this.request('/api/users/me/avatar');
            return response;
        } catch (error) {
            console.error('API getMyAvatar error:', error);
            throw error;
        }
    }

    async getUserAvatar(userId) {
        return this.request(`/api/users/${userId}/avatar`);
    }

    async setMyAvatar(avatarUrl, fileName) {
        return this.request('/api/users/me/avatar', {
            method: 'PUT',
            body: JSON.stringify({
                avatarUrl: avatarUrl,
                fileName: fileName
            })
        });
    }

    async deleteMyAvatar() {
        return this.request('/api/users/me/avatar', {
            method: 'DELETE'
        }, false);
    }
}

function parseJwt(token) {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch (e) {
        return {};
    }
}

window.apiService = new ApiService();
