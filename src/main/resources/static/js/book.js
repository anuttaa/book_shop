let currentBookId = null;
let currentBook = null;

document.addEventListener('DOMContentLoaded', function() {
    loadBookDetails();
    checkAuthStatus();
     updateAuthUI();
});

function loadBookDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    currentBookId = urlParams.get('id');

    if (!currentBookId) {
        showError('Book ID not specified');
        return;
    }

    showLoadingState();

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
    document.title = `${book.title} - Book Nook`;

    document.getElementById('bookTitle').textContent = book.title;
    document.getElementById('bookAuthor').textContent = `by ${book.author}`;

    loadBookCover(book);

    const genresContainer = document.getElementById('genresContainer');
    if (book.genre) {
        const genres = book.genre.split(',').map(g => g.trim());
        genresContainer.innerHTML = genres.map(genre => `
            <div class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-neutral-border dark:bg-white/10 px-4">
                <p class="text-neutral-text dark:text-neutral-text-dark text-sm font-medium leading-normal">${genre}</p>
            </div>
        `).join('');
    }

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

    document.getElementById('bookPrice').textContent = `$${book.price}`;

    document.getElementById('bookDescription').textContent = book.description || 'No description available.';
}

async function loadBookCover(book) {
    const bookCover = document.getElementById('bookCover');

    if (book.imageUrl) {
        console.log('Using book.imageUrl:', book.imageUrl);
        setBookCoverImage(bookCover, book.imageUrl);
        return;
    }

    if (book.media && book.media.length > 0) {
        console.log('Book has embedded media:', book.media);
        const coverMedia = findCoverMedia(book.media);
        if (coverMedia && coverMedia.fileUrl) {
            console.log('Found cover in embedded media:', coverMedia.fileUrl);
            setBookCoverImage(bookCover, coverMedia.fileUrl);
            return;
        }
    }

    console.log('Fetching media from API for book:', book.id);
    try {
        const mediaList = await apiService.getBookMedia(book.id);
        console.log('Media from API:', mediaList);

        if (mediaList && mediaList.length > 0) {
            const coverMedia = findCoverMedia(mediaList);
            if (coverMedia && coverMedia.fileUrl) {
                console.log('Found cover in API media:', coverMedia.fileUrl);
                setBookCoverImage(bookCover, coverMedia.fileUrl);
                return;
            }
        }
    } catch (error) {
        console.error('Error loading media:', error);
    }

    console.log('Using fallback (first letter)');
    setBookCoverFallback(bookCover, book.title);
}

function setBookCoverImage(bookCover, imageUrl) {
    bookCover.style.backgroundImage = `url('${imageUrl}')`;
    bookCover.innerHTML = '';
    bookCover.classList.add('bg-cover', 'bg-center');
    bookCover.classList.remove('bg-gradient-to-br', 'from-primary', 'to-blue-600', 'bg-gray-300', 'dark:bg-gray-600', 'animate-pulse');

    const img = new Image();
    img.onerror = function() {
        console.warn('Failed to load cover image, using fallback');
        setBookCoverFallback(bookCover, document.getElementById('bookTitle').textContent);
    };
    img.src = imageUrl;
}

function setBookCoverFallback(bookCover, title) {
    bookCover.style.backgroundImage = '';
    bookCover.innerHTML = title.charAt(0).toUpperCase();
    bookCover.classList.remove('bg-cover', 'bg-center', 'bg-gray-300', 'dark:bg-gray-600', 'animate-pulse');
    bookCover.classList.add('bg-gradient-to-br', 'from-primary', 'to-blue-600');
}

function findCoverMedia(mediaList) {
    console.log('Searching for cover in media list...');

    if (!mediaList || mediaList.length === 0) {
        console.log('Media list is empty');
        return null;
    }

    let coverMedia = mediaList.find(media => {
        const fileType = media.fileType || media.type;
        console.log(`Checking media - fileType: ${fileType}, url: ${media.fileUrl}`);
        return fileType && (fileType.toLowerCase() === 'image' || fileType.toLowerCase().includes('image'));
    });

    if (coverMedia) {
        console.log('Found cover by fileType:', coverMedia);
        return coverMedia;
    }

    coverMedia = mediaList.find(media => {
        const url = media.fileUrl || media.url;
        if (!url) return false;

        const hasImageExtension = url.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
        console.log(`Checking extension for ${url}: ${hasImageExtension}`);
        return hasImageExtension;
    });

    if (coverMedia) {
        console.log('Found cover by extension:', coverMedia);
        return coverMedia;
    }

    if (mediaList.length > 0) {
        console.log('Using first available media:', mediaList[0]);
        return mediaList[0];
    }

    console.log('No suitable media found');
    return null;
}

