function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm transform transition-all duration-300 ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        type === 'warning' ? 'bg-yellow-500' :
        'bg-blue-500'
    }`;

    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <span class="material-symbols-outlined text-sm">close</span>
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function checkAuth() {
    return !!apiService.token;
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'BYN'
    }).format(price);
}

function handleApiError(error) {
    console.error('API Error:', error);

    if (error.message.includes('Authentication required') || error.message.includes('401')) {
        showNotification('Please login to continue', 'error');
        window.location.href = '/pages/login.html';
    } else {
        showNotification(error.message || 'An error occurred', 'error');
    }
}

function updateAuthUI() {
    const isLoggedIn = checkAuthStatus();

    const userActions = document.getElementById('userActions');
    const authButtons = document.getElementById('authButtons');
    const userActionsMain = document.getElementById('user-actions');
    const authButtonsMain = document.getElementById('auth-buttons');

    if (isLoggedIn) {
        if (userActions) userActions.classList.remove('hidden');
        if (userActionsMain) userActionsMain.classList.remove('hidden');
        if (authButtons) authButtons.classList.add('hidden');
        if (authButtonsMain) authButtonsMain.classList.add('hidden');
    } else {
        if (userActions) userActions.classList.add('hidden');
        if (userActionsMain) userActionsMain.classList.add('hidden');
        if (authButtons) authButtons.classList.remove('hidden');
        if (authButtonsMain) authButtonsMain.classList.remove('hidden');
    }
}

function checkAuthStatus() {
    return localStorage.getItem('isLoggedIn') === 'true' ||
           document.cookie.includes('auth_token') ||
           false;
}

document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
});