const container = document.getElementById('wishlistContainer');
const addAllBtn = document.getElementById('moveAllBtn');
let allBooks = [];

function createBookCard(book) {
  const div = document.createElement('div');
  div.className = "flex flex-col group relative overflow-hidden rounded-xl";

  const coverUrl = book.cover || 'redirect:https://via.placeholder.com/120x160/522B47/F1F0EA?text=cover';

  div.innerHTML = `
    <div class="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl shadow-md"
         style="background-image: url('${coverUrl}');"></div>
    <div class="absolute inset-0 bg-black/50 group-hover-content flex flex-col items-center justify-center p-4 gap-3">
      <button class="w-full flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-white text-sm font-bold" data-action="addToCart">В корзину</button>
      <button class="w-full flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-white/20 text-white backdrop-blur-sm text-sm font-medium" data-action="viewDetails">Подробнее</button>
      <button class="absolute top-2 right-2 flex items-center justify-center size-8 rounded-full bg-black/30 text-white hover:bg-destructive/30" data-action="remove">
        <span class="material-symbols-outlined text-lg">delete</span>
      </button>
    </div>
    <div class="pt-3">
      <p class="text-gray-900 dark:text-white text-base font-bold leading-normal">${book.title}</p>
      <p class="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal">${book.author} - $${book.price}</p>
      <div class="flex items-center text-sm text-amber-500">
        ${'★'.repeat(Math.round(book.rating)) + '☆'.repeat(5 - Math.round(book.rating))}
      </div>
    </div>
  `;

  div.querySelector('[data-action="remove"]').addEventListener('click', async () => {
    try {
      await apiService.removeFromWishlist(book.id);
      allBooks = allBooks.filter(b => b.id !== book.id);
      filterBooks();
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  });

  div.querySelector('[data-action="addToCart"]').addEventListener('click', async () => {
    try {
      await apiService.addToCart(book.id, 1);
      await apiService.removeFromWishlist(book.id);
      allBooks = allBooks.filter(b => b.id !== book.id);
      filterBooks();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  });

  div.querySelector('[data-action="viewDetails"]').addEventListener('click', () => {
    window.location.href = `/pages/book.html?id=${book.id}`;
  });

  return div;
}

function renderBooks(books) {
  container.innerHTML = '';
  if (!books.length) {
    container.innerHTML = '<p class="col-span-full text-center py-8 text-secondary-text">Нет книг по выбранным фильтрам</p>';
    return;
  }
  books.forEach(book => container.appendChild(createBookCard(book)));
}

function filterBooks() {
  const category = document.getElementById('filterCategory').value;
  const maxPrice = parseFloat(document.getElementById('filterPrice').value);
  const rating = parseInt(document.getElementById('filterRating').value);

  const filtered = allBooks.filter(book => {
    const matchesCategory = category === 'Все' || book.genre === category;
    const matchesPrice = book.price <= maxPrice;
    const matchesRating = book.rating >= rating;
    return matchesCategory && matchesPrice && matchesRating;
  });

  renderBooks(filtered);
}

async function loadWishlist() {
  try {
    const wishlist = await apiService.getWishlist();
    allBooks = wishlist.books.map(b => ({
      ...b,
      price: parseFloat(b.price) || 0,
      quantity: 1
    })) || [];
    renderBooks(allBooks);
    populateCategories(allBooks);
  } catch (error) {
    console.error('Не удалось загрузить список желаемого:', error);
    container.innerHTML = '<p class="col-span-full text-center py-8 text-secondary-text">Не удалось загрузить список желаемого</p>';
  }
}

addAllBtn.addEventListener('click', async () => {
    try {
        await Promise.all(allBooks.map(async (book) => {
            await apiService.addToCart(book.id, 1);
            await apiService.removeFromWishlist(book.id);
        }));
        allBooks = [];
        filterBooks();
    } catch (error) {
        console.error('Failed to add all books to cart:', error);
    }
});

function populateCategories(books) {
  const categorySelect = document.getElementById('filterCategory');
  categorySelect.innerHTML = '<option value="Все">Все</option>';
  const categories = [...new Set(books.map(book => book.genre).filter(Boolean))];
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

document.getElementById('filterCategory').addEventListener('change', filterBooks);
document.getElementById('filterPrice').addEventListener('input', (e) => {
  document.getElementById('priceValue').textContent = e.target.value;
  filterBooks();
});
document.getElementById('filterRating').addEventListener('change', filterBooks);

function createShareText(books) {
    const bookList = books.slice(0, 8).map(book => 
        `• ${book.title} - ${book.author}`
    ).join('\n');
    
    const moreText = books.length > 8 ? 
        `\n...и еще ${books.length - 8} книг` : '';
    
    return `📚 Мой список желаемых книг:\n\n${bookList}${moreText}\n\nПосмотреть весь список: ${window.location.href}`;
}

function showShareNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `share-notification ${type}`;
    notification.innerHTML = `
        <span class="share-notification-icon material-symbols-outlined">
            ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
        </span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Показываем уведомление
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Скрываем через 4 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        // Удаляем через время анимации
        setTimeout(() => notification.remove(), 400);
    }, 4000);
}

// Добавляем CSS анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(10px); }
    }
    .animate-fade-in {
        animation: fadeIn 0.3s ease-out;
    }
`;
document.head.appendChild(style);

// Функция для копирования ссылки
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Запасной вариант для старых браузеров
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
    }
}

// Основная функция для настройки кнопки "Поделиться"
function setupShareButton() {
    const shareMainBtn = document.getElementById('shareMainBtn');
    const shareMenu = document.getElementById('shareMenu');
    const shareVKEl = document.getElementById('shareVK');
    const shareTelegramEl = document.getElementById('shareTelegram');
    const copyLinkEl = document.getElementById('copyLink');

    if (!shareMainBtn || !shareMenu) return;

    const openMenu = () => {
        shareMenu.classList.add('show');
        shareMenu.classList.remove('hidden');
    };

    const closeMenu = () => {
        shareMenu.classList.remove('show');
        shareMenu.classList.add('hidden');
    };

    shareMainBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (shareMenu.classList.contains('hidden')) {
            openMenu();
        } else {
            closeMenu();
        }
    });

    document.addEventListener('click', (e) => {
        if (!shareMenu.contains(e.target) && !shareMainBtn.contains(e.target)) {
            closeMenu();
        }
    });

    if (shareVKEl) {
        shareVKEl.addEventListener('click', async (e) => {
            e.stopPropagation();
            closeMenu();
            if (allBooks.length === 0) {
                showShareNotification('Добавьте книги в вишлист, чтобы поделиться!', 'error');
                return;
            }
            const shareText = createShareText(allBooks);
            const encodedText = encodeURIComponent(shareText);
            const currentUrl = encodeURIComponent(window.location.href);
            const vkUrl = `https://vk.com/share.php?url=${currentUrl}&title=${encodeURIComponent('Мой книжный вишлист')}&comment=${encodedText}&noparse=true`;
            window.open(vkUrl, '_blank', 'width=700,height=600');
            showShareNotification('Открываю ВКонтакте...', 'info');
        });
    }

    if (shareTelegramEl) {
        shareTelegramEl.addEventListener('click', async (e) => {
            e.stopPropagation();
            closeMenu();
            if (allBooks.length === 0) {
                showShareNotification('Добавьте книги в вишлист, чтобы поделиться!', 'error');
                return;
            }
            const shareText = createShareText(allBooks);
            const encodedText = encodeURIComponent(shareText);
            const currentUrl = encodeURIComponent(window.location.href);
            const telegramUrl = `https://t.me/share/url?url=${currentUrl}&text=${encodedText}`;
            window.open(telegramUrl, '_blank', 'width=700,height=600');
            showShareNotification('Открываю Telegram...', 'info');
        });
    }

    if (copyLinkEl) {
        copyLinkEl.addEventListener('click', async (e) => {
            e.stopPropagation();
            closeMenu();
            const currentUrl = window.location.href;
            const success = await copyToClipboard(currentUrl);
            if (success) {
                showShareNotification('Ссылка скопирована в буфер обмена!', 'success');
            } else {
                showShareNotification('Не удалось скопировать ссылку', 'error');
            }
        });
    }
}

// Инициализируем кнопку "Поделиться" после загрузки страницы
document.addEventListener('DOMContentLoaded', setupShareButton);

loadWishlist();
