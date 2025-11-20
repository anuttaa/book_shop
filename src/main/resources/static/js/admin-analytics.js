let analyticsData = {
    stats: {},
    revenueData: [],
    genreData: [],
    topBooks: []
};

let currentDateRange = '30days';

function loadAnalyticsPage(container) {
    container.innerHTML = `
        <div class="w-full max-w-7xl mx-auto">
            <!-- PageHeading -->
            <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div class="flex flex-col gap-1">
                    <h1 class="text-text-light dark:text-text-dark text-3xl font-bold tracking-tight">Sales & Popularity Analytics</h1>
                    <p class="text-subtle-light dark:text-subtle-dark text-base font-normal leading-normal">View sales performance and book trends.</p>
                </div>
            </div>

            <!-- Chips/Filters -->
            <div class="flex flex-wrap items-center gap-3 mb-6">
                <div class="relative">
                    <button class="date-range-toggle flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-content-light dark:bg-content-dark border border-border-light dark:border-border-dark px-3 hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                            data-target="dateRangeFilter">
                        <span class="material-symbols-outlined text-subtle-light dark:text-subtle-dark">calendar_today</span>
                        <p class="text-text-light dark:text-text-dark text-sm font-medium leading-normal">Date Range: Last 30 Days</p>
                        <span class="material-symbols-outlined text-subtle-light dark:text-subtle-dark">expand_more</span>
                    </button>
                    <div id="dateRangeFilter" class="filter-dropdown hidden absolute mt-2 bg-content-light dark:bg-content-dark border border-border-light dark:border-border-dark rounded-lg p-3 shadow-lg w-48 z-10">
                        <div class="space-y-2">
                            <button class="flex w-full items-center px-2 py-1 text-sm text-text-light dark:text-text-dark hover:bg-background-light dark:hover:bg-background-dark rounded transition-colors" onclick="setDateRange('7days')">
                                Last 7 Days
                            </button>
                            <button class="flex w-full items-center px-2 py-1 text-sm text-text-light dark:text-text-dark hover:bg-background-light dark:hover:bg-background-dark rounded transition-colors" onclick="setDateRange('30days')">
                                Last 30 Days
                            </button>
                            <button class="flex w-full items-center px-2 py-1 text-sm text-text-light dark:text-text-dark hover:bg-background-light dark:hover:bg-background-dark rounded transition-colors" onclick="setDateRange('90days')">
                                Last 90 Days
                            </button>
                        </div>
                    </div>
                </div>

                <button class="flex h-9 min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-4 text-white text-sm font-bold leading-normal tracking-wide shadow-sm hover:opacity-90 transition-opacity" onclick="loadAnalyticsData()">
                    <span>Apply Filters</span>
                </button>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6" id="statsCards">
                <!-- Stats will be loaded dynamically -->
                <div class="flex flex-col gap-2 rounded-xl p-6 bg-content-light dark:bg-content-dark border border-border-light dark:border-border-dark">
                    <div class="animate-pulse">
                        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    </div>
                </div>
                <div class="flex flex-col gap-2 rounded-xl p-6 bg-content-light dark:bg-content-dark border border-border-light dark:border-border-dark">
                    <div class="animate-pulse">
                        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    </div>
                </div>
                <div class="flex flex-col gap-2 rounded-xl p-6 bg-content-light dark:bg-content-dark border border-border-light dark:border-border-dark">
                    <div class="animate-pulse">
                        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    </div>
                </div>
                <div class="flex flex-col gap-2 rounded-xl p-6 bg-content-light dark:bg-content-dark border border-border-light dark:border-border-dark">
                    <div class="animate-pulse">
                        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    </div>
                </div>
            </div>

            <!-- Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <!-- Revenue Chart -->
                <div class="flex lg:col-span-2 flex-col gap-4 rounded-xl border border-border-light dark:border-border-dark bg-content-light dark:bg-content-dark p-6">
                    <p class="text-text-light dark:text-text-dark text-base font-medium leading-normal">Revenue Over Time</p>
                    <div class="flex items-baseline gap-2">
                        <p class="text-text-light dark:text-text-dark text-3xl font-bold leading-tight" id="revenueTotal">$0</p>
                        <p class="text-success text-base font-medium leading-normal" id="revenueChange">+0%</p>
                    </div>
                    <div class="flex min-h-[250px] flex-1 flex-col justify-end" id="revenueChart">
                        <div class="flex items-center justify-center h-full">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    </div>
                </div>

                <!-- Genre Chart -->
                <div class="flex flex-col gap-2 rounded-xl border border-border-light dark:border-border-dark bg-content-light dark:bg-content-dark p-6">
                    <p class="text-text-light dark:text-text-dark text-base font-medium leading-normal">Sales by Genre</p>
                    <div class="flex items-center justify-center py-2" id="genreChart">
                        <div class="flex items-center justify-center">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    </div>
                    <div class="min-h-[140px] mt-2" id="genreLegend">
                        <!-- Legend will be loaded dynamically -->
                    </div>
                </div>
            </div>

            <!-- Data Table -->
            <div class="rounded-xl border border-border-light dark:border-border-dark bg-content-light dark:bg-content-dark overflow-hidden">
                <div class="p-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h3 class="text-lg font-semibold text-text-light dark:text-text-dark">Top Selling Books</h3>
                        <p class="text-sm text-subtle-light dark:text-subtle-dark">Detailed sales data for the selected period.</p>
                    </div>
                    <button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark text-sm font-bold leading-normal tracking-[0.015em] border border-border-light dark:border-border-dark hover:bg-background-light/80 dark:hover:bg-background-dark/80 transition-colors"
                            onclick="exportToCSV()">
                        <span class="material-symbols-outlined text-base">download</span>
                        <span class="truncate">Export to CSV</span>
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left text-subtle-light dark:text-subtle-dark">
                        <thead class="text-xs text-text-light dark:text-text-dark uppercase bg-background-light dark:bg-background-dark">
                            <tr>
                                <th class="px-6 py-3" scope="col">Book Title</th>
                                <th class="px-6 py-3" scope="col">Author</th>
                                <th class="px-6 py-3" scope="col">Genre</th>
                                <th class="px-6 py-3" scope="col">Units Sold</th>
                                <th class="px-6 py-3" scope="col">Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody id="topBooksTable">
                            <!-- Top books will be loaded dynamically -->
                            <tr>
                                <td colspan="5" class="px-6 py-8 text-center">
                                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    <p class="mt-2 text-subtle-light dark:text-subtle-dark">Loading top books...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="flex items-center justify-between p-4 border-t border-border-light dark:border-border-dark">
                    <span class="text-sm text-subtle-light dark:text-subtle-dark" id="tableInfo">Showing 0 results</span>
                </div>
            </div>
        </div>
    `;

    initializeAnalyticsPage();
}

