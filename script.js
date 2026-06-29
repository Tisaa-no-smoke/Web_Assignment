/* ===== Kingdom Homecraft — Small Shared JS ===== */
/* Most product content is now written directly in HTML. */

const CART_KEY = "angkor_maison_cart";
const RECEIPT_KEY = "angkor_maison_receipts";
const FREE_SHIPPING_AT = 200;
const KHR_RATE = 4100;
const CAMBODIA_CITY_PROVINCES = [
  "Phnom Penh",
  "Banteay Meanchey",
  "Battambang",
  "Kampong Cham",
  "Kampong Chhnang",
  "Kampong Speu",
  "Kampong Thom",
  "Kampot",
  "Kandal",
  "Kep",
  "Koh Kong",
  "Kratie",
  "Mondulkiri",
  "Oddar Meanchey",
  "Pailin",
  "Preah Vihear",
  "Prey Veng",
  "Pursat",
  "Preah Sihanouk",
  "Ratanakiri",
  "Siem Reap",
  "Stung Treng",
  "Svay Rieng",
  "Takeo",
  "Tboung Khmum"
];

function fmtUSD(price) {
  return "$" + Number(price).toLocaleString();
}

function fmtKHR(price) {
  return "៛" + (Number(price) * KHR_RATE).toLocaleString();
}

function escapeHTML(value) {
  return String(value || "").replace(/[&<>"']/g, function (character) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character];
  });
}

function getCart() {
  let cart = [];

  try {
    cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch (error) {
    cart = [];
  }

  return cart
    .filter(function (item) {
      return item && item.name && item.category && item.img && Number.isFinite(Number(item.price));
    })
    .map(function (item) {
      item.id = String(item.id);
      item.price = Number(item.price);
      item.qty = Number(item.qty) || 1;
      return item;
    });
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function getReceipts() {
  let receipts = [];

  try {
    receipts = JSON.parse(localStorage.getItem(RECEIPT_KEY) || "[]");
  } catch (error) {
    receipts = [];
  }

  return receipts
    .filter(function (receipt) {
      return receipt && receipt.orderId && Array.isArray(receipt.items);
    })
    .map(function (receipt) {
      receipt.subtotal = Number(receipt.subtotal) || 0;
      receipt.shipping = Number(receipt.shipping) || 0;
      receipt.total = Number(receipt.total) || receipt.subtotal + receipt.shipping;
      receipt.items = receipt.items
        .filter(function (item) {
          return item && item.name && item.category && item.img;
        })
        .map(function (item) {
          return {
            id: String(item.id),
            name: item.name,
            category: item.category,
            price: Number(item.price) || 0,
            img: item.img,
            qty: Number(item.qty) || 1
          };
        });
      return receipt;
    });
}

function saveReceipt(receipt) {
  const receipts = getReceipts();
  receipts.unshift(receipt);
  localStorage.setItem(RECEIPT_KEY, JSON.stringify(receipts));
}

function formatReceiptDate(dateText) {
  const date = new Date(dateText);

  if (Number.isNaN(date.getTime())) {
    return "Recent order";
  }

  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getPaymentLabel(value) {
  const paymentLabels = {
    cash: "Cash by Delivery",
    qr: "QR Code"
  };

  return paymentLabels[value] || "Cash by Delivery";
}

function getCheckoutDetails(form) {
  if (!form || typeof FormData === "undefined") {
    return {
      customer: { name: "Walk-in Customer", phone: "", email: "" },
      delivery: { city: "Phnom Penh", address: "", date: "", note: "" },
      payment: "cash"
    };
  }

  const formData = new FormData(form);

  return {
    customer: {
      name: String(formData.get("customerName") || "").trim(),
      phone: String(formData.get("customerPhone") || "").trim(),
      email: String(formData.get("customerEmail") || "").trim()
    },
    delivery: {
      city: String(formData.get("deliveryCity") || "").trim(),
      address: String(formData.get("deliveryAddress") || "").trim(),
      date: String(formData.get("deliveryDate") || "").trim(),
      note: String(formData.get("deliveryNote") || "").trim()
    },
    payment: String(formData.get("paymentMethod") || "cash").trim()
  };
}

function updateCartBadge() {
  const badge = document.querySelector(".cart-badge");
  if (!badge) return;

  const cart = getCart();
  const count = cart.reduce((total, item) => total + item.qty, 0);

  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}

function showToast(message) {
  let toast = document.querySelector(".toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toast.timer);
  toast.timer = setTimeout(function () {
    toast.classList.remove("show");
  }, 2400);
}

function bumpCartBadge() {
  const badge = document.querySelector(".cart-badge");
  if (!badge) return;

  badge.classList.remove("bump");
  void badge.offsetWidth;
  badge.classList.add("bump");
}

function getProductFromCard(card) {
  return {
    id: card.dataset.id,
    name: card.dataset.name,
    category: card.dataset.category,
    price: Number(card.dataset.price),
    img: card.dataset.img,
    qty: 1
  };
}

function addProductCardToCart(card) {
  const product = getProductFromCard(card);
  const cart = getCart();
  const existingItem = cart.find(function (item) {
    return item.id === product.id;
  });

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push(product);
  }

  saveCart(cart);
  bumpCartBadge();
  showToast('Added "' + product.name + '" to cart');
}

function addProductToCart(button) {
  const card = button.closest(".product-card");
  if (!card) return;

  addProductCardToCart(card);
}

function initAddToCartButtons() {
  const buttons = document.querySelectorAll(".add-cart");

  buttons.forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      addProductToCart(button);
    });
  });
}

