/* ===== Cart page rendering, quantity controls, delivery form, payment modal, and checkout ===== */

function changeCartQty(id, amount) {
  const cart = getCart();
  const item = cart.find(function (cartItem) {
    return cartItem.id === id;
  });

  if (!item) return;

  item.qty += amount;

  if (item.qty <= 0) {
    saveCart(cart.filter(function (cartItem) {
      return cartItem.id !== id;
    }));
  } else {
    saveCart(cart);
  }

  renderCart();
}

function removeCartItem(id) {
  const cart = getCart().filter(function (item) {
    return item.id !== id;
  });

  saveCart(cart);
  renderCart();
}

function renderCart() {
  const cartWrap = document.getElementById("cart-wrap");
  if (!cartWrap) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartWrap.innerHTML = `
      <div class="empty-cart">
        <h3>Your cart is empty</h3>
        <p>Browse our collection and add something you love.</p>
        <a href="products.html" class="btn" style="margin-top:1.5rem;">Shop Products</a>
      </div>`;
    return;
  }

  const subtotal = cart.reduce(function (total, item) {
    return total + item.price * item.qty;
  }, 0);
  const shipping = subtotal >= FREE_SHIPPING_AT ? 0 : 5;
  const total = subtotal + shipping;
  const itemCount = cart.reduce(function (count, item) {
    return count + item.qty;
  }, 0);
  const remaining = Math.max(0, FREE_SHIPPING_AT - subtotal);
  const progress = Math.min(100, subtotal / FREE_SHIPPING_AT * 100);

  const shippingMessage = remaining > 0
    ? `<div class="ship-bar">
         <p>You're <strong>${fmtUSD(remaining)}</strong> away from free Phnom Penh delivery</p>
         <div class="ship-track"><div class="ship-fill" style="width:${progress}%"></div></div>
       </div>`
    : `<div class="ship-bar ship-bar--done">
         <p>You have unlocked <strong>free delivery</strong> within Phnom Penh.</p>
       </div>`;

  const summaryItems = cart.slice(0, 3).map(function (item) {
    return `
      <div class="summary-item">
        <span>${escapeHTML(item.name)} × ${item.qty}</span>
        <strong>${fmtUSD(item.price * item.qty)}</strong>
      </div>`;
  }).join("");

  const extraItems = cart.length > 3
    ? `<p class="summary-extra">+ ${cart.length - 3} more item${cart.length - 3 === 1 ? "" : "s"}</p>`
    : "";
  const cityProvinceOptions = CAMBODIA_CITY_PROVINCES.map(function (place) {
    return `<button type="button" class="city-option" data-city-value="${escapeHTML(place)}">${escapeHTML(place)}</button>`;
  }).join("");
  const today = new Date();
  const minDeliveryDate = today.getFullYear() + "-"
    + String(today.getMonth() + 1).padStart(2, "0") + "-"
    + String(today.getDate()).padStart(2, "0");

  cartWrap.innerHTML = `
    <ol class="checkout-steps" aria-label="Checkout progress">
      <li class="active"><span>1</span>Cart</li>
      <li class="active"><span>2</span>Delivery</li>
      <li><span>3</span>Confirm</li>
    </ol>

    <div class="cart-layout">
      <div class="checkout-main">
        ${shippingMessage}
        <section class="cart-panel">
          <div class="cart-panel-head">
            <div>
              <span class="checkout-kicker">Selected items</span>
              <h3>Your order</h3>
            </div>
            <span class="item-pill">${itemCount} item${itemCount === 1 ? "" : "s"}</span>
          </div>

          <div class="cart-items">
            ${cart.map(function (item) {
              const itemTotal = item.price * item.qty;

              return `
                <div class="cart-item">
                  <img src="${escapeHTML(item.img)}" alt="${escapeHTML(item.name)}">
                  <div class="cart-item-info">
                    <h4>${escapeHTML(item.name)}</h4>
                    <p>${fmtUSD(item.price)} · ${escapeHTML(item.category)}</p>
                    <div class="qty-control">
                      <button type="button" class="qty-btn" data-action="decrease" data-id="${escapeHTML(item.id)}">−</button>
                      <span>${item.qty}</span>
                      <button type="button" class="qty-btn" data-action="increase" data-id="${escapeHTML(item.id)}">+</button>
                    </div>
                    <button type="button" class="remove-btn" data-action="remove" data-id="${escapeHTML(item.id)}">Remove</button>
                  </div>
                  <div class="cart-item-price">${fmtUSD(itemTotal)}</div>
                </div>`;
            }).join("")}
          </div>
        </section>

        <form id="checkout-form" class="checkout-form">
          <section class="checkout-section">
            <div class="checkout-section-head">
              <span class="checkout-icon">01</span>
              <div>
                <h3>Customer details</h3>
                <p>We will use these details to confirm your order.</p>
              </div>
            </div>
            <div class="checkout-grid">
              <label class="checkout-field">
                <span>Full name</span>
                <input type="text" name="customerName" placeholder="Your name" autocomplete="name" required>
              </label>
              <label class="checkout-field">
                <span>Phone / Telegram</span>
                <input type="tel" name="customerPhone" placeholder="+855 ..." autocomplete="tel" required>
              </label>
              <label class="checkout-field checkout-field-wide">
                <span>Email</span>
                <input type="email" name="customerEmail" placeholder="you@example.com" autocomplete="email">
              </label>
            </div>
          </section>

          <section class="checkout-section">
            <div class="checkout-section-head">
              <span class="checkout-icon">02</span>
              <div>
                <h3>Delivery</h3>
                <p>Same-week delivery in Phnom Penh and 2 or 3 days to provinces.</p>
              </div>
            </div>
            <div class="checkout-grid">
              <label class="checkout-field">
                <span>Country</span>
                <input class="country-input" type="text" value="Cambodia" readonly>
              </label>
              <label class="checkout-field city-province-field">
                <span>Province (Required)</span>
                <div class="city-select">
                  <div class="city-search-row">
                    <input class="city-province-input" type="search" name="deliveryCity" placeholder="-- Select province *" autocomplete="address-level2" required>
                    <button type="button" class="city-toggle-btn" aria-label="Open province list"></button>
                  </div>
                  <div class="city-options" role="listbox">
                    ${cityProvinceOptions}
                    <p class="city-empty" hidden>No city or province found.</p>
                  </div>
                </div>
              </label>
              <label class="checkout-field">
                <span>Delivery date</span>
                <input type="date" name="deliveryDate" min="${minDeliveryDate}" required>
              </label>
              <label class="checkout-field checkout-field-wide">
                <span>Delivery address</span>
                <textarea name="deliveryAddress" placeholder="House number, street, sangkat, landmark" required></textarea>
              </label>
              <label class="checkout-field checkout-field-wide">
                <span>Order note</span>
                <textarea name="deliveryNote" placeholder="Gate code, preferred contact time, or special request"></textarea>
              </label>
            </div>
          </section>

          <section class="checkout-section">
            <div class="checkout-section-head">
              <span class="checkout-icon">03</span>
              <div>
                <h3>Payment method</h3>
                <p>Choose cash at delivery or scan the QR code.</p>
              </div>
            </div>
            <div class="payment-options">
              <label class="payment-option">
                <input type="radio" name="paymentMethod" value="cash" checked>
                <span class="payment-card"><strong>Cash by Delivery</strong><small>Pay when your order arrives</small></span>
              </label>
              <label class="payment-option">
                <input type="radio" name="paymentMethod" value="qr">
                <span class="payment-card"><strong>QR Code</strong><small>Scan to pay online</small></span>
              </label>
            </div>
          </section>
        </form>
      </div>

      <aside class="cart-summary">
        <span class="checkout-kicker">Secure order</span>
        <h3>Order Summary</h3>
        <p class="summary-count">${itemCount} item${itemCount === 1 ? "" : "s"} ready for checkout</p>
        <div class="summary-items">${summaryItems}${extraItems}</div>
        <div class="summary-row"><span>Subtotal</span><span>${fmtUSD(subtotal)}</span></div>
        <div class="summary-row"><span>Delivery</span><span>${shipping === 0 ? "Free" : fmtUSD(shipping)}</span></div>
        <div class="summary-total">
          <span>Total</span>
          <span>${fmtUSD(total)}</span>
          <span class="total-khr">${fmtKHR(total)}</span>
        </div>
        <div class="summary-payments">
          <span>Cash by Delivery</span>
          <span>QR Code</span>
        </div>
        <button class="btn checkout-submit" type="submit" form="checkout-form">Place Order</button>
        <a href="products.html" class="summary-link">Continue shopping</a>
      </aside>
    </div>`;
}