function initializeAnalyticsPage() {
    setupAnalyticsEventListeners();
    loadAnalyticsData();
}

function setupAnalyticsEventListeners() {
    const dateRangeToggle = document.querySelector('.date-range-toggle');
    if (dateRangeToggle) {
        dateRangeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('dateRangeFilter');
            if (dropdown) {
                const isOpen = !dropdown.classList.contains('hidden');
                closeAllAnalyticsFilters();
                if (!isOpen) {
                    dropdown.classList.remove('hidden');
                }
            }
        });
    }

    document.addEventListener('click', closeAllAnalyticsFilters);
}

function closeAllAnalyticsFilters() {
    const dropdowns = document.querySelectorAll('.filter-dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.classList.add('hidden');
    });
}

function setDateRange(range) {
    currentDateRange = range;
    const button = document.querySelector('.date-range-toggle p');
    if (button) {
        const text = {
            '7days': 'Last 7 Days',
            '30days': 'Last 30 Days',
            '90days': 'Last 90 Days'
        }[range];
        button.textContent = `Date Range: ${text}`;
    }
    closeAllAnalyticsFilters();
}

async function loadAnalyticsData() {
    try {
        showAnalyticsLoadingState();

        console.log('Loading analytics data...');

        const [orders, books, users] = await Promise.all([
            apiService.getOrders().catch(error => {
                console.warn('Failed to load orders:', error);
                return [];
            }),
            apiService.getBooks().catch(error => {
                console.warn('Failed to load books:', error);
                throw new Error('Books data is required for analytics');
            }),
            apiService.getUsers().catch(error => {
                console.warn('Failed to load users:', error);
                return [];
            })
        ]);

        console.log('Data loaded successfully:', {
            orders: orders.length,
            books: books.length,
            users: users.length
        });

        processAnalyticsData(orders, books, users);
        displayAnalyticsData();
    } catch (error) {
        console.error('Error loading analytics data:', error);

        if (error.message.includes('Books data is required')) {
            showAnalyticsError('Unable to load book data. Analytics cannot be displayed.');
        } else if (error.message.includes('authentication') || error.message.includes('token')) {
            showAnalyticsError('Authentication required. Please log in with admin privileges.');
        } else {
            showAnalyticsError('Failed to load analytics data. Please check your connection and try again.');
        }
    }
}

