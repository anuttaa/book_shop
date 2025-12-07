function loadOrdersPage(container) {
    container.innerHTML = `
        <div class="flex flex-col gap-6 p-8">
            <!-- PageHeading -->
            <header class="flex flex-wrap justify-between items-center gap-4">
                <h1 class="text-text-light dark:text-text-dark text-3xl font-bold leading-tight tracking-tight">Order Management</h1>
                <button class="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em]" onclick="createNewOrder()">
                    <span class="material-symbols-outlined">add</span>
                    <span class="truncate">New Order</span>
                </button>
            </header>

            <!-- Filters -->
            <div class="flex flex-col sm:flex-row gap-4">
                <!-- SearchBar -->
                <div class="flex-grow">
                    <label class="flex flex-col h-12 w-full">
                        <div class="flex w-full flex-1 items-stretch rounded-lg h-full">
                            <div class="text-subtle-light dark:text-subtle-dark flex bg-background-light dark:bg-background-dark items-center justify-center pl-4 rounded-l-lg border border-border-light dark:border-border-dark">
                                <span class="material-symbols-outlined">search</span>
                            </div>
                            <input id="ordersSearchInput" class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-primary border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark h-full placeholder:text-subtle-light dark:placeholder:text-subtle-dark px-4 text-base font-normal leading-normal" placeholder="Search by Order #, Customer Name..." value=""/>
                        </div>
                    </label>
                </div>
            </div>

            <!-- Table Container -->
            <div class="overflow-hidden rounded-lg border border-border-light dark:border-border-dark bg-content-light dark:bg-content-dark">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-background-light dark:bg-background-dark">
                            <tr>
                                <th class="p-4 w-12 text-left">
                                    <input id="selectAllOrders" class="h-5 w-5 rounded border-border-light dark:border-border-dark bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/50" type="checkbox"/>
                                </th>
                                <th class="p-4 text-left font-medium text-text-light dark:text-text-dark whitespace-nowrap">Order #</th>
                                <th class="p-4 text-left font-medium text-text-light dark:text-text-dark whitespace-nowrap">Date</th>
                                <th class="p-4 text-left font-medium text-text-light dark:text-text-dark whitespace-nowrap">Customer</th>
                                <th class="p-4 text-left font-medium text-text-light dark:text-text-dark whitespace-nowrap">Total</th>
                                <th class="p-4 text-left font-medium text-text-light dark:text-text-dark whitespace-nowrap">Status</th>
                                <th class="p-4 text-left font-medium text-text-light dark:text-text-dark whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="ordersTableBody" class="divide-y divide-border-light dark:divide-border-dark">
                            <!-- Orders will be loaded dynamically -->
                        </tbody>
                    </table>
                </div>

                <!-- Loading State -->
                <div id="ordersLoadingState" class="p-8 text-center">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p class="mt-2 text-subtle-light dark:text-subtle-dark">Loading orders...</p>
                </div>

                <!-- Empty State -->
                <div id="ordersEmptyState" class="hidden p-8 text-center">
                    <span class="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4">receipt_long</span>
                    <h3 class="text-lg font-medium text-text-light dark:text-text-dark mb-2">No orders found</h3>
                    <p class="text-subtle-light dark:text-subtle-dark mb-4">No orders match your current filters.</p>
                    <button class="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold" onclick="resetOrderFilters()">
                        <span class="material-symbols-outlined">refresh</span>
                        <span>Reset Filters</span>
                    </button>
                </div>

                <!-- Pagination -->
                <div id="ordersPagination" class="hidden flex items-center justify-between p-4 border-t border-border-light dark:border-border-dark">
                    <p class="text-sm text-subtle-light dark:text-subtle-dark">Showing <span id="ordersShowingRange">1-5</span> of <span id="ordersTotalCount">0</span> results</p>
                    <div class="flex items-center gap-2">
                        <button class="flex items-center justify-center h-8 w-8 rounded-md border border-border-light dark:border-border-dark text-subtle-light dark:text-subtle-dark hover:bg-background-light dark:hover:bg-background-dark" onclick="previousOrdersPage()">
                            <span class="material-symbols-outlined text-lg">chevron_left</span>
                        </button>
                        <div id="ordersPageNumbers" class="flex items-center gap-1">
                            <!-- Page numbers will be generated dynamically -->
                        </div>
                        <button class="flex items-center justify-center h-8 w-8 rounded-md border border-border-light dark:border-border-dark text-subtle-light dark:text-subtle-dark hover:bg-background-light dark:hover:bg-background-dark" onclick="nextOrdersPage()">
                            <span class="material-symbols-outlined text-lg">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    initializeOrdersPage();
}

function initializeOrdersPage() {
    setupOrdersEventListeners();
    loadOrders();
}

function setupOrdersEventListeners() {
    const searchInput = document.getElementById('ordersSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            currentOrderFilters.search = searchInput.value;
            currentOrdersPage = 1;
            filterAndDisplayOrders();
        }, 300));
    }

    const selectAll = document.getElementById('selectAllOrders');
    if (selectAll) {
        selectAll.addEventListener('change', toggleSelectAllOrders);
    }
}

async function loadOrders() {
    try {
        showOrdersLoadingState();
        const orders = await apiService.getOrders();
        allOrders = orders;
        filterAndDisplayOrders();

    } catch (error) {
        console.error('Error loading orders:', error);
        showOrdersError('Failed to load orders');
    }
}

function showOrdersLoadingState() {
    const loadingState = document.getElementById('ordersLoadingState');
    const emptyState = document.getElementById('ordersEmptyState');
    const tableBody = document.getElementById('ordersTableBody');
    const pagination = document.getElementById('ordersPagination');

    if (loadingState) loadingState.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    if (tableBody) tableBody.innerHTML = '';
    if (pagination) pagination.classList.add('hidden');
}

function filterAndDisplayOrders() {
    let filtered = filterOrders(allOrders);
    filteredOrders = filtered;
    displayOrders();
    updateOrdersPagination();
}

function filterOrders(orders) {
    let filtered = [...orders];

    if (currentOrderFilters.search) {
        const searchTerm = currentOrderFilters.search.toLowerCase();
        filtered = filtered.filter(order => {
            const orderNum = `#${order.id}`;
            const customerName = order.user?.username || '';

            return orderNum.toLowerCase().includes(searchTerm) ||
                   customerName.toLowerCase().includes(searchTerm);
        });
    }

    if (currentOrderFilters.status.length > 0) {
        filtered = filtered.filter(order =>
            order.status && currentOrderFilters.status.includes(order.status)
        );
    }

    if (currentOrderFilters.dateFrom) {
        filtered = filtered.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= new Date(currentOrderFilters.dateFrom);
        });
    }

    if (currentOrderFilters.dateTo) {
        filtered = filtered.filter(order => {
            const orderDate = new Date(order.createdAt);
            const toDate = new Date(currentOrderFilters.dateTo);
            toDate.setHours(23, 59, 59, 999);
            return orderDate <= toDate;
        });
    }

    return filtered;
}