function renderOrderConfirmation(receipt) {
  const cartWrap = document.getElementById("cart-wrap");
  if (!cartWrap) return;

  const customer = receipt.customer || {};
  const delivery = receipt.delivery || {};
  const payment = receipt.payment || "Payment pending";
  const deliveryDate = delivery.date || "Delivery date pending";
  const receiptItems = receipt.items.map(function (item) {
    return `
      <div class="receipt-item">
        <img src="${escapeHTML(item.img)}" alt="${escapeHTML(item.name)}">
        <div class="receipt-meta">
          <strong>${escapeHTML(item.name)}</strong>
          <span>${escapeHTML(item.category)} · ${fmtUSD(item.price)} × ${item.qty}</span>
        </div>
        <div class="receipt-line-total">${fmtUSD(item.price * item.qty)}</div>
      </div>`;
  }).join("");

  cartWrap.innerHTML = `
    <ol class="checkout-steps" aria-label="Checkout progress">
      <li class="active"><span>1</span>Cart</li>
      <li class="active"><span>2</span>Delivery</li>
      <li class="active"><span>3</span>Confirm</li>
    </ol>

    <section class="checkout-confirmation checkout-complete" aria-live="polite">
      <div class="modal-mark">✓</div>
      <span class="checkout-kicker">Order confirmed</span>
      <h2>Thank you, ${escapeHTML(customer.name || "Customer")}</h2>
      <p class="modal-sub">Your order is confirmed and your receipt is ready.</p>

      <div class="confirmation-card">
        <div class="modal-row"><span>Order number</span><strong>${escapeHTML(receipt.orderId)}</strong></div>
        <div class="modal-row"><span>Total</span><strong>${fmtUSD(receipt.total)} · ${fmtKHR(receipt.total)}</strong></div>
        <div class="modal-row"><span>Payment</span><strong>${escapeHTML(payment)}</strong></div>
        <div class="modal-row"><span>Delivery</span><strong>${escapeHTML(delivery.city || "Delivery pending")}</strong></div>
        <div class="modal-row"><span>Date</span><strong>${escapeHTML(deliveryDate)}</strong></div>
      </div>

      <article class="receipt-card confirmation-receipt">
        <div class="receipt-head">
          <div>
            <span class="receipt-label">Receipt</span>
            <h3>${escapeHTML(receipt.orderId)}</h3>
            <p class="receipt-date">${formatReceiptDate(receipt.date)}</p>
          </div>
          <div class="receipt-total">
            ${fmtUSD(receipt.total)}
            <span>${fmtKHR(receipt.total)}</span>
          </div>
        </div>

        <div class="receipt-details">
          <div><span>Customer</span><strong>${escapeHTML(customer.name || "Customer")}</strong></div>
          <div><span>Payment</span><strong>${escapeHTML(payment)}</strong></div>
          <div><span>Delivery</span><strong>${escapeHTML(delivery.city || "Delivery pending")}</strong></div>
        </div>

        <div class="receipt-items">
          ${receiptItems}
        </div>

        <div class="receipt-summary">
          <div><span>Subtotal</span><strong>${fmtUSD(receipt.subtotal)}</strong></div>
          <div><span>Delivery</span><strong>${receipt.shipping === 0 ? "Free" : fmtUSD(receipt.shipping)}</strong></div>
          <div><span>Total</span><strong>${fmtUSD(receipt.total)}</strong></div>
        </div>
      </article>

      <div class="confirmation-next">
        <div><span>1</span><p>Team review</p></div>
        <div><span>2</span><p>Payment confirm</p></div>
        <div><span>3</span><p>Delivery</p></div>
      </div>

      <p class="modal-foot">We will contact ${escapeHTML(customer.phone || "you")} to confirm the address and payment.</p>
      <div class="modal-actions">
        <a href="receipts.html" class="btn btn-outline modal-link">View receipt history</a>
        <a href="products.html" class="btn modal-link">Continue shopping</a>
      </div>
    </section>`;

  const stickyHeader = document.querySelector(".site-header");
  const headerOffset = stickyHeader ? stickyHeader.offsetHeight : 0;
  const top = cartWrap.getBoundingClientRect().top + window.scrollY - headerOffset - 18;

  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

function showQrPaymentModal() {
  const existingModal = document.querySelector(".qr-modal-overlay");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.className = "modal-overlay qr-modal-overlay";
  modal.innerHTML = `
    <div class="modal qr-modal" role="dialog" aria-modal="true" aria-labelledby="qr-modal-title">
      <button type="button" class="qr-modal-close" aria-label="Close QR code">×</button>
      <span class="checkout-kicker">QR Code Payment</span>
      <h2 id="qr-modal-title">Scan to pay</h2>
      <p class="modal-sub">Please complete the transfer before placing your order.</p>
      <img src="site-photos/Qrcode.jpg" alt="Payment QR code">
      <button type="button" class="btn qr-modal-close-btn">Done</button>
    </div>`;

  document.body.appendChild(modal);

  modal.addEventListener("click", function (event) {
    if (event.target === modal || event.target.closest(".qr-modal-close, .qr-modal-close-btn")) {
      modal.remove();
    }
  });
}

function closeCityProvinceMenus(exceptMenu) {
  document.querySelectorAll(".city-select.open").forEach(function (citySelect) {
    if (citySelect !== exceptMenu) {
      citySelect.classList.remove("open");
    }
  });
}

function filterCityProvinceOptions(citySelect) {
  if (!citySelect) return;

  const input = citySelect.querySelector(".city-province-input");
  const options = citySelect.querySelectorAll(".city-option");
  const emptyMessage = citySelect.querySelector(".city-empty");
  const searchText = input ? input.value.trim().toLowerCase() : "";
  let visibleCount = 0;

  options.forEach(function (option) {
    const matches = option.textContent.toLowerCase().includes(searchText);
    option.hidden = !matches;
    if (matches) visibleCount += 1;
  });

  if (emptyMessage) {
    emptyMessage.hidden = visibleCount > 0;
  }

  citySelect.classList.add("open");
}

function openCityProvinceMenu(citySelect) {
  if (!citySelect) return;

  closeCityProvinceMenus(citySelect);
  filterCityProvinceOptions(citySelect);
}

function selectCityProvince(option) {
  const citySelect = option.closest(".city-select");
  const input = citySelect ? citySelect.querySelector(".city-province-input") : null;

  if (input) {
    input.value = option.dataset.cityValue || option.textContent.trim();
  }

  if (citySelect) {
    citySelect.querySelectorAll(".city-option").forEach(function (cityOption) {
      cityOption.classList.toggle("selected", cityOption === option);
    });
    citySelect.classList.add("has-value");
    citySelect.classList.remove("open");
  }
}

function initCartPage() {
  const cartWrap = document.getElementById("cart-wrap");
  if (!cartWrap) return;

  cartWrap.addEventListener("click", function (event) {
    const cityOption = event.target.closest(".city-option");

    if (cityOption) {
      event.stopPropagation();
      selectCityProvince(cityOption);
      return;
    }

    const citySearchButton = event.target.closest(".city-toggle-btn");

    if (citySearchButton) {
      event.stopPropagation();
      const citySelect = citySearchButton.closest(".city-select");
      const cityInput = citySelect ? citySelect.querySelector(".city-province-input") : null;
      openCityProvinceMenu(citySelect);
      if (cityInput) cityInput.focus();
      return;
    }

    if (!event.target.closest(".city-select")) {
      closeCityProvinceMenus();
    }

    const qrOption = event.target.closest(".payment-option");

    if (qrOption) {
      const qrInput = qrOption.querySelector('input[name="paymentMethod"][value="qr"]');
      if (qrInput && qrInput.checked) {
        showQrPaymentModal();
      }
    }

    const button = event.target.closest("button");
    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id;

    if (action === "increase") changeCartQty(id, 1);
    if (action === "decrease") changeCartQty(id, -1);
    if (action === "remove") removeCartItem(id);
  });

  cartWrap.addEventListener("input", function (event) {
    if (!event.target.classList.contains("city-province-input")) return;

    filterCityProvinceOptions(event.target.closest(".city-select"));
  });

  cartWrap.addEventListener("focusin", function (event) {
    if (!event.target.classList.contains("city-province-input")) return;

    openCityProvinceMenu(event.target.closest(".city-select"));
  });

  cartWrap.addEventListener("keydown", function (event) {
    if (!event.target.classList.contains("city-province-input")) return;

    const citySelect = event.target.closest(".city-select");

    if (event.key === "Escape") {
      if (citySelect) citySelect.classList.remove("open");
      return;
    }

    if (event.key === "Enter" && citySelect && citySelect.classList.contains("open")) {
      const firstVisibleOption = Array.from(citySelect.querySelectorAll(".city-option")).find(function (option) {
        return !option.hidden;
      });

      if (firstVisibleOption) {
        event.preventDefault();
        selectCityProvince(firstVisibleOption);
      }
    }
  });

  cartWrap.addEventListener("submit", function (event) {
    if (event.target.id !== "checkout-form") return;

    event.preventDefault();
    checkout(event.target);
  });

  cartWrap.addEventListener("change", function (event) {
    if (event.target.name !== "paymentMethod") return;

    if (event.target.value === "qr") {
      showQrPaymentModal();
    }
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".city-select")) {
      closeCityProvinceMenus();
    }
  });

  renderCart();
}

function checkout(form) {
  const cart = getCart();
  if (cart.length === 0) return;

  const checkoutDetails = getCheckoutDetails(form);
  const customer = checkoutDetails.customer;
  const delivery = checkoutDetails.delivery;
  const paymentLabel = getPaymentLabel(checkoutDetails.payment);

  if (!customer.name || !customer.phone || !delivery.city || !delivery.address) {
    showToast("Please complete your checkout details.");
    return;
  }

  const orderId = "AM-" + Math.floor(100000 + Math.random() * 900000);
  const subtotal = cart.reduce(function (sum, item) {
    return sum + item.price * item.qty;
  }, 0);
  const shipping = subtotal >= FREE_SHIPPING_AT ? 0 : 5;
  const finalTotal = subtotal + shipping;
  const receipt = {
    orderId: orderId,
    date: new Date().toISOString(),
    items: cart,
    subtotal: subtotal,
    shipping: shipping,
    total: finalTotal,
    customer: customer,
    delivery: delivery,
    payment: paymentLabel
  };

  saveReceipt(receipt);
  saveCart([]);
  renderOrderConfirmation(receipt);
}
