document.addEventListener('DOMContentLoaded', function() {
    setupPasswordToggle();

    // Если пользователь уже авторизован, перенаправить на главную
    if (apiService.token) {
        showNotification('You are already logged in. Redirecting...', 'info');
        setTimeout(() => {
            window.location.href = '../mainPage.html';
        }, 2000);
        return;
    }

    // Обработка формы регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const submitButton = this.querySelector('button[type="submit"]');

            console.log('Form data:', { username, email, password, confirmPassword }); // для отладки

            // Валидация
            if (!username || !email || !password || !confirmPassword) {
                showNotification('Please fill in all fields', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }

            if (!isValidPassword(password)) {
                showNotification('Password must be at least 6 characters long', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }

            try {
                // Показать состояние загрузки
                submitButton.textContent = 'Creating Account...';
                submitButton.disabled = true;

                const userData = {
                    username: username,
                    email: email,
                    password: password
                };

                console.log('Sending registration data:', userData); // для отладки

                const result = await apiService.register(userData);
                console.log('Registration response:', result); // для отладки

                showNotification('Registration successful! Redirecting to login...', 'success');

                // Редирект на страницу логина
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            } catch (error) {
                console.error('Registration error:', error); // для отладки
                showNotification('Registration failed: ' + (error.message || 'Unknown error'), 'error');
            } finally {
                submitButton.textContent = 'Create Account';
                submitButton.disabled = false;
            }
        });
    }

    // Обновить ссылки для навигации
    updateNavigationLinks();
});

function updateNavigationLinks() {
    // Обновить ссылки в хедере
    document.querySelectorAll('header a[href="#"]').forEach(link => {
        if (link.textContent.includes('Register')) {
            link.href = 'register.html';
        } else if (link.textContent.includes('Login')) {
            link.href = 'login.html';
        } else if (link.textContent.includes('Home')) {
            link.href = '../mainPage.html';
        }
    });
}