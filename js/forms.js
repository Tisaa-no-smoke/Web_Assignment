/* ===== Contact form and newsletter form behavior ===== */

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
