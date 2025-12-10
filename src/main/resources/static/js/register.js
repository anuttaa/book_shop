document.addEventListener('DOMContentLoaded', function() {
    setupPasswordToggle();
    setupUsernameValidation();
    setupEmailValidation(); // Добавляем вызов валидации email

    if (apiService.token) {
        showNotification('Вы уже вошли. Перенаправление...', 'info');
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

            if (!username || !email || !password || !confirmPassword) {
                showNotification('Заполните все поля', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showNotification('Введите корректный email', 'error');
                return;
            }

            if (!isValidPassword(password)) {
                showNotification('Пароль должен быть не менее 6 символов', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showNotification('Пароли не совпадают', 'error');
                return;
            }

            try {
                submitButton.textContent = 'Создание аккаунта...';
                submitButton.disabled = true;

                const userData = {
                    username: username,
                    email: email,
                    password: password
                };

                const result = await apiService.register(userData);
                
                showNotification('Регистрация успешна! Перенаправление к входу...', 'success');

                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);

            } catch (error) {
                console.error('Registration error:', error);

                const errorMessage = error.message || '';
                const lowerCaseError = errorMessage.toLowerCase();

                if (lowerCaseError.includes('username') &&
                    (lowerCaseError.includes('taken') ||
                     lowerCaseError.includes('already exists') ||
                     lowerCaseError.includes('occupied') ||
                     lowerCaseError.includes('duplicate'))) {
                    showNotification('Имя пользователя уже занято. Выберите другое.', 'error');
                } else if (lowerCaseError.includes('email') &&
                          (lowerCaseError.includes('taken') ||
                           lowerCaseError.includes('already exists') ||
                           lowerCaseError.includes('occupied') ||
                           lowerCaseError.includes('duplicate'))) {
                    showNotification('Этот email уже зарегистрирован. Используйте другой или войдите.', 'error');
                } else {
                    showNotification('Ошибка регистрации: ' + errorMessage, 'error');
                }
            } finally {
                submitButton.textContent = 'Создать аккаунт';
                submitButton.disabled = false;
            }
        });
    }

    updateNavigationLinks();
});

async function checkUsernameAvailability(username) {
    try {
        const users = await apiService.getUsers();
        const userExists = users.some(user =>
            user.username.toLowerCase() === username.toLowerCase()
        );
        return !userExists;
    } catch (error) {
        console.error('Username availability check error:', error);
        return true; // Возвращаем true при ошибке, чтобы не блокировать регистрацию
    }
}

async function checkEmailAvailability(email) {
    try {
        const users = await apiService.getUsers();
        const emailExists = users.some(user =>
            user.email.toLowerCase() === email.toLowerCase()
        );
        return !emailExists;
    } catch (error) {
        console.error('Email availability check error:', error);
        return true; // Возвращаем true при ошибке, чтобы не блокировать регистрацию
    }
}

function setupUsernameValidation() {
    const usernameInput = document.getElementById('username');
    if (!usernameInput) return;

    let timeoutId;

    usernameInput.addEventListener('input', function() {
        clearTimeout(timeoutId);
        const username = this.value.trim();

        if (username.length >= 3) {
            timeoutId = setTimeout(async () => {
                const isAvailable = await checkUsernameAvailability(username);
                updateUsernameValidationUI(isAvailable, 'username');
            }, 500);
        } else {
            clearValidationUI('username');
        }
    });
}

function setupEmailValidation() {
    const emailInput = document.getElementById('email');
    if (!emailInput) return;

    let timeoutId;

    emailInput.addEventListener('input', function() {
        clearTimeout(timeoutId);
        const email = this.value.trim();

        if (email.length >= 5 && isValidEmail(email)) {
            timeoutId = setTimeout(async () => {
                const isAvailable = await checkEmailAvailability(email);
                updateEmailValidationUI(isAvailable);
            }, 500);
        } else {
            clearValidationUI('email');
        }
    });
}

function updateUsernameValidationUI(isAvailable, fieldType) {
    const usernameInput = document.getElementById('username');
    const existingFeedback = usernameInput.parentNode.querySelector('.validation-feedback');

    if (existingFeedback) {
        existingFeedback.remove();
    }

    const feedback = document.createElement('div');
    feedback.className = `validation-feedback text-sm mt-1`;
    
    if (usernameInput.value.length >= 3) {
        feedback.style.color = isAvailable ? '#2E7D32' : '#D32F2F';
        feedback.textContent = isAvailable ? 'Имя пользователя доступно' : 'Имя пользователя занято';
        usernameInput.style.borderColor = isAvailable ? '#2E7D32' : '#D32F2F';
    } else {
        feedback.style.color = '#757575';
        feedback.textContent = 'Минимум 3 символа';
        usernameInput.style.borderColor = '#E0DDCF';
    }

    usernameInput.parentNode.appendChild(feedback);
}

function updateEmailValidationUI(isAvailable) {
    const emailInput = document.getElementById('email');
    const existingFeedback = emailInput.parentNode.querySelector('.validation-feedback');

    if (existingFeedback) {
        existingFeedback.remove();
    }

    const feedback = document.createElement('div');
    feedback.className = `validation-feedback text-sm mt-1`;
    
    if (emailInput.value.length >= 5 && isValidEmail(emailInput.value)) {
        feedback.style.color = isAvailable ? '#2E7D32' : '#D32F2F';
        feedback.textContent = isAvailable ? 'Email доступен' : 'Email уже зарегистрирован';
        emailInput.style.borderColor = isAvailable ? '#2E7D32' : '#D32F2F';
    } else if (emailInput.value.length > 0 && !isValidEmail(emailInput.value)) {
        feedback.style.color = '#D32F2F';
        feedback.textContent = 'Введите корректный email';
        emailInput.style.borderColor = '#D32F2F';
    } else {
        feedback.style.color = '#757575';
        feedback.textContent = 'Введите email';
        emailInput.style.borderColor = '#E0DDCF';
    }

    emailInput.parentNode.appendChild(feedback);
}

function clearValidationUI(fieldType) {
    const input = document.getElementById(fieldType);
    const existingFeedback = input.parentNode.querySelector('.validation-feedback');

    if (existingFeedback) {
        existingFeedback.remove();
    }

    input.style.borderColor = '#E0DDCF';
}

function setupPasswordToggle() {
    const toggle = document.querySelector('#togglePassword');
    const password = document.querySelector('#password');
    if (!toggle || !password) return;

    const updateVisibility = () => {
        if (password.value && password.value.length > 0) {
            toggle.classList.remove('hidden');
        } else {
            toggle.classList.add('hidden');
        }
    };

    toggle.classList.add('hidden');
    password.addEventListener('input', updateVisibility);
    password.addEventListener('blur', updateVisibility);

    toggle.addEventListener('click', () => {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        const icon = toggle.querySelector('.material-symbols-outlined');
        if (icon) {
            icon.textContent = type === 'password' ? 'visibility' : 'visibility_off';
        }
    });

    updateVisibility();
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