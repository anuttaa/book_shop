function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

document.addEventListener('DOMContentLoaded', async function() {

    const token = localStorage.getItem('token');

    if (!token) {
        sessionStorage.setItem('adminRedirect', window.location.pathname);
        window.location.href = '/login?message=admin_login_required';
        return;
    }

    apiService.setToken(token);


    try {
        const payload = parseJwt(token);
    } catch (e) {
        
    }

    try {
        const profile = await apiService.getProfile();

        const payload = parseJwt(token);
        let roles = payload.roles || payload.authorities || [];

        if (typeof roles === 'string') {
            roles = roles.split(/[\s,]+/);
        }

        const isAdmin = Array.isArray(roles)
            ? roles.some(r => {
                const role = String(r).toLowerCase();
                return role.includes('admin') || role.includes('role_admin') || role === 'admin';
            })
            : String(roles).toLowerCase().includes('admin');


        if (!isAdmin) {
            adminNotify('Доступ к админ-панели запрещен. Требуются права администратора.', 'error');

            localStorage.removeItem('token');
            apiService.removeToken();

            setTimeout(() => {
                window.location.href = '/login?message=admin_access_denied';
            }, 2000);
            return;
        }

        
        initializeAdminPanel();

    } catch (error) {
        console.error('Authentication failed:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);

        if (error.message.includes('401') || error.message.includes('403') ||
            error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {

            adminNotify('Сессия истекла или доступ запрещен', 'error');
            localStorage.removeItem('token');
            apiService.removeToken();

            setTimeout(() => {
                window.location.href = '/login?message=session_expired';
            }, 1500);
        } else {
            adminNotify('Ошибка подключения к серверу', 'error');
        }
    }
});

const externalNotify = typeof window.showNotification === 'function' ? window.showNotification : null;

async function initializeAdminPanel() {
  try {
        try { await apiService.request('/api/users/promote-self', { method: 'POST' }); } catch (_) {}
        try {
            const data = await apiService.request('/api/users/refresh-token', { method: 'POST' });
            if (data && data.token) { apiService.setToken(data.token); }
        } catch (_) {}
        updateAdminInfo();

        if (typeof initializeNavigation === 'function') {
            initializeNavigation();
        }

        setupGlobalListeners();

        setTimeout(() => {
            if (currentAppPage === 'book-management') {
                if (typeof loadBookManagementPage === 'function') {
                    loadBookManagementPage();
                }
            }
        }, 100);

    
    } catch (error) {
        console.error('Failed to initialize admin panel:', error);
        adminNotify('Ошибка инициализации панели', 'error');
    }
}

async function updateAdminInfo() {
    try {
        const profile = await apiService.getProfile();
        const nameEl = document.getElementById('adminName');
        const emailEl = document.getElementById('adminEmail');
        const avatarLetterEl = document.getElementById('adminAvatarLetter');

        if (nameEl) {
            nameEl.textContent = profile.username || 'Администратор';
        }

        if (emailEl) {
            emailEl.textContent = profile.email || '';
        }

        if (avatarLetterEl) {
            const name = profile.username || 'A';
            avatarLetterEl.textContent = name.charAt(0).toUpperCase();
        }

        try {
            const avatar = await apiService.getMyAvatar();
            const url = avatar && (avatar.fileUrl || avatar.avatarUrl);
            const avatarContainer = document.querySelector('.avatar');

            if (url && avatarContainer) {
                avatarContainer.style.backgroundImage = `url('${url}')`;
                avatarContainer.style.backgroundSize = 'cover';
                avatarContainer.style.backgroundPosition = 'center';
                if (avatarLetterEl) {
                    avatarLetterEl.textContent = '';
                }
            }
        } catch (avatarError) {
            
        }

    } catch (error) {
        console.error('Failed to load admin info:', error);
    }
}

function setupGlobalListeners() {
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.filter-toggle') && !e.target.closest('.filter-dropdown')) {
            closeAllFilters();
            if (typeof closeAllOrdersFilters === 'function') {
                closeAllOrdersFilters();
            }
        }
    });

    const logoutLinks = document.querySelectorAll('[onclick*="logout"], a[href*="logout"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
}

