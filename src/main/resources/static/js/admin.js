let allBooks = [];
let filteredBooks = [];
const booksPerPage = 10;
let currentBookPage = 1;

let currentFilters = { genres: [], authors: [], formats: [] };
let currentSearch = '';
let currentSort = '';
let priceFilter = { min: 0, max: 100 };

const searchInput = document.getElementById('searchInput');
const genresContainer = document.getElementById('genres');
const authorsContainer = document.getElementById('authors');
const formatsContainer = document.getElementById('formats');
const priceSlider = document.getElementById('price-slider');
const priceValue = document.getElementById('price-value');

let allOrders = [];
let filteredOrders = [];
let currentOrdersPage = 1;
const ordersPerPage = 10;
let currentOrderFilters = {
    search: '',
    status: [],
    dateFrom: '',
    dateTo: ''
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel initializing...');
    checkAdminAuth();
    initializeNavigation();
    setupGlobalEventListeners();

    setTimeout(() => {
        if (currentAppPage === 'book-management') {
            loadBookManagementPage();
        }
    }, 100);
});

function checkAdminAuth() {
    if (!apiService.token) {
        window.location.href = '/login';
        return;
    }
}

function setupGlobalEventListeners() {
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.filter-toggle') && !e.target.closest('.filter-dropdown')) {
            closeAllFilters();
            closeAllOrdersFilters();
        }
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-black' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function logout() {
    if (apiService.removeToken) {
        apiService.removeToken();
    }
    window.location.href = '/login';
}

window.allBooks = [];
window.filteredBooks = [];
window.allOrders = [];
window.filteredOrders = [];
window.allUsers = [];
window.filteredUsers = [];
window.currentAppPage = 'book-management';
window.booksPerPage = 10;
window.currentBookPage = 1;
window.ordersPerPage = 10;
window.currentOrdersPage = 1;
window.usersPerPage = 10;
window.currentUsersPage = 1;

window.currentFilters = { genres: [], authors: [], formats: [] };
window.currentSearch = '';
window.currentSort = '';
window.priceFilter = { min: 0, max: 100 };

window.currentOrderFilters = {
    search: '',
    status: [],
    dateFrom: '',
    dateTo: ''
};

window.currentUserFilters = {
    search: '',
    role: [],
    status: []
};