function getProductDetailText(card) {
  const description = card.querySelector(".product-desc");
  return description ? description.textContent.trim() : "Hand-selected by Kingdom Homecraft for warm Cambodian homes.";
}

function getProductCraftDetails(product, description) {
  const text = (product.name + " " + product.category + " " + description).toLowerCase();
  let material = "Cambodian artisan material";
  let origin = "Phnom Penh studio";
  let care = "Wipe gently with a soft dry cloth";

  if (text.includes("rattan")) {
    material = "Natural woven rattan";
    origin = "Kampong Cham weaving partners";
  } else if (text.includes("teak")) {
    material = "Reclaimed Cambodian teak";
    origin = "Mondulkiri wood workshop";
  } else if (text.includes("krama")) {
    material = "Krama-inspired cotton";
    origin = "Takeo textile partners";
  } else if (text.includes("silk")) {
    material = "Naturally dyed silk";
    origin = "Takeo silk weavers";
    care = "Keep dry and away from harsh sunlight";
  } else if (text.includes("brass")) {
    material = "Hand-finished brass";
    origin = "Phnom Penh metal workshop";
  } else if (text.includes("ceramic") || text.includes("terracotta") || text.includes("vase")) {
    material = "Hand-thrown ceramic";
    origin = "Kampong Chhnang pottery village";
  } else if (text.includes("plant") || text.includes("palm") || text.includes("sapling")) {
    material = "Live indoor plant";
    origin = "Local Cambodian nursery";
    care = "Bright indirect light and moderate watering";
  } else if (text.includes("hyacinth")) {
    material = "Water hyacinth fiber";
    origin = "Tonle Sap weaving partners";
  } else if (text.includes("kampot")) {
    material = "Kampot-inspired natural blend";
    origin = "Kampot makers";
  }

  return { material: material, origin: origin, care: care };
}

function getProductSizeText(product, description) {
  const sizeMatch = description.match(/\d+\s*x\s*\d+\s*cm|\d+\s*cm/i);

  if (sizeMatch) {
    return sizeMatch[0].replace(/\s+/g, " ");
  }

  if (product.category === "Furniture") return "Standard home furniture size";
  if (product.category === "Lighting") return "Indoor accent lighting";
  if (product.category === "Plants") return "Indoor-friendly potted size";
  if (product.category === "Wall Decoration") return "Ready for wall display";

  return "Small-batch home accessory";
}