function logout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('adminRedirect');
    if (apiService && apiService.removeToken) {
        apiService.removeToken();
    }
    window.location.href = '/login';
}

function adminNotify(message, type = 'info') {
    if (externalNotify && externalNotify !== adminNotify) {
        externalNotify(message, type);
        return;
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 8px;
        color: white;
        background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#17a2b8'};
        z-index: 9999;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Failed to parse JWT:', e);
        return {};
    }
}

async function testApiConnection() {
    

    const token = localStorage.getItem('token');

    try {
        
        const profile = await apiService.getProfile();
        

        
        const books = await apiService.getBooks();
        

        
        const users = await apiService.getUsers();
        

        
        const orders = await apiService.getOrders();
        

        return {
            profile: true,
            books: books.length,
            users: users.length,
            orders: orders.length
        };

    } catch (error) {
        console.error('API test failed:', error);
        console.error('Error status:', error.message);

        if (error.message.includes('401')) {
            console.error('Unauthorized - Token invalid or expired');
        } else if (error.message.includes('403')) {
            console.error('Forbidden - Insufficient permissions');
        } else if (error.message.includes('Network')) {
            console.error('Network error - Check CORS or server connection');
        } else if (error.message.includes('Failed to fetch')) {
            console.error('Fetch failed - Check if server is running at', apiService.baseUrl);
        }

        throw error;
    }
}

function addTestButton() {
    const testBtn = document.createElement('button');
    testBtn.textContent = 'Test API Connection';
    testBtn.className = 'fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded';
    testBtn.onclick = async () => {
        try {
            const result = await testApiConnection();
            alert(`API tests passed!\n- Profile: ${result.profile}\n- Books: ${result.books}\n- Users: ${result.users}\n- Orders: ${result.orders}`);
        } catch (error) {
            alert(`API test failed: ${error.message}\nCheck console for details.`);
        }
    };
    document.body.appendChild(testBtn);
}

function initializeAdminPanel() {
    try {
        updateAdminInfo();

        if (typeof initializeNavigation === 'function') {
            initializeNavigation();
        }

        setupGlobalListeners();

        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            addTestButton();
        }

        setTimeout(() => {
            if (currentAppPage === 'book-management') {
                if (typeof loadBookManagementPage === 'function') {
                    loadBookManagementPage();
                }
            }
        }, 100);

        

    } catch (error) {
        console.error('Failed to initialize admin panel:', error);
        adminNotify('Ошибка инициализации панели', 'error');
    }
}

function isUserAdmin() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        const payload = parseJwt(token);
        let roles = payload.roles || payload.authorities || [];

        if (typeof roles === 'string') {
            roles = roles.split(/[\s,]+/);
        }

        // Проверяем все возможные варианты написания роли администратора
        return Array.isArray(roles)
            ? roles.some(role => {
                const normalizedRole = String(role).toUpperCase();
                return normalizedRole === 'ROLE_ADMIN' ||
                    normalizedRole === 'ADMIN' ||
                    normalizedRole === 'ROLE_ADMIN' ||
                    normalizedRole.includes('ADMIN');
            })
            : String(roles).toUpperCase().includes('ADMIN');
    } catch (e) {
        console.error('Error checking admin status:', e);
        return false;
    }
}

window.parseJwt = parseJwt;

window.allBooks = [];
window.filteredBooks = [];
window.currentAppPage = 'book-management';
window.booksPerPage = 10;
window.currentBookPage = 1;
window.currentFilters = { genres: [], authors: [], formats: [] };
window.currentSearch = '';
window.priceFilter = { min: 0, max: 100 };
window.debounce = debounce;
window.currentSort = '';
window.allOrders = [];
window.filteredOrders = [];
window.currentOrdersPage = 1;
window.ordersPerPage = 10;
window.currentOrderFilters = {
    search: '',
    status: [],
    dateFrom: '',
    dateTo: ''
};
