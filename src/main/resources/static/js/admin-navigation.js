function initializeNavigation() {
    setTimeout(() => {
        const navLinks = document.querySelectorAll('aside nav a, aside .flex-flex-col a, [data-page]');

        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                let page = this.getAttribute('data-page');

                if (!page) {
                    const textElement = this.querySelector('p');
                    if (textElement) {
                        page = textElement.textContent.toLowerCase().replace(' ', '-');
                    }
                }

                if (page) {
                    navigateTo(page);
                }
            });
        });

        updateActiveNavItem(currentAppPage);
    }, 100);
}

function navigateTo(page) {
    currentAppPage = page;
    updateActiveNavItem(page);
    loadPageContent(page);
}

function updateActiveNavItem(page) {
    const navLinks = document.querySelectorAll('aside nav a, aside .flex-flex-col a, [data-page]');

    navLinks.forEach(link => {
        link.classList.remove('bg-primary/10', 'text-primary');
        link.classList.add('text-subtle-light', 'dark:text-subtle-dark');

        const icon = link.querySelector('.material-symbols-outlined');
        if (icon) {
            icon.style.fontVariationSettings = "'FILL' 0";
        }
    });

    let activeLink = document.querySelector(`[data-page="${page}"]`);

    if (!activeLink) {
        navLinks.forEach(link => {
            const textElement = link.querySelector('p');
            if (textElement) {
                const linkText = textElement.textContent.toLowerCase().replace(' ', '-');
                if (linkText === page) {
                    activeLink = link;
                }
            }
        });
    }

    if (activeLink) {
        activeLink.classList.remove('text-subtle-light', 'dark:text-subtle-dark');
        activeLink.classList.add('bg-primary/10', 'text-primary');

        const icon = activeLink.querySelector('.material-symbols-outlined');
        if (icon) {
            icon.style.fontVariationSettings = "'FILL' 1";
        }
    }
}

function loadPageContent(page) {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    showLoadingState(mainContent);

    switch(page) {
        case 'dashboard':
            loadDashboardPage(mainContent);
            break;
        case 'book-management':
            loadBookManagementPage(mainContent);
            break;
        case 'orders':
            loadOrdersPage(mainContent);
            break;
        case 'customers':
            loadCustomersPage(mainContent);
            break;
        case 'analytics':
            loadAnalyticsPage(mainContent);
            break;
        default:
            loadBookManagementPage(mainContent);
    }
}

function logout() {
    if (apiService.removeToken) {
        apiService.removeToken();
    }
    window.location.href = '/login';
}

window.initializeNavigation = initializeNavigation;
window.navigateTo = navigateTo;
window.loadPageContent = loadPageContent;
window.logout = logout;
