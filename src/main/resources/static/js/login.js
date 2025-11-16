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
            showNotification('Please fill in all fields', 'error');
            return;
        }

        try {
            submitButton.textContent = 'Signing In...';
            submitButton.disabled = true;

            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) throw new Error('Invalid credentials');

            const data = await response.json();
            if (!data.token) throw new Error('No token received from server');

            apiService.setToken(data.token);

            showNotification('Login successful! Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = '/';
            }, 800);

        } catch (error) {
            console.error('Login error:', error);
            showNotification('Login failed: ' + error.message, 'error');
        } finally {
            submitButton.textContent = 'Login';
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
        toggle.textContent = type === 'password' ? 'Show' : 'Hide';
    });
}
