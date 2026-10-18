/* ===== Navbar cart badge and toast animation helpers ===== */

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
