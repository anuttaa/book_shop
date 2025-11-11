document.addEventListener('DOMContentLoaded', function() {
    // Обновить UI в зависимости от статуса авторизации
    updateAuthUI();

    // Настроить навигацию
    setupNavigation();

    // Загрузить книги из базы данных
    loadBooksFromDB();

    // Обновить счетчик корзины если пользователь авторизован
    if (apiService.token) {
        updateCartCounter();
    }
});

// Обновить UI авторизации
function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userActions = document.getElementById('user-actions');

    if (!authButtons) return;

    if (apiService.token) {
        // Пользователь авторизован - показать действия пользователя
        authButtons.style.display = 'none';
        if (userActions) {
            userActions.style.display = 'flex';
        }
    } else {
        // Пользователь не авторизован - показать кнопки входа/регистрации
        authButtons.style.display = 'flex';
        if (userActions) {
            userActions.style.display = 'none';
        }

        // Показать сообщение для неавторизованных пользователей
        showGuestMessage();
    }
}

// Показать сообщение для гостей
function showGuestMessage() {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    // Добавить сообщение если его нет
    if (!document.getElementById('guest-message')) {
        const guestMessage = document.createElement('div');
        guestMessage.id = 'guest-message';
        guestMessage.className = 'text-center py-12';
        guestMessage.innerHTML = `
            <h2 class="text-2xl font-bold text-primary-text dark:text-white mb-4">
                Welcome to BookStore
            </h2>
            <p class="text-secondary-text dark:text-gray-400 mb-6">
                Please login or register to browse our book collection
            </p>
            <div class="flex justify-center gap-4">
                <a href="/pages/login.html" class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em]">
                    <span class="truncate">Login</span>
                </a>
                <a href="/pages/register.html" class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-100 dark:bg-gray-800 text-primary-text dark:text-white text-sm font-bold leading-normal tracking-[0.015em]">
                    <span class="truncate">Register</span>
                </a>
            </div>
        `;
        mainContent.insertBefore(guestMessage, mainContent.firstChild);
    }
}

// Настроить навигацию
function setupNavigation() {
    // Обновить ссылки в хедере
    document.querySelectorAll('header a[href="#"]').forEach(link => {
        if (link.textContent === 'Register') {
            link.href = '/pages/register.html';
        } else if (link.textContent === 'Login') {
            link.href = '/pages/login.html';
        } else if (link.textContent === 'Home') {
            link.href = '/';
        }
    });
}

// Выход
function logout() {
    apiService.removeToken();
    updateAuthUI();
    showNotification('Logged out successfully', 'success');
    window.location.reload();
}

// Загрузить книги из базы данных
async function loadBooksFromDB() {
    try {
        // Получаем все книги из базы данных
        const allBooks = await apiService.getBooks();
        console.log('Books loaded from DB:', allBooks);

        if (allBooks && allBooks.length > 0) {
            // Разделяем книги на рекомендованные и популярные
            const recommended = allBooks.slice(0, 5); // Первые 5 как рекомендованные
            const popular = allBooks.slice(5, 10); // Следующие 5 как популярные

            console.log('Recommended books:', recommended);
            console.log('Popular books:', popular);

            displayBooks('recommended-books', recommended);
            displayBooks('popular-books', popular);

            // Скрыть демо-книги если они есть
            hideDemoBooks();
        } else {
            // Если книг нет в базе, показываем демо-книги
            console.log('No books in DB, showing demo books');
            showDemoBooks();
        }
    } catch (error) {
        console.error('Error loading books from DB:', error);
        showNotification('Failed to load books from database', 'error');
        // Показать демо-книги в случае ошибки
        showDemoBooks();
    }
}

// Скрыть демо-книги
function hideDemoBooks() {
    // Находим и удаляем статичные демо-книги
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const heading = section.querySelector('h2');
        if (heading && (heading.textContent.includes('Recommended') || heading.textContent.includes('Popular'))) {
            const existingGrid = section.querySelector('.grid');
            if (existingGrid && !existingGrid.id) {
                existingGrid.innerHTML = ''; // Очищаем демо-книги
            }
        }
    });
}

