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
        console.warn('Failed to load background image:', e.target.style.backgroundImage);
        e.target.style.backgroundImage = "url('redirect:https://via.placeholder.com/120x160/4F46E5/FFFFFF?text=📚')";
    }
}, true);

async function updateUserAvatarUI() {
    const userAvatarButton = document.querySelector('button a[href="/profile"]');
    if (!userAvatarButton) return;

    try {
        const avatarData = await apiService.getMyAvatar();

        const avatarContainer = userAvatarButton.parentElement;

        if (avatarData && avatarData.avatarUrl) {
            avatarContainer.innerHTML = `
                <a href="/profile" class="flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden">
                    <img src="${avatarData.avatarUrl}"
                         alt="User Avatar"
                         class="w-full h-full object-cover"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <span class="material-symbols-outlined hidden">account_circle</span>
                </a>
            `;
        } else {
            avatarContainer.innerHTML = `
                <a href="/profile" class="flex items-center justify-center rounded-lg bg-gray-100 dark:bg-background-dark/80 w-10 h-10">
                    <span class="material-symbols-outlined">account_circle</span>
                </a>
            `;
        }
    } catch (error) {
        console.error('Failed to load user avatar:', error);
        userAvatarButton.innerHTML = '<span class="material-symbols-outlined">account_circle</span>';
    }
}

function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userActions = document.getElementById('user-actions');

    if (!authButtons) return;

    if (apiService.token) {
        authButtons.style.display = 'none';
        if (userActions) {
            userActions.style.display = 'flex';
        }
        updateUserAvatarUI();
    } else {
        authButtons.style.display = 'flex';
        if (userActions) {
            userActions.style.display = 'none';
        }

        showGuestMessage();
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
        guestMessage.innerHTML = `
            <h2 class="text-2xl font-bold text-primary-text dark:text-white mb-4">
                Welcome to BookStore
            </h2>
            <p class="text-secondary-text dark:text-gray-400 mb-6">
                Please login or register to browse our book collection
            </p>
            <div class="flex justify-center gap-4">
                <a href="/login" class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em]">
                    <span class="truncate">Login</span>
                </a>
                <a href="/register" class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-100 dark:bg-gray-800 text-primary-text dark:text-white text-sm font-bold leading-normal tracking-[0.015em]">
                    <span class="truncate">Register</span>
                </a>
            </div>
        `;
        mainContent.insertBefore(guestMessage, mainContent.firstChild);
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

        console.log('Recommended books:', recommended);
        console.log('Popular books:', popular);
        console.log('Top rated books:', topRated);

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
             'Recommended For You' : 'New Arrivals';
     }

     if (popularTitle) {
         popularTitle.textContent = isLoggedIn ?
             'Popular in Your Network' : 'Most Popular Books';
     }

     if (topRatedTitle) {
         topRatedTitle.textContent = 'Top Rated Books';
     }
 }

async function loadAllBooksFallback() {
    try {
        console.log('Using fallback book loading method...');
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
        container.innerHTML = '<p class="col-span-full text-center py-8 text-secondary-text dark:text-gray-400">No books found</p>';
        return;
    }

    const bookPromises = books.map(async (book) => {
        const coverUrl = await getBookCover(book);
        const rating = book.rating || await calculateBookRating(book);
        const bookType = book.type ? book.type.toLowerCase() : 'physical';

        return `
            <div class="group relative flex h-full flex-col rounded-lg bg-white dark:bg-gray-800 shadow-[0_0_4px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden transition-shadow hover:shadow-lg cursor-pointer" onclick="openBookPage(${book.id})">
                <div class="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover bg-gray-200"
                     style="background-image: url('${coverUrl}')"
                     data-alt="Book cover for ${book.title}">
                    <div class="absolute top-2 right-2">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            bookType === 'electronic'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }">
                            ${bookType === 'electronic' ? 'E-book' : 'Physical'}
                        </span>
                    </div>
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
                        <span class="ml-1">${rating}</span>
                        ${book.reviewCount ? `<span class="ml-1 text-xs">(${book.reviewCount})</span>` : ''}
                    </div>
                    <div class="flex items-center justify-between mt-2">
                        <p class="text-primary-text dark:text-white text-lg font-bold">$${book.price || '0.00'}</p>
                        <span class="text-xs text-secondary-text dark:text-gray-400">
                            ${book.timesAddedToCart || 0} in cart
                        </span>
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
        console.warn(`Failed to load media for book ${book.id}:`, error);
    }

    return 'redirect:https://via.placeholder.com/120x160/4F46E5/FFFFFF?text=📚';
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
        console.warn(`Failed to load reviews for book ${book.id}:`, error);
    }

    return 0.0;
}

function openBookPage(bookId) {
    window.location.href = `/pages/book.html?id=${bookId}`;
}

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