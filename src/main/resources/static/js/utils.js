function showNotification(message, type = 'info') {
    const containerId = 'toast-container';
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.style.position = 'fixed';
        container.style.top = '16px';
        container.style.right = '16px';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '8px';
        document.body.appendChild(container);
    }

    const colors = {
        success: '#522B47',
        error: '#522B47',
        warning: '#E0DDCF',
        info: '#522B47'
    };

    const toast = document.createElement('div');
    toast.style.background = colors[type] || colors.info;
    toast.style.color = type === 'warning' ? '#522B47' : '#F1F0EA';
    toast.style.padding = '12px 16px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.maxWidth = '360px';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.justifyContent = 'space-between';
    toast.style.gap = '12px';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px)';
    toast.style.transition = 'opacity 200ms ease, transform 200ms ease';

    const text = document.createElement('span');
    text.textContent = message;
    text.style.fontSize = '14px';
    text.style.fontWeight = '600';

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px">close</span>';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.color = type === 'warning' ? '#522B47' : '#F1F0EA';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-8px)';
        setTimeout(() => toast.remove(), 200);
    };

    toast.appendChild(text);
    toast.appendChild(closeBtn);
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-8px)';
            setTimeout(() => toast.remove(), 200);
        }
    }, 4000);
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
        showNotification('Пожалуйста, войдите, чтобы продолжить', 'error');
        window.location.href = '/pages/login.html';
    } else {
        showNotification(error.message || 'Произошла ошибка', 'error');
    }
}

function updateAuthUI() {
    const isLoggedIn = checkAuth();

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
    return !!apiService.token;
}

document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
});