async function getRecommendationCover(book) {
    console.log(`Getting cover for recommendation: "${book.title}" (ID: ${book.id})`);

    if (book.imageUrl) {
        console.log('Using book.imageUrl for recommendation:', book.imageUrl);
        return book.imageUrl;
    }

    if (book.media && book.media.length > 0) {
        console.log('Recommendation has embedded media:', book.media);
        const coverMedia = findCoverMedia(book.media);
        if (coverMedia && coverMedia.fileUrl) {
            console.log('Found cover in embedded media for recommendation:', coverMedia.fileUrl);
            return coverMedia.fileUrl;
        }
    }

    console.log(`Fetching media from API for recommendation ${book.id}`);
    try {
        const mediaList = await apiService.getBookMedia(book.id);

        if (mediaList && mediaList.length > 0) {
            console.log(`Received ${mediaList.length} media items for recommendation`);
            const coverMedia = findCoverMedia(mediaList);
            if (coverMedia && coverMedia.fileUrl) {
                console.log('Found cover in API media for recommendation:', coverMedia.fileUrl);
                return coverMedia.fileUrl;
            } else {
                console.log('No suitable cover found for recommendation');
            }
        } else {
            console.log('No media returned for recommendation');
        }
    } catch (error) {
        console.warn(`Failed to load media for recommendation ${book.id}:`, error);
    }

    console.log('Using fallback for recommendation');
    return null;
}

