function loadBookManagementPage(container) {
    if (!container) {
        container = document.querySelector('main');
    }

    container.innerHTML = `
        <div class="p-8">
            <!-- PageHeading -->
            <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h1 class="text-text-light dark:text-text-dark text-3xl font-bold leading-tight tracking-tight">Управление книгами</h1>
                <button class="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-DEFAULT h-10 px-4 bg-secondary text-secondary-content text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90" onclick="openAddBookModal()">
                    <span class="material-symbols-outlined">add</span>
                    <span class="truncate">Добавить книгу</span>
                </button>
            </div>

            <div class="bg-content-light dark:bg-content-dark rounded-lg shadow-sm">
                <!-- SearchBar & Chips -->
                <div class="p-4 border-b border-border-light dark:border-border-dark">
                    <div class="flex flex-col gap-4">
                        <!-- Поиск -->
                        <div class="flex-1">
                            <label class="flex flex-col min-w-40 h-10 w-full">
                                <div class="flex w-full flex-1 items-stretch rounded-DEFAULT h-full">
                                    <div class="text-subtle-light dark:text-subtle-dark flex border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark items-center justify-center pl-3 rounded-l-DEFAULT border-r-0">
                                        <span class="material-symbols-outlined">search</span>
                                    </div>
                                    <input id="searchInput" class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-DEFAULT text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark h-full placeholder:text-subtle-light dark:placeholder:text-subtle-dark px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal" placeholder="Поиск по названию, автору или жанру..." value=""/>
                                </div>
                            </label>
                        </div>

                        <!-- Фильтры -->
                        <div class="filters-sticky bg-content-light dark:bg-content-dark">
                            <div class="flex flex-wrap items-center gap-3">
                                <!-- Genre Filter -->
                                <div class="relative">
                                    <button class="filter-toggle flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark pl-3 pr-3 text-subtle-light dark:text-subtle-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            data-target="genres">
                                        <span class="material-symbols-outlined text-base">filter_list</span>
                                        <p class="text-sm font-medium">Жанр</p>
                                        <span class="material-symbols-outlined text-base expand-icon">expand_more</span>
                                    </button>
                                    <div id="genres" class="filter-dropdown hidden absolute mt-2 bg-content-light border border-border-light rounded-lg p-3 shadow-lg w-48">
                                        <!-- Genres will be loaded dynamically -->
                                    </div>
                                </div>

                                <!-- Author Filter -->
                                <div class="relative">
                                    <button class="filter-toggle flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark pl-3 pr-3 text-subtle-light dark:text-subtle-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            data-target="authors">
                                        <span class="material-symbols-outlined text-base">filter_list</span>
                                        <p class="text-sm font-medium">Автор</p>
                                        <span class="material-symbols-outlined text-base expand-icon">expand_more</span>
                                    </button>
                                    <div id="authors" class="filter-dropdown hidden absolute mt-2 bg-content-light border border-border-light rounded-lg p-3 shadow-lg w-48">
                                        <!-- Authors will be loaded dynamically -->
                                    </div>
                                </div>

                                <!-- Format Filter -->
                                <div class="relative">
                                    <button class="filter-toggle flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark pl-3 pr-3 text-subtle-light dark:text-subtle-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            data-target="formats">
                                        <span class="material-symbols-outlined text-base">filter_list</span>
                                        <p class="text-sm font-medium">Формат</p>
                                        <span class="material-symbols-outlined text-base expand-icon">expand_more</span>
                                    </button>
                                    <div id="formats" class="filter-dropdown hidden absolute mt-2 bg-content-light border border-border-light rounded-lg p-3 shadow-lg w-48">
                                        <!-- Formats will be loaded dynamically -->
                                    </div>
                                </div>

                                <!-- Price Filter -->
                                <div class="relative">
                                    <button class="filter-toggle flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark pl-3 pr-3 text-subtle-light dark:text-subtle-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            data-target="price">
                                        <span class="material-symbols-outlined text-base">filter_list</span>
                                        <p class="text-sm font-medium">Цена</p>
                                        <span class="material-symbols-outlined text-base expand-icon">expand_more</span>
                                    </button>
                                    <div id="price" class="filter-dropdown hidden absolute mt-2 bg-content-light border border-border-light rounded-lg p-4 shadow-lg w-64">
                                        <div class="mb-2">
                                            <span id="price-value" class="text-sm font-medium text-text-light dark:text-text-dark">$0 - $100</span>
                                        </div>
                                        <input type="range" id="price-slider" min="0" max="100" value="100"
                                               class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
                                    </div>
                                </div>

                                <!-- Reset Filters Button -->
                                <button class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark px-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        onclick="resetFilters()">
                                    <span class="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-xl">restart_alt</span>
                                    <p class="text-subtle-light dark:text-subtle-dark text-sm font-medium">Сбросить фильтры</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Table -->
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-subtle-light dark:text-subtle-dark uppercase bg-background-light dark:bg-background-dark">
                        <tr>
                            <th class="p-4" scope="col">
                                <input id="selectAll" class="h-4 w-4 rounded border-border-light dark:border-border-dark bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-2 focus:ring-offset-0 focus:ring-primary/50" type="checkbox"/>
                            </th>
                            <th class="px-4 py-3" scope="col">Обложка</th>
                            <th class="px-4 py-3 min-w-64" scope="col">Название</th>
                            <th class="px-4 py-3 min-w-40" scope="col">Автор</th>
                            <th class="px-4 py-3" scope="col">Жанр</th>
                            <th class="px-4 py-3" scope="col">Тип</th>
                            <th class="px-4 py-3" scope="col">Цена</th>
                            
                            <th class="px-4 py-3 text-right" scope="col">Действия</th>
                        </tr>
                        </thead>
                        <tbody id="booksTableBody">
                        <!-- Books will be loaded dynamically -->
                        </tbody>
                    </table>
                </div>

                <!-- Loading State -->
                <div id="loadingState" class="p-8 text-center">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p class="mt-2 text-subtle-light dark:text-subtle-dark">Загрузка книг...</p>
                </div>

                <!-- Empty State -->
                <div id="emptyState" class="hidden p-8 text-center">
                    <span class="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4">menu_book</span>
                    <h3 class="text-lg font-medium text-text-light dark:text-text-dark mb-2">Книги не найдены</h3>
                    <p class="text-subtle-light dark:text-subtle-dark mb-4">Добавьте первую книгу в каталог.</p>
                    <button class="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-DEFAULT h-10 px-4 bg-secondary text-secondary-content text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90" onclick="openAddBookModal()">
                        <span class="material-symbols-outlined">add</span>
                        <span class="truncate">Добавить книгу</span>
                    </button>
                </div>

                <!-- Pagination -->
                <div class="hidden flex items-center justify-between p-4 border-t border-border-light dark:border-border-dark" id="paginationContainer">
                    <span class="text-sm text-subtle-light dark:text-subtle-dark">Показано <span class="font-semibold text-text-light dark:text-text-dark" id="showingRange">1-0</span> из <span class="font-semibold text-text-light dark:text-text-dark" id="totalBooks">0</span></span>
                    <div class="flex items-center gap-2">
                        <button class="flex items-center justify-center px-3 h-8 text-sm font-medium border rounded-DEFAULT bg-content-light dark:bg-content-dark border-border-light dark:border-border-dark text-subtle-light dark:text-subtle-dark hover:bg-background-light dark:hover:bg-background-dark" onclick="previousPage()">Предыдущая</button>
                        <button class="flex items-center justify-center px-3 h-8 text-sm font-medium border rounded-DEFAULT bg-content-light dark:bg-content-dark border-border-light dark:border-border-dark text-subtle-light dark:text-subtle-dark hover:bg-background-light dark:hover:bg-background-dark" onclick="nextPage()">Следующая</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Book Modal -->
        <div id="addBookModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-content-light dark:bg-content-dark rounded-lg w-full max-w-md mx-4">
                <div class="flex justify-between items-center p-4 border-b border-border-light dark:border-border-dark">
                    <h3 class="text-lg font-bold text-text-light dark:text-text-dark">Добавить книгу</h3>
                    <button onclick="closeAddBookModal()" class="text-subtle-light dark:text-subtle-dark hover:text-text-light dark:hover:text-text-dark">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form id="addBookForm" class="p-4 space-y-3">
                    <div class="grid grid-cols-1 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-1">URL изображения обложки</label>
                            <input type="url" name="imageUrl"
                                   class="w-full rounded-DEFAULT border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark"
                                   placeholder="https://example.com/book-cover.jpg">
                            <p class="text-xs text-subtle-light dark:text-subtle-dark mt-1">Необязательно: Укажите URL изображения обложки книги</p>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Название *</label>
                            <input type="text" name="title" required
                                   class="w-full rounded-DEFAULT border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Автор *</label>
                            <input type="text" name="author" required
                                   class="w-full rounded-DEFAULT border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Жанр *</label>
                            <input type="text" name="genre" required
                                   class="w-full rounded-DEFAULT border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Цена *</label>
                            <input type="number" step="0.01" min="0" name="price" required
                                   class="w-full rounded-DEFAULT border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Тип *</label>
                            <select name="type" required
                                    class="w-full rounded-DEFAULT border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark">
                                <option value="PHYSICAL">Печатная</option>
                                <option value="ELECTRONIC">Электронная</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Описание</label>
                            <textarea name="description" rows="3"
                                      class="w-full rounded-DEFAULT border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark"
                                      placeholder="Введите описание книги..."></textarea>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                        <button type="button" onclick="closeAddBookModal()"
                                class="px-4 py-2 text-subtle-light dark:text-subtle-dark hover:text-text-light dark:hover:text-text-dark transition-colors">Отмена</button>
                        <button type="submit"
                                class="px-4 py-2 bg-primary text-white rounded-DEFAULT hover:opacity-90 transition-opacity">Добавить книгу</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    initializeBookManagement();
    loadBooks();
}

function initializeBookManagement() {
    setupBooksEventListeners();
}

function setupBooksEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            currentSearch = searchInput.value;
            currentBookPage = 1;
            filterAndDisplayBooks();
        }, 300));
    }

    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.addEventListener('change', toggleSelectAll);
    }

    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
        addBookForm.addEventListener('submit', handleAddBook);
    }

    const priceSlider = document.getElementById('price-slider');
    const priceValue = document.getElementById('price-value');
    if (priceSlider) {
        priceSlider.addEventListener('input', () => {
            priceFilter.max = parseFloat(priceSlider.value);
            if (priceValue) {
                priceValue.textContent = `0–${priceSlider.value} $`;
            }
            currentBookPage = 1;
            filterAndDisplayBooks();
        });
    }

    setupFilterDropdowns();

    document.addEventListener('click', closeAllFilters);
}

function setupFilterDropdowns() {
    const filterToggles = document.querySelectorAll('.filter-toggle');

    filterToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetId = toggle.dataset.target;
            const dropdown = document.getElementById(targetId);
            if (!dropdown) return;

            const isOpen = !dropdown.classList.contains('hidden');

            closeAllFilters();

            if (!isOpen) {
                dropdown.classList.remove('hidden');
                toggle.classList.add('bg-primary/10', 'text-primary');

                const icon = toggle.querySelector('.expand-icon');
                if (icon) {
                    icon.textContent = 'expand_less';
                }
            }
        });
    });
}

function closeAllFilters() {
    const dropdowns = document.querySelectorAll('.filter-dropdown');
    const toggles = document.querySelectorAll('.filter-toggle');

    dropdowns.forEach(dropdown => {
        dropdown.classList.add('hidden');
    });

    toggles.forEach(toggle => {
        toggle.classList.remove('bg-primary/10', 'text-primary');
        const icon = toggle.querySelector('.expand-icon');
        if (icon) {
            icon.textContent = 'expand_more';
        }
    });
}

async function loadBooks() {
    try {
        showLoadingState();

        const books = await apiService.getBooks();
        allBooks = books;

        await loadFilters(books);

        const priceSlider = document.getElementById('price-slider');
        const priceValue = document.getElementById('price-value');
        if (priceSlider && !priceSlider.dataset.loaded) {
            const maxPrice = Math.max(...books.map(b => parseFloat(b.price) || 0), 100);
            priceSlider.max = Math.ceil(maxPrice);
            priceSlider.value = priceSlider.max;
            if (priceValue) {
                priceValue.textContent = `$0 - $${priceSlider.value}`;
            }
            priceFilter.max = parseFloat(priceSlider.value);
            priceSlider.dataset.loaded = 'true';
        }

        filterAndDisplayBooks();

    } catch (error) {
        console.error('Error loading books:', error);
        showError('Не удалось загрузить книги');
    }
}

async function loadFilters(books) {
    const genresContainer = document.getElementById('genres');
    if (genresContainer && genresContainer.dataset.loaded) return;

    const genres = [...new Set(books.map(b => b.genre).filter(Boolean))];
    const authors = [...new Set(books.map(b => b.author).filter(Boolean))];
    const formats = ['PHYSICAL', 'ELECTRONIC'];

    if (genresContainer) createFilter(genresContainer, 'genres', genres);

    const authorsContainer = document.getElementById('authors');
    if (authorsContainer) createFilter(authorsContainer, 'authors', authors);

    const formatsContainer = document.getElementById('formats');
    if (formatsContainer) createFilter(formatsContainer, 'formats', formats, true);

    if (genresContainer) genresContainer.dataset.loaded = true;
}

function createFilter(container, key, options, toLower = false) {
    if (!container) return;

    container.innerHTML = '';

    if (options.length === 0) {
        container.innerHTML = '<p class="text-sm text-subtle-light">Нет доступных вариантов</p>';
        return;
    }

    const visibleOptions = options;
    const hiddenOptions = [];

    const allWrapper = document.createElement('div');
    allWrapper.className = 'flex items-center mb-2';
    allWrapper.innerHTML = `
        <input class="filter-checkbox h-4 w-4 rounded border-border-light text-primary bg-transparent"
               type="checkbox" id="${key}-all" data-value="all" />
        <label class="ml-2 text-sm text-text-light cursor-pointer" for="${key}-all">Все</label>
    `;
    container.appendChild(allWrapper);

    visibleOptions.forEach((item, i) => {
        const checkbox = createCheckbox(item, key, i, toLower);
        if (checkbox) container.appendChild(checkbox);
    });

    if (hiddenOptions.length) {
        const hiddenContainer = document.createElement('div');
        hiddenContainer.id = `${key}-hidden`;
        hiddenContainer.className = '';
        hiddenOptions.forEach((item, i) => {
            const checkbox = createCheckbox(item, key, i + 5, toLower);
            if (checkbox) hiddenContainer.appendChild(checkbox);
        });
        container.appendChild(hiddenContainer);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = 'Показать меньше';
        btn.className = 'text-sm text-primary underline mt-2 hover:no-underline';
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = hiddenContainer.classList.contains('hidden');
            hiddenContainer.classList.toggle('hidden');
            btn.textContent = isHidden ? 'Показать меньше' : 'Показать больше';
        });
        container.appendChild(btn);
    }

    setupFilterCheckboxes(container, key, toLower);
}

function createCheckbox(label, key, index, toLower = false) {
    const id = `${key}-${index}`;
    const value = toLower ? label.toLowerCase() : label;
    const displayLabel = key === 'formats' ?
        (label === 'ELECTRONIC' ? 'Электронная' : 'Печатная') :
        label;

    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center mb-2';
    wrapper.innerHTML = `
        <input class="filter-checkbox h-4 w-4 rounded border-border-light text-primary bg-transparent" type="checkbox" id="${id}" data-value="${value}" />
        <label class="ml-2 text-sm text-text-light cursor-pointer truncate" for="${id}" title="${displayLabel}">${displayLabel}</label>
    `;
    return wrapper;
}

function setupFilterCheckboxes(container, key, toLower = false) {
    const checkboxes = container.querySelectorAll('.filter-checkbox');

    checkboxes.forEach(ch => {
        ch.addEventListener('change', (e) => {
            e.stopPropagation();

            if (ch.dataset.value === 'all') {
                if (ch.checked) {
                    checkboxes.forEach(other => {
                        if (other !== ch) other.checked = false;
                    });
                }
            } else {
                const allCheckbox = container.querySelector('[data-value="all"]');
                if (allCheckbox) allCheckbox.checked = false;

                if (ch.checked) {
                    checkboxes.forEach(other => {
                        if (other !== ch && other.dataset.value !== 'all') {
                            other.checked = false;
                        }
                    });
                }
            }

            updateCurrentFilters(key, container, toLower);
            currentBookPage = 1;
            filterAndDisplayBooks();
        });
    });
}

function updateCurrentFilters(key, container, toLower = false) {
    const checkboxes = container.querySelectorAll('.filter-checkbox');
    const checkedBoxes = Array.from(checkboxes).filter(c => c.checked);

    if (checkedBoxes.length === 0 || checkedBoxes.some(c => c.dataset.value === 'all')) {
        currentFilters[key] = [];
    } else {
        currentFilters[key] = checkedBoxes
            .filter(c => c.dataset.value !== 'all')
            .map(c => toLower ? c.dataset.value.toLowerCase() : c.dataset.value);
    }
}

function filterAndDisplayBooks() {
    let filtered = applyFilters(allBooks);

    if (currentSearch) {
        const s = currentSearch.toLowerCase();
        filtered = filtered.filter(b =>
            (b.title && b.title.toLowerCase().includes(s)) ||
            (b.author && b.author.toLowerCase().includes(s)) ||
            (b.genre && b.genre.toLowerCase().includes(s))
        );
    }

    filtered = applySort(filtered);
    filteredBooks = filtered;

    displayBooks();
    updatePagination();
}

function applyFilters(books) {
    let filtered = [...books];

    if (currentFilters.genres.length) {
        filtered = filtered.filter(b => currentFilters.genres.includes(b.genre));
    }
    if (currentFilters.authors.length) {
        filtered = filtered.filter(b => currentFilters.authors.includes(b.author));
    }
    if (currentFilters.formats.length) {
        filtered = filtered.filter(b => currentFilters.formats.includes(b.type));
    }

    filtered = filtered.filter(b => {
        const price = parseFloat(b.price) || 0;
        return price >= priceFilter.min && price <= priceFilter.max;
    });

    return filtered;
}

function applySort(books) {
    if (!currentSort) return books;

    const sorted = [...books];
    switch(currentSort) {
        case 'priceAsc':
            sorted.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
            break;
        case 'priceDesc':
            sorted.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
            break;
        case 'popularity':
            sorted.sort((a, b) => (b.timesAddedToCart || 0) - (a.timesAddedToCart || 0));
            break;
        case 'titleAsc':
            sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
            break;
        case 'titleDesc':
            sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
            break;
    }
    return sorted;
}

async function displayBooks() {
    const tableBody = document.getElementById('booksTableBody');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const paginationContainer = document.getElementById('paginationContainer');

    if (!tableBody) return;

    if (filteredBooks.length === 0) {
        tableBody.innerHTML = '';
        if (loadingState) loadingState.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
        if (paginationContainer) paginationContainer.classList.add('hidden');
        return;
    }

    const startIndex = (currentBookPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const booksToShow = filteredBooks.slice(startIndex, endIndex);

    const booksWithCovers = await Promise.all(
        booksToShow.map(async book => ({
            ...book,
            coverStyle: await getBookCoverStyle(book)
        }))
    );

    tableBody.innerHTML = booksWithCovers.map(book => `
        <tr class="border-b border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark">
            <td class="p-4">
                <input class="book-checkbox h-4 w-4 rounded border-border-light dark:border-border-dark bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-2 focus:ring-offset-0 focus:ring-primary/50"
                       type="checkbox" value="${book.id}"/>
            </td>
            <td class="px-4 py-2">
                <div class="w-10 h-10 rounded-full bg-cover bg-center flex items-center justify-center text-white text-sm font-bold bg-primary"
                     style="${book.coverStyle}">
                    ${book.coverStyle ? '' : book.title.charAt(0).toUpperCase()}
                </div>
            </td>
            <td class="px-4 py-2 font-medium text-text-light dark:text-text-dark">
                <div class="max-w-48">
                    <p class="line-clamp-2" title="${book.title}">${book.title}</p>
                    ${book.description ? `<p class="text-xs text-subtle-light dark:text-subtle-dark line-clamp-2 mt-1" title="${book.description}">${book.description}</p>` : ''}
                </div>
            </td>
            <td class="px-4 py-2 text-subtle-light dark:text-subtle-dark">${book.author || 'Неизвестен'}</td>
            <td class="px-4 py-2 text-subtle-light dark:text-subtle-dark">${book.genre || 'Не указан'}</td>
            <td class="px-4 py-2">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-text-light">
                    ${book.type === 'electronic' ? 'Электронная' : 'Печатная'}
                </span>
            </td>
            <td class="px-4 py-2 text-subtle-light dark:text-subtle-dark">$${(parseFloat(book.price) || 0).toFixed(2)}</td>
            <td class="px-4 py-2 text-right">
                <div class="flex justify-end gap-2">
                    <button class="flex items-center justify-center size-8 rounded-full bg-primary/20 text-primary hover:bg-primary/30" onclick="editBook(${book.id})">
                        <span class="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button class="flex items-center justify-center size-8 rounded-full bg-destructive/20 text-destructive hover:bg-destructive/30" onclick="deleteBook(${book.id})">
                        <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    if (loadingState) loadingState.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    if (paginationContainer) paginationContainer.classList.remove('hidden');
}