// Показать демо-книги (запасной вариант)
function showDemoBooks() {
    const demoBooks = [
        {
            id: 1,
            title: "The Midnight Library",
            author: "Matt Haig",
            price: 15.99,
            rating: 4.5,
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-w23gKHZ7L-g68tShIWLOodXHQ2bXWx7GqQRKOsZumdQJV-AcXJScvr_tcJf7VrA04iSBrFsJ0pkWe2SZrWT6_9M5RUGaGjTJDcJyD3i66bK4oM6RDSsa5WTHhijfOXpXr-lpoiVWZQ6b9g-fKASQzeEF8Awg_eambMHDst_8BUJzlaUVMK9FE-7OLlDQS6VQl0IqFyGiX9ai5xCNBjsCm0NJYs3ujZGtNyssmUCyY7pHuYzFFMh1_MJi5GnCivP33Lm-j67znpU"
        },
        {
            id: 2,
            title: "Project Hail Mary",
            author: "Andy Weir",
            price: 18.50,
            rating: 4.9,
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDakzEzV9f4cf7X3NsNhckFbnRh_79tgXQyHWLsnQjTH42l1GmnHmP8A9hdigwZ8IoP-V81M36n31IgYIc1K4P4SUsWOGLI-WCIpH933dBzlw2hiHPSawucbbOPt_DaK7eKqahwCQX-Ve_8Q67z5JXGtI-M47mIhV6UjF8PmUe5dsENOWGy8CTvRMfNnZBuc9c6EeqEADYALHnfK-WbXaZKYwZVzlGbznkuHqkLpg2sGYPyHA-oCM9bSP__akhYop5XD6Aj24Gt50M"
        },
        {
            id: 3,
            title: "Dune",
            author: "Frank Herbert",
            price: 10.99,
            rating: 4.7,
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoO5oKgzFC6TJgLiD8QJerdUvQ9B6TsIGE2vsukf8VBbc_i1_LT5JbK-9JX97KhzgxHSfetVuXFG1CUWgnROD1bapmtta5wePGDXpZdVe2-jUBX68n67AQf6pw1kWJTbrFOgrByjiXLCr0sgCHSMltNYa9szEgOYsMG1V7-4HbfN48npQz8OvluU4oUJf05c5oxWBeGTKWFUtwDGYRfpvSSmMp89z4zUdpDBuNh7lxRX89ISS2cO3TbjfboJothNgIxK5GcxkMlsk"
        },
        {
            id: 4,
            title: "The Vanishing Half",
            author: "Brit Bennett",
            price: 16.20,
            rating: 4.4,
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMv46CuSmDfoUVlCRNFJe9W1z8pKQovW_Uxp-1I0ixuIRuab3KB0I5BXdLnDuFVN_QWBrjTwaUWMUD8cNEdN2HA6Fx8ttWr4sirjwPbS-994MUq1WQy-RwYIK5gRM5qUtgRe2qv-DHRVSgdozjHvtcCdl9XWgaxKct5jqAfCl7dLQcwcGlxaizmIBVP-WILcBNzy0jrZlcgze2ZRbTvRbtD_D72a3Owq1y757i23d6yYHdy_OFcVDPGHhJ1iewupH44z6ZTSwP-B8"
        }
    ];

    displayBooks('recommended-books', demoBooks.slice(0, 2));
    displayBooks('popular-books', demoBooks.slice(2, 4));
}