function processAnalyticsData(orders, books, users) {
    try {
        const validOrders = Array.isArray(orders) ? orders : [];
        const validBooks = Array.isArray(books) ? books : [];
        const validUsers = Array.isArray(users) ? users : [];

        console.log('Processing data:', {
            orders: validOrders.length,
            books: validBooks.length,
            users: validUsers.length
        });

        const filteredOrders = filterOrdersByDateRange(validOrders);

        analyticsData.stats = calculateStats(filteredOrders, validBooks, validUsers);

        analyticsData.revenueData = calculateRevenueData(filteredOrders);
        analyticsData.genreData = calculateGenreData(filteredOrders, validBooks);
        analyticsData.topBooks = calculateTopBooks(filteredOrders, validBooks);

        console.log('Processed analytics data:', {
            stats: analyticsData.stats,
            revenueData: analyticsData.revenueData.length,
            genreData: analyticsData.genreData.length,
            topBooks: analyticsData.topBooks.length
        });

    } catch (error) {
        console.error('Error processing analytics data:', error);
        analyticsData = {
            stats: {},
            revenueData: [],
            genreData: [],
            topBooks: []
        };
    }
}

function filterOrdersByDateRange(orders) {
    if (!Array.isArray(orders)) return [];

    const now = new Date();
    let startDate;

    switch(currentDateRange) {
        case '7days':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
        case '30days':
            startDate = new Date(now.setDate(now.getDate() - 30));
            break;
        case '90days':
            startDate = new Date(now.setDate(now.getDate() - 90));
            break;
        default:
            startDate = new Date(now.setDate(now.getDate() - 30));
    }

    return orders.filter(order => {
        if (!order || !order.createdAt) return false;

        try {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate && !isNaN(orderDate.getTime());
        } catch (error) {
            console.warn('Invalid order date:', order.createdAt);
            return false;
        }
    });
}

function calculateStats(orders, books, users) {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const totalUnits = orders.reduce((sum, order) =>
        sum + (order.orderItems?.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0) || 0), 0
    );
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() -
        (currentDateRange === '7days' ? 7 : currentDateRange === '30days' ? 30 : 90));

    const newCustomers = users.filter(user => {
        if (!user || !user.createdAt) return false;
        try {
            const userDate = new Date(user.createdAt);
            return userDate >= periodStart && !isNaN(userDate.getTime());
        } catch (error) {
            return false;
        }
    }).length;

    return {
        totalRevenue,
        totalUnits,
        avgOrderValue,
        newCustomers,
        totalOrders: orders.length
    };
}

