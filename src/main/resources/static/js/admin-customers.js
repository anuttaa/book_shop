let allUsers = [];
let filteredUsers = [];
let currentUsersPage = 1;
const usersPerPage = 10;
let currentUserFilters = {
    search: '',
    role: [],
    status: []
};

function loadCustomersPage(container) {
    container.innerHTML = `
        <div class="w-full max-w-7xl mx-auto">
            <!-- PageHeading -->
            <header class="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div class="flex flex-col">
                    <h1 class="text-3xl font-bold tracking-tight text-text-light-primary dark:text-dark-primary">User Management</h1>
                    <p class="text-text-light-secondary dark:text-dark-secondary text-base">View, edit, and manage user accounts.</p>
                </div>
                <button class="flex items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:opacity-90" onclick="openAddUserModal()">
                    <span class="material-symbols-outlined mr-2">add</span>
                    <span class="truncate">Add New User</span>
                </button>
            </header>

            <!-- Search and Filters -->
            <div class="mb-6 flex flex-wrap items-center gap-4">
                <!-- SearchBar -->
                <div class="flex-grow min-w-[300px]">
                    <label class="flex flex-col h-12 w-full">
                        <div class="flex w-full flex-1 items-stretch rounded-lg h-full">
                            <div class="text-text-light-secondary dark:text-dark-secondary flex border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark items-center justify-center pl-4 rounded-l-lg border-r-0">
                                <span class="material-symbols-outlined">search</span>
                            </div>
                            <input id="usersSearchInput" class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-text-light-primary dark:text-dark-primary focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-full placeholder:text-text-light-secondary dark:placeholder:text-dark-secondary pl-2 text-base font-normal" placeholder="Search by name, email, or ID..." value=""/>
                        </div>
                    </label>
                </div>

                <!-- Chips -->
                <div class="flex gap-3">
                    <div class="relative">
                        <button class="user-filter-toggle flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark px-4 hover:bg-surface-light/80 dark:hover:bg-surface-dark/80 transition-colors"
                                data-target="roleFilter">
                            <p class="text-sm font-medium text-text-light-primary dark:text-dark-primary">Filter by Role</p>
                            <span class="material-symbols-outlined text-text-light-secondary dark:text-dark-secondary">expand_more</span>
                        </button>
                        <div id="roleFilter" class="user-filter-dropdown hidden absolute mt-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-3 shadow-lg w-48 z-10">
                            <div class="space-y-2">
                                <label class="flex items-center">
                                    <input type="checkbox" class="role-checkbox h-4 w-4 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary bg-transparent" value="admin">
                                    <span class="ml-2 text-sm text-text-light-primary dark:text-dark-primary">Admin</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="role-checkbox h-4 w-4 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary bg-transparent" value="user">
                                    <span class="ml-2 text-sm text-text-light-primary dark:text-dark-primary">User</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="role-checkbox h-4 w-4 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary bg-transparent" value="guest">
                                    <span class="ml-2 text-sm text-text-light-primary dark:text-dark-primary">Guest</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="relative">
                        <button class="user-filter-toggle flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark px-4 hover:bg-surface-light/80 dark:hover:bg-surface-dark/80 transition-colors"
                                data-target="statusFilter">
                            <p class="text-sm font-medium text-text-light-primary dark:text-dark-primary">Filter by Status</p>
                            <span class="material-symbols-outlined text-text-light-secondary dark:text-dark-secondary">expand_more</span>
                        </button>
                        <div id="statusFilter" class="user-filter-dropdown hidden absolute mt-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-3 shadow-lg w-48 z-10">
                            <div class="space-y-2">
                                <label class="flex items-center">
                                    <input type="checkbox" class="status-checkbox h-4 w-4 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary bg-transparent" value="active">
                                    <span class="ml-2 text-sm text-text-light-primary dark:text-dark-primary">Active</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="status-checkbox h-4 w-4 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary bg-transparent" value="blocked">
                                    <span class="ml-2 text-sm text-text-light-primary dark:text-dark-primary">Blocked</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <button class="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark px-4 hover:bg-surface-light/80 dark:hover:bg-surface-dark/80 transition-colors"
                            onclick="resetUserFilters()">
                        <span class="material-symbols-outlined text-text-light-secondary dark:text-dark-secondary">restart_alt</span>
                        <p class="text-sm font-medium text-text-light-primary dark:text-dark-primary">Reset Filters</p>
                    </button>
                </div>
            </div>

            <!-- Table -->
            <div class="overflow-hidden rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
                <div class="overflow-x-auto">
                    <table class="w-full min-w-[1000px]">
                        <thead>
                            <tr class="border-b border-border-light dark:border-border-dark">
                                <th class="p-4 text-left text-sm font-semibold text-text-light-secondary dark:text-dark-secondary tracking-wider">User ID</th>
                                <th class="p-4 text-left text-sm font-semibold text-text-light-secondary dark:text-dark-secondary tracking-wider">Name</th>
                                <th class="p-4 text-left text-sm font-semibold text-text-light-secondary dark:text-dark-secondary tracking-wider">Email</th>
                                <th class="p-4 text-left text-sm font-semibold text-text-light-secondary dark:text-dark-secondary tracking-wider">Role</th>
                                <th class="p-4 text-left text-sm font-semibold text-text-light-secondary dark:text-dark-secondary tracking-wider">Date Registered</th>
                                <th class="p-4 text-left text-sm font-semibold text-text-light-secondary dark:text-dark-secondary tracking-wider">Status</th>
                                <th class="p-4 text-left text-sm font-semibold text-text-light-secondary dark:text-dark-secondary tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="usersTableBody" class="divide-y divide-border-light dark:divide-border-dark">
                            <!-- Users will be loaded dynamically -->
                        </tbody>
                    </table>
                </div>

                <!-- Loading State -->
                <div id="usersLoadingState" class="p-8 text-center">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p class="mt-2 text-text-light-secondary dark:text-dark-secondary">Loading users...</p>
                </div>

                <!-- Empty State -->
                <div id="usersEmptyState" class="hidden p-8 text-center">
                    <span class="material-symbols-outlined text-6xl text-text-light-secondary dark:text-dark-secondary mb-4">group</span>
                    <h3 class="text-lg font-medium text-text-light-primary dark:text-dark-primary mb-2">No users found</h3>
                    <p class="text-text-light-secondary dark:text-dark-secondary mb-4">No users match your current filters.</p>
                    <button class="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:opacity-90" onclick="resetUserFilters()">
                        <span class="material-symbols-outlined">refresh</span>
                        <span>Reset Filters</span>
                    </button>
                </div>

                <!-- Pagination -->
                <div id="usersPagination" class="hidden flex items-center justify-between p-4 border-t border-border-light dark:border-border-dark">
                    <p class="text-sm text-text-light-secondary dark:text-dark-secondary">Showing <span id="usersShowingRange">1-5</span> of <span id="usersTotalCount">0</span> users</p>
                    <div class="flex items-center gap-2">
                        <button class="flex h-9 w-9 items-center justify-center rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light-secondary dark:text-dark-secondary hover:bg-primary/10 transition-colors" onclick="previousUsersPage()">
                            <span class="material-symbols-outlined text-xl">chevron_left</span>
                        </button>
                        <div id="usersPageNumbers" class="flex items-center gap-1">
                            <!-- Page numbers will be generated dynamically -->
                        </div>
                        <button class="flex h-9 w-9 items-center justify-center rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light-secondary dark:text-dark-secondary hover:bg-primary/10 transition-colors" onclick="nextUsersPage()">
                            <span class="material-symbols-outlined text-xl">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <!-- Add User Modal -->
        <div id="addUserModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-content-light dark:bg-content-dark rounded-lg w-full max-w-md">
                <div class="flex justify-between items-center p-6 border-b border-border-light dark:border-border-dark">
                    <h3 class="text-lg font-bold text-text-light dark:text-text-dark">Add New User</h3>
                    <button onclick="closeAddUserModal()" class="text-subtle-light dark:text-subtle-dark hover:text-text-light dark:hover:text-text-dark">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form id="addUserForm" class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Username *</label>
                        <input type="text" name="username" required
                               class="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Email *</label>
                        <input type="email" name="email" required
                               class="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Password *</label>
                        <input type="password" name="password" required
                               class="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Role *</label>
                        <select name="role" required
                                class="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="guest">Guest(blocked)</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Status *</label>
                        <select name="status" required
                                class="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="active">Active</option>
                            <option value="blocked">Blocked</option>
                        </select>
                    </div>
                </form>

                <div class="flex justify-end gap-3 p-6 border-t border-border-light dark:border-border-dark">
                    <button type="button" onclick="closeAddUserModal()"
                            class="px-4 py-2 text-subtle-light dark:text-subtle-dark hover:text-text-light dark:hover:text-text-dark transition-colors">
                        Cancel
                    </button>
                    <button type="button" onclick="submitAddUserForm()"
                            class="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">
                        Add User
                    </button>
                </div>
            </div>
        </div>

        <!-- Edit User Modal -->
        <div id="editUserModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-content-light dark:bg-content-dark rounded-lg w-full max-w-md">
                <div class="flex justify-between items-center p-6 border-b border-border-light dark:border-border-dark">
                    <h3 class="text-lg font-bold text-text-light dark:text-text-dark">Edit User</h3>
                    <button onclick="closeEditUserModal()" class="text-subtle-light dark:text-subtle-dark hover:text-text-light dark:hover:text-text-dark">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form id="editUserForm" class="p-6 space-y-4">
                    <input type="hidden" name="userId" id="editUserId">

                    <div>
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Username *</label>
                        <input type="text" name="username" id="editUsername" required
                               class="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Email *</label>
                        <input type="email" name="email" id="editEmail" required
                               class="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Role *</label>
                        <select name="role" id="editRole" required
                                class="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="guest">Guest</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Status *</label>
                        <select name="status" id="editStatus" required
                                class="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="active">Active</option>
                            <option value="blocked">Blocked</option>
                        </select>
                    </div>
                </form>

                <div class="flex justify-between items-center p-6 border-t border-border-light dark:border-border-dark">
                    <button type="button" onclick="deleteUser()"
                            class="px-4 py-2 bg-destructive text-destructive-content rounded-lg hover:opacity-90 transition-opacity">
                        Delete User
                    </button>
                    <div class="flex gap-3">
                        <button type="button" onclick="closeEditUserModal()"
                                class="px-4 py-2 text-subtle-light dark:text-subtle-dark hover:text-text-light dark:hover:text-text-dark transition-colors">
                            Cancel
                        </button>
                        <button type="button" onclick="submitEditUserForm()"
                                class="px-4 py-2 bg-primary text-primary-content rounded-lg hover:opacity-90 transition-opacity">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    initializeUsersPage();
}

function initializeUsersPage() {
    setupUsersEventListeners();
    loadUsers();
}

function setupUsersEventListeners() {
    const searchInput = document.getElementById('usersSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            currentUserFilters.search = searchInput.value;
            currentUsersPage = 1;
            filterAndDisplayUsers();
        }, 300));
    }

    const roleCheckboxes = document.querySelectorAll('.role-checkbox');
    roleCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateRoleFilters);
    });

    const statusCheckboxes = document.querySelectorAll('.status-checkbox');
    statusCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateStatusFilters);
    });

    document.addEventListener('click', function(e) {
            const addModal = document.getElementById('addUserModal');
            const editModal = document.getElementById('editUserModal');

            if (addModal && !addModal.classList.contains('hidden') &&
                e.target === addModal) {
                closeAddUserModal();
            }

            if (editModal && !editModal.classList.contains('hidden') &&
                e.target === editModal) {
                closeEditUserModal();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeAddUserModal();
                closeEditUserModal();
            }
        });

    setupUsersFilterDropdowns();
}

function setupUsersFilterDropdowns() {
    const filterToggles = document.querySelectorAll('.user-filter-toggle');

    filterToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetId = toggle.dataset.target;
            const dropdown = document.getElementById(targetId);
            if (!dropdown) return;

            const isOpen = !dropdown.classList.contains('hidden');
            closeAllUsersFilters();

            if (!isOpen) {
                dropdown.classList.remove('hidden');
                toggle.classList.add('bg-primary/10', 'text-primary');
            }
        });
    });

    document.addEventListener('click', closeAllUsersFilters);
}

function closeAllUsersFilters() {
    const dropdowns = document.querySelectorAll('.user-filter-dropdown');
    const toggles = document.querySelectorAll('.user-filter-toggle');

    dropdowns.forEach(dropdown => {
        dropdown.classList.add('hidden');
    });

    toggles.forEach(toggle => {
        toggle.classList.remove('bg-primary/10', 'text-primary');
    });
}

async function loadUsers() {
    try {
        showUsersLoadingState();

        const users = await apiService.getUsers();
        console.log('Loaded users:', users);
        allUsers = users;

        filterAndDisplayUsers();

    } catch (error) {
        console.error('Error loading users:', error);
        showUsersError('Failed to load users');
    }
}

function showUsersLoadingState() {
    const loadingState = document.getElementById('usersLoadingState');
    const emptyState = document.getElementById('usersEmptyState');
    const tableBody = document.getElementById('usersTableBody');
    const pagination = document.getElementById('usersPagination');

    if (loadingState) loadingState.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    if (tableBody) tableBody.innerHTML = '';
    if (pagination) pagination.classList.add('hidden');
}

function filterAndDisplayUsers() {
    let filtered = filterUsers(allUsers);
    filteredUsers = filtered;
    displayUsers();
    updateUsersPagination();
}

function filterUsers(users) {
    let filtered = [...users];

    if (currentUserFilters.search) {
        const searchTerm = currentUserFilters.search.toLowerCase();
        filtered = filtered.filter(user =>
            (user.username && user.username.toLowerCase().includes(searchTerm)) ||
            (user.email && user.email.toLowerCase().includes(searchTerm)) ||
            (user.id && user.id.toString().includes(searchTerm))
        );
    }

    if (currentUserFilters.role.length > 0) {
        filtered = filtered.filter(user =>
            user.role && currentUserFilters.role.includes(user.role.toLowerCase())
        );
    }

    if (currentUserFilters.status.length > 0) {
        filtered = filtered.filter(user => {
            const status = user.role === 'guest' ? 'blocked' : 'active';
            return currentUserFilters.status.includes(status);
        });
    }

    return filtered;
}

function displayUsers() {
    const tableBody = document.getElementById('usersTableBody');
    const loadingState = document.getElementById('usersLoadingState');
    const emptyState = document.getElementById('usersEmptyState');
    const pagination = document.getElementById('usersPagination');

    if (!tableBody) return;

    if (filteredUsers.length === 0) {
        tableBody.innerHTML = '';
        if (loadingState) loadingState.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
        if (pagination) pagination.classList.add('hidden');
        return;
    }

    const startIndex = (currentUsersPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToShow = filteredUsers.slice(startIndex, endIndex);

    tableBody.innerHTML = usersToShow.map(user => {
        const userId = `#${user.id}`;
        const userName = user.username || 'Unknown User';
        const userEmail = user.email || 'No email';
        const userRole = user.role || 'user';

        const userStatus = user.role === 'guest' ? 'blocked' : 'active';

        const registeredDate = user.createdAt ? formatUserDate(user.createdAt) : 'N/A';

        const avatarColor = getAvatarColor(userName);

        return `
            <tr class="hover:bg-surface-light/50 dark:hover:bg-surface-dark/50 transition-colors">
                <td class="p-4 text-sm text-text-light-secondary dark:text-dark-secondary">${userId}</td>
                <td class="p-4">
                    <div class="flex items-center">
                        <div class="w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold mr-3">
                            ${userName.charAt(0).toUpperCase()}
                        </div>
                        <span class="text-sm font-medium text-text-light-primary dark:text-dark-primary">${userName}</span>
                    </div>
                </td>
                <td class="p-4 text-sm text-text-light-secondary dark:text-dark-secondary">${userEmail}</td>
                <td class="p-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        userRole === 'admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : userRole === 'user'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : userRole === 'guest'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }">
                        ${capitalizeFirst(userRole)}
                    </span>
                </td>
                <td class="p-4 text-sm text-text-light-secondary dark:text-dark-secondary">${registeredDate}</td>
                <td class="p-4 text-sm">
                    <div class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${getUserStatusClass(userStatus)}">
                        <span class="h-2 w-2 rounded-full ${getUserStatusDotClass(userStatus)}"></span>
                        ${getUserStatusText(userStatus)}
                    </div>
                </td>
                <td class="p-4">
                    <div class="flex items-center gap-2">
                        <button class="flex h-8 w-8 items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors" onclick="editUser(${user.id})" title="Edit User">
                            <span class="material-symbols-outlined text-xl">edit</span>
                        </button>
                        ${userStatus === 'active' ? `
                            <button class="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger/10 transition-colors" onclick="toggleUserStatus(${user.id}, 'block')" title="Block User">
                                <span class="material-symbols-outlined text-xl">block</span>
                            </button>
                        ` : `
                            <button class="flex h-8 w-8 items-center justify-center rounded-lg text-success hover:bg-success/10 transition-colors" onclick="toggleUserStatus(${user.id}, 'unblock')" title="Unblock User">
                                <span class="material-symbols-outlined text-xl">check_circle</span>
                            </button>
                        `}
                        <button class="flex h-8 w-8 items-center justify-center rounded-lg text-orange-500 hover:bg-orange-500/10 transition-colors" onclick="resetUserPassword(${user.id})" title="Reset Password">
                            <span class="material-symbols-outlined text-xl">key</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    if (loadingState) loadingState.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    if (pagination) pagination.classList.remove('hidden');
}

function getAvatarColor(username) {
    const colors = [
        'bg-gradient-to-br from-blue-500 to-blue-600',
        'bg-gradient-to-br from-green-500 to-green-600',
        'bg-gradient-to-br from-purple-500 to-purple-600',
        'bg-gradient-to-br from-pink-500 to-pink-600',
        'bg-gradient-to-br from-orange-500 to-orange-600',
        'bg-gradient-to-br from-teal-500 to-teal-600',
        'bg-gradient-to-br from-red-500 to-red-600',
        'bg-gradient-to-br from-indigo-500 to-indigo-600'
    ];

    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
}

function updateRoleFilters() {
    const checkboxes = document.querySelectorAll('.role-checkbox:checked');
    currentUserFilters.role = Array.from(checkboxes).map(cb => cb.value);
    currentUsersPage = 1;
    filterAndDisplayUsers();
}

function updateStatusFilters() {
    const checkboxes = document.querySelectorAll('.status-checkbox:checked');
    currentUserFilters.status = Array.from(checkboxes).map(cb => cb.value);
    currentUsersPage = 1;
    filterAndDisplayUsers();
}

function updateUsersPagination() {
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / usersPerPage);
    const startIndex = (currentUsersPage - 1) * usersPerPage + 1;
    const endIndex = Math.min(startIndex + usersPerPage - 1, total);

    const showingRange = document.getElementById('usersShowingRange');
    const totalCount = document.getElementById('usersTotalCount');
    const pageNumbers = document.getElementById('usersPageNumbers');

    if (showingRange) showingRange.textContent = `${startIndex}-${endIndex}`;
    if (totalCount) totalCount.textContent = total;

    if (pageNumbers) {
        let paginationHTML = '';

        paginationHTML += `
            <button class="flex h-9 w-9 items-center justify-center rounded-lg border ${currentUsersPage === 1 ? 'border-primary bg-primary/10 text-primary' : 'border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light-secondary dark:text-dark-secondary hover:bg-primary/10 transition-colors'}"
                    onclick="goToUsersPage(1)">1</button>
        `;

        if (currentUsersPage > 3) {
            paginationHTML += `<span class="text-text-light-secondary dark:text-dark-secondary px-2">...</span>`;
        }

        for (let i = Math.max(2, currentUsersPage - 1); i <= Math.min(totalPages - 1, currentUsersPage + 1); i++) {
            if (i !== 1 && i !== totalPages) {
                paginationHTML += `
                    <button class="flex h-9 w-9 items-center justify-center rounded-lg border ${currentUsersPage === i ? 'border-primary bg-primary/10 text-primary' : 'border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light-secondary dark:text-dark-secondary hover:bg-primary/10 transition-colors'}"
                            onclick="goToUsersPage(${i})">${i}</button>
                `;
            }
        }

        if (currentUsersPage < totalPages - 2) {
            paginationHTML += `<span class="text-text-light-secondary dark:text-dark-secondary px-2">...</span>`;
        }

        if (totalPages > 1) {
            paginationHTML += `
                <button class="flex h-9 w-9 items-center justify-center rounded-lg border ${currentUsersPage === totalPages ? 'border-primary bg-primary/10 text-primary' : 'border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light-secondary dark:text-dark-secondary hover:bg-primary/10 transition-colors'}"
                        onclick="goToUsersPage(${totalPages})">${totalPages}</button>
            `;
        }

        pageNumbers.innerHTML = paginationHTML;
    }
}

function previousUsersPage() {
    if (currentUsersPage > 1) {
        currentUsersPage--;
        filterAndDisplayUsers();
    }
}

function nextUsersPage() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    if (currentUsersPage < totalPages) {
        currentUsersPage++;
        filterAndDisplayUsers();
    }
}

function goToUsersPage(page) {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    if (page >= 1 && page <= totalPages) {
        currentUsersPage = page;
        filterAndDisplayUsers();
    }
}

function resetUserFilters() {
    currentUserFilters = {
        search: '',
        role: [],
        status: []
    };
    currentUsersPage = 1;

    const searchInput = document.getElementById('usersSearchInput');
    if (searchInput) searchInput.value = '';

    const checkboxes = document.querySelectorAll('.role-checkbox, .status-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    filterAndDisplayUsers();
}

function getUserStatusClass(status) {
    const statusClasses = {
        'active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'blocked': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}

function getUserStatusDotClass(status) {
    const dotClasses = {
        'active': 'bg-green-500',
        'blocked': 'bg-red-500',
        'pending': 'bg-yellow-500'
    };
    return dotClasses[status] || 'bg-gray-500';
}

function getUserStatusText(status) {
    const statusText = {
        'active': 'Active',
        'blocked': 'Blocked',
        'pending': 'Pending'
    };
    return statusText[status] || status;
}

function formatUserDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid Date';
    }
}

function capitalizeFirst(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function showUsersError(message) {
    const tableBody = document.getElementById('usersTableBody');
    const loadingState = document.getElementById('usersLoadingState');

    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="p-8 text-center text-danger">
                    <span class="material-symbols-outlined text-4xl mb-2">error</span>
                    <p>${message}</p>
                    <button onclick="loadUsers()" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">
                        Try Again
                    </button>
                </td>
            </tr>
        `;
    }
    if (loadingState) loadingState.classList.add('hidden');
}

