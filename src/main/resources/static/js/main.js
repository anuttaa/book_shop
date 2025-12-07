document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();

    setupNavigation();

    loadBooksFromDB();

    if (apiService.token) {
        updateCartCounter();
    }
});

document.addEventListener('error', function(e) {
    if (e.target.tagName === 'DIV' && e.target.style.backgroundImage) {
        e.target.style.backgroundImage = "url('https://via.placeholder.com/120x160/522B47/F1F0EA?text=%F0%9F%93%9A')";
    }
}, true);

async function updateUserAvatarUI() {
    const profileLink = document.querySelector('header a[href="/profile"]');
    if (!profileLink) return;
    const container = profileLink.closest('.icon-btn') || profileLink.parentElement;
    if (!container) return;

    try {
        const avatarData = await apiService.getMyAvatar();
        if (avatarData && avatarData.avatarUrl) {
            container.innerHTML = `
                <a href="/profile" class="flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden">
                    <img src="${avatarData.avatarUrl}" alt="User Avatar" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <span class="material-symbols-outlined hidden">account_circle</span>
                </a>
            `;
        } else {
            container.innerHTML = `
                <a href="/profile" class="flex items-center justify-center rounded-lg bg-gray-100 dark:bg-background-dark/80 w-10 h-10">
                    <span class="material-symbols-outlined">account_circle</span>
                </a>
            `;
        }
    } catch (error) {
        const target = container.querySelector('a[href="/profile"]') || container;
        if (target) {
            target.innerHTML = '<span class="material-symbols-outlined">account_circle</span>';
        }
    }
}

function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userActions = document.getElementById('user-actions');
    const adminLink = document.getElementById('admin-link');

    if (!authButtons) return;

    if (apiService.token) {
        authButtons.style.display = 'none';
        if (userActions) {
            userActions.style.display = 'flex';
        }
        updateUserAvatarUI();
        updateAdminLinkVisibility(adminLink);
    } else {
        authButtons.style.display = 'flex';
        if (userActions) {
            userActions.style.display = 'none';
        }
        if (adminLink) {
            adminLink.classList.add('hidden');
        }

        showGuestMessage();
    }
}

function updateAdminLinkVisibility(adminLink) {
    if (!adminLink || !apiService.token) return;
    try {
        const payload = parseJwt(apiService.token) || {};
        let roles = payload.roles || payload.authorities || payload.scope || payload.role || [];
        if (typeof roles === 'string') {
            roles = roles.split(/[\s,]+/);
        }
        const isAdmin = Array.isArray(roles)
            ? roles.some(r => String(r).toLowerCase().includes('admin'))
            : String(roles).toLowerCase().includes('admin');
        adminLink.classList.toggle('hidden', !isAdmin);
    } catch (e) {
        adminLink.classList.add('hidden');
    }
}

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
        const counter = document.getElementById('cart-counter');
        if (counter) {
            counter.classList.add('hidden');
        }
    }
}

function showGuestMessage() {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    if (!document.getElementById('guest-message')) {
        const guestMessage = document.createElement('div');
        guestMessage.id = 'guest-message';
        guestMessage.className = 'text-center py-12';
        // гостевой блок убран по требованиям дизайна
    }
}

function setupNavigation() {
    document.querySelectorAll('header a[href="#"]').forEach(link => {
        if (link.textContent === 'Register') {
            link.href = '/register';
        } else if (link.textContent === 'Login') {
            link.href = '/login';
        } else if (link.textContent === 'Home') {
            link.href = '/';
        }
    });
}

function logout() {
    apiService.removeToken();
    updateAuthUI();
    showNotification('Logged out successfully', 'success');
    window.location.reload();
}

async function loadBooksFromDB() {
    try {
        const [recommended, popular, topRated] = await Promise.all([
            apiService.getRecommendedBooks(),
            apiService.getPopularBooks(),
            apiService.getTopRatedBooks()
        ]);

        

        await displayBooks('recommended-books', recommended || []);
        await displayBooks('popular-books', popular || []);
        await displayBooks('top-rated-books', topRated || []);

        updateSectionTitles();

    } catch (error) {
        console.error('Error loading books from DB:', error);
        showNotification('Failed to load books from database', 'error');

        await loadAllBooksFallback();
    }
}

