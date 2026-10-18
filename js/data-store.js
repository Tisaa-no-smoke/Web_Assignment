/* ===== Shared data, formatting, and localStorage helpers ===== */

/* ===== Kingdom Homecraft — Small Shared JS ===== */
/* Most product content is now written directly in HTML. */

const CART_KEY = "kingdom_homecraft_cart";
const RECEIPT_KEY = "kingdom_homecraft_receipts";

/* Move carts and receipts saved under the old project name to the new keys */
[["angkor_maison_cart", CART_KEY], ["angkor_maison_receipts", RECEIPT_KEY]].forEach(function (keys) {
  try {
    const oldData = localStorage.getItem(keys[0]);
    if (oldData !== null && localStorage.getItem(keys[1]) === null) {
      localStorage.setItem(keys[1], oldData);
    }
    localStorage.removeItem(keys[0]);
  } catch (error) {
    /* Storage is unavailable, nothing to move */
  }
});
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