function openAddUserModal() {
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.getElementById('addUserForm').reset();
    }
}

function closeAddUserModal() {
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

async function submitAddUserForm() {
    const form = document.getElementById('addUserForm');
    const formData = new FormData(form);

    const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
        status: formData.get('status')
    };

    if (!userData.username || !userData.email || !userData.password) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    try {
        showNotification('Creating user...', 'info');

        const newUser = await apiService.createUser(userData);

        showNotification('User created successfully!', 'success');
        closeAddUserModal();

        await loadUsers();

    } catch (error) {
        console.error('Error creating user:', error);
        showNotification('Failed to create user: ' + error.message, 'error');
    }
}

async function submitEditUserForm() {
    const form = document.getElementById('editUserForm');
    const formData = new FormData(form);

    const userId = parseInt(formData.get('userId'));
    const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
        role: formData.get('role'),
        status: formData.get('status')
    };

    if (!userData.username || !userData.email) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    try {
        showNotification('Updating user...', 'info');

        const updatedUser = await apiService.updateUser(userId, userData);

        showNotification('User updated successfully!', 'success');
        closeEditUserModal();

        await loadUsers();

    } catch (error) {
        console.error('Error updating user:', error);
        showNotification('Failed to update user: ' + error.message, 'error');
    }
}

