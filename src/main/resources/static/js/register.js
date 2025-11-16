document.addEventListener('DOMContentLoaded', function() {
    setupPasswordToggle();

    if (apiService.token) {
        showNotification('You are already logged in. Redirecting...', 'info');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
        return;
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const submitButton = this.querySelector('button[type="submit"]');

            console.log('Form data:', { username, email, password, confirmPassword });

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
                submitButton.textContent = 'Creating Account...';
                submitButton.disabled = true;

                const userData = {
                    username: username,
                    email: email,
                    password: password
                };

                console.log('Sending registration data:', userData);

                const result = await apiService.register(userData);
                console.log('Registration response:', result);

                showNotification('Registration successful! Redirecting to login...', 'success');

                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);

            } catch (error) {
                console.error('Registration error:', error);
                showNotification('Registration failed: ' + (error.message || 'Unknown error'), 'error');
            } finally {
                submitButton.textContent = 'Create Account';
                submitButton.disabled = false;
            }
        });
    }

    updateNavigationLinks();
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

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidPassword(password) {
    return password.length >= 6;
}

function updateNavigationLinks() {
    document.querySelectorAll('header a[href="#"]').forEach(link => {
        if (link.textContent.includes('Register')) {
            link.href = 'register';
        } else if (link.textContent.includes('Login')) {
            link.href = 'login';
        } else if (link.textContent.includes('Home')) {
            link.href = '/';
        }
    });
}