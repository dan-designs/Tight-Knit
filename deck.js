/* TIGHT KNIT × PANDORA · deck navigation
   Keyboard: ← → space · R or Home restarts · hash deep-links (#/3) */

(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const total = slides.length;
  const counter = document.getElementById("counter");
  const slideCode = document.getElementById("slideCode");
  const progressFill = document.getElementById("progressFill");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const btnRestart = document.getElementById("btnRestart");

  let current = -1;

  // Stagger indexes for entrance animation
  slides.forEach((slide) => {
    slide.querySelectorAll(".reveal").forEach((el, i) => {
      el.style.setProperty("--i", i);
    });
  });

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function goTo(index, { backward = false } = {}) {
    index = Math.max(0, Math.min(total - 1, index));
    if (index === current) return;

    slides.forEach((s, i) => {
      s.classList.toggle("active", i === index);
      s.classList.toggle("from-next", i === index && backward);
    });

    current = index;

    counter.textContent = `${pad(index + 1)} / ${pad(total)}`;
    slideCode.textContent = slides[index].dataset.code || "";
    progressFill.style.width = `${((index + 1) / total) * 100}%`;
    btnPrev.disabled = index === 0;
    btnNext.disabled = index === total - 1;

    // reset scroll position of the new slide (mobile overflow)
    const inner = slides[index].querySelector(".slide-inner");
    if (inner) inner.scrollTop = 0;

    history.replaceState(null, "", `#/${index + 1}`);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1, { backward: true }); }
  function restart() { goTo(0, { backward: true }); }

  // ---------- buttons ----------
  btnNext.addEventListener("click", next);
  btnPrev.addEventListener("click", prev);
  btnRestart.addEventListener("click", restart);

  // ---------- keyboard ----------
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case "ArrowRight":
      case "PageDown":
      case " ":
        e.preventDefault();
        next();
        break;
      case "ArrowLeft":
      case "PageUp":
        e.preventDefault();
        prev();
        break;
      case "Home":
      case "r":
      case "R":
        e.preventDefault();
        restart();
        break;
      case "End":
        e.preventDefault();
        goTo(total - 1);
        break;
    }
  });

  // ---------- touch (horizontal swipe) ----------
  let touchX = null;
  let touchY = null;
  window.addEventListener("touchstart", (e) => {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    touchX = touchY = null;
    // horizontal intent only; leave vertical scrolling alone
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      dx < 0 ? next() : prev();
    }
  }, { passive: true });

  // ---------- click left/right edges to navigate (presenter-friendly) ----------
  document.getElementById("deck").addEventListener("click", (e) => {
    // ignore clicks on interactive elements or selected text
    if (e.target.closest("a, button") || window.getSelection().toString()) return;
    const x = e.clientX / window.innerWidth;
    if (x > 0.8) next();
    else if (x < 0.2) prev();
  });

  // ---------- language toggle (Google Translate page translation) ----------
  // The hidden Translate widget loads on every page view. Toggling drives the
  // widget's internal <select> directly, so the swap is instant with no
  // reload. The googtrans cookie only persists the choice across loads, and a
  // verified reload remains as the fallback if the widget is slow or blocked.
  const langPill = document.getElementById("langPill");
  const langBtn = document.getElementById("langBtn");
  const langMenu = document.getElementById("langMenu");
  const langLabel = document.getElementById("langLabel");
  let verifyTimer = null;

  function currentLang() {
    const m = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
    return m && decodeURIComponent(m[1]).endsWith("/es") ? "es" : "en";
  }

  function isTranslated() {
    return document.documentElement.classList.contains("translated-ltr") ||
           document.documentElement.classList.contains("translated-rtl");
  }

  function writeCookie(lang) {
    // clear every variant first so a stale copy can't shadow the new value
    const past = ";expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    document.cookie = "googtrans=" + past;
    if (location.hostname) {
      document.cookie = "googtrans=" + past + ";domain=" + location.hostname;
      document.cookie = "googtrans=" + past + ";domain=." + location.hostname;
    }
    if (lang === "es") document.cookie = "googtrans=/en/es;path=/";
  }

  function updatePill(lang) {
    langLabel.textContent = lang === "es" ? "🇪🇸 Español" : "🇺🇸 English";
    langMenu.querySelectorAll("button").forEach((b) => {
      b.setAttribute("aria-selected", String(b.dataset.lang === lang));
    });
  }

  function loadGoogleTranslate() {
    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", includedLanguages: "en,es", autoDisplay: false },
        "google_translate_element"
      );
    };
    const s = document.createElement("script");
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.head.appendChild(s);
  }

  function applyViaCombo(lang) {
    const combo = document.querySelector(".goog-te-combo");
    if (!combo || !window.google || !window.google.translate) return false;
    combo.value = lang === "es" ? "es" : "en";
    combo.dispatchEvent(new Event("change"));
    // the widget occasionally swallows the first change event
    setTimeout(() => combo.dispatchEvent(new Event("change")), 200);
    return true;
  }

  function setLanguage(lang) {
    langPill.classList.remove("open");
    langBtn.setAttribute("aria-expanded", "false");
    clearTimeout(verifyTimer);

    const alreadyThere = (lang === "es") === isTranslated();
    if (lang === currentLang() && alreadyThere) {
      updatePill(lang);
      return;
    }

    writeCookie(lang);
    updatePill(lang);

    if (!applyViaCombo(lang)) {
      location.reload();
      return;
    }
    // verify the in-place swap landed; if not, the cookie is already set so a
    // reload is guaranteed to finish the job
    verifyTimer = setTimeout(() => {
      if ((lang === "es") !== isTranslated()) location.reload();
    }, 1500);
  }

  const lang = currentLang();
  updatePill(lang);
  langMenu.querySelectorAll("button").forEach((b) => {
    b.addEventListener("click", () => setLanguage(b.dataset.lang));
  });
  loadGoogleTranslate();

  langBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = langPill.classList.toggle("open");
    langBtn.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (e) => {
    if (!langPill.contains(e.target)) langPill.classList.remove("open");
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") langPill.classList.remove("open");
  });

  // ---------- start at hash if present ----------
  const hashIndex = parseInt((location.hash.match(/\d+/) || [1])[0], 10) - 1;
  goTo(Number.isFinite(hashIndex) ? hashIndex : 0);

  window.addEventListener("hashchange", () => {
    const i = parseInt((location.hash.match(/\d+/) || [1])[0], 10) - 1;
    if (i !== current) goTo(i, { backward: i < current });
  });
})();