function generateStarRating(rating) {
    const stars = [];
    const maxStars = 5;

    for (let i = 1; i <= maxStars; i++) {
        if (i <= Math.floor(rating)) {
            stars.push('<span class="material-symbols-outlined text-xl text-yellow-500">star</span>');
        } else if (i === Math.ceil(rating) && rating % 1 >= 0.3) {
            stars.push('<span class="material-symbols-outlined text-xl text-yellow-500">star_half</span>');
        } else {
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

async function checkUserReview(bookId) {
    if (!apiService.token) {
        console.log('No token, user not logged in');
        return null;
    }

    try {
        console.log('Checking user reviews for book:', bookId);
        const userReviews = await apiService.getUserReviews();
        console.log('User reviews:', userReviews);

        const userReview = userReviews.find(review => review.bookId === bookId);
        console.log('Found user review for this book:', userReview);

        return userReview;
    } catch (error) {
        console.error('Error checking user review:', error);
        return null;
    }
}

async function loadReviews(bookId) {
    const reviewsContainer = document.getElementById('reviewsContainer');
    reviewsContainer.innerHTML = '';

    try {
        const reviews = await apiService.getBookReviews(bookId);
        const userReview = await checkUserReview(bookId);

        console.log('All reviews from API:', reviews);
        console.log('Current user review:', userReview);

        const reviewButton = document.createElement("div");
        reviewButton.className = "mb-6 text-center";
        reviewButton.innerHTML = `
            <button onclick="openReviewModal()" class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary-alt dark:bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 transition-colors mx-auto">
                <span class="material-symbols-outlined mr-2">rate_review</span>
                <span class="truncate">Write a Review</span>
            </button>
        `;
        reviewsContainer.appendChild(reviewButton);

        if (!reviews || reviews.length === 0) {
            const noReviewsEl = document.createElement("div");
            noReviewsEl.className = "bg-white dark:bg-background-dark/50 border-2 border-dashed border-neutral-border dark:border-white/20 rounded-xl p-6 flex flex-col gap-4 items-center justify-center text-center";
            noReviewsEl.innerHTML = `
                <p class="font-bold text-neutral-text dark:text-neutral-text-dark">No reviews yet</p>
                <p class="text-gray-600 dark:text-gray-300 text-sm">Be the first to share your thoughts!</p>
            `;
            reviewsContainer.appendChild(noReviewsEl);
            return;
        }

        reviews.forEach(review => {
            const stars = generateStarIcons(review.rating);

            const isUserReview = userReview && userReview.id === review.id;

            console.log(`Review ${review.id}: isUserReview = ${isUserReview}, username = ${review.username}`);

            const reviewEl = document.createElement("div");
            reviewEl.className = `p-4 border border-neutral-border dark:border-neutral-text-dark rounded-lg shadow-sm mb-4 bg-white dark:bg-background-dark/30 ${
                isUserReview ? 'ring-2 ring-green-500 relative' : ''
            }`;

            let actionButtons = '';
            if (isUserReview) {
                actionButtons = `
                    <div class="flex gap-2 ml-3">
                        <button onclick="editReviewModal(${review.id})"
                                class="flex items-center gap-1 px-2 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors text-sm"
                                title="Edit review">
                            <span class="material-symbols-outlined text-base">edit</span>
                            <span>Edit</span>
                        </button>
                        <button onclick="deleteReview(${review.id})"
                                class="flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors text-sm"
                                title="Delete review">
                            <span class="material-symbols-outlined text-base">delete</span>
                            <span>Delete</span>
                        </button>
                    </div>
                `;
            }

            reviewEl.innerHTML = `
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-lg text-neutral-text dark:text-neutral-text-dark">${review.username}</span>
                        ${isUserReview ?
                          '<span class="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full flex items-center gap-1"><span class="material-symbols-outlined text-sm">person</span>Your Review</span>' : ''}
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="flex text-yellow-500 text-lg">
                            ${stars}
                        </div>
                    </div>
                </div>

                <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">${review.comment}</p>

                <div class="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                        ${review.createdAt ? `Posted: ${new Date(review.createdAt).toLocaleDateString()}` : ''}
                        ${review.updatedAt && review.updatedAt !== review.createdAt ?
                          `<br><span class="text-gray-400">Edited: ${new Date(review.updatedAt).toLocaleDateString()}</span>` : ''}
                    </div>
                    ${actionButtons}
                </div>
            `;
            reviewsContainer.appendChild(reviewEl);
        });

    } catch (error) {
        console.error('Error loading reviews:', error);
        const errorEl = document.createElement("div");
        errorEl.className = "text-center py-8";
        errorEl.innerHTML = `
            <span class="material-symbols-outlined text-red-500 text-4xl mb-2">error</span>
            <p class="text-red-500">Failed to load reviews</p>
            <button onclick="loadReviews(${bookId})" class="mt-2 text-primary-alt dark:text-primary text-sm hover:underline">
                Try Again
            </button>
        `;
        reviewsContainer.appendChild(errorEl);
    }
}

function editReviewModal(reviewId) {
    loadReviewForEditing(reviewId);
}

async function loadReviewForEditing(reviewId) {
    try {
        const userReviews = await apiService.getUserReviews();
        const reviewToEdit = userReviews.find(review => review.id === reviewId);

        if (!reviewToEdit) {
            showNotification('Review not found or you do not have permission to edit it', 'error');
            return;
        }

        createEditReviewModal(reviewToEdit);

    } catch (error) {
        console.error('Error loading review for editing:', error);
        showNotification('Failed to load review for editing', 'error');
    }
}

function createEditReviewModal(review) {
    if (reviewModal) {
        reviewModal.remove();
    }

    reviewModal = document.createElement('dialog');
    reviewModal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm';
    reviewModal.innerHTML = `
        <div class="bg-white dark:bg-background-dark rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-scale-in">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-neutral-text dark:text-neutral-text-dark">Edit Review</h3>
                <button onclick="closeReviewModal()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <form id="editReviewForm" class="space-y-4">
                <input type="hidden" id="editReviewId" value="${review.id}">

                <div class="space-y-2">
                    <label class="block text-sm font-medium text-neutral-text dark:text-neutral-text-dark">Rating</label>
                    <div class="flex space-x-1" id="editRatingStars">
                        ${[1,2,3,4,5].map(i => `
                            <button type="button"
                                    class="text-2xl transition-colors duration-200"
                                    data-rating="${i}"
                                    onclick="setEditRating(${i})">
                                <span class="material-symbols-outlined ${i <= review.rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}">star</span>
                            </button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="editSelectedRating" name="rating" value="${review.rating}" required>
                </div>

                <div class="space-y-2">
                    <label for="editReviewComment" class="block text-sm font-medium text-neutral-text dark:text-neutral-text-dark">Your Review</label>
                    <textarea
                        id="editReviewComment"
                        name="comment"
                        rows="4"
                        class="w-full px-3 py-2 border border-neutral-border dark:border-white/20 rounded-lg bg-white dark:bg-background-dark/50 text-neutral-text dark:text-neutral-text-dark placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-alt dark:focus:ring-primary focus:border-transparent resize-none"
                        placeholder="Share your thoughts about this book..."
                        maxlength="500"
                        required>${review.comment || ''}</textarea>
                    <div class="text-xs text-gray-500 dark:text-gray-400 text-right">
                        <span id="editCharCount">${review.comment ? review.comment.length : 0}</span>/500 characters
                    </div>
                </div>

                <div class="flex space-x-3 pt-4">
                    <button type="button" onclick="closeReviewModal()" class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" id="updateReviewBtn" class="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                        Update Review
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(reviewModal);
    reviewModal.showModal();

    document.getElementById('editReviewComment').addEventListener('input', updateEditCharCount);
    document.getElementById('editReviewForm').addEventListener('submit', updateReview);
}

function setEditRating(rating) {
    const stars = document.querySelectorAll('#editRatingStars button');
    const selectedRatingInput = document.getElementById('editSelectedRating');

    stars.forEach((star, index) => {
        const icon = star.querySelector('.material-symbols-outlined');
        if (index < rating) {
            icon.textContent = 'star';
            icon.classList.remove('text-gray-300', 'dark:text-gray-600');
            icon.classList.add('text-yellow-500');
        } else {
            icon.textContent = 'star';
            icon.classList.remove('text-yellow-500');
            icon.classList.add('text-gray-300', 'dark:text-gray-600');
        }
    });

    selectedRatingInput.value = rating;
}

function updateEditCharCount() {
    const textarea = document.getElementById('editReviewComment');
    const charCount = document.getElementById('editCharCount');
    charCount.textContent = textarea.value.length;
}

async function updateReview(event) {
    event.preventDefault();

    const reviewId = document.getElementById('editReviewId').value;
    const rating = parseInt(document.getElementById('editSelectedRating').value);
    const comment = document.getElementById('editReviewComment').value.trim();
    const submitBtn = document.getElementById('updateReviewBtn');

    if (!rating || !comment) {
        showNotification('Please provide both rating and comment', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        Updating...
    `;

    try {
        const reviewData = {
            rating: rating,
            comment: comment
        };

        const response = await apiService.updateReview(reviewId, reviewData);

        console.log('Review updated successfully:', response);
        showNotification('Review updated successfully!', 'success');
        closeReviewModal();

        await loadReviews(currentBookId);

        await updateBookRating();

    } catch (error) {
        console.error('Error updating review:', error);

        if (error.message.includes('401') || error.message.includes('403')) {
            showNotification('Authentication failed. Please log in again.', 'error');
        } else if (error.message.includes('400')) {
            showNotification('Invalid review data. Please check your input.', 'error');
        } else {
            showNotification('Failed to update review. Please try again.', 'error');
        }

        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Review';
    }
}

async function deleteReview(reviewId) {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
        return;
    }

    try {
        await apiService.deleteReview(reviewId);
        showNotification('Review deleted successfully!', 'success');

        await loadReviews(currentBookId);

        await updateBookRating();

    } catch (error) {
        console.error('Error deleting review:', error);

        if (error.message.includes('401') || error.message.includes('403')) {
            showNotification('Authentication failed. Please log in again.', 'error');
        } else {
            showNotification('Failed to delete review. Please try again.', 'error');
        }
    }
}

function generateStarIcons(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<span class="material-symbols-outlined text-base">star</span>';
        } else {
            stars += '<span class="material-symbols-outlined text-base text-gray-300 dark:text-gray-600">star</span>';
        }
    }
    return stars;
}

async function loadRecommendations(bookId) {
    try {
        console.log('Loading recommendations...');
        const recommendations = await apiService.getRecommendedBooks();
        const recommendationsContainer = document.getElementById('recommendationsContainer');

        if (recommendations && recommendations.length > 0) {
            const filteredRecs = recommendations.filter(book => book.id != bookId).slice(0, 5);
            console.log(`Filtered recommendations: ${filteredRecs.length} books`);

            recommendationsContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p class="mt-2 text-secondary-text dark:text-gray-400">Loading recommendations...</p>
                </div>
            `;

            const recommendationPromises = filteredRecs.map(async (book) => {
                const coverUrl = await getRecommendationCover(book);
                console.log(`Final cover for "${book.title}": ${coverUrl || 'Using fallback'}`);

                return `
                    <div class="flex flex-col gap-2 group cursor-pointer" onclick="openBookPage(${book.id})">
                        <div class="w-full aspect-[2/3] rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105 flex items-center justify-center text-white text-4xl font-bold overflow-hidden ${
                            coverUrl ? 'bg-cover bg-center' : 'bg-gradient-to-br from-primary to-blue-600'
                        }"
                             style="${coverUrl ? `background-image: url('${coverUrl}')` : ''}"
                             onerror="this.style.backgroundImage=''; this.classList.remove('bg-cover', 'bg-center'); this.classList.add('bg-gradient-to-br', 'from-primary', 'to-blue-600'); this.innerHTML='${book.title.charAt(0).toUpperCase()}'">
                            ${coverUrl ? '' : book.title.charAt(0).toUpperCase()}
                        </div>
                        <h3 class="font-bold text-sm truncate text-neutral-text dark:text-neutral-text-dark mt-2">${book.title}</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">${book.author}</p>
                        <p class="text-sm font-bold text-primary-alt dark:text-primary">$${book.price || '0.00'}</p>
                    </div>
                `;
            });

            const recommendationElements = await Promise.all(recommendationPromises);
            recommendationsContainer.innerHTML = recommendationElements.join('');

            console.log('Recommendations loaded successfully');
        } else {
            recommendationsContainer.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">No recommendations available</p>';
        }
    } catch (error) {
        console.error('Error loading recommendations:', error);
        document.getElementById('recommendationsContainer').innerHTML =
            '<p class="text-gray-500 col-span-full text-center py-8">Error loading recommendations</p>';
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

let reviewModal = null;

function openReviewModal() {
    if (!apiService.token) {
        showNotification('Please login to write a review', 'error');
        return;
    }

    createReviewModal();
    reviewModal.showModal();
}

function createReviewModal() {
    if (reviewModal) {
        reviewModal.remove();
    }

    reviewModal = document.createElement('dialog');
    reviewModal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm';
    reviewModal.innerHTML = `
        <div class="bg-white dark:bg-background-dark rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-scale-in">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-neutral-text dark:text-neutral-text-dark">Write a Review</h3>
                <button onclick="closeReviewModal()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <form id="reviewForm" class="space-y-4">
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-neutral-text dark:text-neutral-text-dark">Rating</label>
                    <div class="flex space-x-1" id="ratingStars">
                        ${[1,2,3,4,5].map(i => `
                            <button type="button"
                                    class="text-2xl transition-colors duration-200"
                                    data-rating="${i}"
                                    onclick="setRating(${i})">
                                <span class="material-symbols-outlined text-gray-300 dark:text-gray-600 hover:text-yellow-400">star</span>
                            </button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="selectedRating" name="rating" value="0" required>
                </div>

                <div class="space-y-2">
                    <label for="reviewComment" class="block text-sm font-medium text-neutral-text dark:text-neutral-text-dark">Your Review</label>
                    <textarea
                        id="reviewComment"
                        name="comment"
                        rows="4"
                        class="w-full px-3 py-2 border border-neutral-border dark:border-white/20 rounded-lg bg-white dark:bg-background-dark/50 text-neutral-text dark:text-neutral-text-dark placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-alt dark:focus:ring-primary focus:border-transparent resize-none"
                        placeholder="Share your thoughts about this book..."
                        maxlength="500"
                        required></textarea>
                    <div class="text-xs text-gray-500 dark:text-gray-400 text-right">
                        <span id="charCount">0</span>/500 characters
                    </div>
                </div>

                <div class="flex space-x-3 pt-4">
                    <button type="button" onclick="closeReviewModal()" class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" id="submitReviewBtn" class="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-alt dark:bg-primary rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        Submit Review
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(reviewModal);

    document.getElementById('reviewComment').addEventListener('input', updateCharCount);
    document.getElementById('reviewForm').addEventListener('submit', submitReview);
}

function setRating(rating) {
    const stars = document.querySelectorAll('#ratingStars button');
    const selectedRatingInput = document.getElementById('selectedRating');

    stars.forEach((star, index) => {
        const icon = star.querySelector('.material-symbols-outlined');
        if (index < rating) {
            icon.textContent = 'star';
            icon.classList.remove('text-gray-300', 'dark:text-gray-600');
            icon.classList.add('text-yellow-500');
        } else {
            icon.textContent = 'star';
            icon.classList.remove('text-yellow-500');
            icon.classList.add('text-gray-300', 'dark:text-gray-600');
        }
    });

    selectedRatingInput.value = rating;
    updateSubmitButton();
}

function updateCharCount() {
    const textarea = document.getElementById('reviewComment');
    const charCount = document.getElementById('charCount');
    charCount.textContent = textarea.value.length;
    updateSubmitButton();
}

function updateSubmitButton() {
    const rating = parseInt(document.getElementById('selectedRating').value);
    const comment = document.getElementById('reviewComment').value.trim();
    const submitBtn = document.getElementById('submitReviewBtn');

    submitBtn.disabled = !(rating > 0 && comment.length > 0 && comment.length <= 500);
}

function closeReviewModal() {
    if (reviewModal) {
        reviewModal.remove();
        reviewModal = null;
    }
}

async function submitReview(event) {
    event.preventDefault();

    const rating = parseInt(document.getElementById('selectedRating').value);
    const comment = document.getElementById('reviewComment').value.trim();
    const submitBtn = document.getElementById('submitReviewBtn');

    if (!rating || !comment) {
        showNotification('Please provide both rating and comment', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        Submitting...
    `;

    try {
        const reviewData = {
            rating: rating,
            comment: comment
        };

        const response = await apiService.addReview(currentBookId, reviewData);

        console.log('Review submitted successfully:', response);
        showNotification('Review submitted successfully!', 'success');
        closeReviewModal();

        await loadReviews(currentBookId);

        await updateBookRating();

    } catch (error) {
        console.error('Error submitting review:', error);

        if (error.message.includes('401') || error.message.includes('403')) {
            showNotification('Authentication failed. Please log in again.', 'error');
        } else if (error.message.includes('400')) {
            showNotification('Invalid review data. Please check your input.', 'error');
        } else if (error.message.includes('409')) {
            showNotification('You have already reviewed this book.', 'error');
        } else {
            showNotification('Failed to submit review. Please try again.', 'error');
        }

        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Review';
    }
}

async function updateBookRating() {
    try {
        const updatedBook = await apiService.getBookById(currentBookId);

        const ratingSection = document.getElementById('ratingSection');
        if (updatedBook.rating && updatedBook.rating > 0) {
            const stars = generateStarRating(updatedBook.rating);
            ratingSection.innerHTML = `
                <div class="flex text-yellow-500">
                    ${stars}
                </div>
                <p class="text-gray-600 dark:text-gray-400 text-sm font-medium">${updatedBook.rating.toFixed(2)} ${updatedBook.reviewCount ? `(${updatedBook.reviewCount} ratings)` : ''}</p>
            `;
        }
    } catch (error) {
        console.error('Error updating book rating:', error);
    }
}

document.addEventListener('click', function(event) {
    if (reviewModal && event.target === reviewModal) {
        closeReviewModal();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && reviewModal) {
        closeReviewModal();
    }
});

function showLoadingState() {
    document.getElementById('bookTitle').textContent = 'Loading...';
    document.getElementById('bookAuthor').textContent = 'by Loading...';
    document.getElementById('bookPrice').textContent = '$...';
    document.getElementById('bookDescription').textContent = 'Loading book details...';

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