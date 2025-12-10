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
          <label for="pmCash" class="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer">
            <input id="pmCash" type="radio" name="pm" value="cash" checked />
            <span>Наличные</span>
          </label>
          <label for="pmCard" class="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer">
            <input id="pmCard" type="radio" name="pm" value="card" />
            <span>Банковская карта</span>
          </label>
        </div>

        <div id="cardFields" class="hidden space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Номер карты</label>
            <input id="cardNumber" type="text" inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000" class="form-input w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2" />
            <div id="cardNumberError" class="text-red-600 text-sm mt-1 hidden"></div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Месяц/Год</label>
              <input id="cardExp" type="text" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY" class="form-input w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2" />
              <div id="cardExpError" class="text-red-600 text-sm mt-1 hidden"></div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVC</label>
              <input id="cardCvc" type="password" inputmode="numeric" autocomplete="cc-csc" placeholder="CVC" class="form-input w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2" />
              <div id="cardCvcError" class="text-red-600 text-sm mt-1 hidden"></div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Бренд карты</label>
            <input id="cardBrand" type="text" placeholder="Visa/Mastercard/MIR" class="form-input w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2" />
            <div id="cardBrandError" class="text-red-600 text-sm mt-1 hidden"></div>
          </div>
        </div>

        <div class="mt-4">
          <button id="payNow" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-base">payments</span>
            Оплатить
          </button>
        </div>
      </div>
    `;

        const payBtn = document.getElementById('payNow');
        const methodInputs = document.querySelectorAll('input[name="pm"]');
        const cardFields = document.getElementById('cardFields');
        const pmCash = document.getElementById('pmCash');
        const pmCard = document.getElementById('pmCard');

        function formatCardNumber(value) {
            return value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().substr(0, 19);
        }

        function validateCardNumber(value) {
            const cleanValue = value.replace(/\s+/g, '');
            if (!cleanValue) {
                return { valid: false, message: 'Введите номер карты' };
            }
            if (cleanValue.length < 12) {
                return { valid: false, message: 'Номер карты слишком короткий' };
            }
            if (!/^\d+$/.test(cleanValue)) {
                return { valid: false, message: 'Номер карты должен содержать только цифры' };
            }
            return { valid: true };
        }

        function formatExpDate(value) {
            const cleanValue = value.replace(/\D/g, '');
            if (cleanValue.length >= 2) {
                return cleanValue.substr(0, 2) + '/' + cleanValue.substr(2, 2);
            }
            return cleanValue;
        }

        function validateExpDate(value) {
            const [month, year] = value.split('/');
            if (!month || !year) {
                return { valid: false, message: 'Введите дату в формате MM/YY' };
            }

            const monthNum = parseInt(month, 10);
            const yearNum = parseInt(year, 10);
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = new Date().getMonth() + 1;

            if (monthNum < 1 || monthNum > 12) {
                return { valid: false, message: 'Неверный месяц' };
            }
            if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
                return { valid: false, message: 'Карта просрочена' };
            }
            if (yearNum > currentYear + 20) {
                return { valid: false, message: 'Неверный год' };
            }

            return { valid: true };
        }

        function validateCvc(value) {
            if (!value) {
                return { valid: false, message: 'Введите CVC код' };
            }
            if (!/^\d{3,4}$/.test(value)) {
                return { valid: false, message: 'CVC код должен содержать 3-4 цифры' };
            }
            return { valid: true };
        }

        function validateCardBrand(value) {
            if (!value) {
                return { valid: true };
            }
            const validBrands = ['visa', 'mastercard', 'mir', 'maestro'];
            const lowerValue = value.toLowerCase();
            if (!validBrands.some(brand => lowerValue.includes(brand))) {
                return { valid: false, message: 'Укажите корректный бренд (Visa, Mastercard, MIR)' };
            }
            return { valid: true };
        }

        function showError(fieldId, message) {
            const errorElement = document.getElementById(fieldId + 'Error');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.remove('hidden');
                const inputElement = document.getElementById(fieldId);
                if (inputElement) {
                    inputElement.classList.add('border-red-500');
                    inputElement.classList.remove('border-green-500');
                }
            }
        }

        function hideError(fieldId) {
            const errorElement = document.getElementById(fieldId + 'Error');
            if (errorElement) {
                errorElement.classList.add('hidden');
                const inputElement = document.getElementById(fieldId);
                if (inputElement) {
                    inputElement.classList.remove('border-red-500');
                    inputElement.classList.add('border-green-500');
                }
            }
        }

        function validateAllCardFields() {
            const method = document.querySelector('input[name="pm"]:checked').value;
            if (method !== 'card') return true;

            const cardNumber = document.getElementById('cardNumber').value;
            const cardExp = document.getElementById('cardExp').value;
            const cardCvc = document.getElementById('cardCvc').value;
            const cardBrand = document.getElementById('cardBrand').value;

            let isValid = true;

            const cardNumberValidation = validateCardNumber(cardNumber);
            if (!cardNumberValidation.valid) {
                showError('cardNumber', cardNumberValidation.message);
                isValid = false;
            } else {
                hideError('cardNumber');
            }

            const expValidation = validateExpDate(cardExp);
            if (!expValidation.valid) {
                showError('cardExp', expValidation.message);
                isValid = false;
            } else {
                hideError('cardExp');
            }

            const cvcValidation = validateCvc(cardCvc);
            if (!cvcValidation.valid) {
                showError('cardCvc', cvcValidation.message);
                isValid = false;
            } else {
                hideError('cardCvc');
            }

            const brandValidation = validateCardBrand(cardBrand);
            if (!brandValidation.valid) {
                showError('cardBrand', brandValidation.message);
                isValid = false;
            } else {
                hideError('cardBrand');
            }

            return isValid;
        }

        const cardNumberInput = document.getElementById('cardNumber');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', function() {
                this.value = formatCardNumber(this.value);
                const validation = validateCardNumber(this.value);
                if (!validation.valid) {
                    showError('cardNumber', validation.message);
                } else {
                    hideError('cardNumber');
                }
            });
        }

        const cardExpInput = document.getElementById('cardExp');
        if (cardExpInput) {
            cardExpInput.addEventListener('input', function() {
                this.value = formatExpDate(this.value);
                const validation = validateExpDate(this.value);
                if (!validation.valid) {
                    showError('cardExp', validation.message);
                } else {
                    hideError('cardExp');
                }
            });
        }

        const cardCvcInput = document.getElementById('cardCvc');
        if (cardCvcInput) {
            cardCvcInput.addEventListener('input', function() {
                const validation = validateCvc(this.value);
                if (!validation.valid) {
                    showError('cardCvc', validation.message);
                } else {
                    hideError('cardCvc');
                }
            });
        }

        const cardBrandInput = document.getElementById('cardBrand');
        if (cardBrandInput) {
            cardBrandInput.addEventListener('input', function() {
                const validation = validateCardBrand(this.value);
                if (!validation.valid) {
                    showError('cardBrand', validation.message);
                } else {
                    hideError('cardBrand');
                }
            });
        }

        const updateMethod = () => {
            const method = document.querySelector('input[name="pm"]:checked').value;
            if (method === 'card') {
                cardFields.classList.remove('hidden');
            } else {
                cardFields.classList.add('hidden');
            }
        };

        methodInputs.forEach(i => {
            i.addEventListener('change', updateMethod);
            i.addEventListener('input', updateMethod);
            i.addEventListener('click', updateMethod);
        });

        if (pmCash) pmCash.addEventListener('change', updateMethod);
        if (pmCard) pmCard.addEventListener('change', updateMethod);
        container.addEventListener('change', (e) => {
            if (e.target && e.target.name === 'pm') updateMethod();
        });

        updateMethod();

        if (payBtn) {
            payBtn.addEventListener('click', async () => {
                const method = document.querySelector('input[name="pm"]:checked').value;

                if (method === 'card' && !validateAllCardFields()) {
                    showNotification('Пожалуйста, исправьте ошибки в данных карты', 'error');
                    return;
                }

                payBtn.disabled = true;
                payBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> Оплата...';

                try {
                    const payload = {
                        orderId: order.id,
                        method,
                        amount: order.totalPrice,
                        currency: 'RUB'
                    };

                    if (method === 'card') {
                        const cardNumber = document.getElementById('cardNumber').value.trim();
                        const cardBrand = document.getElementById('cardBrand').value.trim();

                        if (!cardNumber || cardNumber.replace(/\s+/g,'').length < 12) {
                            showNotification('Введите корректный номер карты', 'error');
                            payBtn.disabled = false;
                            payBtn.innerHTML = '<span class="material-symbols-outlined">payments</span> Оплатить';
                            return;
                        }

                        payload.cardNumber = cardNumber.replace(/\s+/g, '');

                        payload.cardExp = document.getElementById('cardExp').value;
                        payload.cardCvc = document.getElementById('cardCvc').value;
                        if (cardBrand) payload.cardBrand = cardBrand;
                    }

                    await apiService.createPayment(payload);
                    showNotification(method === 'card' ? 'Оплата прошла успешно' : 'Заявка на оплату создана', 'success');
                    setTimeout(() => {
                        window.location.href = '/orders';
                    }, 2000);

                } catch (e) {
                    showNotification('Не удалось выполнить оплату: ' + (e?.message || ''), 'error');
                    payBtn.disabled = false;
                    payBtn.innerHTML = '<span class="material-symbols-outlined">payments</span> Оплатить';
                }
            });
        }

    } catch (error) {
        container.innerHTML = '<div class="text-center py-12"><p class="text-red-600 dark:text-red-400 text-lg">Ошибка загрузки</p></div>';
    }
});