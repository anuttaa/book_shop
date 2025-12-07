function handleAvatarClick() {
    const avatarBtn = document.querySelector('[data-section="avatar"]');
    if (avatarBtn) {
        avatarBtn.click();
        setTimeout(() => {
            document.getElementById('contentArea').scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
}

function attachAvatarHandlers() {
    const avatarForm = document.getElementById("avatarForm");
    const deleteAvatarBtn = document.getElementById("deleteAvatarBtn");

    if (avatarForm) {
        avatarForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const avatarUrl = document.getElementById("avatarUrl").value;
            const fileName = document.getElementById("avatarFileName").value || 'avatar.jpg';

            if (!avatarUrl) {
                showAvatarMessage("Введите URL аватара", "text-destructive");
                return;
            }

            try {
                await apiService.setMyAvatar(avatarUrl, fileName);
                showAvatarMessage("Аватар обновлён", "text-success");

                await loadCurrentAvatarPreview();
                await loadUserAvatar();

            } catch (error) {
                showAvatarMessage("Не удалось обновить аватар: " + error.message, "text-destructive");
            }
        });
    }

    if (deleteAvatarBtn) {
        deleteAvatarBtn.addEventListener("click", async () => {
            if (!confirm("Вы уверены, что хотите удалить аватар?")) return;

            try {
                await apiService.deleteMyAvatar();
                showAvatarMessage("Аватар удалён", "text-success");

                await loadCurrentAvatarPreview();
                await loadUserAvatar();

            } catch (error) {
                showAvatarMessage("Не удалось удалить аватар: " + error.message, "text-destructive");
            }
        });
    }

    document.querySelectorAll('.avatar-option').forEach(option => {
        option.addEventListener('click', () => {
            const url = option.dataset.url;
            document.getElementById('avatarUrl').value = url;
            document.getElementById('avatarFileName').value = 'avatar.jpg';

            document.getElementById('avatarForm').dispatchEvent(new Event('submit'));
        });
    });
}

// parseJwt helper
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return {};
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    if (!apiService.token) {
        window.location.href = '/login';
        return;
    }

    try {
        const user = await apiService.getProfile();
        loadProfileSection();
        document.getElementById('sidebarUsername').textContent = user.username;
        document.getElementById('sidebarEmail').textContent = user.email;

        await loadUserAvatar();

    } catch (err) {
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
            window.location.href = '/login';
        }
    }
});

document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
        document.querySelectorAll(".nav-btn").forEach(b =>
            b.classList.remove("bg-primary/10", "text-primary", "dark:bg-primary/20")
        );

        btn.classList.add("bg-primary/10", "text-primary", "dark:bg-primary/20");

        const section = btn.dataset.section;
        switch(section) {
            case "avatar":
                await loadAvatarSection();
                break;
            case "profile":
                loadProfileSection();
                break;
            case "change-password":
                loadChangePasswordSection();
                break;
            case "delete":
                loadDeleteAccountSection();
                break;
            default:
                document.getElementById("contentArea").innerHTML = `<div>Content will be loaded dynamically...</div>`;
        }

        await loadUserAvatar();
    });
});

async function loadProfileSection() {
    const content = `
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-bold mb-4">Мой профиль</h2>
        <form id="profileForm" class="flex flex-col gap-4 max-w-4xl" style="max-width:640px">
          <div>
            <label class="text-sm font-medium">Полное имя</label>
            <input id="profileName" type="text" class="w-full rounded-md border bg-background-light px-3 py-2"/>
          </div>
          <div>
            <label class="text-sm font-medium">Email</label>
            <input id="profileEmail" type="email" class="w-full rounded-md border bg-background-light px-3 py-2"/>
          </div>
          <div>
            <label class="text-sm font-medium"><input id="profileSubscribed" type="checkbox"/> Подписка на рассылку</label>
          </div>
          <button type="submit" class="mt-2 btn btn-primary">Сохранить изменения</button>
          <p id="profileMessage" class="text-sm mt-2"></p>
        </form>
      </div>`;
    document.getElementById("contentArea").innerHTML = content;

    await fillProfileForm();
    attachProfileHandlers();
}

async function fillProfileForm() {
    try {
        const user = await apiService.getProfile();
        document.getElementById("profileName").value = user.username || "";
        document.getElementById("profileEmail").value = user.email || "";

        const checkbox = document.getElementById("profileSubscribed");
        checkbox.checked = Boolean(user.subscribed);

    } catch (e) {
    }
}

