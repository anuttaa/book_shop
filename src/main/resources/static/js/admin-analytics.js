let analyticsData = {
    stats: {},
    revenueData: [],
    genreData: [],
    topBooks: []
};

let previousPeriodData = {
    stats: {},
    revenueData: []
};

let currentDateRange = '30days';

function loadAnalyticsPage(container) {
    container.innerHTML = `
        <div class="w-full max-w-7xl mx-auto">
            <!-- PageHeading -->
            <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div class="flex flex-col gap-1">
                    <h1 class="text-text-light dark:text-text-dark text-3xl font-bold tracking-tight">Аналитики продаж и популярности</h1>
                    <p class="text-subtle-light dark:text-subtle-dark text-base font-normal leading-normal">Посмотрите успех продаж и книжные тренды.</p>
                </div>
            </div>

            <!-- Chips/Filters -->
            <div class="flex flex-wrap items-center gap-3 mb-6">
                <div class="relative">
                    <button class="date-range-toggle flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-content-light dark:bg-content-dark border border-border-light dark:border-border-dark px-3 hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                            data-target="dateRangeFilter">
                        <span class="material-symbols-outlined text-subtle-light dark:text-subtle-dark">calendar_today</span>
                        <p class="text-text-light dark:text-text-dark text-sm font-medium leading-normal">Период: Последние 30 дней</p>
                        <span class="material-symbols-outlined text-subtle-light dark:text-subtle-dark">expand_more</span>
                    </button>
                    <p class="text-xs text-subtle-light dark:text-subtle-dark mt-1">Сравнение с предыдущим периодом такой же длины</p>
                    <div id="dateRangeFilter" class="filter-dropdown hidden absolute mt-2 bg-content-light dark:bg-content-dark border border-border-light dark:border-border-dark rounded-lg p-3 shadow-lg w-48 z-10">
                        <div class="space-y-2">
                            <button class="flex w-full items-center px-2 py-1 text-sm text-text-light dark:text-text-dark hover:bg-background-light dark:hover:bg-background-dark rounded transition-colors" onclick="setDateRange('7days')">
                                Последние 7 дней
                            </button>
                            <button class="flex w-full items-center px-2 py-1 text-sm text-text-light dark:text-text-dark hover:bg-background-light dark:hover:bg-background-dark rounded transition-colors" onclick="setDateRange('30days')">
                                Последние 30 дней
                            </button>
                            <button class="flex w-full items-center px-2 py-1 text-sm text-text-light dark:text-text-dark hover:bg-background-light dark:hover:bg-background-dark rounded transition-colors" onclick="setDateRange('90days')">
                                Последние 90 дней
                            </button>
                        </div>
                    </div>
                </div>

                <button class="flex h-9 min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-4 text-white text-sm font-bold leading-normal tracking-wide shadow-sm hover:opacity-90 transition-opacity" onclick="loadAnalyticsData()">
                    <span>Применить фильтры</span>
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
                    <p class="text-text-light dark:text-text-dark text-base font-medium leading-normal">Выручка по времени</p>
                    <div class="flex items-baseline gap-2">
                        <p class="text-text-light dark:text-text-dark text-3xl font-bold leading-tight" id="revenueTotal">$0</p>
                        <p class="text-success text-base font-medium leading-normal" id="revenueChange">+0%</p>
                    </div>
                    <div class="flex min-h-[300px] flex-1 flex-col justify-end" id="revenueChart">
                        <div class="flex items-center justify-center h-full">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    </div>
                </div>

                <!-- Genre Chart -->
                <div class="flex flex-col gap-2 rounded-xl border border-border-light dark:border-border-dark bg-content-light dark:bg-content-dark p-6">
                    <p class="text-text-light dark:text-text-dark text-base font-medium leading-normal">Продажи по жанрам</p>
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
                        <h3 class="text-lg font-semibold text-text-light dark:text-text-dark">Топ продаваемых книг</h3>
                        <p class="text-sm text-subtle-light dark:text-subtle-dark">Детальные данные о продажах за выбранный период.</p>
                    </div>
                    <button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark text-sm font-bold leading-normal tracking-[0.015em] border border-border-light dark:border-border-dark hover:bg-background-light/80 dark:hover:bg-background-dark/80 transition-colors"
                            onclick="exportToCSV()">
                        <span class="material-symbols-outlined text-base">download</span>
                        <span class="truncate">Экспорт в CSV</span>
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left text-subtle-light dark:text-subtle-dark">
                        <thead class="text-xs text-text-light dark:text-text-dark uppercase bg-background-light dark:bg-background-dark">
                            <tr>
                                <th class="px-6 py-3" scope="col">Название книги</th>
                                <th class="px-6 py-3" scope="col">Автор</th>
                                <th class="px-6 py-3" scope="col">Жанр</th>
                                <th class="px-6 py-3" scope="col">Продано единиц</th>
                                <th class="px-6 py-3" scope="col">Общая выручка</th>
                            </tr>
                        </thead>
                        <tbody id="topBooksTable">
                            <!-- Top books will be loaded dynamically -->
                            <tr>
                                <td colspan="5" class="px-6 py-8 text-center">
                                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    <p class="mt-2 text-subtle-light dark:text-subtle-dark">Загрузка топ книг...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="flex items-center justify-between p-4 border-t border-border-light dark:border-border-dark">
                    <span class="text-sm text-subtle-light dark:text-subtle-dark" id="tableInfo">Показано 0 результатов</span>
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
            '7days': 'Последние 7 дней',
            '30days': 'Последние 30 дней',
            '90days': 'Последние 90 дней'
        }[range];
        button.textContent = `Период: ${text}`;
    }
    closeAllAnalyticsFilters();
}

async function loadAnalyticsData() {
    try {
        showAnalyticsLoadingState();

        

        const [orders, books, users] = await Promise.all([
            apiService.getOrders().catch(error => {
                return [];
            }),
            apiService.getBooks().catch(error => {
                throw new Error('Books data is required for analytics');
            }),
            apiService.getUsers().catch(error => {
                return [];
            })
        ]);

        // Загружаем данные за предыдущий период для сравнения
        const previousPeriodOrders = await loadPreviousPeriodOrders(orders);

        processAnalyticsData(orders, books, users);
        processPreviousPeriodData(previousPeriodOrders, books, users);
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

        

        const filteredOrders = filterOrdersByDateRange(validOrders);

        analyticsData.stats = calculateStats(filteredOrders, validBooks, validUsers);

        analyticsData.revenueData = calculateRevenueData(filteredOrders);
        analyticsData.genreData = calculateGenreData(filteredOrders, validBooks);
        analyticsData.topBooks = calculateTopBooks(filteredOrders, validBooks);

        

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

async function loadPreviousPeriodOrders(allOrders) {
    if (!Array.isArray(allOrders)) return [];
    
    const now = new Date();
    const daysBack = currentDateRange === '7days' ? 7 : currentDateRange === '30days' ? 30 : 90;
    
    // Предыдущий период - такой же длины, но раньше
    // Например, если текущий период - последние 30 дней (дни 0-30 назад),
    // то предыдущий период - это дни 31-60 назад
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() - daysBack);
    periodEnd.setHours(23, 59, 59, 999); // Конец дня
    
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() - daysBack);
    periodStart.setHours(0, 0, 0, 0); // Начало дня
    
    const previousOrders = allOrders.filter(order => {
        if (!order || !order.createdAt) return false;
        try {
            const orderDate = new Date(order.createdAt);
            return orderDate >= periodStart && orderDate <= periodEnd && !isNaN(orderDate.getTime());
        } catch (error) {
            return false;
        }
    });
    
    console.log(`Предыдущий период: ${periodStart.toLocaleDateString('ru-RU')} - ${periodEnd.toLocaleDateString('ru-RU')}, найдено заказов: ${previousOrders.length}`);
    
    return previousOrders;
}

function processPreviousPeriodData(orders, books, users) {
    try {
        const validOrders = Array.isArray(orders) ? orders : [];
        
        previousPeriodData.stats = calculateStats(validOrders, books, users);
        previousPeriodData.revenueData = calculateRevenueData(validOrders);
    } catch (error) {
        console.error('Error processing previous period data:', error);
        previousPeriodData = {
            stats: {},
            revenueData: []
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
    const daysBack = currentDateRange === '7days' ? 7 : currentDateRange === '30days' ? 30 : 90;
    periodStart.setDate(periodStart.getDate() - daysBack);

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
        totalOrders: orders.length,
        daysBack: daysBack
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

    if (!orders || orders.length === 0) {
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
                
            } else {
                
            }
        });
    });

    

    const result = Object.entries(genreSales)
        .map(([genre, units]) => ({ genre, units }))
        .sort((a, b) => b.units - a.units);

    

    return result;
}

function calculateTopBooks(orders, books) {

    if (!orders || orders.length === 0) {
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
                
            }
        });
    });

    

    const result = Object.values(bookSales)
        .sort((a, b) => b.units - a.units)
        .slice(0, 10);

    

    return result;
}

function displayAnalyticsData() {
    

    displayStats();
    displayRevenueChart();
    displayGenreChart();
    displayTopBooks();
}

function displayStats() {
    const stats = analyticsData.stats;
    const prevStats = getPreviousPeriodStats();
    const statsContainer = document.getElementById('statsCards');

    if (!statsContainer) return;

    const hasData = stats.totalOrders > 0;

    if (!hasData) {
        statsContainer.innerHTML = `
            <div class="col-span-4 p-8 text-center text-subtle-light">
                <span class="material-symbols-outlined text-4xl mb-2">analytics</span>
                <p class="text-lg mb-2">Нет данных по продажам</p>
                <p class="text-sm">Заказы за выбранный период не найдены или нет доступа к данным.</p>
            </div>
        `;
        return;
    }

    const revenueGrowth = calculateGrowth(stats.totalRevenue, prevStats.totalRevenue, 'revenue');
    const unitsGrowth = calculateGrowth(stats.totalUnits, prevStats.totalUnits, 'units');
    const avgOrderGrowth = calculateGrowth(stats.avgOrderValue, prevStats.avgOrderValue, 'avgOrder');
    const customersGrowth = calculateGrowth(stats.newCustomers, prevStats.newCustomers, 'customers');

    const formatGrowth = (growth) => {
        if (growth === null) {
            return '<span class="text-subtle-light dark:text-subtle-dark text-xs">Нет данных для сравнения</span>';
        }
        const colorClass = growth >= 0 ? 'text-success' : 'text-danger';
        const sign = growth >= 0 ? '+' : '';
        return `<span class="${colorClass} text-sm font-medium leading-normal">${sign}${growth}% к предыдущему периоду</span>`;
    };

    statsContainer.innerHTML = `
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-content-light dark:bg-content-dark border border-border-light dark:border-border-dark">
            <p class="text-subtle-light text-base font-medium leading-normal">Всего выручка</p>
            <p class="text-text-light dark:text-text-dark text-3xl font-bold leading-tight">$${formatNumber(stats.totalRevenue || 0)}</p>
            ${formatGrowth(revenueGrowth)}
        </div>
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-content-light dark:bg-content-dark border border-border-light dark:border-border-dark">
            <p class="text-subtle-light text-base font-medium leading-normal">Продано единиц</p>
            <p class="text-text-light dark:text-text-dark text-3xl font-bold leading-tight">${formatNumber(stats.totalUnits || 0)}</p>
            ${formatGrowth(unitsGrowth)}
        </div>
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-content-light dark:bg-content-dark border border-border-light dark:border-border-dark">
            <p class="text-subtle-light text-base font-medium leading-normal">Средний чек</p>
            <p class="text-text-light dark:text-text-dark text-3xl font-bold leading-tight">$${(stats.avgOrderValue || 0).toFixed(2)}</p>
            ${formatGrowth(avgOrderGrowth)}
        </div>
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-content-light dark:bg-content-dark border border-border-light dark:border-border-dark">
            <p class="text-subtle-light text-base font-medium leading-normal">Новые покупатели</p>
            <p class="text-text-light dark:text-text-dark text-3xl font-bold leading-tight">${stats.newCustomers || 0}</p>
            ${formatGrowth(customersGrowth)}
        </div>
    `;
}

function displayRevenueChart() {
    const revenueData = analyticsData.revenueData;
    const prevRevenueData = previousPeriodData.revenueData || [];
    const totalRevenue = revenueData?.reduce((sum, day) => sum + (day.revenue || 0), 0) || 0;
    const prevTotalRevenue = prevRevenueData?.reduce((sum, day) => sum + (day.revenue || 0), 0) || 0;
    const revenueChange = calculateGrowth(totalRevenue, prevTotalRevenue, 'revenue');

    const revenueTotal = document.getElementById('revenueTotal');
    const revenueChangeElement = document.getElementById('revenueChange');

    if (revenueTotal) revenueTotal.textContent = `$${formatNumber(totalRevenue)}`;
    if (revenueChangeElement) {
        if (revenueChange === null) {
            revenueChangeElement.textContent = 'Нет данных для сравнения';
            revenueChangeElement.className = 'text-base font-medium leading-normal text-subtle-light dark:text-subtle-dark';
        } else {
            revenueChangeElement.textContent = `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`;
            revenueChangeElement.className = `text-base font-medium leading-normal ${revenueChange >= 0 ? 'text-success' : 'text-danger'}`;
        }
    }

    const chartContainer = document.getElementById('revenueChart');
    if (chartContainer) {
        chartContainer.innerHTML = createRevenueSVG(revenueData);
    }
}

function createRevenueSVG(data) {
    if (!data || data.length === 0) {
        return createFallbackChart('Нет данных по выручке за выбранный период');
    }

    const validData = data.filter(d =>
        d &&
        typeof d.revenue === 'number' &&
        !isNaN(d.revenue) &&
        isFinite(d.revenue)
    );

    if (validData.length === 0) {
        return createFallbackChart('Нет валидных данных по выручке');
    }

    try {
        const maxRevenue = Math.max(...validData.map(d => d.revenue));
        const minRevenue = Math.min(...validData.map(d => d.revenue));
        const revenueRange = Math.max(maxRevenue - minRevenue, maxRevenue * 0.1, 1);

        const svgWidth = 600;
        const svgHeight = 250;
        const padding = { top: 30, right: 20, bottom: 40, left: 50 };

        // Создаем более детальный график с осями и метками
        const chartWidth = svgWidth - padding.left - padding.right;
        const chartHeight = svgHeight - padding.top - padding.bottom;

        const linePath = createLinePath(validData, chartWidth, chartHeight, padding, maxRevenue, revenueRange);
        const areaPath = createAreaPath(validData, chartWidth, chartHeight, padding, maxRevenue, revenueRange);
        const gridLines = createGridLines(chartWidth, chartHeight, padding, maxRevenue, revenueRange);
        const axisLabels = createAxisLabels(validData, chartWidth, chartHeight, padding, maxRevenue);

        if (!linePath || linePath.includes('NaN')) {
            return createFallbackChart('Не удалось сгенерировать график выручки');
        }

        return `
            <div class="relative w-full h-full">
                <svg width="100%" height="100%" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" class="overflow-visible">
                    <!-- Сетка -->
                    ${gridLines}
                    
                    <!-- Область под графиком -->
                    <path d="${areaPath}" fill="url(#gradient)" fill-opacity="0.3"/>
                    
                    <!-- Линия графика -->
                    <path d="${linePath}" stroke="#522B47" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    
                    <!-- Точки на графике -->
                    ${validData.map((d, i) => {
                        const x = padding.left + (i / Math.max(validData.length - 1, 1)) * chartWidth;
                        const yValue = revenueRange > 0 ? (d.revenue / maxRevenue) : 0.5;
                        const y = padding.top + chartHeight - yValue * chartHeight;
                        return `<circle cx="${x}" cy="${y}" r="4" fill="#522B47" stroke="white" stroke-width="2"/>`;
                    }).join('')}
                    
                    <!-- Подписи осей -->
                    ${axisLabels}
                    
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="#522B47" stop-opacity="0.4"/>
                            <stop offset="100%" stop-color="#522B47" stop-opacity="0"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        `;
    } catch (error) {
        console.error('Error creating revenue chart:', error);
        return createFallbackChart('Ошибка при создании графика выручки');
    }
}

function createGridLines(chartWidth, chartHeight, padding, maxRevenue, revenueRange) {
    const gridLines = [];
    const numGridLines = 5;
    
    // Горизонтальные линии
    for (let i = 0; i <= numGridLines; i++) {
        const y = padding.top + (chartHeight / numGridLines) * i;
        const value = maxRevenue - (revenueRange / numGridLines) * i;
        gridLines.push(`
            <line x1="${padding.left}" y1="${y}" x2="${padding.left + chartWidth}" y2="${y}" 
                  stroke="#e5e7eb" stroke-width="1" stroke-dasharray="2,2"/>
            <text x="${padding.left - 10}" y="${y + 4}" text-anchor="end" 
                  font-size="10" fill="#6b7280">$${formatNumber(Math.round(value))}</text>
        `);
    }
    
    return gridLines.join('');
}

function createAxisLabels(data, chartWidth, chartHeight, padding, maxRevenue) {
    if (!data || data.length === 0) return '';
    
    const labels = [];
    const numLabels = Math.min(data.length, 7); // Максимум 7 меток
    
    for (let i = 0; i < numLabels; i++) {
        const index = Math.floor((i / (numLabels - 1)) * (data.length - 1));
        const x = padding.left + (index / Math.max(data.length - 1, 1)) * chartWidth;
        const date = new Date(data[index].date);
        const dateStr = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
        
        labels.push(`
            <text x="${x}" y="${padding.top + chartHeight + 20}" text-anchor="middle" 
                  font-size="10" fill="#6b7280">${dateStr}</text>
        `);
    }
    
    return labels.join('');
}

function createFallbackChart(message = 'Chart data not available') {
    return `
        <div class="flex flex-col items-center justify-center h-full text-subtle-light dark:text-subtle-dark">
            <span class="material-symbols-outlined text-4xl mb-2">bar_chart</span>
            <p class="text-sm text-center">${message}</p>
        </div>
    `;
}

function createLinePath(data, chartWidth, chartHeight, padding, maxValue, range) {
    if (!data || data.length === 0) return '';

    const xStep = chartWidth / Math.max(data.length - 1, 1);
    const points = data.map((d, i) => {
        const x = padding.left + i * xStep;
        const yValue = range > 0 ? (d.revenue / maxValue) : 0.5;
        const y = padding.top + chartHeight - yValue * chartHeight;
        return `${x},${y}`;
    }).filter(point => !point.includes('NaN'));

    return points.length > 0 ? `M ${points.join(' L ')}` : '';
}

function createAreaPath(data, chartWidth, chartHeight, padding, maxValue, range) {
    if (!data || data.length === 0) return '';

    const linePath = createLinePath(data, chartWidth, chartHeight, padding, maxValue, range);
    if (!linePath) return '';

    const xStep = chartWidth / Math.max(data.length - 1, 1);
    const lastX = padding.left + (data.length - 1) * xStep;
    const bottomY = padding.top + chartHeight;

    return `${linePath} L ${lastX},${bottomY} L ${padding.left},${bottomY} Z`;
}

function displayGenreChart() {
    const genreData = analyticsData.genreData;
    const totalUnits = genreData.reduce((sum, genre) => sum + (genre.units || 0), 0);

    const chartContainer = document.getElementById('genreChart');
    const legendContainer = document.getElementById('genreLegend');

    if (chartContainer && legendContainer) {
        if (genreData.length === 0 || totalUnits === 0) {
            chartContainer.innerHTML = createFallbackChart('Нет данных по продажам жанров');
            legendContainer.innerHTML = '';
        } else {
            chartContainer.innerHTML = createGenrePieChart(genreData, totalUnits);
            legendContainer.innerHTML = createGenreLegend(genreData, totalUnits);
        }
    }
}

function createGenrePieChart(genreData, totalUnits) {
    if (!genreData || genreData.length === 0 || totalUnits === 0) {
        return '<div class="text-subtle-light dark:text-subtle-dark text-center">Нет данных по жанрам</div>';
    }

    const baseColors = ['#522B47', '#E0DDCF', '#F1F0EA'];
    const colors = Array(16).fill(null).map((_, i) => baseColors[i % baseColors.length]);

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
                <span class="text-sm text-subtle-light dark:text-subtle-dark">Всего продано</span>
            </div>
        </div>
    `;
}

