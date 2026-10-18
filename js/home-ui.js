/* ===== Reveal animation and home page slideshow ===== */

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