function updateSectionTitles() {
     const isLoggedIn = !!apiService.token;

     const recommendedTitle = document.querySelector('#recommended-books .section-title');
     const popularTitle = document.querySelector('#popular-books .section-title');
     const topRatedTitle = document.querySelector('#top-rated-books .section-title');

     if (recommendedTitle) {
         recommendedTitle.textContent = isLoggedIn ?
            'Рекомендации для вас' : 'Новинки';
     }

     if (popularTitle) {
         popularTitle.textContent = isLoggedIn ?
            'Популярно среди ваших друзей' : 'Самые популярные книги';
     }

     if (topRatedTitle) {
         topRatedTitle.textContent = 'Книги с высоким рейтингом';
     }
 }

async function loadAllBooksFallback() {
    try {
        
        const allBooks = await apiService.getBooks();

        if (allBooks && allBooks.length > 0) {
            const processedBooks = allBooks.map(book => ({
                ...book,
                rating: book.rating || calculateRatingFromReviews(book.reviews),
                reviewCount: book.reviews ? book.reviews.length : 0
            }));

            const recommended = processedBooks.slice(0, 15);
            const popular = processedBooks
                .sort((a, b) => (b.timesAddedToCart || 0) - (a.timesAddedToCart || 0))
                .slice(0, 15);
            const topRated = processedBooks
                .filter(book => book.rating > 0)
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 15);

            await displayBooks('recommended-books', recommended);
            await displayBooks('popular-books', popular);
            await displayBooks('top-rated-books', topRated);
        }
    } catch (fallbackError) {
        console.error('Fallback book loading also failed:', fallbackError);
    }
}

function calculateRatingFromReviews(reviews) {
    if (!reviews || reviews.length === 0) {
        return 0.0;
    }
    const sum = reviews.reduce((total, review) => total + (review.rating || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
}

async function displayBooks(containerId, books) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }

    if (!books || books.length === 0) {
        container.innerHTML = '<p class="text-center muted" style="grid-column:1/-1;padding:16px 0">Книги не найдены</p>';
        return;
    }

    const bookPromises = books.map(async (book) => {
        const coverUrl = await getBookCover(book);
        const rating = book.rating || await calculateBookRating(book);
        const bookType = book.type ? book.type.toLowerCase() : 'physical';

        return `
            <div class="book-card" onclick="openBookPage(${book.id})">
                <div class="book-card__cover" style="background-image:url('${coverUrl}')">
                <div class="book-card__badge">${bookType === 'electronic' ? 'Электронная' : 'Печатная'}</div>
                </div>
                <div class="book-card__overlay">
                    <button onclick="event.stopPropagation(); addToCart(${book.id})" class="btn btn-primary">В корзину</button>
                    <button onclick="event.stopPropagation(); toggleWishlist(${book.id})" class="btn btn-clear"><span id="wishlist-text-${book.id}">В избранное</span></button>
                </div>
                <div class="book-card__info">
                    <div>
                        <p class="book-title">${book.title}</p>
                        <p class="book-author">${book.author}</p>
                    </div>
                    <div class="book-meta">
                        <span class="material-symbols-outlined" style="color:#f59e0b;font-size:16px">star</span>
                        <span>${rating}</span>
                        ${book.reviewCount ? `<span class="muted">(${book.reviewCount})</span>` : ''}
                    </div>
                    <div class="price-row">
                        <p class="price">$${book.price || '0.00'}</p>
                        <span class="muted">${book.timesAddedToCart || 0} в корзине</span>
                    </div>
                </div>
            </div>
        `;
    });

    const bookElements = await Promise.all(bookPromises);
    container.innerHTML = bookElements.join('');

    if (apiService.token) {
        books.forEach(book => {
            checkWishlistStatus(book.id);
        });
    }
}