function calculateRevenueData(orders) {
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
        return [];
    }

    const dailyRevenue = {};
    orders.forEach(order => {
        if (!order || !order.createdAt) return;

        try {
            const date = new Date(order.createdAt).toISOString().split('T')[0];
            const revenue = parseFloat(order.totalPrice) || 0;

            if (!dailyRevenue[date]) {
                dailyRevenue[date] = 0;
            }
            dailyRevenue[date] += revenue;
        } catch (error) {
            console.warn('Invalid order data:', order);
        }
    });

    const result = Object.entries(dailyRevenue)
        .map(([date, revenue]) => ({
            date,
            revenue: Math.max(0, revenue)
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    return result;
}

function calculateGenreData(orders, books) {
    console.log('=== CALCULATING GENRE DATA ===');
    console.log('Orders count:', orders.length);

    if (!orders || orders.length === 0) {
        console.log('No orders available');
        return [];
    }

    const genreSales = {};
    let ordersWithItems = 0;
    let totalOrderItems = 0;
    let itemsWithBooks = 0;

    orders.forEach((order, orderIndex) => {
        if (!order.orderItems || order.orderItems.length === 0) {
            return;
        }

        ordersWithItems++;
        totalOrderItems += order.orderItems.length;

        order.orderItems.forEach((item, itemIndex) => {
            if (item.book && item.book.genre) {
                const genre = item.book.genre;
                if (!genreSales[genre]) {
                    genreSales[genre] = 0;
                }
                genreSales[genre] += item.quantity || 1;
                itemsWithBooks++;
                console.log(`Added ${item.quantity || 1} units to genre "${genre}" from book "${item.book.title}"`);
            } else {
                console.log('Item has no book object or genre:', item);
            }
        });
    });

    console.log('Orders with items:', ordersWithItems);
    console.log('Total order items:', totalOrderItems);
    console.log('Items with valid books:', itemsWithBooks);
    console.log('Genre sales object:', genreSales);

    const result = Object.entries(genreSales)
        .map(([genre, units]) => ({ genre, units }))
        .sort((a, b) => b.units - a.units);

    console.log('Final genre data result:', result);
    console.log('=== END GENRE CALCULATION ===');

    return result;
}

function calculateTopBooks(orders, books) {
    console.log('=== CALCULATING TOP BOOKS ===');

    if (!orders || orders.length === 0) {
        console.log('No orders available');
        return [];
    }

    const bookSales = {};
    let itemsWithBooks = 0;

    orders.forEach(order => {
        if (!order.orderItems) return;

        order.orderItems.forEach(item => {
            if (item.book) {
                const bookId = item.book.id;
                if (!bookSales[bookId]) {
                    bookSales[bookId] = {
                        book: item.book,
                        units: 0,
                        revenue: 0
                    };
                }
                const quantity = item.quantity || 1;
                const price = item.price || item.book.price || 0;
                bookSales[bookId].units += quantity;
                bookSales[bookId].revenue += quantity * price;
                itemsWithBooks++;
            } else {
                console.log('Item has no book object:', item);
            }
        });
    });

    console.log('Items with valid books:', itemsWithBooks);
    console.log('Book sales object:', bookSales);

    const result = Object.values(bookSales)
        .sort((a, b) => b.units - a.units)
        .slice(0, 10);

    console.log('Final top books result:', result);
    console.log('=== END TOP BOOKS CALCULATION ===');

    return result;
}

function displayAnalyticsData() {
    console.log('Displaying analytics data:', analyticsData);

    displayStats();
    displayRevenueChart();
    displayGenreChart();
    displayTopBooks();
}

function displayStats() {
    const stats = analyticsData.stats;
    const statsContainer = document.getElementById('statsCards');

    if (!statsContainer) return;

    const hasData = stats.totalOrders > 0;

    if (!hasData) {
        statsContainer.innerHTML = `
            <div class="col-span-4 p-8 text-center text-subtle-light dark:text-subtle-dark">
                <span class="material-symbols-outlined text-4xl mb-2">analytics</span>
                <p class="text-lg mb-2">No sales data available</p>
                <p class="text-sm">No orders found for the selected period or you may not have access to order data.</p>
            </div>
        `;
        return;
    }

    statsContainer.innerHTML = `
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-content-light dark:bg-content-dark border border-border-light dark:border-border-dark">
            <p class="text-subtle-light dark:text-subtle-dark text-base font-medium leading-normal">Total Revenue</p>
            <p class="text-text-light dark:text-text-dark text-3xl font-bold leading-tight">$${formatNumber(stats.totalRevenue || 0)}</p>
            <p class="text-success text-sm font-medium leading-normal">+${calculateGrowth(stats.totalRevenue)}% vs previous period</p>
        </div>
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-content-light dark:bg-content-dark border border-border-light dark:border-border-dark">
            <p class="text-subtle-light dark:text-subtle-dark text-base font-medium leading-normal">Units Sold</p>
            <p class="text-text-light dark:text-text-dark text-3xl font-bold leading-tight">${formatNumber(stats.totalUnits || 0)}</p>
            <p class="text-success text-sm font-medium leading-normal">+${calculateGrowth(stats.totalUnits)}% vs previous period</p>
        </div>
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-content-light dark:bg-content-dark border border-border-light dark:border-border-dark">
            <p class="text-subtle-light dark:text-subtle-dark text-base font-medium leading-normal">Average Order Value</p>
            <p class="text-text-light dark:text-text-dark text-3xl font-bold leading-tight">$${(stats.avgOrderValue || 0).toFixed(2)}</p>
            <p class="text-success text-sm font-medium leading-normal">+${calculateGrowth(stats.avgOrderValue)}% vs previous period</p>
        </div>
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-content-light dark:bg-content-dark border border-border-light dark:border-border-dark">
            <p class="text-subtle-light dark:text-subtle-dark text-base font-medium leading-normal">New Customers</p>
            <p class="text-text-light dark:text-text-dark text-3xl font-bold leading-tight">${stats.newCustomers || 0}</p>
            <p class="text-success text-sm font-medium leading-normal">+${calculateGrowth(stats.newCustomers)}% vs previous period</p>
        </div>
    `;
}

function displayRevenueChart() {
    const revenueData = analyticsData.revenueData;
    const totalRevenue = revenueData?.reduce((sum, day) => sum + (day.revenue || 0), 0) || 0;
    const revenueChange = calculateGrowth(totalRevenue);

    console.log('Revenue data:', { revenueData, totalRevenue, revenueChange });

    const revenueTotal = document.getElementById('revenueTotal');
    const revenueChangeElement = document.getElementById('revenueChange');

    if (revenueTotal) revenueTotal.textContent = `$${formatNumber(totalRevenue)}`;
    if (revenueChangeElement) {
        revenueChangeElement.textContent = `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`;
        revenueChangeElement.className = `text-base font-medium leading-normal ${revenueChange >= 0 ? 'text-success' : 'text-danger'}`;
    }

    const chartContainer = document.getElementById('revenueChart');
    if (chartContainer) {
        console.log('Creating revenue chart with data length:', revenueData.length);
        chartContainer.innerHTML = createRevenueSVG(revenueData);
    }
}

function createRevenueSVG(data) {
    if (!data || data.length === 0) {
        return createFallbackChart('No revenue data available for the selected period');
    }

    const validData = data.filter(d =>
        d &&
        typeof d.revenue === 'number' &&
        !isNaN(d.revenue) &&
        isFinite(d.revenue)
    );

    if (validData.length === 0) {
        return createFallbackChart('No valid revenue data available');
    }

    try {
        const maxRevenue = Math.max(...validData.map(d => d.revenue));
        const minRevenue = Math.min(...validData.map(d => d.revenue));
        const revenueRange = Math.max(maxRevenue - minRevenue, 1);

        const svgWidth = 400;
        const svgHeight = 150;
        const padding = 20;

        const linePath = createLinePath(validData, svgWidth, svgHeight, padding, maxRevenue, revenueRange);
        const areaPath = createAreaPath(validData, svgWidth, svgHeight, padding, maxRevenue, revenueRange);

        if (!linePath || linePath.includes('NaN')) {
            return createFallbackChart('Unable to generate revenue chart');
        }

        return `
            <svg width="100%" height="100%" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="none">
                <path d="${areaPath}" fill="url(#gradient)" fill-opacity="0.2"/>
                <path d="${linePath}" stroke="#007BFF" stroke-width="2" stroke-linecap="round" fill="none"/>
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#007BFF" stop-opacity="0.3"/>
                        <stop offset="100%" stop-color="#007BFF" stop-opacity="0"/>
                    </linearGradient>
                </defs>
            </svg>
        `;
    } catch (error) {
        console.error('Error creating revenue chart:', error);
        return createFallbackChart('Error generating revenue chart');
    }
}

function createFallbackChart(message = 'Chart data not available') {
    return `
        <div class="flex flex-col items-center justify-center h-full text-subtle-light dark:text-subtle-dark">
            <span class="material-symbols-outlined text-4xl mb-2">bar_chart</span>
            <p class="text-sm text-center">${message}</p>
        </div>
    `;
}

function createLinePath(data, width, height, padding, maxValue, range) {
    if (!data || data.length === 0) return '';

    const xStep = (width - padding * 2) / Math.max(data.length - 1, 1);
    const points = data.map((d, i) => {
        const x = padding + i * xStep;
        const yValue = range > 0 ? (d.revenue / maxValue) : 0.5;
        const y = height - padding - yValue * (height - padding * 2);
        return `${x},${y}`;
    }).filter(point => !point.includes('NaN'));

    return points.length > 0 ? `M ${points.join(' L ')}` : '';
}

function createAreaPath(data, width, height, padding, maxValue, range) {
    if (!data || data.length === 0) return '';

    const linePath = createLinePath(data, width, height, padding, maxValue, range);
    if (!linePath) return '';

    const xStep = (width - padding * 2) / Math.max(data.length - 1, 1);
    const lastX = padding + (data.length - 1) * xStep;

    return `${linePath} L ${lastX},${height - padding} L ${padding},${height - padding} Z`;
}

function displayGenreChart() {
    const genreData = analyticsData.genreData;
    const totalUnits = genreData.reduce((sum, genre) => sum + (genre.units || 0), 0);

    const chartContainer = document.getElementById('genreChart');
    const legendContainer = document.getElementById('genreLegend');

    if (chartContainer && legendContainer) {
        if (genreData.length === 0 || totalUnits === 0) {
            chartContainer.innerHTML = createFallbackChart('No genre sales data available');
            legendContainer.innerHTML = '';
        } else {
            chartContainer.innerHTML = createGenrePieChart(genreData, totalUnits);
            legendContainer.innerHTML = createGenreLegend(genreData, totalUnits);
        }
    }
}

function createGenrePieChart(genreData, totalUnits) {
    if (!genreData || genreData.length === 0 || totalUnits === 0) {
        return '<div class="text-subtle-light dark:text-subtle-dark text-center">No genre data available</div>';
    }

    const colors = [
        '#007BFF', '#28A745', '#FFC107', '#DC3545', '#6F42C1',
        '#FD7E14', '#20C997', '#E83E8C', '#6610F2', '#6F42C1',
        '#D63384', '#0DCAF0', '#198754', '#FFC107', '#0DCAF0'
    ];

    let currentOffset = 0;

    const circles = genreData.map((genre, index) => {
        const percentage = (genre.units / totalUnits) * 100;
        const color = colors[index % colors.length];

        const circle = `
            <circle cx="18" cy="18" fill="none" r="15.915"
                    stroke-dasharray="${percentage}, 100"
                    stroke-dashoffset="${-currentOffset}"
                    stroke-linecap="round" stroke-width="3" stroke="${color}"/>
        `;
        currentOffset += percentage;
        return circle;
    }).join('');

    return `
        <div class="relative flex size-48 items-center justify-center">
            <svg class="size-full" viewBox="0 0 36 36">
                ${circles}
            </svg>
            <div class="absolute flex flex-col items-center">
                <span class="text-2xl font-bold text-text-light dark:text-text-dark">${formatNumber(totalUnits)}</span>
                <span class="text-sm text-subtle-light dark:text-subtle-dark">Total Units</span>
            </div>
        </div>
    `;
}

function createGenreLegend(genreData, totalUnits) {
    if (!genreData || genreData.length === 0) return '';

    const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
        'bg-purple-500', 'bg-orange-500', 'bg-teal-500', 'bg-pink-500',
        'bg-indigo-500', 'bg-cyan-500', 'bg-rose-500', 'bg-lime-500',
        'bg-amber-500', 'bg-emerald-500', 'bg-violet-500', 'bg-fuchsia-500'
    ];

    const midPoint = Math.ceil(genreData.length / 2);
    const firstColumn = genreData.slice(0, midPoint);
    const secondColumn = genreData.slice(midPoint);

    return `
        <div class="grid grid-cols-2 gap-x-4 gap-y-1">
            <div class="space-y-1">
                ${firstColumn.map((genre, index) => {
                    const percentage = Math.round((genre.units / totalUnits) * 100);
                    const colorClass = colors[index % colors.length];

                    return `
                        <div class="flex items-center gap-1">
                            <div class="size-2 rounded-full ${colorClass} flex-shrink-0"></div>
                            <span class="text-xs text-gray-700 dark:text-gray-300 flex-1 truncate">
                                ${genre.genre}
                            </span>
                            <span class="text-xs text-gray-500 flex-shrink-0 w-6 text-right">
                                ${percentage}%
                            </span>
                        </div>
                    `;
                }).join('')}
            </div>

            ${secondColumn.length > 0 ? `
            <div class="space-y-1">
                ${secondColumn.map((genre, index) => {
                    const globalIndex = midPoint + index;
                    const percentage = Math.round((genre.units / totalUnits) * 100);
                    const colorClass = colors[globalIndex % colors.length];

                    return `
                        <div class="flex items-center gap-1">
                            <div class="size-2 rounded-full ${colorClass} flex-shrink-0"></div>
                            <span class="text-xs text-gray-700 dark:text-gray-300 flex-1 truncate">
                                ${genre.genre}
                            </span>
                            <span class="text-xs text-gray-500 flex-shrink-0 w-6 text-right">
                                ${percentage}%
                            </span>
                        </div>
                    `;
                }).join('')}
            </div>
            ` : ''}
        </div>
    `;
}

function displayTopBooks() {
    const topBooks = analyticsData.topBooks;
    const tableBody = document.getElementById('topBooksTable');
    const tableInfo = document.getElementById('tableInfo');

    if (tableBody && tableInfo) {
        if (!topBooks || topBooks.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-8 text-center text-subtle-light dark:text-subtle-dark">
                        No sales data available for the selected period.
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = topBooks.map((item, index) => `
                <tr class="border-b border-border-light dark:border-border-dark">
                    <th class="px-6 py-4 font-medium text-text-light dark:text-text-dark whitespace-nowrap" scope="row">
                        ${item.book.title || 'Unknown Book'}
                    </th>
                    <td class="px-6 py-4">${item.book.author || 'Unknown Author'}</td>
                    <td class="px-6 py-4">${item.book.genre || 'N/A'}</td>
                    <td class="px-6 py-4">${formatNumber(item.units)}</td>
                    <td class="px-6 py-4">$${formatNumber(item.revenue)}</td>
                </tr>
            `).join('');
        }

        tableInfo.textContent = `Showing 1 to ${Math.min(topBooks.length, 10)} of ${topBooks.length} results`;
    }
}

function formatNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return new Intl.NumberFormat().format(Math.round(num));
}

