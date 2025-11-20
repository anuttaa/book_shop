function handleAvatarClick() {
    const avatarBtn = document.querySelector('[data-section="avatar"]');
    if (avatarBtn) {
        avatarBtn.click();

        setTimeout(() => {
            document.getElementById('contentArea').scrollIntoView({
                behavior: 'smooth'
            });
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
                showAvatarMessage("Please enter avatar URL", "text-red-600");
                return;
            }

            try {
                await apiService.setMyAvatar(avatarUrl, fileName);
                showAvatarMessage("Avatar updated successfully!", "text-green-600");

                await loadCurrentAvatarPreview();
                await loadUserAvatar();

            } catch (error) {
                console.error('Failed to update avatar:', error);
                showAvatarMessage("Failed to update avatar: " + error.message, "text-red-600");
            }
        });
    }

    if (deleteAvatarBtn) {
        deleteAvatarBtn.addEventListener("click", async () => {
            if (!confirm("Are you sure you want to delete your avatar?")) return;

            try {
                await apiService.deleteMyAvatar();
                showAvatarMessage("Avatar deleted successfully!", "text-green-600");

                await loadCurrentAvatarPreview();
                await loadUserAvatar();

            } catch (error) {
                console.error('Failed to delete avatar:', error);
                showAvatarMessage("Failed to delete avatar: " + error.message, "text-red-600");
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

function handleAvatarClick() {
    const avatarBtn = document.querySelector('[data-section="avatar"]');
    if (avatarBtn) {
        avatarBtn.click();

        setTimeout(() => {
            document.getElementById('contentArea').scrollIntoView({
                behavior: 'smooth'
            });
        }, 100);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const user = await apiService.getProfile();
        loadProfileSection();
        document.getElementById('sidebarUsername').textContent = user.username;
        document.getElementById('sidebarEmail').textContent = user.email;

        await loadUserAvatar();

    } catch (err) {
        console.error('Profile fetch error:', err.message);
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
      <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900/50">
        <h2 class="text-2xl font-bold mb-4">My Profile</h2>
        <form id="profileForm" class="flex flex-col gap-4 max-w-lg">
          <div>
            <label>Full Name</label>
            <input id="profileName" type="text" class="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"/>
          </div>
          <div>
            <label>Email</label>
            <input id="profileEmail" type="email" class="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"/>
          </div>
          <div>
            <label><input id="profileSubscribed" type="checkbox"/> Subscribe to newsletter</label>
          </div>
          <button type="submit" class="mt-2 bg-primary text-white px-4 py-2 rounded-md">Save Changes</button>
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
        console.log(user.subscribed);
        document.getElementById("profileName").value = user.username || "";
        document.getElementById("profileEmail").value = user.email || "";

        const checkbox = document.getElementById("profileSubscribed");
        checkbox.checked = Boolean(user.subscribed);

    } catch (e) {
        console.error("Error loading profile:", e);
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
                const password = prompt("Enter your password to refresh token:");
                if (password) {
                    const loginResult = await apiService.login(updated.username, password);
                    apiService.setToken(loginResult.token);
                }
            }

            showProfileMessage("Saved successfully!", "text-green-600");
        } catch (e) {
            console.error(e);
            showProfileMessage("Error saving changes", "text-red-600");
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
      <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900/50">
        <h2 class="text-2xl font-bold mb-4">Change Password</h2>
        <form id="changePasswordForm" class="flex flex-col gap-4 max-w-lg">
          <div>
            <label>Current Password</label>
            <input id="currentPassword" type="password" class="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"/>
          </div>
          <div>
            <label>New Password</label>
            <input id="newPassword" type="password" class="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"/>
          </div>
          <button type="submit" class="mt-2 bg-primary text-white px-4 py-2 rounded-md">Update Password</button>
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
            showPasswordMessage(msg, "text-green-600");
        } catch (e) {
            console.error(e);
            showPasswordMessage("Failed to update password", "text-red-600");
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
      <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900/50">
        <h2 class="text-2xl font-bold mb-4">Delete Account</h2>
        <p>This action is irreversible.</p>
        <button id="deleteAccountBtn" class="bg-red-600 text-white px-4 py-2 rounded-md mt-2">Delete Account</button>
        <p id="deleteMessage" class="text-sm mt-2"></p>
      </div>`;
    document.getElementById("contentArea").innerHTML = content;

    document.getElementById("deleteAccountBtn").addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete your account?")) return;
        try {
            await apiService.deleteAccount();
            showDeleteMessage("Account deleted!", "text-green-600");
            apiService.removeToken();
            window.location.href = "/";
        } catch (e) {
            console.error(e);
            showDeleteMessage("Failed to delete account", "text-red-600");
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
        console.log('Loading user avatar...');
        const avatarData = await apiService.getMyAvatar();
        const avatarContainer = document.getElementById('avatarContainer');

        console.log('Raw avatar data:', avatarData);

        let avatarUrl = null;

        if (avatarData && avatarData.fileUrl) {
            avatarUrl = avatarData.fileUrl;
            console.log('Using fileUrl:', avatarUrl);
        }

        console.log('Final avatar URL:', avatarUrl);

        if (avatarUrl) {
            const fullUrl = avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:8080${avatarUrl}`;

            avatarContainer.style.backgroundImage = `url('${fullUrl}')`;
            avatarContainer.style.backgroundSize = 'cover';
            avatarContainer.style.backgroundPosition = 'center';
            avatarContainer.style.backgroundRepeat = 'no-repeat';
            avatarContainer.innerHTML = '';

            console.log('Avatar loaded successfully:', fullUrl);
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
            console.log('No avatar URL found - showing default icon');
        }

    } catch (error) {
        console.error('Failed to load avatar:', error);
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
        <h2 class="text-2xl font-bold mb-4">Change Avatar</h2>

        <!-- Current Avatar Preview -->
        <div class="flex flex-col items-center mb-6">
            <div id="currentAvatarPreview" class="size-32 rounded-full bg-cover bg-center bg-gray-200 border-2 border-gray-300 dark:border-gray-600 mb-4"></div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Current avatar</p>
        </div>

        <!-- Avatar Upload Form -->
        <form id="avatarForm" class="flex flex-col gap-4 max-w-lg">
          <div>
            <label class="block text-sm font-medium mb-2">Avatar URL</label>
            <input id="avatarUrl" type="url"
                   placeholder="https://example.com/avatar.jpg"
                   class="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"/>
            <p class="text-xs text-gray-500 mt-1">Enter a direct link to your avatar image</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">File Name (optional)</label>
            <input id="avatarFileName" type="text"
                   placeholder="avatar.jpg"
                   class="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"/>
          </div>

          <div class="flex gap-3">
            <button type="submit" class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
              Update Avatar
            </button>
            <button type="button" id="deleteAvatarBtn" class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
              Delete Avatar
            </button>
          </div>

          <p id="avatarMessage" class="text-sm mt-2"></p>
        </form>

        <!-- Avatar Examples -->
        <div class="mt-6">
          <h3 class="text-lg font-medium mb-3">Quick Avatar Examples</h3>
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
        console.log('Loading current avatar preview...');
        const avatarData = await apiService.getMyAvatar();
        const preview = document.getElementById('currentAvatarPreview');

        console.log('Preview avatar data:', avatarData);

        let avatarUrl = null;

        if (avatarData && avatarData.fileUrl) {
            avatarUrl = avatarData.fileUrl;
        }

        console.log('Preview extracted URL:', avatarUrl);

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
        console.error('Failed to load current avatar preview:', error);
    }
}

function showAvatarMessage(text, cls) {
    const msg = document.getElementById("avatarMessage");
    if (msg) {
        msg.textContent = text;
        msg.className = "text-sm mt-2 " + cls;
    }
}
