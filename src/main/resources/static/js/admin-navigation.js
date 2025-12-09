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
        case 'newsletter':
            loadNewsletterPage(mainContent);
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
function loadNewsletterPage(mainContent) {
    const html = `
      <div class="p-8">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-text-light dark:text-text-dark text-3xl font-bold">Рассылка подписчикам</h1>
          <div></div>
        </div>
        <div class="bg-content-light dark:bg-content-dark rounded-lg shadow-sm p-6 max-w-3xl">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Тема письма</label>
            <input id="newsletterSubject" type="text" class="w-full rounded-DEFAULT border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2" placeholder="Например: Акции декабря" />
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium mb-1">Текст письма</label>
            <textarea id="newsletterContent" rows="8" class="w-full rounded-DEFAULT border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2" placeholder="Текст рассылки"></textarea>
          </div>
          <div class="flex items-center gap-3">
            <button id="sendNewsletterBtn" class="flex items-center gap-2 h-10 px-4 rounded-DEFAULT bg-secondary text-secondary-content text-sm font-bold">
              <span class="material-symbols-outlined">send</span>
              Отправить рассылку
            </button>
            <span id="newsletterStatus" class="text-sm"></span>
          </div>
        </div>
      </div>`;
    mainContent.innerHTML = html;
    const sendBtn = document.getElementById('sendNewsletterBtn');
    if (sendBtn) {
      sendBtn.addEventListener('click', async () => {
        const subject = document.getElementById('newsletterSubject').value.trim();
        const content = document.getElementById('newsletterContent').value.trim();
        const statusEl = document.getElementById('newsletterStatus');
        if (!subject || !content) {
          if (typeof adminNotify === 'function') adminNotify('Заполните тему и текст письма', 'error');
          return;
        }
        try {
          const res = await apiService.sendNewsletter(subject, content);
          if (typeof adminNotify === 'function') adminNotify(`Отправлено: ${res.attempted} (подписчиков: ${res.recipients})`, 'success');
          if (statusEl) statusEl.textContent = `Отправлено: ${res.attempted} / ${res.recipients}`;
        } catch (e) {
          if (typeof adminNotify === 'function') adminNotify('Ошибка отправки рассылки: ' + (e.message || ''), 'error');
          if (statusEl) statusEl.textContent = 'Ошибка отправки';
        }
      });
    }
 }
window.logout = logout;