async function deleteUser() {
    const form = document.getElementById('editUserForm');
    const formData = new FormData(form);
    const userId = parseInt(formData.get('userId'));

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }

    try {
        showNotification('Deleting user...', 'info');

        await apiService.deleteUser(userId);

        showNotification('User deleted successfully!', 'success');
        closeEditUserModal();

        await loadUsers();

    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Failed to delete user: ' + error.message, 'error');
    }
}

async function toggleUserStatus(userId, action) {
    try {
        const message = action === 'block' ?
            'Are you sure you want to block this user? They will not be able to login.' :
            'Are you sure you want to unblock this user?';

        if (!confirm(message)) {
            return;
        }

        showNotification(`${action === 'block' ? 'Blocking' : 'Unblocking'} user...`, 'info');

        if (action === 'block') {
            await apiService.blockUser(userId);
            showNotification('User blocked successfully!', 'success');
        } else {
            await apiService.unblockUser(userId);
            showNotification('User unblocked successfully!', 'success');
        }

        await loadUsers();

    } catch (error) {
        console.error('Error updating user status:', error);
        showNotification('Failed to update user status', 'error');
    }
}

async function resetUserPassword(userId) {
    const newPassword = prompt('Enter new password for user:');
    if (!newPassword) {
        return;
    }

    if (newPassword.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }

    try {
        showNotification('Resetting password...', 'info');
        await apiService.resetUserPassword(userId, newPassword);
        showNotification('Password reset successfully!', 'success');
    } catch (error) {
        console.error('Error resetting password:', error);
        showNotification('Failed to reset password', 'error');
    }
}

function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        showNotification('User not found', 'error');
        return;
    }

    const modal = document.getElementById('editUserModal');
    if (modal) {
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUsername').value = user.username || '';
        document.getElementById('editEmail').value = user.email || '';
        document.getElementById('editRole').value = user.role || 'ser';
        document.getElementById('editStatus').value = user.status || 'active';

        modal.classList.remove('hidden');
    }
}

function closeEditUserModal() {
    const modal = document.getElementById('editUserModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

window.loadCustomersPage = loadCustomersPage;
window.previousUsersPage = previousUsersPage;
window.nextUsersPage = nextUsersPage;
window.goToUsersPage = goToUsersPage;
window.resetUserFilters = resetUserFilters;
window.editUser = editUser;
window.toggleUserStatus = toggleUserStatus;
window.openAddUserModal = openAddUserModal;
window.closeAddUserModal = closeAddUserModal;
window.submitAddUserForm = submitAddUserForm;
window.closeEditUserModal = closeEditUserModal;
window.submitEditUserForm = submitEditUserForm;
window.deleteUser = deleteUser;
window.resetUserPassword = resetUserPassword;