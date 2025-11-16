document.addEventListener("DOMContentLoaded", () => {
    loadCart();

   const checkoutBtn = document.querySelector(".w-full.bg-primary");
   if (checkoutBtn) {
       checkoutBtn.addEventListener("click", async () => {
           checkoutBtn.disabled = true;
           checkoutBtn.textContent = "Processing...";

           try {
               const order = await apiService.createOrderFromCart();
               showNotification(`Заказ #${order.id} успешно создан!`);

               loadCart();
           } catch (e) {
               console.error("Ошибка при создании заказа:", e);
               showNotification("Не удалось оформить заказ. Попробуйте еще раз.");
           } finally {
               checkoutBtn.disabled = false;
               checkoutBtn.textContent = "Checkout";
           }
       });
   }
});

async function loadCart() {
    let cart;

    try {
        cart = await apiService.getCart();
    } catch (e) {
        console.error("Ошибка загрузки корзины:", e);
        return;
    }

    console.log("CART:", cart);

    const tbody = document.getElementById("cart-items");
    const subtotalEl = document.getElementById("subtotal");

    tbody.innerHTML = "";
    let subtotal = 0;

    cart.forEach(item => {
        const total = item.book.price * item.quantity;
        subtotal += total;

        const tr = document.createElement("tr");
        tr.className = "border-t border-gray-200 dark:border-gray-700";

        const imageUrl = item.book.media && item.book.media.length > 0
            ? item.book.media[0].fileUrl
            : "/img/placeholder.jpg";

        tr.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-24 bg-gray-200 rounded overflow-hidden">
                        <img class="w-full h-full object-cover" src="${imageUrl}" />
                    </div>
                    <div>
                        <p class="font-bold text-gray-900 dark:text-white">${item.book.title}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${item.book.author}</p>
                    </div>
                </div>
            </td>

            <td class="px-6 py-4 text-gray-800 dark:text-gray-200">
                $${item.book.price.toFixed(2)}
            </td>

            <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                    <button data-action="dec" data-id="${item.id}" class="qty-btn w-8 h-8 rounded-full border dark:border-gray-600 text-lg">−</button>
                    <span class="w-10 text-center text-gray-900 dark:text-gray-200">${item.quantity}</span>
                    <button data-action="inc" data-id="${item.id}" class="qty-btn w-8 h-8 rounded-full border dark:border-gray-600 text-lg">+</button>
                </div>
            </td>

            <td class="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                $${total.toFixed(2)}
            </td>

            <td class="px-6 py-4 text-right">
                <button class="delete-btn text-gray-500 hover:text-red-500" data-book="${item.book.id}">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;

    enableQuantityButtons();
    enableDeleteButtons();
}

function enableQuantityButtons() {
    document.querySelectorAll(".qty-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const cartItemId = btn.dataset.id;
            const action = btn.dataset.action;

            const row = btn.closest("tr");
            const qtyEl = row.querySelector("span");

            let qty = parseInt(qtyEl.textContent);
            qty = action === "inc" ? qty + 1 : qty - 1;
            if (qty < 1) qty = 1;

            try {
                await apiService.request("/api/cart/update-quantity", {
                    method: "PUT",
                    body: JSON.stringify({ cartItemId, quantity: qty })
                });
            } catch (e) {
                console.error("Ошибка обновления количества:", e);
            }

            loadCart();
        });
    });
}

function enableDeleteButtons() {
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const bookId = btn.dataset.book;

            try {
                await apiService.removeFromCart(bookId);
            } catch (e) {
                console.error("Ошибка удаления:", e);
            }

            loadCart();
        });
    });
}