async function getBookCoverStyle(book) {
    if (book.media && book.media.length > 0) {
        const coverMedia = findCoverMedia(book.media);
        if (coverMedia && coverMedia.fileUrl) {
            return `background-image: url('${coverMedia.fileUrl}')`;
        }
    }

    try {
        const mediaList = await apiService.getBookMedia(book.id);
        if (mediaList && mediaList.length > 0) {
            const coverMedia = findCoverMedia(mediaList);
            if (coverMedia && coverMedia.fileUrl) {
                return `background-image: url('${coverMedia.fileUrl}')`;
            }
        }
    } catch (error) {
        
    }

    return '';
}

function findCoverMedia(mediaList) {
    if (!mediaList || mediaList.length === 0) return null;

    let coverMedia = mediaList.find(media =>
        media.fileType && media.fileType.toLowerCase().includes('image')
    );

    if (!coverMedia) {
        coverMedia = mediaList.find(media =>
            media.fileUrl && media.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        );
    }

    return coverMedia || mediaList[0];
}

function getStatusClass(book) {
    const inCart = book.timesAddedToCart || 0;
    if (inCart > 10) return 'bg-secondary text-text-light';
    if (inCart > 0) return 'bg-secondary/20 text-text-light';
    return 'bg-background-light text-text-light';
}

