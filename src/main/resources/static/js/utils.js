// Показать уведомление
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
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

    // Добавляем уведомление на страницу
    document.body.appendChild(notification);

    // Автоматически удаляем через 5 секунд
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Проверка авторизации
function checkAuth() {
    return !!apiService.token;
}

// Форматирование цены
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// Обработка ошибок API
function handleApiError(error) {
    console.error('API Error:', error);

    if (error.message.includes('Authentication required') || error.message.includes('401')) {
        showNotification('Please login to continue', 'error');
        window.location.href = '/pages/login.html';
    } else {
        showNotification(error.message || 'An error occurred', 'error');
    }
}