function showProductDetailModal(card) {
  const existingModal = document.querySelector(".product-detail-overlay");
  if (existingModal) existingModal.remove();

  const product = getProductFromCard(card);
  const description = getProductDetailText(card);
  const craftDetails = getProductCraftDetails(product, description);
  const sizeText = getProductSizeText(product, description);
  const modal = document.createElement("div");

  modal.className = "modal-overlay product-detail-overlay";
  modal.innerHTML = `
    <div class="modal product-detail-modal" role="dialog" aria-modal="true" aria-labelledby="product-detail-title">
      <button type="button" class="product-detail-close" aria-label="Close product details">×</button>
      <div class="product-detail-grid">
        <div class="product-detail-media">
          <img src="${escapeHTML(product.img)}" alt="${escapeHTML(product.name)}">
        </div>
        <div class="product-detail-info">
          <span class="checkout-kicker">${escapeHTML(product.category)}</span>
          <h2 id="product-detail-title">${escapeHTML(product.name)}</h2>
          <div class="product-detail-price">
            <strong>${fmtUSD(product.price)}</strong>
            <span>${fmtKHR(product.price)}</span>
          </div>
          <p class="product-detail-desc">${escapeHTML(description)}</p>

          <div class="product-detail-facts">
            <div><span>Material</span><strong>${escapeHTML(craftDetails.material)}</strong></div>
            <div><span>Origin</span><strong>${escapeHTML(craftDetails.origin)}</strong></div>
            <div><span>Size</span><strong>${escapeHTML(sizeText)}</strong></div>
            <div><span>Care</span><strong>${escapeHTML(craftDetails.care)}</strong></div>
          </div>

          <div class="product-detail-note">
            <span>Delivery</span>
            <p>Same-week Phnom Penh delivery. Province delivery usually takes 2 or 3 days.</p>
          </div>

          <div class="product-detail-actions">
            <button type="button" class="btn product-detail-add">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>`;

  document.body.appendChild(modal);

  modal.addEventListener("click", function (event) {
    if (event.target === modal || event.target.closest(".product-detail-close")) {
      modal.remove();
      return;
    }

    if (event.target.closest(".product-detail-add")) {
      addProductCardToCart(card);
    }
  });
}

function initProductDetails() {
  const cards = document.querySelectorAll(".product-card");

  cards.forEach(function (card) {
    card.tabIndex = 0;

    card.addEventListener("click", function (event) {
      if (event.target.closest(".add-cart, button, a")) return;
      showProductDetailModal(card);
    });

    card.addEventListener("keydown", function (event) {
      if (event.key !== "Enter") return;
      if (event.target.closest(".add-cart, button, a")) return;
      showProductDetailModal(card);
    });
  });
}

function filterProducts() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  const activeButton = document.querySelector(".filter-btn.active");
  const searchInput = document.getElementById("search");
  const noProducts = document.getElementById("no-products");

  const activeCategory = activeButton ? activeButton.dataset.category : "All";
  const searchText = searchInput ? searchInput.value.toLowerCase() : "";
  const cards = grid.querySelectorAll(".product-card");
  let visibleCount = 0;

  cards.forEach(function (card) {
    const productName = card.dataset.name.toLowerCase();
    const productCategory = card.dataset.category;
    const categoryMatches = activeCategory === "All" || productCategory === activeCategory;
    const searchMatches = productName.includes(searchText);
    const shouldShow = categoryMatches && searchMatches;

    card.hidden = !shouldShow;
    if (shouldShow) visibleCount += 1;
  });

  if (noProducts) {
    noProducts.hidden = visibleCount > 0;
  }
}

