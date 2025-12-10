let orders;
let ordersData = [];
let currentOrdersPage = 1;
const ordersPerPage = 5;

document.addEventListener("DOMContentLoaded", async () => {  // Добавьте async здесь
    if (!apiService.token) {
        showAuthRequiredMessage();
        return;
    }
    try {
        const profile = await apiService.getProfile();
        await loadOrders();
    } catch (error) {
        console.error("Ошибка проверки прав:", error);
        showAccessDeniedMessage();
    }
});

function showAccessDeniedMessage() {
    const container = document.getElementById("orders-container");
    if (!container) return;

    container.innerHTML = `
        <div class="text-center py-12">
            <div class="material-symbols-outlined text-6xl text-red-300 dark:text-red-600 mb-4">block</div>
            <p class="text-red-600 dark:text-red-400 text-lg mb-4">Доступ запрещен. Недостаточно прав для просмотра заказов.</p>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">Токен: ${apiService.token ? 'присутствует' : 'отсутствует'}</p>
            <button onclick="location.reload()" class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90">
                Обновить страницу
            </button>
        </div>
    `;
}

function showAuthRequiredMessage() {
    const container = document.getElementById("orders-container");
    if (!container) return;

    container.innerHTML = `
        <div class="text-center py-12">
            <div class="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">lock</div>
            <p class="text-gray-600 dark:text-gray-400 text-lg mb-4">Для просмотра заказов необходимо авторизоваться</p>
            <div class="flex justify-center gap-4">
                <a href="/login" class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90">
                    Войти
                </a>
                <a href="/register" class="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-200 dark:bg-gray-700 px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600">
                    Зарегистрироваться
                </a>
            </div>
        </div>
    `;
}

async function loadOrders() {
    const container = document.getElementById("orders-container");
    if (!container) {
        console.error("Orders container not found");
        return;
    }

    container.innerHTML = '<div class="text-center py-8"><p class="text-gray-600 dark:text-gray-400">Загрузка заказов...</p></div>';

    try {
    orders = await apiService.getUserOrders();
    } catch (e) {
        console.error("Ошибка загрузки заказов:", e);
        container.innerHTML = `
                   <div class="text-center py-8">
                       <p class="text-red-500 mb-2">Не удалось загрузить заказы.</p>
                       <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">${e.message}</p>
                       <button onclick="loadOrders()" class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
                           Попробовать снова
                       </button>
                       <button onclick="apiService.removeToken(); location.reload()" class="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-500 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600 ml-2">
                           Выйти
                       </button>
                   </div>
               `;
        return;
    }

    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <div class="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">shopping_bag</div>
                <p class="text-gray-600 dark:text-gray-400 text-lg mb-4">У вас пока нет заказов.</p>
                <a href="/" class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90">
                    Начать покупки
                </a>
            </div>
        `;
        return;
    }

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    ordersData = orders;
    renderOrdersPage();
    renderOrdersPagination();
    enableButtons();
}

function createOrderElement(order) {
    const details = document.createElement("details");
    details.className = "flex flex-col rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 group overflow-hidden mb-4";

    const statusClass = getStatusTailwindClass(order.status);
    const statusText = getStatusText(order.status);

    const itemsHtml = order.orderItems && order.orderItems.length > 0
        ? order.orderItems.map(item => createOrderItemHtml(item)).join("")
        : `<tr><td colspan="3" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">Детали заказа недоступны</td></tr>`;

    details.innerHTML = `
        <summary class="flex cursor-pointer items-center justify-between gap-4 p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div class="flex items-center gap-4 flex-wrap">
                <p class="text-gray-900 dark:text-white text-lg font-semibold">Заказ #${order.id}</p>
                <p class="text-gray-500 dark:text-gray-400 text-sm">${formatDate(order.createdAt)}</p>
                <span class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusClass}">
                    <span class="material-symbols-outlined text-sm">${getStatusIcon(order.status)}</span>
                    ${statusText}
                </span>
            </div>
            <div class="flex items-center gap-4">
                <p class="text-gray-900 dark:text-white text-lg font-semibold">$${(order.totalPrice || 0).toFixed(2)}</p>
                <span class="material-symbols-outlined text-gray-600 dark:text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
            </div>
        </summary>
        <div class="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/30">
            ${order.orderItems && order.orderItems.length > 0 ? `
                <div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 mb-6">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th class="px-6 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Товар</th>
                                <th class="px-6 py-3 text-center font-medium text-gray-600 dark:text-gray-300 w-24">Кол-во</th>
                                <th class="px-6 py-3 text-right font-medium text-gray-600 dark:text-gray-300 w-32">Цена</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                            ${itemsHtml}
                        </tbody>
                    </table>
                </div>
                <div class="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    ${order.status === "created" ? `
                        <button class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors pay-btn" data-id="${order.id}">
                            <span class="material-symbols-outlined text-base">payments</span>
                            Оплатить
                        </button>
                    ` : ""}
                    ${order.status === "created" || order.status === "cancelled" ? `
                        <button class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors delete-btn" data-id="${order.id}">
                            <span class="material-symbols-outlined text-base">delete</span>
                            Удалить
                        </button>
                    ` : ""}
                    <button class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors reorder-btn" data-id="${order.id}">
                        <span class="material-symbols-outlined text-base">replay</span>
                        Повторить заказ
                    </button>
                </div>
            ` : `<p class="text-sm text-gray-600 dark:text-gray-400 text-center py-4">Детали этого заказа недоступны.</p>`}
        </div>
    `;

    return details;
}

function createOrderItemHtml(item) {
    if (!item || !item.book) {
        return `<tr><td colspan="3" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">Информация о товаре недоступна</td></tr>`;
    }

    const imageUrl = getBookImageUrl(item.book);
    const bookTitle = item.bookTitle || item.book.title || 'Неизвестная книга';
    const bookAuthor = item.bookAuthor || item.book.author || 'Автор не указан';
    const firstLetter = bookTitle.charAt(0).toUpperCase();
    const bookId = item.book.id;

    return `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                    <img class="h-12 w-9 rounded-md object-cover bg-gray-200 dark:bg-gray-700 ${imageUrl ? '' : 'hidden'}"
                         src="${imageUrl || ''}"
                         alt="${bookTitle}"
                         data-book-id="${bookId}"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                    <div class="h-12 w-9 rounded-md bg-[#522B47] flex items-center justify-center text-white font-bold text-lg ${imageUrl ? 'hidden' : ''}">
                        ${firstLetter}
                    </div>
                    <div>
                        <div class="font-medium text-gray-900 dark:text-white">${bookTitle}</div>
                        <div class="text-gray-500 dark:text-gray-400 text-sm">${bookAuthor}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">${item.quantity || 1}</td>
            <td class="px-6 py-4 text-right text-gray-900 dark:text-white font-medium">$${(item.price || 0).toFixed(2)}</td>
        </tr>
    `;
}

