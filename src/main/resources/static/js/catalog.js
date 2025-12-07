const grid = document.querySelector('#book-grid');
const searchInput = document.querySelector('#search');
const sortSelect = document.querySelector('#sort');
const paginationContainer = document.querySelector('#pagination');

let currentPage = 1;
let totalPages = 1;
let currentFilters = { genres: [], authors: [], formats: [] };
let currentSearch = '';
let currentSort = '';
let priceFilter = { min: 0, max: 100 };

const genresContainer = document.getElementById('genres');
const authorsContainer = document.getElementById('authors');
const formatsContainer = document.getElementById('formats');
const priceSlider = document.getElementById('price-slider');
const priceValue = document.getElementById('price-value');

document.addEventListener('DOMContentLoaded', function() {
     updateAuthUI();
});

async function loadBooks() {
    try {
        const books = await apiService.getBooks();

        if (!genresContainer.dataset.loaded) await loadFilters(books);

        if (!priceSlider.dataset.loaded) {
            const maxPrice = Math.max(...books.map(b => parseFloat(b.price) || 0), 100);
            priceSlider.max = Math.ceil(maxPrice);
            priceSlider.value = priceSlider.max;
            priceValue.textContent = `0–${priceSlider.value} $`;
            priceFilter.max = parseFloat(priceSlider.value);
            priceSlider.dataset.loaded = 'true';
        }

        const booksWithMedia = await Promise.all(
            books.map(async book => {
        const image = await getBookCover(book);
                const type = book.type ? book.type.toLowerCase() : 'physical';
                const rating = book.rating !== undefined ? book.rating : await calculateBookRating(book);
                return { ...book, image, type, rating, price: parseFloat(book.price) || 0 };
            })
        );

        let filtered = applyFilters(booksWithMedia);

        if (currentSearch) {
            const s = currentSearch.toLowerCase();
            filtered = filtered.filter(b =>
                (b.title && b.title.toLowerCase().includes(s)) ||
                (b.author && b.author.toLowerCase().includes(s))
            );
        }

        filtered = applySort(filtered);

        const pageSize = 8;
        totalPages = Math.ceil(filtered.length / pageSize);
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const pagedBooks = filtered.slice(start, end);

        renderBooks(pagedBooks);
        renderPagination();

    } catch (e) {
        console.error('Error loading books:', e);
        grid.innerHTML = `<p class="col-span-full text-center text-text-light">Не удалось загрузить книги</p>`;
    }
}

async function loadFilters(books) {
    const genres = [...new Set(books.map(b => b.genre).filter(Boolean))];
    const authors = [...new Set(books.map(b => b.author).filter(Boolean))];
    const formats = ['physical', 'electronic'];

    createFilter(genresContainer, 'genres', genres);
    createFilter(authorsContainer, 'authors', authors);
    createFilter(formatsContainer, 'formats', formats, true);
    genresContainer.dataset.loaded = true;
}

function createFilter(container, key, options, toLower=false) {
    container.innerHTML = '';
    options.forEach((item, i) => container.appendChild(createCheckbox(item, key, i, toLower)));
    setupSingleSelect(container, key, toLower);
}

function createCheckbox(label, key, index, toLower=false) {
    const id = `${key}-${index}`;
    const value = label;
    const displayLabel = key === 'formats' ? (label === 'electronic' ? 'Электронная' : 'Печатная') : label;

    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center';
    wrapper.innerHTML = `
        <input class="h-4 w-4 rounded border-border-light text-primary" type="checkbox" id="${id}" data-value="${value}" />
        <label class="ml-2 text-sm text-text-light" for="${id}">${displayLabel}</label>
    `;
    return wrapper;
}

function setupSingleSelect(container, key, toLower=false) {
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(ch => {
        ch.addEventListener('change', () => {
            if (ch.checked) checkboxes.forEach(other => { if (other !== ch) other.checked = false; });

            currentFilters[key] = Array.from(checkboxes)
                .filter(c => c.checked)
                .map(c => toLower ? c.dataset.value.toLowerCase() : c.dataset.value);

            currentPage = 1;
            loadBooks();
        });
    });
}

