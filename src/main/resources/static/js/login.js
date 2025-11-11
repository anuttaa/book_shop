document.addEventListener('DOMContentLoaded', function() {
    setupPasswordToggle();

    if (apiService.token) {
        showNotification('You are already logged in. Redirecting...', 'info');
        setTimeout(() => {
            window.location.href = '../mainPage.html';
        }, 2000);
        return;
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const submitButton = this.querySelector('button[type="submit"]');

            console.log('Login attempt:', { username });

            if (!username || !password) {
                showNotification('Please fill in all fields', 'error');
                return;
            }

            try {
                submitButton.textContent = 'Signing In...';
                submitButton.disabled = true;

                const result = await apiService.login(username, password);
                console.log('Login successful:', result);

                if (result.token) {
                    apiService.setToken(result.token);
                    console.log('Token saved to localStorage:', result.token);

                    showNotification('Login successful! Redirecting...', 'success');

                    setTimeout(() => {
                        window.location.href = '../pages/mainPage.html';
                    }, 1000);
                } else {
                    throw new Error('No token received from server');
                }

            } catch (error) {
                console.error('Login error:', error);
                showNotification('Login failed: ' + (error.message || 'Invalid credentials'), 'error');
            } finally {
                submitButton.textContent = 'Login';
                submitButton.disabled = false;
            }
        });
    }

    updateNavigationLinks();
});