function getBookImageUrl(book) {
    if (!book) return null;

    const url = book.cover || book.imageUrl;

    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        return url;
    }

    return null;
}

function getStatusTailwindClass(status) {
    switch (status) {
        case "created": return "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300";
        case "paid": return "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300";
        case "shipped": return "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300";
        case "completed": return "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300";
        case "cancelled": return "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300";
        default: return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
}

function getStatusText(status) {
    const statusMap = {
        "created": "Создан",
        "paid": "Оплачен",
        "shipped": "Отправлен",
        "completed": "Завершен",
        "cancelled": "Отменен"
    };
    return statusMap[status] || status;
}

function getStatusIcon(status) {
    const iconMap = {
        "created": "pending",
        "paid": "paid",
        "shipped": "local_shipping",
        "completed": "check_circle",
        "cancelled": "cancel"
    };
    return iconMap[status] || "help";
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function enableButtons() {
    document.querySelectorAll(".pay-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const orderId = btn.dataset.id;
            window.location.href = `/payment?orderId=${orderId}`;
        });
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const orderId = btn.dataset.id;
            if (!confirm("Вы уверены, что хотите удалить этот заказ? Это действие нельзя отменить.")) return;

            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> Удаление...';

            try {
                await apiService.deleteOrder(orderId);
                showNotification("Заказ успешно удален!", "success");
                loadOrders();
            } catch (e) {
                console.error("Ошибка при удалении:", e);
                showNotification("Не удалось удалить заказ", "error");
                btn.disabled = false;
                btn.innerHTML = '<span class="material-symbols-outlined">delete</span> Удалить';
            }
        });
    });

    document.querySelectorAll(".reorder-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const orderId = btn.dataset.id;

            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> Добавление...';

            try {
                await apiService.reorder(orderId);
                showNotification("Товары добавлены в корзину!", "success");
                if (typeof updateCartCounter === 'function') {
                    updateCartCounter();
                }
            } catch (e) {
                console.error("Ошибка при повторном заказе:", e);
                showNotification("Не удалось добавить товары в корзину", "error");
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<span class="material-symbols-outlined">replay</span> Повторить заказ';
            }
        });
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        'bg-blue-500'
    }`;
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="material-symbols-outlined">
                ${type === 'success' ? 'check_circle' :
                  type === 'error' ? 'error' : 'info'}
            </span>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}
function renderOrdersPage() {
    const container = document.getElementById("orders-container");
    if (!container) return;
    container.innerHTML = '';
    const start = (currentOrdersPage - 1) * ordersPerPage;
    const pageOrders = ordersData.slice(start, start + ordersPerPage);
    pageOrders.forEach(order => container.appendChild(createOrderElement(order)));
    enhanceOrderImages();
}

function renderOrdersPagination() {
    const pagination = document.getElementById('ordersPagination');
    if (!pagination) return;
    const total = ordersData.length;
    const totalPages = Math.ceil(total / ordersPerPage);
    if (totalPages <= 1) { pagination.innerHTML = ''; return; }

    let html = '<nav aria-label="Pagination" class="flex items-center gap-2">';
    html += `<button class="flex items-center justify-center h-8 w-8 rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" ${currentOrdersPage>1?'onclick="prevOrdersPage()"':''}><span class="material-symbols-outlined text-lg">chevron_left</span></button>`;

    html += `<button class="flex h-8 w-8 items-center justify-center rounded-md border ${currentOrdersPage===1?'border-primary bg-primary/10 text-primary':'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}" onclick="goToOrdersPage(1)">1</button>`;
    if (currentOrdersPage > 3) html += `<span class="px-2 text-slate-600 dark:text-slate-400">...</span>`;
    for (let i = Math.max(2, currentOrdersPage - 1); i <= Math.min(totalPages - 1, currentOrdersPage + 1); i++) {
        if (i !== 1 && i !== totalPages) {
        html += `<button class="flex h-8 w-8 items-center justify-center rounded-md border ${currentOrdersPage===i?'border-primary bg-primary/10 text-primary':'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}" onclick="goToOrdersPage(${i})">${i}</button>`;
        }
    }
    if (currentOrdersPage < totalPages - 2) html += `<span class="px-2 text-slate-600 dark:text-slate-400">...</span>`;
    if (totalPages > 1) {
        html += `<button class="flex h-8 w-8 items-center justify-center rounded-md border ${currentOrdersPage===totalPages?'border-primary bg-primary/10 text-primary':'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}" onclick="goToOrdersPage(${totalPages})">${totalPages}</button>`;
    }
    html += `<button class="flex items-center justify-center h-8 w-8 rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" ${currentOrdersPage<totalPages?'onclick="nextOrdersPage()"':''}><span class="material-symbols-outlined text-lg">chevron_right</span></button>`;
    html += '</nav>';
    pagination.innerHTML = html;
}

function findCoverMedia(mediaList) {
    if (!mediaList || mediaList.length === 0) return null;
    let coverMedia = mediaList.find(media => media.fileType === 'image' || (media.fileType && media.fileType.toLowerCase() === 'image'));
    if (!coverMedia) {
        coverMedia = mediaList.find(media => media.fileUrl && media.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i));
    }
    return coverMedia || mediaList[0];
}

async function enhanceOrderImages() {
    const imgs = document.querySelectorAll('img[data-book-id]');
    const tasks = Array.from(imgs).map(async img => {
        if (img.src) return;
        const bookId = img.getAttribute('data-book-id');
        try {
            const mediaList = await apiService.getBookMedia(bookId);
            const coverMedia = findCoverMedia(mediaList);
            if (coverMedia && coverMedia.fileUrl) {
                img.src = coverMedia.fileUrl;
                img.style.display = 'block';
                const fallback = img.nextElementSibling;
                if (fallback) fallback.style.display = 'none';
            }
        } catch (e) {
        }
    });
    await Promise.allSettled(tasks);
}

function goToOrdersPage(page) {
    const totalPages = Math.ceil(ordersData.length / ordersPerPage);
    if (page>=1 && page<=totalPages) {
        currentOrdersPage = page;
        renderOrdersPage();
        renderOrdersPagination();
    }
}

function prevOrdersPage() { goToOrdersPage(currentOrdersPage-1); }
function nextOrdersPage() { goToOrdersPage(currentOrdersPage+1); }