function applyFilters(books) {
    let filtered = [...books];
    if (currentFilters.genres.length) filtered = filtered.filter(b => currentFilters.genres.includes(b.genre));
    if (currentFilters.authors.length) filtered = filtered.filter(b => currentFilters.authors.includes(b.author));
    if (currentFilters.formats.length) filtered = filtered.filter(b => currentFilters.formats.includes(b.type));
    filtered = filtered.filter(b => b.price >= priceFilter.min && b.price <= priceFilter.max);
    return filtered;
}

function applySort(books) {
    if (!currentSort || currentSort === 'popularity') return books;
    const sorted = [...books];
    switch(currentSort) {
        case 'priceAsc': sorted.sort((a,b)=>a.price-b.price); break;
        case 'priceDesc': sorted.sort((a,b)=>b.price-a.price); break;
        case 'rating': sorted.sort((a,b)=> (b.rating||0) - (a.rating||0)); break;
    }
    return sorted;
}

priceSlider.addEventListener('input', () => {
    priceFilter.max = parseFloat(priceSlider.value);
    priceValue.textContent = `0–${priceSlider.value} $`;
    currentPage = 1;
    loadBooks();
});

function renderBooks(books) {
    grid.innerHTML = '';
    if (!books.length) {
        grid.innerHTML = `<p class="col-span-full text-center text-text-light">Книги не найдены</p>`;
        return;
    }

    books.forEach(book => {
        const displayType = book.type === 'electronic' ? 'Электронная' : 'Печатная';
        const typeClasses = 'bg-secondary text-text-light';

        const html = `
        <div class="book-card group relative flex flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-lg max-h-[500px]" data-id="${book.id}">
            <div class="aspect-[3/4] overflow-hidden relative">
                <img class="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105" src="${book.image || 'redirect:https://via.placeholder.com/120x160/522B47/F1F0EA?text=cover'}" alt="${book.title}" />
                <div class="absolute top-2 right-2 z-10">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeClasses}">
                        ${displayType}
                    </span>
                </div>
            </div>
            <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 z-10">
                <button class="add-to-cart flex items-center justify-center h-12 w-12 rounded-full bg-white/90 text-primary hover:bg-white backdrop-blur-sm transition-colors" data-id="${book.id}">
                    <span class="material-symbols-outlined text-2xl">add_shopping_cart</span>
                </button>
                <button class="add-to-wishlist flex items-center justify-center h-12 w-12 rounded-full bg-white/90 text-gray-700 hover:bg-white backdrop-blur-sm transition-colors" data-id="${book.id}">
                    <span class="material-symbols-outlined text-2xl">favorite</span>
                </button>
            </div>
            <div class="flex flex-1 flex-col p-4">
                <h3 class="text-base font-bold text-[#101622] dark:text-white">${book.title}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">${book.author}</p>
                <div class="flex items-center mt-2 gap-1 text-amber-400">${renderStars(book.rating)}</div>
                <p class="mt-auto pt-2 text-lg font-bold text-primary">$${book.price.toFixed(2)}</p>
            </div>
        </div>`;
        grid.insertAdjacentHTML('beforeend', html);
    });

    document.querySelectorAll('.book-card').forEach(card => {
        card.addEventListener('click', e => {
            if (e.target.closest('.add-to-cart') || e.target.closest('.add-to-wishlist')) return;
            const bookId = card.dataset.id;
            openBookPage(bookId);
        });
    });

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', async e => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (!apiService.token) {
                showNotification('Войдите, чтобы добавлять товары в корзину', 'error');
                return;
            }
            try {
                await apiService.addToCart(id);
                showNotification('Книга добавлена в корзину!', 'success');
                if (typeof updateCartCounter === 'function') {
                    updateCartCounter();
                }
            } catch (error) {
                showNotification('Не удалось добавить книгу в корзину: ' + error.message, 'error');
            }
        });
    });

    document.querySelectorAll('.add-to-wishlist').forEach(btn => {
        btn.addEventListener('click', async e => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (!apiService.token) {
                showNotification('Войдите, чтобы управлять избранным', 'error');
                return;
            }
            try {
                const isInWishlist = await apiService.checkInWishlist(id);
                if (isInWishlist) {
                    await apiService.removeFromWishlist(id);
                    showNotification('Книга удалена из избранного', 'success');
                } else {
                    await apiService.addToWishlist(id);
                    showNotification('Книга добавлена в избранное!', 'success');
                }
            } catch (error) {
                showNotification('Не удалось обновить избранное: ' + error.message, 'error');
            }
        });
    });
}

