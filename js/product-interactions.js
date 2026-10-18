/* ===== Product cards, Add to Cart, product detail popup, and product filters ===== */

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

  if (text.includes("wooden") || text.includes("wood")) {
    material = "Solid Cambodian wood";
    origin = "Cambodian wood workshop";
  } else if (text.includes("rattan")) {
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
