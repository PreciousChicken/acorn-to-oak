(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  var menuToggle = document.getElementById("menu-toggle");
  var mobileMenu = document.getElementById("mobile-menu");
  var iconHamburger = document.getElementById("icon-hamburger");
  var iconClose = document.getElementById("icon-close");

  function openMenu() {
    mobileMenu.classList.remove("hidden");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
    iconHamburger.classList.add("hidden");
    iconClose.classList.remove("hidden");
  }

  function closeMenu() {
    mobileMenu.classList.add("hidden");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    iconHamburger.classList.remove("hidden");
    iconClose.classList.add("hidden");
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      var isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", function (event) {
      var isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      if (!isOpen) return;
      if (mobileMenu.contains(event.target) || menuToggle.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        closeMenu();
        menuToggle.focus();
      }
    });
  }

  /* ---------- Gallery lightbox ---------- */
  var triggers = Array.prototype.slice.call(document.querySelectorAll("#gallery [data-lightbox]"));
  var lightbox = document.getElementById("lightbox");

  if (triggers.length && lightbox) {
    var lightboxImage = document.getElementById("lightbox-image");
    var closeBtn = document.getElementById("lightbox-close");
    var prevBtn = document.getElementById("lightbox-prev");
    var nextBtn = document.getElementById("lightbox-next");
    var currentIndex = 0;
    var lastFocused = null;

    function show(index) {
      currentIndex = (index + triggers.length) % triggers.length;
      var img = triggers[currentIndex].querySelector("img");
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt;
    }

    function openLightbox(index) {
      lastFocused = document.activeElement;
      show(index);
      lightbox.classList.remove("hidden");
      lightbox.classList.add("flex");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.add("hidden");
      lightbox.classList.remove("flex");
      document.body.style.overflow = "";
      lightboxImage.src = "";
      if (lastFocused) lastFocused.focus();
    }

    triggers.forEach(function (trigger, index) {
      trigger.addEventListener("click", function () {
        openLightbox(index);
      });
    });

    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", function () { show(currentIndex - 1); });
    nextBtn.addEventListener("click", function () { show(currentIndex + 1); });

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (event) {
      if (lightbox.classList.contains("hidden")) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") show(currentIndex - 1);
      if (event.key === "ArrowRight") show(currentIndex + 1);
    });
  }
})();
