document.addEventListener('DOMContentLoaded', function() {
    setupPasswordToggle();
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const submitButton = loginForm.querySelector('button[type="submit"]');

        if (!username || !password) {
            showNotification('Заполните все поля', 'error');
            return;
        }

        try {
            submitButton.textContent = 'Вход...';
            submitButton.disabled = true;

            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) throw new Error('Неверные учетные данные');

            const data = await response.json();
            if (!data.token) throw new Error('Токен не получен от сервера');

            apiService.setToken(data.token);

            showNotification('Вход выполнен! Перенаправление...', 'success');

            setTimeout(() => {
                window.location.href = '/';
            }, 800);

        } catch (error) {
            console.error('Ошибка входа:', error);
            showNotification('Ошибка входа: ' + error.message, 'error');
        } finally {
            submitButton.textContent = 'Войти';
            submitButton.disabled = false;
        }
    });
});

function setupPasswordToggle() {
    const toggle = document.querySelector('#togglePassword');
    const password = document.querySelector('#password');
    if (!toggle || !password) return;

    toggle.addEventListener('click', () => {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        toggle.textContent = type === 'password' ? 'Показать' : 'Скрыть';
    });
}
