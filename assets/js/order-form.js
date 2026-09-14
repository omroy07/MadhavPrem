/* ============================================================
   MadhavPrem — order-form.js
   Keeps the FormSubmit order form in sync with Store.cart.
   Same behavior as the original main.js, wired to the shared store.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const orderForm       = document.getElementById('orderForm');
  if (!orderForm) return; // this page has no order form (category pages)

  const quantityInput   = document.getElementById('quantity');
  const discountBox     = document.getElementById('discountBox');
  const discountField   = document.getElementById('discountField');
  const cartSummaryBox  = document.getElementById('cartSummaryBox');
  const cartSummaryField = document.getElementById('cartSummaryField');
  const itemsTextarea   = document.getElementById('items');
  const submitBtn       = document.getElementById('submitBtn');
  const successMessage  = document.getElementById('successMessage');

  function formatRupees(n) {
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
  }

  function updateDiscount() {
    const qty = parseInt(quantityInput.value, 10) || 0;
    const cart = Store.cart;
    const usingCartTotal = cart.length > 0 && !quantityInput.dataset.manual;

    if (qty >= 5) {
      if (usingCartTotal) {
        const total = Store.cartTotal();
        const discounted = total * 0.7;
        discountBox.textContent = `🎉 30% discount applied! ${formatRupees(total)} → ${formatRupees(discounted)}`;
        if (discountField) discountField.value = `30% discount applied (${formatRupees(total)} → ${formatRupees(discounted)})`;
      } else {
        discountBox.textContent = '🎉 30% discount applied on your total order value!';
        if (discountField) discountField.value = '30% discount applied';
      }
      discountBox.classList.add('active');
    } else {
      discountBox.textContent = 'Order 5 or more pieces and get 30% off your total.';
      discountBox.classList.remove('active');
      if (discountField) discountField.value = 'No discount';
    }
  }

  // Plain line — used in the "Order Items" textarea (plain text, no images allowed there).
  function itemLine(item) {
    return `${item.name} × ${item.qty || 1} — ₹${item.price}`;
  }
  // Same line plus a link to the product photo (resolved to a full URL) —
  // goes in the hidden field that reaches the shopkeeper's email.
  function itemLineWithPhoto(item) {
    const photo = item.image ? ` — Photo: ${new URL(item.image, location.href).href}` : '';
    return `${itemLine(item)}${photo}`;
  }
  // Rich row with an actual thumbnail — used in the on-page cart summary
  // so the customer can see exactly what they're ordering too.
  function itemRowHtml(item) {
    const thumb = item.image ? `<img src="${item.image}" alt="${item.name}">` : '';
    return `<div class="cart-summary-line">${thumb}<span>${item.name} × ${item.qty || 1} — ₹${item.price}</span></div>`;
  }

  function syncCartToForm() {
    const cart = Store.cart;
    if (!cart.length) {
      cartSummaryBox.textContent = 'Cart is empty — or type your items above.';
      cartSummaryBox.classList.remove('active');
      if (cartSummaryField) cartSummaryField.value = '';
      return;
    }
    if (cartSummaryField) cartSummaryField.value = cart.map(itemLineWithPhoto).join(', ');
    if (itemsTextarea && (!itemsTextarea.dataset.manual || itemsTextarea.dataset.manual === 'false')) {
      itemsTextarea.value = cart.map(itemLine).join('\n');
    }
    if (quantityInput && !quantityInput.dataset.manual) {
      quantityInput.value = Store.cartCount();
      updateDiscount();
    }
    const total = Store.cartTotal();
    const eligible = Store.cartCount() >= 5;
    const totalLine = eligible
      ? `<div class="cart-summary-total">Subtotal: ${formatRupees(total)} · 30% off → ${formatRupees(total * 0.7)}</div>`
      : `<div class="cart-summary-total">Subtotal: ${formatRupees(total)}</div>`;
    cartSummaryBox.innerHTML = `🛒 Cart ready:` + cart.map(itemRowHtml).join('') + totalLine;
    cartSummaryBox.classList.add('active');
  }

  itemsTextarea?.addEventListener('input', () => { itemsTextarea.dataset.manual = 'true'; });
  quantityInput?.addEventListener('input', () => { quantityInput.dataset.manual = 'true'; updateDiscount(); });

  orderForm.addEventListener('submit', () => {
    const cart = Store.cart;
    const summary = cart.map(itemLineWithPhoto).join(', ');
    if (cartSummaryField) cartSummaryField.value = summary || 'Customer typed items manually';
    if (itemsTextarea && !itemsTextarea.value.trim() && cart.length) {
      itemsTextarea.value = cart.map(itemLine).join('\n');
    }
    if (quantityInput && !quantityInput.dataset.manual && cart.length) {
      quantityInput.value = cart.reduce((s, i) => s + (i.qty || 1), 0);
    }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
  });

  (function checkSuccess() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === '1') {
      successMessage.classList.add('show');
      successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      Store.cart = [];
      Store.save();
      window.history.replaceState({}, document.title, window.location.pathname + '#order');
    }
  })();

  Store.onChange(syncCartToForm);
  updateDiscount();
  syncCartToForm();
});