// Отобразить книги
function displayBooks(containerId, books) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }

    if (!books || books.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center py-8 text-secondary-text dark:text-gray-400">No books found</p>';
        return;
    }

    container.innerHTML = books.map(book => `
        <div class="group relative flex h-full flex-col rounded-lg bg-white dark:bg-gray-800 shadow-[0_0_4px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden transition-shadow hover:shadow-lg cursor-pointer" onclick="openBookPage(${book.id})">
            <div class="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover bg-gray-200"
                 style="background-image: url('${getBookCover(book)}')"
                 data-alt="Book cover for ${book.title}">
            </div>
            <div class="absolute inset-0 bg-black/50 group-hover:flex hidden flex-col justify-end p-4">
                <button onclick="event.stopPropagation(); addToCart(${book.id})" class="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] mb-2 hover:bg-primary/90 transition-colors">
                    <span class="truncate">Add to Cart</span>
                </button>
                <button onclick="event.stopPropagation(); toggleWishlist(${book.id})" class="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white/20 backdrop-blur-sm text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-white/30 transition-colors">
                    <span class="truncate" id="wishlist-text-${book.id}">Add to Wishlist</span>
                </button>
            </div>
            <div class="flex flex-col flex-1 justify-between p-4">
                <div>
                    <p class="text-primary-text dark:text-white text-base font-medium leading-normal truncate">${book.title}</p>
                    <p class="text-secondary-text dark:text-gray-400 text-sm font-normal leading-normal truncate">${book.author}</p>
                </div>
                <div class="flex items-center mt-2 text-sm text-secondary-text dark:text-gray-400">
                    <span class="material-symbols-outlined text-yellow-500 !text-base">star</span>
                    <span class="ml-1">${book.rating || '4.0'}</span>
                </div>
                <p class="text-primary-text dark:text-white text-lg font-bold mt-2">$${book.price || '0.00'}</p>
            </div>
        </div>
    `).join('');

    // Проверить вишлист для каждой книги (только для авторизованных пользователей)
    if (apiService.token) {
        books.forEach(book => {
            checkWishlistStatus(book.id);
        });
    }
}

// Получить обложку книги (из media или использовать дефолтную)
function getBookCover(book) {
    // Если у книги есть imageUrl, используем его
    if (book.imageUrl) {
        return book.imageUrl;
    }

    // Если есть связь с media, можно добавить логику для получения обложки
    // Пока используем дефолтную обложку
    return '/images/default-book.jpg';
}

// Открыть страницу книги
function openBookPage(bookId) {
    window.location.href = `/pages/book.html?id=${bookId}`;
}

// Добавить в корзину
async function addToCart(bookId) {
    if (!apiService.token) {
        showNotification('Please login to add items to cart', 'error');
        return;
    }

    try {
        await apiService.addToCart(bookId);
        showNotification('Book added to cart!', 'success');
        updateCartCounter();
    } catch (error) {
        showNotification('Failed to add book to cart: ' + error.message, 'error');
    }
}

// Обновить счетчик корзины
async function updateCartCounter() {
    try {
        const cart = await apiService.getCart();
        const counter = document.getElementById('cart-counter');
        if (counter && cart && cart.items) {
            const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            counter.textContent = totalItems;
            counter.classList.toggle('hidden', totalItems === 0);
        }
    } catch (error) {
        console.error('Error updating cart counter:', error);
    }
}

// Переключить вишлист
async function toggleWishlist(bookId) {
    if (!apiService.token) {
        showNotification('Please login to manage wishlist', 'error');
        return;
    }

    try {
        const isInWishlist = await apiService.checkInWishlist(bookId);

        if (isInWishlist) {
            await apiService.removeFromWishlist(bookId);
            updateWishlistButton(bookId, false);
            showNotification('Book removed from wishlist', 'success');
        } else {
            await apiService.addToWishlist(bookId);
            updateWishlistButton(bookId, true);
            showNotification('Book added to wishlist!', 'success');
        }
    } catch (error) {
        showNotification('Failed to update wishlist: ' + error.message, 'error');
    }
}

// Проверить статус вишлиста
async function checkWishlistStatus(bookId) {
    if (!apiService.token) return;

    try {
        const isInWishlist = await apiService.checkInWishlist(bookId);
        updateWishlistButton(bookId, isInWishlist);
    } catch (error) {
        console.error('Failed to check wishlist status:', error);
    }
}

// Обновить кнопку вишлиста
function updateWishlistButton(bookId, isInWishlist) {
    const button = document.querySelector(`button[onclick="toggleWishlist(${bookId})"]`);
    const text = document.getElementById(`wishlist-text-${bookId}`);

    if (button && text) {
        if (isInWishlist) {
            text.textContent = 'Remove from Wishlist';
            button.classList.remove('bg-white/20');
            button.classList.add('bg-red-500/80');
        } else {
            text.textContent = 'Add to Wishlist';
            button.classList.remove('bg-red-500/80');
            button.classList.add('bg-white/20');
        }
    }
}