async function getBookCover(book) {

    if (book.media && book.media.length > 0) {
        const coverMedia = findCoverMedia(book.media);
        if (coverMedia && coverMedia.fileUrl) {
            return coverMedia.fileUrl;
        }
    }

    try {
        const mediaList = await apiService.getBookMedia(book.id);
        if (mediaList && mediaList.length > 0) {
            const coverMedia = findCoverMedia(mediaList);
            if (coverMedia && coverMedia.fileUrl) {
                return coverMedia.fileUrl;
            }
        }
    } catch (error) {
        
    }

    return 'https://via.placeholder.com/120x160/522B47/FFFFFF?text=%F0%9F%93%9A';
}

function findCoverMedia(mediaList) {
    let coverMedia = mediaList.find(media =>
        media.fileType === 'image' ||
        (media.fileType && media.fileType.toLowerCase() === 'image')
    );

    if (!coverMedia) {
        coverMedia = mediaList.find(media =>
            media.fileUrl && media.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        );
    }

    if (!coverMedia && mediaList.length > 0) {
        coverMedia = mediaList[0];
    }

    return coverMedia;
}

async function calculateBookRating(book) {
    if (book.rating !== undefined && book.rating !== null) {
        return book.rating;
    }

    if (book.reviews && book.reviews.length > 0) {
        const sum = book.reviews.reduce((total, review) => total + (review.rating || 0), 0);
        const average = sum / book.reviews.length;
        return Math.round(average * 10) / 10;
    }

    try {
        const reviews = await apiService.getBookReviews(book.id);
        if (reviews && reviews.length > 0) {
            const sum = reviews.reduce((total, review) => total + (review.rating || 0), 0);
            const average = sum / reviews.length;
            return Math.round(average * 10) / 10;
        }
    } catch (error) {
        
    }

    return 0.0;
}

function openBookPage(bookId) {
    window.location.href = `/pages/book.html?id=${bookId}`;
}

async function addToCart(bookId) {
    if (!apiService.token) {
        showNotification('Войдите, чтобы добавлять товары в корзину', 'error');
        return;
    }

    try {
        await apiService.addToCart(bookId);
        showNotification('Книга добавлена в корзину!', 'success');
        updateCartCounter();
    } catch (error) {
        showNotification('Не удалось добавить книгу в корзину: ' + error.message, 'error');
    }
}

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

async function toggleWishlist(bookId) {
    if (!apiService.token) {
        showNotification('Войдите, чтобы управлять избранным', 'error');
        return;
    }

    try {
        const isInWishlist = await apiService.checkInWishlist(bookId);

        if (isInWishlist) {
            await apiService.removeFromWishlist(bookId);
            updateWishlistButton(bookId, false);
            showNotification('Книга удалена из избранного', 'success');
        } else {
            await apiService.addToWishlist(bookId);
            updateWishlistButton(bookId, true);
            showNotification('Книга добавлена в избранное!', 'success');
        }
    } catch (error) {
        showNotification('Не удалось обновить избранное: ' + error.message, 'error');
    }
}

async function checkWishlistStatus(bookId) {
    if (!apiService.token) return;

    try {
        const isInWishlist = await apiService.checkInWishlist(bookId);
        updateWishlistButton(bookId, isInWishlist);
    } catch (error) {
        console.error('Failed to check wishlist status:', error);
    }
}

function updateWishlistButton(bookId, isInWishlist) {
    const button = document.querySelector(`button[onclick="toggleWishlist(${bookId})"]`);
    const text = document.getElementById(`wishlist-text-${bookId}`);
    if (button && text) {
        if (isInWishlist) {
            text.textContent = 'Убрать из избранного';
            button.classList.remove('btn-clear');
            button.classList.add('btn-danger');
        } else {
            text.textContent = 'В избранное';
            button.classList.remove('btn-danger');
            button.classList.add('btn-clear');
        }
    }
}
