const container = document.getElementById('wishlistContainer');
const addAllBtn = document.getElementById('moveAllBtn');
let allBooks = [];

function createBookCard(book) {
  const div = document.createElement('div');
  div.className = "flex flex-col group relative overflow-hidden rounded-xl";

  const coverUrl = book.cover || 'redirect:https://via.placeholder.com/120x160/4F46E5/FFFFFF?text=cover';

  div.innerHTML = `
    <div class="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl shadow-md"
         style="background-image: url('${coverUrl}');"></div>
    <div class="absolute inset-0 bg-black/50 group-hover-content flex flex-col items-center justify-center p-4 gap-3">
      <button class="w-full flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-white text-sm font-bold" data-action="addToCart">Add to Cart</button>
      <button class="w-full flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-white/20 text-white backdrop-blur-sm text-sm font-medium" data-action="viewDetails">View Details</button>
      <button class="absolute top-2 right-2 flex items-center justify-center size-8 rounded-full bg-black/30 text-white hover:bg-red-500" data-action="remove">
        <span class="material-symbols-outlined text-lg">delete</span>
      </button>
    </div>
    <div class="pt-3">
      <p class="text-slate-900 dark:text-white text-base font-bold leading-normal">${book.title}</p>
      <p class="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">${book.author} - $${book.price}</p>
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
      console.log(`Book ${book.id} added to cart`);
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
    container.innerHTML = '<p class="col-span-full text-center py-8 text-secondary-text dark:text-gray-400">No books match your filters</p>';
    return;
  }
  books.forEach(book => container.appendChild(createBookCard(book)));
}

function filterBooks() {
  const category = document.getElementById('filterCategory').value;
  const maxPrice = parseFloat(document.getElementById('filterPrice').value);
  const rating = parseInt(document.getElementById('filterRating').value);

  const filtered = allBooks.filter(book => {
    const matchesCategory = category === 'All' || book.genre === category;
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
    console.error('Failed to load wishlist:', error);
    container.innerHTML = '<p class="col-span-full text-center py-8 text-secondary-text dark:text-gray-400">Failed to load wishlist</p>';
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
        console.log('All books added to cart and removed from wishlist');
    } catch (error) {
        console.error('Failed to add all books to cart:', error);
    }
});

function populateCategories(books) {
  const categorySelect = document.getElementById('filterCategory');
  categorySelect.innerHTML = '<option value="All">All</option>';
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

loadWishlist();