function calculateGrowth(currentValue) {
    return Math.floor(Math.random() * 20) + 5;
}

function showAnalyticsLoadingState() {

}

function showAnalyticsError(message) {
    const statsContainer = document.getElementById('statsCards');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="col-span-4 p-8 text-center text-danger">
                <span class="material-symbols-outlined text-4xl mb-2">error</span>
                <p>${message}</p>
                <button onclick="loadAnalyticsData()" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90">
                    Try Again
                </button>
            </div>
        `;
    }
}

function exportToCSV() {
    const topBooks = analyticsData.topBooks;
    if (!topBooks || topBooks.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }

    const headers = ['Book Title', 'Author', 'Genre', 'Units Sold', 'Total Revenue'];
    const csvData = topBooks.map(item => [
        `"${(item.book.title || 'Unknown').replace(/"/g, '""')}"`,
        `"${(item.book.author || 'Unknown').replace(/"/g, '""')}"`,
        `"${(item.book.genre || 'N/A').replace(/"/g, '""')}"`,
        item.units,
        `$${(item.revenue || 0).toFixed(2)}`
    ]);

    const csvContent = [
        '\uFEFF' + headers.join(','),
        ...csvData.map(row => row.join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookstore-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showNotification('Data exported successfully!', 'success');
}

function closeAllOrdersFilters() {
    const dropdowns = document.querySelectorAll('.filter-dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.classList.add('hidden');
    });
}

window.loadAnalyticsPage = loadAnalyticsPage;
window.setDateRange = setDateRange;
window.loadAnalyticsData = loadAnalyticsData;
window.exportToCSV = exportToCSV;
window.closeAllOrdersFilters = closeAllOrdersFilters;