function getStatusText(book) {
    const inCart = book.timesAddedToCart || 0;
    if (inCart > 10) return 'Популярно';
    if (inCart > 0) return 'Активно';
    return 'Новинка';
}

function updatePagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    const showingRange = document.getElementById('showingRange');
    const totalBooks = document.getElementById('totalBooks');

    if (!paginationContainer || !showingRange || !totalBooks) return;

    const total = filteredBooks.length;
    const startIndex = (currentBookPage - 1) * booksPerPage + 1;
    const endIndex = Math.min(startIndex + booksPerPage - 1, total);

    showingRange.textContent = `${startIndex}-${endIndex}`;
    totalBooks.textContent = total;

    const totalPages = Math.ceil(total / booksPerPage);
    const paginationButtons = paginationContainer.querySelector('div:last-child');
    if (!paginationButtons) return;

    paginationButtons.innerHTML = '';

    if (totalPages > 1) {
        paginationButtons.innerHTML += `
            <button class="flex items-center justify-center h-8 w-8 rounded-md border border-border-light dark:border-border-dark text-subtle-light dark:text-subtle-dark hover:bg-background-light dark:hover:bg-background-dark" onclick="previousPage()">
                <span class="material-symbols-outlined text-lg">chevron_left</span>
            </button>
        `;

        paginationButtons.innerHTML += `
            <button class="flex h-8 w-8 items-center justify-center rounded-md border ${currentBookPage === 1 ? 'border-primary bg-primary/10 text-primary' : 'border-border-light dark:border-border-dark text-subtle-light dark:text-subtle-dark hover:bg-background-light dark:hover:bg-background-dark'}"
                    onclick="goToBookPage(1)">1</button>
        `;

        if (currentBookPage > 3) {
            paginationButtons.innerHTML += `<span class="px-2 text-subtle-light dark:text-subtle-dark">...</span>`;
        }

        for (let i = Math.max(2, currentBookPage - 1); i <= Math.min(totalPages - 1, currentBookPage + 1); i++) {
            if (i !== 1 && i !== totalPages) {
                paginationButtons.innerHTML += `
                    <button class="flex h-8 w-8 items-center justify-center rounded-md border ${currentBookPage === i ? 'border-primary bg-primary/10 text-primary' : 'border-border-light dark:border-border-dark text-subtle-light dark:text-subtle-dark hover:bg-background-light dark:hover:bg-background-dark'}"
                            onclick="goToBookPage(${i})">${i}</button>
                `;
            }
        }

        if (currentBookPage < totalPages - 2) {
            paginationButtons.innerHTML += `<span class="px-2 text-subtle-light dark:text-subtle-dark">...</span>`;
        }

        if (totalPages > 1) {
            paginationButtons.innerHTML += `
                <button class="flex h-8 w-8 items-center justify-center rounded-md border ${currentBookPage === totalPages ? 'border-primary bg-primary/10 text-primary' : 'border-border-light dark:border-border-dark text-subtle-light dark:text-subtle-dark hover:bg-background-light dark:hover:bg-background-dark'}"
                        onclick="goToBookPage(${totalPages})">${totalPages}</button>
            `;
        }

        paginationButtons.innerHTML += `
            <button class="flex items-center justify-center h-8 w-8 rounded-md border border-border-light dark:border-border-dark text-subtle-light dark:text-subtle-dark hover:bg-background-light dark:hover:bg-background-dark" onclick="nextPage()">
                <span class="material-symbols-outlined text-lg">chevron_right</span>
            </button>
        `;
    }
}

