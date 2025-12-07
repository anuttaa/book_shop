document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId');

  if (!apiService.token) {
    window.location.href = '/login';
    return;
  }

  const container = document.getElementById('paymentContainer');
  if (!container) return;

  container.innerHTML = '<div class="text-center py-8"><p class="text-gray-600 dark:text-gray-400">Загрузка заказа...</p></div>';

  try {
    const orders = await apiService.getUserOrders();
    const order = (orders || []).find(o => String(o.id) === String(orderId));

    if (!order) {
      container.innerHTML = '<div class="text-center py-12"><p class="text-red-600 dark:text-red-400 text-lg">Заказ не найден</p><a href="/orders" class="btn btn-secondary mt-4">Вернуться к заказам</a></div>';
      return;
    }

    const itemsHtml = (order.orderItems || []).map(item => `
      <div class="flex items-center justify-between py-2">
        <div class="flex flex-col">
          <span class="text-gray-900 dark:text-white font-medium">${item.book?.title || 'Книга'}</span>
          <span class="text-gray-500 dark:text-gray-400 text-sm">${item.book?.author || ''}</span>
        </div>
        <div class="text-right">
          <span class="text-gray-700 dark:text-gray-300">${item.quantity || 1} × $${(item.price || 0).toFixed(2)}</span>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="rounded-lg bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Заказ #${order.id}</h2>
          <a href="/orders" class="btn btn-secondary">К заказам</a>
        </div>
        <div class="space-y-2">${itemsHtml}</div>
        <div class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 mt-6 pt-4">
          <span class="text-lg text-gray-700 dark:text-gray-300">Итого</span>
          <span class="text-xl font-bold text-gray-900 dark:text-white">$${(order.totalPrice || 0).toFixed(2)}</span>
        </div>
      </div>

      <div class="rounded-lg bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Способ оплаты</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <label class="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer">
            <input type="radio" name="pm" value="card" checked />
            <span>Банковская карта</span>
          </label>
          <label class="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer">
            <input type="radio" name="pm" value="wallet" />
            <span>Электронный кошелёк</span>
          </label>
        </div>
        <button id="payNow" class="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
          <span class="material-symbols-outlined text-base">payments</span>
          Оплатить
        </button>
      </div>
    `;

    const payBtn = document.getElementById('payNow');
    if (payBtn) {
      payBtn.addEventListener('click', async () => {
        payBtn.disabled = true;
        payBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> Оплата...';
        try {
          await apiService.payOrder(order.id);
          showNotification('Заказ оплачен', 'success');
          window.location.href = '/orders';
        } catch (e) {
          showNotification('Не удалось выполнить оплату', 'error');
          payBtn.disabled = false;
          payBtn.innerHTML = '<span class="material-symbols-outlined">payments</span> Оплатить';
        }
      });
    }

  } catch (error) {
    container.innerHTML = '<div class="text-center py-12"><p class="text-red-600 dark:text-red-400 text-lg">Ошибка загрузки</p></div>';
  }
});