function createGenreLegend(genreData, totalUnits) {
    if (!genreData || genreData.length === 0) return '';

    const colors = ['bg-primary','bg-secondary','bg-background-light'];

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
                        Нет данных о продажах за выбранный период.
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

        tableInfo.textContent = `Показано 1–${Math.min(topBooks.length, 10)} из ${topBooks.length} результатов`;
    }
}

function formatNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return new Intl.NumberFormat().format(Math.round(num));
}

function calculateGrowth(currentValue, previousValue, metricName) {
    // Если нет текущих данных
    if (!currentValue || currentValue === 0) {
        // Если и предыдущих нет - показываем 0
        if (!previousValue || previousValue === 0) {
            return 0;
        }
        // Если были данные, а сейчас нет - это -100%
        return -100;
    }
    
    // Если нет предыдущих данных, но есть текущие
    if (!previousValue || previousValue === 0) {
        // Показываем, что это новый показатель (не показываем бесконечный рост)
        return null; // Вернем null, чтобы показать "Нет данных для сравнения"
    }
    
    const growth = ((currentValue - previousValue) / previousValue) * 100;
    return Math.round(growth * 10) / 10; // Округляем до 1 знака после запятой
}

function getPreviousPeriodStats() {
    if (!previousPeriodData || !previousPeriodData.stats) {
        return {
            totalRevenue: 0,
            totalUnits: 0,
            avgOrderValue: 0,
            newCustomers: 0,
            totalOrders: 0
        };
    }
    return previousPeriodData.stats;
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
                    Попробовать снова
                </button>
            </div>
        `;
    }
}

function exportToCSV() {
    const topBooks = analyticsData.topBooks;
    if (!topBooks || topBooks.length === 0) {
        showNotification('Нет данных для экспорта', 'warning');
        return;
    }

    const headers = ['Название', 'Автор', 'Жанр', 'Продано', 'Выручка'];
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

    showNotification('Данные успешно экспортированы!', 'success');
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