function initProductFilters() {
  const filters = document.getElementById("filters");
  const searchInput = document.getElementById("search");
  if (!filters || !searchInput) return;

  const urlCategory = new URLSearchParams(location.search).get("cat");

  if (urlCategory) {
    const selectedButton = filters.querySelector('[data-category="' + urlCategory + '"]');
    if (selectedButton) {
      filters.querySelectorAll(".filter-btn").forEach(function (button) {
        button.classList.toggle("active", button === selectedButton);
      });
    }
  }

  filters.addEventListener("click", function (event) {
    const button = event.target.closest(".filter-btn");
    if (!button) return;

    filters.querySelectorAll(".filter-btn").forEach(function (filterButton) {
      filterButton.classList.toggle("active", filterButton === button);
    });

    filterProducts();
  });

  searchInput.addEventListener("input", filterProducts);
  filterProducts();
}

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
                  <img src="${item.img}" alt="${escapeHTML(item.name)}">
                  <div class="cart-item-info">
                    <h4>${escapeHTML(item.name)}</h4>
                    <p>${fmtUSD(item.price)} · ${escapeHTML(item.category)}</p>
                    <div class="qty-control">
                      <button type="button" class="qty-btn" data-action="decrease" data-id="${item.id}">−</button>
                      <span>${item.qty}</span>
                      <button type="button" class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
                    </div>
                    <button type="button" class="remove-btn" data-action="remove" data-id="${item.id}">Remove</button>
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