function attachProfileHandlers() {
    document.getElementById("profileForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const updated = {
            username: document.getElementById("profileName").value,
            email: document.getElementById("profileEmail").value,
            subscribed: document.getElementById("profileSubscribed").checked
        };

        try {
            await apiService.updateProfile(updated);

            const usernameEl = document.getElementById('username');
            const emailEl = document.getElementById('email');
            if (usernameEl) usernameEl.textContent = updated.username;
            if (emailEl) emailEl.textContent = updated.email;

            const tokenUser = parseJwt(apiService.token).sub;
            if (tokenUser !== updated.username) {
            const password = prompt("Введите пароль для обновления токена:");
                if (password) {
                    const loginResult = await apiService.login(updated.username, password);
                    apiService.setToken(loginResult.token);
                }
            }

            showProfileMessage("Сохранено", "text-success");
        } catch (e) {
            showProfileMessage("Ошибка сохранения", "text-destructive");
        }
    });
}

function showProfileMessage(text, cls) {
    const msg = document.getElementById("profileMessage");
    msg.textContent = text;
    msg.className = "text-sm mt-2 " + cls;
}

async function loadChangePasswordSection() {
    const content = `
      <div class="rounded-lg bg-content-light p-6 shadow-sm">
        <h2 class="text-2xl font-bold mb-4">Смена пароля</h2>
        <form id="changePasswordForm" class="flex flex-col gap-4" style="max-width:640px">
          <div>
            <label>Текущий пароль</label>
            <input id="currentPassword" type="password" class="w-full rounded-lg border bg-background-light px-3 py-2"/>
          </div>
          <div>
            <label>Новый пароль</label>
            <input id="newPassword" type="password" class="w-full rounded-lg border bg-background-light px-3 py-2"/>
          </div>
          <button type="submit" class="mt-2 btn btn-primary">Обновить пароль</button>
          <p id="passwordMessage" class="text-sm mt-2"></p>
        </form>
      </div>`;

    document.getElementById("contentArea").innerHTML = content;

    document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;

        try {
            const msg = await apiService.changePassword(currentPassword, newPassword);
            showPasswordMessage(msg, "text-success");
        } catch (e) {
            showPasswordMessage("Не удалось обновить пароль", "text-destructive");
        }
    });
}

function showPasswordMessage(text, cls) {
    const msg = document.getElementById("passwordMessage");
    msg.textContent = text;
    msg.className = "text-sm mt-2 " + cls;
}

function loadDeleteAccountSection() {
    const content = `
      <div class="rounded-lg bg-content-light p-6 shadow-sm">
        <h2 class="text-2xl font-bold mb-4">Удаление аккаунта</h2>
        <p>Это действие необратимо.</p>
        <button id="deleteAccountBtn" class="btn btn-danger mt-2">Удалить аккаунт</button>
        <p id="deleteMessage" class="text-sm mt-2"></p>
      </div>`;
    document.getElementById("contentArea").innerHTML = content;

    document.getElementById("deleteAccountBtn").addEventListener("click", async () => {
        if (!confirm("Вы уверены, что хотите удалить аккаунт?")) return;
        try {
            await apiService.deleteAccount();
            showDeleteMessage("Аккаунт удалён!", "text-success");
            apiService.removeToken();
            window.location.href = "/";
        } catch (e) {
            showDeleteMessage("Не удалось удалить аккаунт", "text-destructive");
        }
    });
}

function showDeleteMessage(text, cls) {
    const msg = document.getElementById("deleteMessage");
    msg.textContent = text;
    msg.className = "text-sm mt-2 " + cls;
}