function openBookPage(bookId) {
    window.location.href = `/pages/book.html?id=${bookId}`;
}

function renderStars(rating=0) {
    let stars = '';
    for (let i=1;i<=5;i++){
        if (rating>=i) stars+=`<span class="material-symbols-outlined !text-base">star</span>`;
        else if (rating>=i-0.5) stars+=`<span class="material-symbols-outlined !text-base">star_half</span>`;
        else stars+=`<span class="material-symbols-outlined !text-base text-gray-300">star</span>`;
    }
    return stars;
}

function renderPagination() {
    if(!paginationContainer) return;
    paginationContainer.innerHTML='';
    const createBtn = (num, active=false)=>`<a class="inline-flex items-center justify-center h-9 w-9 text-sm font-medium ${active?'bg-primary text-white':'text-gray-500 hover:bg-gray-200 rounded-lg'}" href="#" data-page="${num}">${num}</a>`;
    for(let i=1;i<=totalPages;i++) paginationContainer.insertAdjacentHTML('beforeend', createBtn(i,i===currentPage));
    paginationContainer.querySelectorAll('a[data-page]').forEach(btn=>{
        btn.addEventListener('click', e=>{
            e.preventDefault();
            currentPage = parseInt(btn.dataset.page);
            loadBooks();
        });
    });
}

async function getBookCover(book){
    if(book.media && book.media.length>0){
        const cover = findCoverMedia(book.media);
        if(cover && (cover.fileUrl || cover.url)) return cover.fileUrl || cover.url;
    }
    try{
        const mediaList = await apiService.getBookMedia(book.id);
        const cover = findCoverMedia(mediaList);
        if(cover && (cover.fileUrl || cover.url)) return cover.fileUrl || cover.url;
    }catch(e){ }
    return "redirect:https://via.placeholder.com/120x160/4F46E5/FFFFFF?text=cover";
}

function findCoverMedia(mediaList){
    let cover = mediaList.find(m => m.fileType && m.fileType.toLowerCase() === 'image');
    if(!cover) cover = mediaList.find(m => /\.(jpg|jpeg|png|gif|webp)$/i.test(m.fileUrl||m.url||''));
    if(!cover && mediaList.length) cover = mediaList[0];
    return cover;
}

async function calculateBookRating(book){
    if(book.rating!==undefined && book.rating!==null) return book.rating;
    if(book.reviews && book.reviews.length>0){
        const sum = book.reviews.reduce((total,r)=>total+(r.rating||0),0);
        return Math.round((sum/book.reviews.length)*10)/10;
    }
    try{
        const reviews = await apiService.getBookReviews(book.id);
        if(reviews && reviews.length>0){
            const sum = reviews.reduce((total,r)=>total+(r.rating||0),0);
            return Math.round((sum/reviews.length)*10)/10;
        }
    }catch(e){ }
    return 0.0;
}

searchInput.addEventListener('input', e => { currentSearch = searchInput.value; currentPage=1; loadBooks(); });
sortSelect.addEventListener('change', e => { currentSort = sortSelect.value; currentPage=1; loadBooks(); });

loadBooks();