function renderReceiptHistory() {
  const receiptWrap = document.getElementById("receipt-history");
  if (!receiptWrap) return;

  const receipts = getReceipts();

  if (receipts.length === 0) {
    receiptWrap.innerHTML = `
      <div class="empty-cart">
        <h3>No receipts yet</h3>
        <p>Your completed orders will appear here after checkout.</p>
        <a href="products.html" class="btn" style="margin-top:1.5rem;">Shop Products</a>
      </div>`;
    return;
  }

  receiptWrap.innerHTML = `
    <div class="receipt-list">
      ${receipts.map(function (receipt) {
        const customerName = receipt.customer && receipt.customer.name ? receipt.customer.name : "Customer";
        const deliveryCity = receipt.delivery && receipt.delivery.city ? receipt.delivery.city : "Delivery";
        const payment = receipt.payment || "Payment pending";

        return `
          <article class="receipt-card">
            <div class="receipt-head">
              <div>
                <span class="receipt-label">Receipt</span>
                <h3>${receipt.orderId}</h3>
                <p class="receipt-date">${formatReceiptDate(receipt.date)}</p>
              </div>
              <div class="receipt-total">
                ${fmtUSD(receipt.total)}
                <span>${fmtKHR(receipt.total)}</span>
              </div>
            </div>

            <div class="receipt-details">
              <div><span>Customer</span><strong>${escapeHTML(customerName)}</strong></div>
              <div><span>Payment</span><strong>${escapeHTML(payment)}</strong></div>
              <div><span>Delivery</span><strong>${escapeHTML(deliveryCity)}</strong></div>
            </div>

            <div class="receipt-items">
              ${receipt.items.map(function (item) {
                return `
                  <div class="receipt-item">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="receipt-meta">
                      <strong>${item.name}</strong>
                      <span>${item.category} · ${fmtUSD(item.price)} × ${item.qty}</span>
                    </div>
                    <div class="receipt-line-total">${fmtUSD(item.price * item.qty)}</div>
                  </div>`;
              }).join("")}
            </div>

            <div class="receipt-summary">
              <div><span>Subtotal</span><strong>${fmtUSD(receipt.subtotal)}</strong></div>
              <div><span>Delivery</span><strong>${receipt.shipping === 0 ? "Free" : fmtUSD(receipt.shipping)}</strong></div>
              <div><span>Total</span><strong>${fmtUSD(receipt.total)}</strong></div>
            </div>
          </article>`;
      }).join("")}
    </div>`;
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
  const deliveryDate = delivery.date || "Delivery date pending";
  const modal = document.createElement("div");

  saveReceipt({
    orderId: orderId,
    date: new Date().toISOString(),
    items: cart,
    subtotal: subtotal,
    shipping: shipping,
    total: finalTotal,
    customer: customer,
    delivery: delivery,
    payment: paymentLabel
  });

  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal checkout-complete">
      <div class="modal-mark">✓</div>
      <span class="checkout-kicker">Order confirmed</span>
      <h2>Thank you, ${escapeHTML(customer.name)}</h2>
      <p class="modal-sub">Your order is now in our delivery queue.</p>

      <div class="confirmation-card">
        <div class="modal-row"><span>Order number</span><strong>${orderId}</strong></div>
        <div class="modal-row"><span>Total</span><strong>${fmtUSD(finalTotal)} · ${fmtKHR(finalTotal)}</strong></div>
        <div class="modal-row"><span>Payment</span><strong>${escapeHTML(paymentLabel)}</strong></div>
        <div class="modal-row"><span>Delivery</span><strong>${escapeHTML(delivery.city)}</strong></div>
        <div class="modal-row"><span>Date</span><strong>${escapeHTML(deliveryDate)}</strong></div>
      </div>

      <div class="confirmation-next">
        <div><span>1</span><p>Team review</p></div>
        <div><span>2</span><p>Payment confirm</p></div>
        <div><span>3</span><p>Delivery</p></div>
      </div>

      <p class="modal-foot">We will contact ${escapeHTML(customer.phone)} to confirm the address and payment.</p>
      <div class="modal-actions">
        <a href="receipts.html" class="btn btn-outline modal-link">View receipt history</a>
        <a href="products.html" class="btn modal-link">Continue shopping</a>
      </div>
    </div>`;

  document.body.appendChild(modal);

  modal.addEventListener("click", function (event) {
    if (event.target === modal) modal.remove();
  });

  requestAnimationFrame(function () {
    modal.classList.add("show");
  });

  saveCart([]);
  renderCart();
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    showToast("Thanks for reaching out. We will reply soon.");
    form.reset();
  });
}

function initNewsletterForm() {
  const form = document.getElementById("newsletter-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    showToast("Thank you for subscribing.");
    form.reset();
  });
}

function initRevealAnimation() {
  const revealItems = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) {
      item.classList.add("in");
    });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach(function (item) {
    observer.observe(item);
  });
}

let slideIndex = 1;
let slideTimer = null;
const SLIDE_AUTO_MS = 4500;

function plusSlides(n) {
  showSlides(slideIndex += n);
  restartAutoSlides();
}

function currentSlide(n) {
  showSlides(slideIndex = n);
  restartAutoSlides();
}

function showSlides(n) {
  let i;
  const slides = document.getElementsByClassName("mySlides");
  const dots = document.getElementsByClassName("dot");

  if (slides.length === 0) return;

  if (n > slides.length) {
    slideIndex = 1;
  }

  if (n < 1) {
    slideIndex = slides.length;
  }

  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }

  slides[slideIndex - 1].style.display = "block";

  if (dots[slideIndex - 1]) {
    dots[slideIndex - 1].className += " active";
  }
}

function restartAutoSlides() {
  const slides = document.getElementsByClassName("mySlides");

  if (slideTimer) {
    clearInterval(slideTimer);
  }

  if (slides.length <= 1) return;

  slideTimer = setInterval(function () {
    showSlides(slideIndex += 1);
  }, SLIDE_AUTO_MS);
}

function initSlideshow() {
  showSlides(slideIndex);
  restartAutoSlides();
}

document.addEventListener("DOMContentLoaded", function () {
  updateCartBadge();
  initAddToCartButtons();
  initProductDetails();
  initProductFilters();
  initCartPage();
  initContactForm();
  initNewsletterForm();
  renderReceiptHistory();
  initSlideshow();
  initRevealAnimation();
});
