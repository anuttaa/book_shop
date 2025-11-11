let currentBookId = null;
let currentBook = null;

document.addEventListener('DOMContentLoaded', function() {
    loadBookDetails();
    checkAuthStatus();
});

function loadBookDetails() {
    // Получаем ID книги из URL параметров
    const urlParams = new URLSearchParams(window.location.search);
    currentBookId = urlParams.get('id');

    if (!currentBookId) {
        showError('Book ID not specified');
        return;
    }

    // Показываем состояние загрузки
    showLoadingState();

    // Добавляем таймаут для запроса
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
    );

    Promise.race([
        apiService.getBookById(currentBookId),
        timeoutPromise
    ])
    .then(book => {
        currentBook = book;
        displayBookDetails(book);
        updateBreadcrumbs(book);
        loadReviews(book.id);
        loadRecommendations(book.id);
        checkWishlistStatus(book.id);
    })
    .catch(error => {
        console.error('Error loading book:', error);
        if (error.message === 'Request timeout') {
            showError('The request took too long. Please try again.');
        } else {
            showError('Book not found or error loading book details');
        }
    });
}

function displayBookDetails(book) {
    // Обновляем заголовок страницы
    document.title = `${book.title} - Book Nook`;

    // Заголовок и автор
    document.getElementById('bookTitle').textContent = book.title;
    document.getElementById('bookAuthor').textContent = `by ${book.author}`;

    // Обложка книги (с приоритетом для imageUrl)
    const bookCover = document.getElementById('bookCover');
    if (book.imageUrl) {
        bookCover.style.backgroundImage = `url('${book.imageUrl}')`;
        bookCover.innerHTML = '';
        bookCover.classList.add('bg-cover', 'bg-center');
        bookCover.classList.remove('bg-gradient-to-br', 'from-primary', 'to-blue-600');
    } else {
        bookCover.innerHTML = book.title.charAt(0).toUpperCase();
        bookCover.style.backgroundImage = '';
        bookCover.classList.remove('bg-cover', 'bg-center');
        bookCover.classList.add('bg-gradient-to-br', 'from-primary', 'to-blue-600');
    }

    // Жанры
    const genresContainer = document.getElementById('genresContainer');
    if (book.genre) {
        const genres = book.genre.split(',').map(g => g.trim());
        genresContainer.innerHTML = genres.map(genre => `
            <div class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-neutral-border dark:bg-white/10 px-4">
                <p class="text-neutral-text dark:text-neutral-text-dark text-sm font-medium leading-normal">${genre}</p>
            </div>
        `).join('');
    }

    // Рейтинг (если есть)
    const ratingSection = document.getElementById('ratingSection');
    if (book.rating && book.rating > 0) {
        const stars = generateStarRating(book.rating);
        ratingSection.innerHTML = `
            <div class="flex text-yellow-500">
                ${stars}
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm font-medium">${book.rating.toFixed(2)} ${book.reviewCount ? `(${book.reviewCount} ratings)` : ''}</p>
        `;
    } else {
        ratingSection.innerHTML = '<p class="text-gray-600 dark:text-gray-400 text-sm font-medium">No ratings yet</p>';
    }

    // Цена
    document.getElementById('bookPrice').textContent = `$${book.price}`;

    // Описание
    document.getElementById('bookDescription').textContent = book.description || 'No description available.';
}

function generateStarRating(rating) {
    const stars = [];
    const maxStars = 5;

    for (let i = 1; i <= maxStars; i++) {
        if (i <= Math.floor(rating)) {
            // Полная звезда
            stars.push('<span class="material-symbols-outlined text-xl text-yellow-500">star</span>');
        } else if (i === Math.ceil(rating) && rating % 1 >= 0.3) {
            // Половина звезды (только если рейтинг достаточно высокий)
            stars.push('<span class="material-symbols-outlined text-xl text-yellow-500">star_half</span>');
        } else {
            // Пустая звезда
            stars.push('<span class="material-symbols-outlined text-xl text-gray-300 dark:text-gray-600">star</span>');
        }
    }

    return stars.join('');
}