function displayOrders() {
    const tableBody = document.getElementById('ordersTableBody');
    const loadingState = document.getElementById('ordersLoadingState');
    const emptyState = document.getElementById('ordersEmptyState');
    const pagination = document.getElementById('ordersPagination');

    if (!tableBody) return;

    if (filteredOrders.length === 0) {
        tableBody.innerHTML = '';
        if (loadingState) loadingState.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
        if (pagination) pagination.classList.add('hidden');
        return;
    }

    const startIndex = (currentOrdersPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const ordersToShow = filteredOrders.slice(startIndex, endIndex);

    tableBody.innerHTML = ordersToShow.map(order => {
        const orderNumber = `#${order.id}`;
        const customerName = order.user?.username || 'Unknown Customer';
        const totalPrice = order.totalPrice || 0;
        const status = order.status || 'pending';
        const createdAt = order.createdAt;

        return `
            <tr class="hover:bg-background-light dark:hover:bg-background-dark transition-colors">
                <td class="p-4 w-12">
                    <input class="order-checkbox h-5 w-5 rounded border-border-light dark:border-border-dark bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/50" type="checkbox" value="${order.id}"/>
                </td>
                <td class="p-4 text-text-light dark:text-text-dark font-medium whitespace-nowrap">${orderNumber}</td>
                <td class="p-4 text-subtle-light dark:text-subtle-dark whitespace-nowrap">${formatOrderDate(createdAt)}</td>
                <td class="p-4 text-subtle-light dark:text-subtle-dark whitespace-nowrap">${customerName}</td>
                <td class="p-4 text-subtle-light dark:text-subtle-dark whitespace-nowrap">$${totalPrice.toFixed(2)}</td>
                <td class="p-4">
                    <div class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${getOrderStatusClass(status)}">
                        <span class="h-2 w-2 rounded-full ${getOrderStatusDotClass(status)}"></span>
                        ${getOrderStatusText(status)}
                    </div>
                </td>
                <td class="p-4 text-subtle-light dark:text-subtle-dark whitespace-nowrap">
                    <div class="flex items-center gap-1">
                        <button class="flex h-8 w-8 items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors" onclick="viewOrder('${order.id}')" title="View Order">
                            <span class="material-symbols-outlined text-xl">visibility</span>
                        </button>
                        <button class="flex h-8 w-8 items-center justify-center rounded-lg text-green-600 hover:bg-green-600/10 transition-colors" onclick="editOrder('${order.id}')" title="Edit Order">
                            <span class="material-symbols-outlined text-xl">edit</span>
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

function getOrderStatusClass(status) {
    const statusClasses = {
        'created': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        'paid': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        'shipped': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
}

function getOrderStatusDotClass(status) {
    const dotClasses = {
        'created': 'bg-blue-500',
        'paid': 'bg-purple-500',
        'shipped': 'bg-orange-500',
        'completed': 'bg-green-500',
        'cancelled': 'bg-red-500'
    };
    return dotClasses[status] || 'bg-gray-500';
}

function getOrderStatusText(status) {
    const statusTexts = {
        'created': 'Created',
        'paid': 'Paid',
        'shipped': 'Shipped',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
    };
    return statusTexts[status] || 'Unknown';
}

function toggleSelectAllOrders() {
    const selectAll = document.getElementById('selectAllOrders');
    const checkboxes = document.querySelectorAll('.order-checkbox');

    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
}

function updateOrdersPagination() {
    const total = filteredOrders.length;
    const totalPages = Math.ceil(total / ordersPerPage);
    const startIndex = (currentOrdersPage - 1) * ordersPerPage + 1;
    const endIndex = Math.min(startIndex + ordersPerPage - 1, total);

    const showingRange = document.getElementById('ordersShowingRange');
    const totalCount = document.getElementById('ordersTotalCount');
    const pageNumbers = document.getElementById('ordersPageNumbers');

    if (showingRange) showingRange.textContent = `${startIndex}-${endIndex}`;
    if (totalCount) totalCount.textContent = total;

    if (pageNumbers) {
        let paginationHTML = '';

        paginationHTML += `
            <button class="flex items-center justify-center h-8 w-8 rounded-md border ${currentOrdersPage === 1 ? 'border-primary bg-primary/20 text-primary' : 'border-border-light dark:border-border-dark text-subtle-light dark:text-subtle-dark hover:bg-background-light dark:hover:bg-background-dark'}"
                    onclick="goToOrdersPage(1)">1</button>
        `;

        if (currentOrdersPage > 3) {
            paginationHTML += `<span class="text-subtle-light dark:text-subtle-dark">...</span>`;
        }

        for (let i = Math.max(2, currentOrdersPage - 1); i <= Math.min(totalPages - 1, currentOrdersPage + 1); i++) {
            if (i !== 1 && i !== totalPages) {
                paginationHTML += `
                    <button class="flex items-center justify-center h-8 w-8 rounded-md border ${currentOrdersPage === i ? 'border-primary bg-primary/20 text-primary' : 'border-border-light dark:border-border-dark text-subtle-light dark:text-subtle-dark hover:bg-background-light dark:hover:bg-background-dark'}"
                            onclick="goToOrdersPage(${i})">${i}</button>
                `;
            }
        }

        if (currentOrdersPage < totalPages - 2) {
            paginationHTML += `<span class="text-subtle-light dark:text-subtle-dark">...</span>`;
        }

        if (totalPages > 1) {
            paginationHTML += `
                <button class="flex items-center justify-center h-8 w-8 rounded-md border ${currentOrdersPage === totalPages ? 'border-primary bg-primary/20 text-primary' : 'border-border-light dark:border-border-dark text-subtle-light dark:text-subtle-dark hover:bg-background-light dark:hover:bg-background-dark'}"
                        onclick="goToOrdersPage(${totalPages})">${totalPages}</button>
            `;
        }

        pageNumbers.innerHTML = paginationHTML;
    }
}

function previousOrdersPage() {
    if (currentOrdersPage > 1) {
        currentOrdersPage--;
        filterAndDisplayOrders();
    }
}

function nextOrdersPage() {
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    if (currentOrdersPage < totalPages) {
        currentOrdersPage++;
        filterAndDisplayOrders();
    }
}

function goToOrdersPage(page) {
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    if (page >= 1 && page <= totalPages) {
        currentOrdersPage = page;
        filterAndDisplayOrders();
    }
}

function formatOrderDate(dateString) {
    if (!dateString) return 'N/A';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        
        return 'Invalid Date';
    }
}

function showOrdersError(message) {
    const tableBody = document.getElementById('ordersTableBody');
    const loadingState = document.getElementById('ordersLoadingState');

    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="p-8 text-center text-destructive">
                    <span class="material-symbols-outlined text-4xl mb-2">error</span>
                    <p>${message}</p>
                    <button onclick="loadOrders()" class="mt-4 px-4 py-2 bg-primary text-primary-content rounded-DEFAULT hover:opacity-90">
                        Try Again
                    </button>
                </td>
            </tr>
        `;
    }
    if (loadingState) loadingState.classList.add('hidden');
}

function createNewOrder() {
    showNotification('Create new order functionality coming soon...', 'info');
}

async function viewOrder(orderId) {
    try {
        const order = allOrders.find(o => o.id === orderId || o.id == orderId);
        if (!order) {
            showNotification('Order not found', 'error');
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'viewOrderModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-content-light dark:bg-content-dark rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div class="flex justify-between items-center p-6 border-b border-border-light dark:border-border-dark">
                    <h3 class="text-lg font-bold text-text-light dark:text-text-dark">Order Details - ${order.orderNumber || `#${order.id}`}</h3>
                    <button onclick="closeViewOrderModal()" class="text-subtle-light dark:text-subtle-dark hover:text-text-light dark:hover:text-text-dark">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div class="p-6 overflow-y-auto max-h-[70vh]">
                    <!-- Order Information -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div class="space-y-4">
                            <div>
                                <h4 class="font-medium text-text-light dark:text-text-dark mb-2">Order Information</h4>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-subtle-light dark:text-subtle-dark">Order Number:</span>
                                        <span class="text-text-light dark:text-text-dark font-medium">${order.orderNumber || `#${order.id}`}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-subtle-light dark:text-subtle-dark">Status:</span>
                                        <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${getOrderStatusClass(order.status)}">
                                            <span class="size-1.5 rounded-full ${getOrderStatusDotClass(order.status)}"></span>
                                            ${getOrderStatusText(order.status)}
                                        </span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-subtle-light dark:text-subtle-dark">Order Date:</span>
                                        <span class="text-text-light dark:text-text-dark">${formatOrderDate(order.createdAt)}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-subtle-light dark:text-subtle-dark">Total Amount:</span>
                                        <span class="text-text-light dark:text-text-dark font-bold">$${(order.totalPrice || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <h4 class="font-medium text-text-light dark:text-text-dark mb-2">Customer Information</h4>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-subtle-light dark:text-subtle-dark">Customer:</span>
                                        <span class="text-text-light dark:text-text-dark">${order.user?.username || 'Unknown Customer'}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-subtle-light dark:text-subtle-dark">Email:</span>
                                        <span class="text-text-light dark:text-text-dark">${order.user?.email || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Order Items -->
                    <div>
                        <h4 class="font-medium text-text-light dark:text-text-dark mb-4">Order Items (${order.orderItems ? order.orderItems.length : 0})</h4>
                        <div class="border border-border-light dark:border-border-dark rounded-lg overflow-hidden">
                            <table class="w-full text-sm">
                                <thead class="bg-background-light dark:bg-background-dark">
                                    <tr>
                                        <th class="p-3 text-left font-medium text-text-light dark:text-text-dark">Book</th>
                                        <th class="p-3 text-left font-medium text-text-light dark:text-text-dark">Quantity</th>
                                        <th class="p-3 text-left font-medium text-text-light dark:text-text-dark">Price</th>
                                        <th class="p-3 text-left font-medium text-text-light dark:text-text-dark">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-border-light dark:divide-border-dark">
                                    ${order.orderItems && order.orderItems.length > 0 ?
                                        order.orderItems.map(item => {
                                            const imageUrl = getBookImageUrl(item.book);
                                            const bookTitle = item.book?.title || 'Unknown Book';
                                            const bookAuthor = item.book?.author || 'Unknown Author';
                                            const firstLetter = bookTitle.charAt(0).toUpperCase();

                                            return `
                                                <tr>
                                                    <td class="p-3">
                                                        <div class="flex items-center gap-3">
                                                            ${imageUrl ? `
                                                                <img class="w-10 h-12 rounded object-cover bg-background-light dark:bg-background-dark"
                                                                     src="${imageUrl}"
                                                                     alt="${bookTitle}"
                                                                     onerror="this.replaceWith(getBookFallbackElement('${firstLetter}'))" />
                                                            ` : getBookFallbackElement(firstLetter)}
                                                            <div>
                                                                <div class="font-medium text-text-light dark:text-text-dark">${bookTitle}</div>
                                                                <div class="text-xs text-subtle-light dark:text-subtle-dark">by ${bookAuthor}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="p-3 text-subtle-light dark:text-subtle-dark">${item.quantity || 1}</td>
                                                    <td class="p-3 text-subtle-light dark:text-subtle-dark">$${(item.price || 0).toFixed(2)}</td>
                                                    <td class="p-3 text-subtle-light dark:text-subtle-dark font-medium">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                                                </tr>
                                            `;
                                        }).join('') :
                                        '<tr><td colspan="4" class="p-4 text-center text-subtle-light dark:text-subtle-dark">No items in this order</td></tr>'
                                    }
                                </tbody>
                                <tfoot class="bg-background-light dark:bg-background-dark">
                                    <tr>
                                        <td colspan="3" class="p-3 text-right font-medium text-text-light dark:text-text-dark">Total:</td>
                                        <td class="p-3 font-bold text-text-light dark:text-text-dark">$${(order.totalPrice || 0).toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-3 p-6 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
                    ${order.status === 'created' ? `
                        <button onclick="payOrder('${order.id}')" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            Mark as Paid
                        </button>
                    ` : ''}
                    <button onclick="closeViewOrderModal()" class="px-4 py-2 border border-border-light dark:border-border-dark text-text-light dark:text-text-dark rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

    } catch (error) {
        console.error('Error viewing order:', error);
        showNotification('Failed to load order details', 'error');
    }
}

function getBookImageUrl(book) {
    if (!book) return null;

    const url = book.cover || book.imageUrl;

    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        return url;
    }

    return null;
}

function getBookFallbackElement(firstLetter) {
    return `
        <div class="w-10 h-12 rounded bg-secondary flex items-center justify-center text-primary font-bold text-sm">
            ${firstLetter}
        </div>
    `;
}

async function payOrder(orderId) {
    try {
        if (!confirm('Mark this order as paid?')) {
            return;
        }

        showNotification('Updating order status...', 'info');
        await apiService.updateOrder(orderId, { status: 'paid' });
        showNotification('Order marked as paid!', 'success');
        closeViewOrderModal();
        await loadOrders();

    } catch (error) {
        console.error('Error paying order:', error);
        showNotification('Failed to update order status: ' + error.message, 'error');
    }
}

function closeViewOrderModal() {
    const modal = document.getElementById('viewOrderModal');
    if (modal) {
        modal.remove();
    }
}

async function editOrder(orderId) {
    try {
        const order = allOrders.find(o => o.id === orderId || o.id == orderId);
        if (!order) {
            showNotification('Order not found', 'error');
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'editOrderModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-content-light dark:bg-content-dark rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div class="flex justify-between items-center p-6 border-b border-border-light dark:border-border-dark">
                    <h3 class="text-lg font-bold text-text-light dark:text-text-dark">Edit Order - #${order.id}</h3>
                    <button onclick="closeEditOrderModal()" class="text-subtle-light dark:text-subtle-dark hover:text-text-light dark:hover:text-text-dark">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div class="p-6 overflow-y-auto max-h-[70vh]">
                    <form id="editOrderForm" class="space-y-4">
                        <input type="hidden" name="orderId" value="${order.id}">

                        <div>
                            <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Order Status</label>
                           <select name="status" class="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary">
                               <option value="created" ${order.status === 'created' ? 'selected' : ''}>Created</option>
                               <option value="paid" ${order.status === 'paid' ? 'selected' : ''}>Paid</option>
                               <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                               <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                               <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                           </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Total Price</label>
                            <input type="number" step="0.01" min="0" name="totalPrice" value="${order.totalPrice || 0}"
                                   class="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Customer Notes</label>
                            <textarea name="notes" rows="3" placeholder="Add any notes about this order..."
                                      class="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary">${order.notes || ''}</textarea>
                        </div>
                    </form>
                </div>

                <div class="flex justify-between items-center p-6 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
                    <button type="button" onclick="deleteOrder('${order.id}')" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Delete Order
                    </button>
                    <div class="flex gap-3">
                        <button type="button" onclick="closeEditOrderModal()" class="px-4 py-2 border border-border-light dark:border-border-dark text-text-light dark:text-text-dark rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors">
                            Cancel
                        </button>
                        <button type="button" onclick="saveOrderChanges('${order.id}')" class="px-4 py-2 bg-primary text-primary-content rounded-lg hover:opacity-90 transition-opacity">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

    } catch (error) {
        console.error('Error editing order:', error);
        showNotification('Failed to load order for editing', 'error');
    }
}

function closeEditOrderModal() {
    const modal = document.getElementById('editOrderModal');
    if (modal) {
        modal.remove();
    }
}

async function saveOrderChanges(orderId) {
    try {
        const form = document.getElementById('editOrderForm');
        const formData = new FormData(form);

        const updatedData = {
            status: formData.get('status'),
            totalPrice: parseFloat(formData.get('totalPrice')),
            notes: formData.get('notes')
        };

        if (!updatedData.status) {
            showNotification('Please select order status', 'error');
            return;
        }

        if (updatedData.totalPrice < 0) {
            showNotification('Total price cannot be negative', 'error');
            return;
        }

        showNotification('Updating order...', 'info');

        await apiService.updateOrder(orderId, updatedData);

        showNotification('Order updated successfully!', 'success');
        closeEditOrderModal();

        await loadOrders();

    } catch (error) {
        console.error('Error saving order changes:', error);
        showNotification('Failed to update order: ' + error.message, 'error');
    }
}

async function deleteOrder(orderId) {
    try {
        if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            return;
        }
        showNotification('Deleting order...', 'info');
        await apiService.deleteOrder(orderId);
        showNotification('Order deleted successfully!', 'success');
        closeEditOrderModal();
        await loadOrders();
    } catch (error) {
        console.error('Error deleting order:', error);
        showNotification('Failed to delete order: ' + error.message, 'error');
    }
}

function resetOrderFilters() {
    currentOrderFilters = {
        search: '',
        status: [],
        dateFrom: '',
        dateTo: ''
    };

    const searchInput = document.getElementById('ordersSearchInput');
    if (searchInput) searchInput.value = '';

    currentOrdersPage = 1;
    filterAndDisplayOrders();
}

window.loadOrdersPage = loadOrdersPage;
window.viewOrder = viewOrder;
window.editOrder = editOrder;
window.deleteOrder = deleteOrder;
window.previousOrdersPage = previousOrdersPage;
window.nextOrdersPage = nextOrdersPage;
window.goToOrdersPage = goToOrdersPage;
window.resetOrderFilters = resetOrderFilters;
window.createNewOrder = createNewOrder;
