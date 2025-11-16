document.addEventListener("DOMContentLoaded", () => {
    loadOrders();
});

async function loadOrders() {
    const container = document.getElementById("orders-container");
    container.innerHTML = "";

    let orders;
    try {
        orders = await apiService.getUserOrders();
    } catch (e) {
        console.error("Ошибка загрузки заказов:", e);
        container.innerHTML = `<p class="text-red-500">Не удалось загрузить заказы.</p>`;
        return;
    }

    if (!orders || orders.length === 0) {
        container.innerHTML = `<p class="text-gray-600 dark:text-gray-400">У вас пока нет заказов.</p>`;
        return;
    }

    orders.forEach(order => {
        const details = document.createElement("details");
        details.className = "flex flex-col rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 group overflow-hidden";

        const statusClass = getStatusTailwindClass(order.status);

        const itemsHtml = order.orderItems.map(item => {
            const imageUrl = item.book.media && item.book.media.length > 0
                ? item.book.media[0].fileUrl
                : "/img/placeholder.jpg";
            return `
                <tr class="divide-y divide-gray-200 dark:divide-gray-700">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center gap-4">
                            <img class="h-16 w-12 rounded-md object-cover" src="${imageUrl}" alt="${item.book.title}" />
                            <div>
                                <div class="font-medium text-gray-900 dark:text-white">${item.book.title}</div>
                                <div class="text-gray-500 dark:text-gray-400 text-sm">${item.book.author}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">${item.quantity}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-gray-500 dark:text-gray-400">$${item.price.toFixed(2)}</td>
                </tr>
            `;
        }).join("");

        details.innerHTML = `
            <summary class="flex cursor-pointer items-center justify-between gap-6 p-4">
                <div class="flex items-center gap-4 flex-wrap">
                    <p class="text-gray-900 dark:text-white text-sm font-semibold">Заказ #${order.id}</p>
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Размещен: ${new Date(order.createdAt).toLocaleDateString()}</p>
                    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}">${order.status}</span>
                </div>
                <div class="flex items-center gap-4">
                    <p class="text-gray-900 dark:text-white text-sm font-semibold">$${order.totalPrice.toFixed(2)}</p>
                    <span class="material-symbols-outlined text-gray-600 dark:text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
                </div>
            </summary>
            <div class="border-t border-gray-200 dark:border-gray-700 p-6 bg-background-light dark:bg-gray-800">
                ${order.orderItems.length > 0 ? `
                    <div class="flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th class="px-6 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Товар</th>
                                    <th class="px-6 py-3 text-left font-medium text-gray-600 dark:text-gray-300 w-24 text-center">Кол-во</th>
                                    <th class="px-6 py-3 text-left font-medium text-gray-600 dark:text-gray-300 w-32 text-right">Цена</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                    </div>
                    <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                        ${order.status === "created" ? `<button class="inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 pay-btn" data-id="${order.id}">Оплатить</button>` : ""}
                        <button class="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 delete-btn" data-id="${order.id}">Удалить</button>
                        <button class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 reorder-btn" data-id="${order.id}">
                            <span class="material-symbols-outlined text-base">replay</span> Повторить
                        </button>
                    </div>
                ` : `<p class="text-sm text-gray-600 dark:text-gray-400">Детали этого заказа недоступны.</p>`}
            </div>
        `;

        container.appendChild(details);
    });

    enableButtons();
}

function getStatusTailwindClass(status) {
    switch (status) {
        case "created": return "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300";
        case "paid": return "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300";
        case "shipped": return "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300";
        case "completed": return "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300";
        case "cancelled": return "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300";
        default: return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
}

function enableButtons() {
    document.querySelectorAll(".pay-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const orderId = btn.dataset.id;
            try {
                await apiService.payOrder(orderId);
                loadOrders();
            } catch (e) {
                console.error("Ошибка при оплате:", e);
                alert("Не удалось оплатить заказ.");
            }
        });
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const orderId = btn.dataset.id;
            if (!confirm("Вы уверены, что хотите удалить этот заказ?")) return;
            try {
                await apiService.deleteOrder(orderId);
                loadOrders();
            } catch (e) {
                console.error("Ошибка при удалении:", e);
                alert("Не удалось удалить заказ.");
            }
        });
    });

    document.querySelectorAll(".reorder-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const orderId = btn.dataset.id;
            try {
                await apiService.reorder(orderId);
                loadOrders();
            } catch (e) {
                console.error("Ошибка при повторном заказе:", e);
                alert("Не удалось повторить заказ.");
            }
        });
    });
}