async function loadUserAvatar() {
    try {
        const avatarData = await apiService.getMyAvatar();
        const avatarContainer = document.getElementById('avatarContainer');

        let avatarUrl = null;

        if (avatarData && avatarData.fileUrl) {
            avatarUrl = avatarData.fileUrl;
        }

        if (avatarUrl) {
            const fullUrl = avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:8080${avatarUrl}`;

            avatarContainer.style.backgroundImage = `url('${fullUrl}')`;
            avatarContainer.style.backgroundSize = 'cover';
            avatarContainer.style.backgroundPosition = 'center';
            avatarContainer.style.backgroundRepeat = 'no-repeat';
            avatarContainer.innerHTML = '';

        } else {
            avatarContainer.style.backgroundImage = 'none';
            avatarContainer.style.backgroundSize = '';
            avatarContainer.style.backgroundPosition = '';
            avatarContainer.style.backgroundRepeat = '';
            avatarContainer.innerHTML = `
                <div class="w-full h-full flex items-center justify-center text-gray-400">
                    <span class="material-symbols-outlined text-3xl">person</span>
                </div>
            `;
        }

    } catch (error) {
        const avatarContainer = document.getElementById('avatarContainer');
        avatarContainer.style.backgroundImage = 'none';
        avatarContainer.innerHTML = `
            <div class="w-full h-full flex items-center justify-center text-gray-400">
                <span class="material-symbols-outlined text-3xl">person</span>
            </div>
        `;
    }
}

async function loadAvatarSection() {
    const content = `
      <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900/50">
        <h2 class="text-2xl font-bold mb-4">Сменить аватар</h2>

        <!-- Current Avatar Preview -->
        <div class="flex flex-col items-center mb-6">
            <div id="currentAvatarPreview" class="size-32 rounded-full bg-cover bg-center bg-gray-200 border-2 border-gray-300 mb-4"></div>
            <p class="text-sm text-gray-500">Текущий аватар</p>
        </div>

        <!-- Avatar Upload Form -->
        <form id="avatarForm" class="flex flex-col gap-4" style="max-width:640px">
          <div>
            <label class="block text-sm font-medium mb-2">URL аватара</label>
            <input id="avatarUrl" type="url"
                   placeholder="https://example.com/avatar.jpg"
                   class="w-full rounded-md border bg-background-light px-3 py-2"/>
            <p class="text-xs text-gray-500 mt-1">Введите прямую ссылку на изображение</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Имя файла (необязательно)</label>
            <input id="avatarFileName" type="text"
                   placeholder="avatar.jpg"
                   class="w-full rounded-md border bg-background-light px-3 py-2"/>
          </div>

          <div class="flex gap-3">
            <button type="submit" class="btn btn-primary">
              Обновить аватар
            </button>
            <button type="button" id="deleteAvatarBtn" class="btn btn-danger">
              Удалить аватар
            </button>
          </div>

          <p id="avatarMessage" class="text-sm mt-2"></p>
        </form>

        <!-- Avatar Examples -->
        <div class="mt-6">
          <h3 class="text-lg font-medium mb-3">Примеры аватаров</h3>
          <div class="grid grid-cols-4 gap-3">
            <div class="avatar-option size-16 rounded-full bg-cover bg-center cursor-pointer hover:scale-110 transition-transform"
                 data-url="https://i.pravatar.cc/150?img=1"></div>
            <div class="avatar-option size-16 rounded-full bg-cover bg-center cursor-pointer hover:scale-110 transition-transform"
                 data-url="https://i.pravatar.cc/150?img=5"></div>
            <div class="avatar-option size-16 rounded-full bg-cover bg-center cursor-pointer hover:scale-110 transition-transform"
                 data-url="https://i.pravatar.cc/150?img=10"></div>
            <div class="avatar-option size-16 rounded-full bg-cover bg-center cursor-pointer hover:scale-110 transition-transform"
                 data-url="https://i.pravatar.cc/150?img=15"></div>
          </div>
        </div>
      </div>`;

    document.getElementById("contentArea").innerHTML = content;
    await loadCurrentAvatarPreview();
    attachAvatarHandlers();
}

async function loadCurrentAvatarPreview() {
    try {
        const avatarData = await apiService.getMyAvatar();
        const preview = document.getElementById('currentAvatarPreview');

        let avatarUrl = null;

        if (avatarData && avatarData.fileUrl) {
            avatarUrl = avatarData.fileUrl;
        }

        if (avatarUrl) {
            const fullUrl = avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:8080${avatarUrl}`;
            preview.style.backgroundImage = `url('${fullUrl}')`;
            preview.innerHTML = '';
        } else {
            preview.style.backgroundImage = 'none';
            preview.innerHTML = `
                <div class="w-full h-full flex items-center justify-center text-gray-400">
                    <span class="material-symbols-outlined text-4xl">person</span>
                </div>
            `;
        }
    } catch (error) {
    }
}

function showAvatarMessage(text, cls) {
    const msg = document.getElementById("avatarMessage");
    if (msg) {
        msg.textContent = text;
        msg.className = "text-sm mt-2 " + cls;
    }
}
