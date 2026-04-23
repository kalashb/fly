/* Fun Learning Youth (FLY) - small interactions only (mobile nav, homepage slider, contact mailto helper). */

function qs(root, sel) {
  return (root || document).querySelector(sel);
}

function qsa(root, sel) {
  return Array.from((root || document).querySelectorAll(sel));
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function initNav() {
  var toggle = qs(document, "[data-nav-toggle]");
  var nav = qs(document, "[data-site-nav]");
  if (!toggle || !nav) return;

  var open = false;

  function setOpen(next) {
    open = next;
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  toggle.addEventListener("click", function () {
    setOpen(!open);
  });

  nav.addEventListener("click", function (event) {
    var t = event.target;
    if (t && t.tagName === "A") setOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setOpen(false);
  });

  document.addEventListener("click", function (event) {
    if (!open) return;
    var target = event.target;
    if (target === toggle || toggle.contains(target)) return;
    if (nav.contains(target)) return;
    setOpen(false);
  });
}

function initActiveNav() {
  var page = document.body.getAttribute("data-page");
  if (!page) return;

  qsa(document, "[data-site-nav] a[data-nav]").forEach(function (link) {
    if (link.getAttribute("data-nav") === page) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function initSlider(root) {
  if (!root) return;

  var track = qs(root, "[data-slider-track]");
  var slides = qsa(track, "[data-slide]");
  var prev = qs(root, "[data-slider-prev]");
  var next = qs(root, "[data-slider-next]");
  var dotsRoot = qs(root, "[data-slider-dots]");
  var caption = qs(root, "[data-slider-caption]");

  if (!track || slides.length === 0) return;

  var index = 0;
  var timer = null;
  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setIndex(next) {
    index = clamp(next, 0, slides.length - 1);
    root.style.setProperty("--slide", String(index));

    qsa(root, "[data-slider-dot]").forEach(function (dot, i) {
      dot.setAttribute("aria-current", i === index ? "true" : "false");
    });

    var active = slides[index];
    var text = active ? active.getAttribute("data-caption") : "";
    if (caption) caption.textContent = text || "";

    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === slides.length - 1;
  }

  function step(delta) {
    setIndex(index + delta);
  }

  function buildDots() {
    if (!dotsRoot) return;
    dotsRoot.innerHTML = "";

    slides.forEach(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "dot";
      b.setAttribute("data-slider-dot", "");
      b.setAttribute("aria-label", "Show slide " + (i + 1));
      b.addEventListener("click", function () {
        setIndex(i);
        restartAutoplay();
      });
      dotsRoot.appendChild(b);
    });
  }

  function stopAutoplay() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  function startAutoplay() {
    if (reduceMotion) return;
    stopAutoplay();
    timer = window.setInterval(function () {
      if (index >= slides.length - 1) setIndex(0);
      else step(1);
    }, 2200); // this is the time in milliseconds between each slide
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  if (prev) prev.addEventListener("click", function () { step(-1); restartAutoplay(); });
  if (next) next.addEventListener("click", function () { step(1); restartAutoplay(); });

  root.addEventListener("mouseenter", stopAutoplay);
  root.addEventListener("mouseleave", startAutoplay);
  root.addEventListener("focusin", stopAutoplay);
  root.addEventListener("focusout", startAutoplay);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  buildDots();
  setIndex(0);
  startAutoplay();
}

function initContactForm() {
  var form = qs(document, "[data-contact-form]");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = (qs(form, "#cf-name") && qs(form, "#cf-name").value) || "";
    var topic = (qs(form, "#cf-topic") && qs(form, "#cf-topic").value) || "General";
    var message = (qs(form, "#cf-message") && qs(form, "#cf-message").value) || "";

    var subject = "FLY website message - " + topic;
    var body =
      (name.trim() ? "Name: " + name.trim() + "\n" : "") +
      "Topic: " +
      topic +
      "\n\n" +
      (message.trim() ? message.trim() : "");

    window.location.href =
      "mailto:withfunlearningyouth@gmail.com" +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
  });
}

function initStoryScroll() {
  var section = qs(document, "[data-story-scroll]");
  if (!section) return;

  var cards = qsa(section, "[data-story-card]");
  var dots = qsa(section, "[data-story-dot]");
  if (cards.length < 2) return;

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  function setActive(index) {
    cards.forEach(function (card, i) {
      card.classList.toggle("active", i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === index);
    });
  }

  function onScroll() {
    if (window.innerWidth <= 900) {
      cards.forEach(function (card) {
        card.classList.add("active");
      });
      return;
    }

    var rect = section.getBoundingClientRect();
    var total = Math.max(1, rect.height - window.innerHeight);
    var progress = Math.min(1, Math.max(0, -rect.top / total));
    var index = Math.min(cards.length - 1, Math.floor(progress * cards.length));
    setActive(index);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
}

document.addEventListener("DOMContentLoaded", function () {
  initActiveNav();
  initNav();
  initSlider(qs(document, "[data-slider]"));
  initContactForm();
  initStoryScroll();
});
