/* ===== Receipt history page rendering ===== */

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
                <h3>${escapeHTML(receipt.orderId)}</h3>
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
                    <img src="${escapeHTML(item.img)}" alt="${escapeHTML(item.name)}">
                    <div class="receipt-meta">
                      <strong>${escapeHTML(item.name)}</strong>
                      <span>${escapeHTML(item.category)} · ${fmtUSD(item.price)} × ${item.qty}</span>
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