function previousPage() {
    if (currentBookPage > 1) {
        currentBookPage--;
        filterAndDisplayBooks();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    if (currentBookPage < totalPages) {
        currentBookPage++;
        filterAndDisplayBooks();
    }
}

function goToBookPage(page) {
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    if (page >= 1 && page <= totalPages) {
        currentBookPage = page;
        filterAndDisplayBooks();
    }
}

function toggleSelectAll() {
    const checkAll = document.getElementById('selectAll');
    if (!checkAll) return;

    const isChecked = checkAll.checked;
    const checkboxes = document.querySelectorAll('.book-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
}

function openAddBookModal() {
    const modal = document.getElementById('addBookModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeAddBookModal() {
    const modal = document.getElementById('addBookModal');
    const form = document.getElementById('addBookForm');
    if (modal) modal.classList.add('hidden');
    if (form) form.reset();
}

async function handleAddBook(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const bookData = {
        title: formData.get('title'),
        author: formData.get('author'),
        genre: formData.get('genre'),
        price: parseFloat(formData.get('price')),
        type: formData.get('type'),
        description: formData.get('description')
    };

    const imageUrl = formData.get('imageUrl');

    try {
        if (!bookData.title || !bookData.author || !bookData.genre || !bookData.price) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (bookData.price < 0) {
            showNotification('Price cannot be negative', 'error');
            return;
        }

        const newBook = await apiService.createBook(bookData);

        if (imageUrl) {
            try {
                const mediaData = {
                    fileType: 'image',
                    fileUrl: imageUrl,
                    fileName: 'cover.jpg'
                };
                await apiService.addBookMedia(newBook.id, mediaData);
            } catch (mediaError) {
                console.error('Error adding book media:', mediaError);
                showNotification('Book added but failed to save cover image', 'warning');
            }
        }

        showNotification('Book added successfully!', 'success');
        closeAddBookModal();
        loadBooks();

    } catch (error) {
        console.error('Error adding book:', error);
        showNotification('Failed to add book: ' + error.message, 'error');
    }
}

async function handleEditBook(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const bookId = formData.get('id');
    const bookData = {
        title: formData.get('title'),
        author: formData.get('author'),
        genre: formData.get('genre'),
        price: parseFloat(formData.get('price')),
        type: formData.get('type'),
        description: formData.get('description')
    };

    const imageUrl = formData.get('imageUrl');

    try {
        // Валидация
        if (!bookData.title || !bookData.author || !bookData.genre || !bookData.price) {
            showNotification('Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }

        if (bookData.price < 0) {
            showNotification('Цена не может быть отрицательной', 'error');
            return;
        }

        // Обновление книги
        console.log('Updating book with data:', bookData);
        const updatedBook = await apiService.updateBook(bookId, bookData);
        console.log('Update successful:', updatedBook);

        // Обновление изображения (если есть)
        if (imageUrl && imageUrl.trim() !== '') {
            try {
                const mediaData = {
                    fileType: 'image',
                    fileUrl: imageUrl,
                    fileName: 'cover.jpg'
                };
                await apiService.addBookMedia(bookId, mediaData);
            } catch (mediaError) {
                console.error('Error updating book media:', mediaError);
                showNotification('Книга обновлена, но не удалось сохранить обложку', 'warning');
            }
        }

        showNotification('Книга успешно обновлена!', 'success');
        closeEditBookModal();
        loadBooks();

    } catch (error) {
        console.error('Error updating book:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.body);

        if (error.status === 403) {
            // Проверим текущие права
            const isAdmin = isUserAdmin();

            if (isAdmin) {
                showNotification('Доступ запрещен, но у вас есть роль администратора. Возможно, проблема с сервером.', 'error');

                // Попробуем сделать простой запрос для проверки связи
                try {
                    const test = await apiService.getProfile();
                    console.log('Profile test passed:', test);

                    // Попробуем другой endpoint
                    const books = await apiService.getBooks();
                    console.log('Can read books:', books.length);

                    showNotification('Соединение с сервером работает. Обратитесь к администратору системы.', 'warning');
                } catch (testError) {
                    console.error('Test request failed:', testError);
                }
            } else {
                showNotification('Доступ запрещен. Требуются права администратора.', 'error');

                // Покажем текущие роли для отладки
                const token = localStorage.getItem('token');
                const payload = parseJwt(token);
                console.log('Current roles in token:', payload.roles);
            }
        } else {
            showNotification('Ошибка при обновлении книги: ' + (error.message || 'Неизвестная ошибка'), 'error');
        }
    }
}

function editBook(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    if (!book) {
        showNotification('Book not found', 'error');
        return;
    }

    openEditBookModal(book);
}

async function openEditBookModal(book) {
    let currentCover = '';
    try {
        const mediaList = await apiService.getBookMedia(book.id);
        const coverMedia = mediaList.find(media => media.fileType === 'IMAGE');
        if (coverMedia) {
            currentCover = coverMedia.fileUrl;
        }
    } catch (error) {
        console.error('Error loading book media:', error);
    }

    const modal = document.createElement('div');
    modal.id = 'editBookModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50" onclick="closeEditBookModal()"></div>
        <div class="relative bg-content-light dark:bg-content-dark rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto border border-border-light dark:border-border-dark shadow-xl mx-4">
            <div class="flex justify-between items-center p-4 border-b border-border-light dark:border-border-dark">
                <h3 class="text-lg font-bold text-text-light dark:text-text-dark">Редактировать книгу</h3>
                <button onclick="closeEditBookModal()" class="text-subtle-light dark:text-subtle-dark hover:text-text-light dark:hover:text-text-dark">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <form id="editBookForm" class="p-4 space-y-3">
                <input type="hidden" name="id" value="${book.id}">
                <div class="grid grid-cols-1 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-1">URL изображения обложки</label>
                        <input type="url" name="imageUrl" value="${currentCover}"
                               class="w-full rounded-DEFAULT border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark"
                               placeholder="https://example.com/book-cover.jpg">
                        <p class="text-xs text-subtle-light dark:text-subtle-dark mt-1">Необязательно: Укажите URL изображения обложки книги</p>
                        ${currentCover ? `
                            <div class="mt-2">
                                <p class="text-xs text-subtle-light dark:text-subtle-dark mb-1">Текущая обложка:</p>
                                <img src="${currentCover}" alt="Текущая обложка" class="w-20 h-28 object-cover rounded border">
                            </div>
                        ` : ''}
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Название *</label>
                        <input type="text" name="title" value="${book.title || ''}" required
                               class="w-full rounded-DEFAULT border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Автор *</label>
                        <input type="text" name="author" value="${book.author || ''}" required
                               class="w-full rounded-DEFAULT border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Жанр *</label>
                        <input type="text" name="genre" value="${book.genre || ''}" required
                               class="w-full rounded-DEFAULT border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Цена *</label>
                        <input type="number" step="0.01" min="0" name="price" value="${book.price || ''}" required
                               class="w-full rounded-DEFAULT border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Тип *</label>
                        <select name="type" required
                                class="w-full rounded-DEFAULT border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark">
                            <option value="PHYSICAL" ${book.type === 'PHYSICAL' ? 'selected' : ''}>Печатная</option>
                            <option value="ELECTRONIC" ${book.type === 'ELECTRONIC' ? 'selected' : ''}>Электронная</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Описание</label>
                        <textarea name="description" rows="3"
                                  class="w-full rounded-DEFAULT border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-text-light dark:text-text-dark"
                                  placeholder="Введите описание книги...">${book.description || ''}</textarea>
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                    <button type="button" onclick="closeEditBookModal()"
                            class="px-4 py-2 text-subtle-light dark:text-subtle-dark hover:text-text-light dark:hover:text-text-dark transition-colors">Отмена</button>
                    <button type="submit"
                            class="px-4 py-2 bg-primary text-white rounded-DEFAULT hover:opacity-90 transition-opacity">Сохранить</button>
                </div>
            </form>
        </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('editBookForm').addEventListener('submit', handleEditBook);
}

function closeEditBookModal() {
    const modal = document.getElementById('editBookModal');
    if (modal) {
        modal.remove();
    }
}

async function deleteBook(bookId) {
    if (!confirm('Are you sure you want to delete this book?')) {
        return;
    }

    try {
        await apiService.deleteBook(bookId);
        showNotification('Book deleted successfully!', 'success');
        loadBooks();
    } catch (error) {
        console.error('Error deleting book:', error);
        showNotification('Failed to delete book', 'error');
    }
}

function resetFilters() {
    currentSearch = '';
    currentFilters = { genres: [], authors: [], formats: [] };
    priceFilter = { min: 0, max: 100 };
    currentBookPage = 1;

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    const priceSlider = document.getElementById('price-slider');
    const priceValue = document.getElementById('price-value');
    if (priceSlider) {
        priceSlider.value = priceSlider.max;
        if (priceValue) {
            priceValue.textContent = `$0 - $${priceSlider.value}`;
        }
    }

    const checkboxes = document.querySelectorAll('.filter-checkbox, input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.dataset.value === 'all') {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }
    });

    filterAndDisplayBooks();
}

function showLoadingState() {
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const tableBody = document.getElementById('booksTableBody');
    const paginationContainer = document.getElementById('paginationContainer');

    if (loadingState) loadingState.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    if (tableBody) tableBody.innerHTML = '';
    if (paginationContainer) paginationContainer.classList.add('hidden');
}

function showError(message) {
    const tableBody = document.getElementById('booksTableBody');
    const loadingState = document.getElementById('loadingState');

    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="p-8 text-center text-destructive">
                    <span class="material-symbols-outlined text-4xl mb-2">error</span>
                    <p>${message}</p>
                    <button onclick="loadBooks()" class="mt-4 px-4 py-2 bg-primary text-white rounded-DEFAULT hover:opacity-90">
                        Try Again
                    </button>
                </td>
            </tr>
        `;
    }
    if (loadingState) loadingState.classList.add('hidden');
}

window.loadBookManagementPage = loadBookManagementPage;
window.openAddBookModal = openAddBookModal;
window.closeAddBookModal = closeAddBookModal;
window.editBook = editBook;
window.deleteBook = deleteBook;
window.resetFilters = resetFilters;
window.previousPage = previousPage;
window.nextPage = nextPage;