function updateBreadcrumbs(book) {
    const breadcrumbs = document.getElementById('breadcrumbs');
    breadcrumbs.innerHTML = `
        <a class="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal hover:text-primary-alt dark:hover:text-primary" href="../mainPage.html">Home</a>
        <span class="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal">/</span>
        <a class="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal hover:text-primary-alt dark:hover:text-primary" href="#">${book.genre ? book.genre.split(',')[0].trim() : 'Books'}</a>
        <span class="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal">/</span>
        <span class="text-neutral-text dark:text-neutral-text-dark text-sm font-medium leading-normal">${book.title}</span>
    `;
}

async function loadReviews(bookId) {
    try {
        // Здесь можно добавить вызов API для получения отзывов
        // const reviews = await apiService.getBookReviews(bookId);

        // Временно используем заглушку
        const reviewsContainer = document.getElementById('reviewsContainer');
        reviewsContainer.innerHTML = `
            <div class="bg-white dark:bg-background-dark/50 border-2 border-dashed border-neutral-border dark:border-white/20 rounded-xl p-6 flex flex-col gap-4 items-center justify-center text-center hover:border-primary-alt dark:hover:border-primary hover:bg-primary-alt/5 dark:hover:bg-primary/10 transition-colors">
                <p class="font-bold text-neutral-text dark:text-neutral-text-dark">No reviews yet</p>
                <p class="text-gray-600 dark:text-gray-300 text-sm">Be the first to share your thoughts!</p>
                <button onclick="openReviewModal()" class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 mt-2 bg-transparent text-primary-alt dark:text-primary border border-primary-alt dark:border-primary text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary-alt dark:hover:bg-primary hover:text-white dark:hover:text-black transition-colors">
                    <span class="truncate">Write a Review</span>
                </button>
            </div>
        `;
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

async function loadRecommendations(bookId) {
    try {
        const recommendations = await apiService.getRecommendedBooks();
        const recommendationsContainer = document.getElementById('recommendationsContainer');

        if (recommendations && recommendations.length > 0) {
            // Исключаем текущую книгу из рекомендаций
            const filteredRecs = recommendations.filter(book => book.id != bookId).slice(0, 5);

            recommendationsContainer.innerHTML = filteredRecs.map(book => `
                <div class="flex flex-col gap-2 group cursor-pointer" onclick="openBookPage(${book.id})">
                    <div class="w-full aspect-[2/3] rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105 flex items-center justify-center text-white text-4xl font-bold ${book.imageUrl ? 'bg-cover bg-center' : 'bg-gradient-to-br from-primary to-blue-600'}"
                         style="${book.imageUrl ? `background-image: url('${book.imageUrl}')` : ''}">
                        ${book.imageUrl ? '' : book.title.charAt(0).toUpperCase()}
                    </div>
                    <h3 class="font-bold text-sm truncate text-neutral-text dark:text-neutral-text-dark">${book.title}</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">${book.author}</p>
                </div>
            `).join('');
        } else {
            recommendationsContainer.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">No recommendations available</p>';
        }
    } catch (error) {
        console.error('Error loading recommendations:', error);
        document.getElementById('recommendationsContainer').innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">Error loading recommendations</p>';
    }
}

async function checkWishlistStatus(bookId) {
    if (!apiService.token) return;

    try {
        const inWishlist = await apiService.checkInWishlist(bookId);
        updateWishlistButton(inWishlist);
    } catch (error) {
        console.error('Error checking wishlist:', error);
    }
}

function updateWishlistButton(inWishlist) {
    const wishlistBtn = document.getElementById('wishlistBtn');
    if (inWishlist) {
        wishlistBtn.innerHTML = '<span class="material-symbols-outlined mr-2">favorite</span><span class="truncate">Remove from Wishlist</span>';
        wishlistBtn.classList.add('bg-red-500', 'text-white', 'hover:bg-red-600');
        wishlistBtn.classList.remove('bg-neutral-border', 'dark:bg-white/10', 'text-neutral-text', 'dark:text-neutral-text-dark');
    } else {
        wishlistBtn.innerHTML = '<span class="material-symbols-outlined mr-2">favorite_border</span><span class="truncate">Add to Wishlist</span>';
        wishlistBtn.classList.remove('bg-red-500', 'text-white', 'hover:bg-red-600');
        wishlistBtn.classList.add('bg-neutral-border', 'dark:bg-white/10', 'text-neutral-text', 'dark:text-neutral-text-dark');
    }
}

async function toggleWishlist() {
    if (!apiService.token) {
        showNotification('Please login to use wishlist', 'error');
        return;
    }

    try {
        const inWishlist = await apiService.checkInWishlist(currentBookId);

        if (inWishlist) {
            await apiService.removeFromWishlist(currentBookId);
            showNotification('Removed from wishlist', 'success');
            updateWishlistButton(false);
        } else {
            await apiService.addToWishlist(currentBookId);
            showNotification('Added to wishlist', 'success');
            updateWishlistButton(true);
        }
    } catch (error) {
        console.error('Error toggling wishlist:', error);
        showNotification('Error updating wishlist', 'error');
    }
}

async function addToCart() {
    if (!apiService.token) {
        showNotification('Please login to add to cart', 'error');
        return;
    }

    try {
        await apiService.addToCart(currentBookId);
        showNotification('Added to cart', 'success');
        updateCartCounter();
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding to cart', 'error');
    }
}

async function updateCartCounter() {
    try {
        const cart = await apiService.getCart();
        const counter = document.querySelector('.cart-counter');
        if (counter && cart && cart.items) {
            const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            counter.textContent = totalItems;
            counter.classList.toggle('hidden', totalItems === 0);
        }
    } catch (error) {
        console.error('Error updating cart counter:', error);
    }
}

function openBookPage(bookId) {
    window.location.href = `book.html?id=${bookId}`;
}

function openReviewModal() {
    if (!apiService.token) {
        showNotification('Please login to write a review', 'error');
        return;
    }
    // Здесь можно добавить модальное окно для написания отзыва
    showNotification('Review feature coming soon!', 'info');
}

function showLoadingState() {
    document.getElementById('bookTitle').textContent = 'Loading...';
    document.getElementById('bookAuthor').textContent = 'by Loading...';
    document.getElementById('bookPrice').textContent = '$...';
    document.getElementById('bookDescription').textContent = 'Loading book details...';

    // Показываем скелетон для обложки
    const bookCover = document.getElementById('bookCover');
    bookCover.innerHTML = '';
    bookCover.classList.add('bg-gray-300', 'dark:bg-gray-600', 'animate-pulse');
}

function showError(message) {
    const mainContent = document.querySelector('.layout-content-container');
    mainContent.innerHTML = `
        <div class="text-center py-20">
            <span class="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
            <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p class="text-gray-600 mb-6">${message}</p>
            <a href="../mainPage.html" class="inline-block bg-primary-alt text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors">
                Back to Home
            </a>
        </div>
    `;
}

function checkAuthStatus() {
    const authButtons = document.getElementById('authButtons');

    if (apiService.token) {
        authButtons.innerHTML = `
            <button onclick="logout()" class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-red-500 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-red-600 transition-colors">
                <span class="truncate">Logout</span>
            </button>
        `;
    } else {
        authButtons.innerHTML = `
            <a href="login.html" class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary-alt/10 dark:bg-primary/20 text-primary-alt dark:text-primary text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary-alt/20 dark:hover:bg-primary/30 transition-colors">
                <span class="truncate">Log In</span>
            </a>
            <a href="register.html" class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary-alt text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 transition-colors">
                <span class="truncate">Sign Up</span>
            </a>
        `;
    }
}

function logout() {
    apiService.removeToken();
    window.location.reload();
}