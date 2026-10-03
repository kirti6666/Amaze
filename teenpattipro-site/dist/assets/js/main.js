// Small progressive enhancements; the site works fully without JavaScript.
(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Sticky mobile download bar: show once the hero download button scrolls out of view.
  var sticky = document.getElementById("sticky-cta");
  var hero = document.getElementById("hero-download");
  if (sticky) {
    if (hero && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        sticky.classList.toggle("is-visible", !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0);
      }).observe(hero);
    } else {
      var onScroll = function () { sticky.classList.toggle("is-visible", window.scrollY > 500); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  // Highlight the current section in the article table of contents.
  var tocLinks = document.querySelectorAll(".toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tocLinks.forEach(function (a) { a.classList.remove("is-active"); });
        if (byId[en.target.id]) byId[en.target.id].classList.add("is-active");
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  // Analytics hook: fires a "download_click" event if Google Analytics (gtag) or GTM is installed.
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-download]");
    if (!a) return;
    var area = a.closest("section, header, footer, .sticky-cta");
    var payload = { event: "download_click", link_url: a.href, location: area ? area.id || area.className : "" };
    if (typeof window.gtag === "function") window.gtag("event", "download_click", payload);
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
  });
})();
