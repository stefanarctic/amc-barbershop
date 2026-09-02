/* ====== Frizeria „AMC” — script.js ====== */

// ---------- Date ----------
const REVIEWS = [
  { name: "Mihai C.", initials: "MC", stars: 5, text: "Apelați cu încredere la Alex, tunde exact cum vă doriți 🫡" },
  { name: "Patrick S.", initials: "PS", stars: 5, text: "Servicii de calitate, cu oameni care de fiecare dată te fac să te simți bine. Cât despre tuns — excelent! Recomand!" },
  { name: "Adrian S.", initials: "AS", stars: 5, text: "Recomand" },
  { name: "Darius C.", initials: "DC", stars: 5, text: "Cele mai bune servicii" },
];

const EXTRA_REVIEWS = [
  { name: "Vlad M.", initials: "VM", stars: 5, text: "Cel mai bun frizer din Sibiu, fără discuții." },
  { name: "George P.", initials: "GP", stars: 5, text: "Programare ușoară, zero așteptare. Simți diferența de la prima tuns." },
  { name: "Radu T.", initials: "RT", stars: 5, text: "Alexandru e un artist cu barba. Recomand cu încredere!" },
];

// Recenzii luate de pe Mero (mero.ro/p/am-barber) — DOAR 4 stele +.
// Se afișează câte 6 pe zi, în rotație: mâine urmează următoarele 6,
// iar când se termină lista, se reia de la început.
// IMPORTANT: adaugă aici DOAR recenzii reale, copiate 1:1 de pe Mero
// (nume, text, nr. stele). NU inventa recenzii — e ilegal (practici
// comerciale incorecte). Cât timp lista e goală, nu se afișează nimic.
const MERO_REVIEWS = [
  // { name: "Nume P.", initials: "NP", stars: 5, text: "textul real de pe Mero" },
];

// Returnează cele 6 recenzii Mero care se afișază AZI (rotație zilnică)
function getTodayMeroReviews() {
  const pool = MERO_REVIEWS.filter((r) => r.stars >= 4); // siguranță: doar 4+
  if (!pool.length) return [];
  const daysSinceEpoch = Math.floor(Date.now() / 86400000); // se schimbă la miezul nopții
  const start = (daysSinceEpoch % pool.length) * 6 % pool.length;
  const today = [];
  for (let i = 0; i < 6 && i < pool.length; i++) {
    today.push({ ...pool[(start + i) % pool.length], source: "mero" });
  }
  return today;
}

const SCHEDULE = [
  { day: "Luni",     hours: "10:00 - 20:00", closed: false, jsDay: 1 },
  { day: "Marți",    hours: "10:00 - 20:00", closed: false, jsDay: 2 },
  { day: "Miercuri", hours: "10:00 - 20:00", closed: false, jsDay: 3 },
  { day: "Joi",      hours: "10:00 - 20:00", closed: false, jsDay: 4 },
  { day: "Vineri",   hours: "10:00 - 20:00", closed: false, jsDay: 5 },
  { day: "Sâmbătă",  hours: "10:30 - 16:00", closed: false, jsDay: 6 },
  { day: "Duminică", hours: "Închis",        closed: true,  jsDay: 0 },
];

const MERO_URL = "https://mero.ro/p/am-barber";

// ---------- Utilitare ----------
const $ = (sel) => document.querySelector(sel);

// Escapare HTML pentru orice text introdus de utilizator înainte de a fi
// interpolat în innerHTML — previne XSS (recenzii, nume, telefon etc.)
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

function parseHours(hours) {
  const [a, b] = hours.split(" - ");
  const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  return { open: toMin(a), close: toMin(b) };
}

function openStatusNow() {
  const now = new Date();
  const entry = SCHEDULE.find((d) => d.jsDay === now.getDay());
  if (!entry || entry.closed) return { open: false, text: "Închis astăzi" };
  const h = parseHours(entry.hours);
  const mins = now.getHours() * 60 + now.getMinutes();
  if (mins >= h.open && mins < h.close) return { open: true, text: "Deschis acum" };
  return { open: false, text: "Închis" };
}

// ---------- Recenzii ----------
// inițial se afișează 6 recenzii; „Vezi mai multe” adaugă încă 4
const REVIEWS_INITIAL = 6;
const REVIEWS_MORE = 4;
let reviewsShown = REVIEWS_INITIAL;

function getAllReviews() {
  const userReviews = getUserReviews().filter((r) => r.stars >= 4); // public doar 4 stele +
  return [...REVIEWS, ...EXTRA_REVIEWS, ...getTodayMeroReviews(), ...userReviews];
}

function renderReviews() {
  const list = getAllReviews().slice(0, reviewsShown);
  $("#moreReviewsBtn").hidden = reviewsShown >= getAllReviews().length;
  $("#reviewsGrid").innerHTML = list.map(
    (r, i) => `
    <article class="review-card reveal visible">
      <div class="review-head">
        <div class="review-avatar">${escapeHtml(r.initials)}</div>
        <div>
          <div class="review-name">${escapeHtml(r.name)}${r.source === "mero" ? ' <span class="muted small">· Mero</span>' : ""}</div>
          <div class="stars">${stars(r.stars)}</div>
        </div>
        ${r.source === "user" ? `<button class="review-delete" data-review-delete="${escapeHtml(r.id)}" aria-label="Șterge recenzia" title="Șterge recenzia ta">🗑</button>` : ""}
      </div>
      <p class="review-text">${escapeHtml(r.text)}</p>
    </article>`
  ).join("");
}

function getUserReviews() {
  try { return JSON.parse(localStorage.getItem("lm_reviews") || "[]"); } catch { return []; }
}

// ștergerea unei recenzii proprii (salvate local în browserul fiecăruia)
$("#reviewsGrid")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-review-delete]");
  if (!btn) return;
  const id = btn.dataset.reviewDelete;
  const remaining = getUserReviews().filter((r) => String(r.id) !== id);
  localStorage.setItem("lm_reviews", JSON.stringify(remaining));
  renderReviews();
});

$("#moreReviewsBtn")?.addEventListener("click", () => {
  reviewsShown += REVIEWS_MORE;
  renderReviews();
});

$("#reviewForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#reviewName").value.trim();
  const text = $("#reviewText").value.trim();
  const starsN = Number($("#reviewStars").value);
  if (!name || !text) return;
  const initials = name.split(/\s+/).map((w) => w[0].toUpperCase()).slice(0, 2).join("");
  const reviews = getUserReviews();
  reviews.unshift({ id: Date.now(), name, initials, stars: starsN, text, source: "user" });
  localStorage.setItem("lm_reviews", JSON.stringify(reviews));
  reviewsShown = getAllReviews().length; // arată și recenzia nou adăugată
  renderReviews();
  e.target.reset();
});

// ---------- Program ----------
function renderSchedule() {
  const today = new Date().getDay();
  // afișăm de Vineri (azi, conform datelor) în ordinea din sursă: Vineri → Joi
  const order = [5, 6, 0, 1, 2, 3, 4];
  $("#scheduleList").innerHTML = order.map((idx) => {
    const d = SCHEDULE[idx];
    const cls = d.jsDay === today ? "today" : d.closed ? "closed-day" : "";
    return `<li class="${cls}"><span>${d.day}</span><span>${d.hours}</span></li>`;
  }).join("");

  const status = openStatusNow();
  const statusEl = $("#openStatus");
  const heroEl = $("#openStatusHero");
  statusEl.textContent = status.text;
  heroEl.textContent = (status.open ? "🟢 " : "🔴 ") + status.text;
}

// ---------- Galerie clienti ----------
// Pune pozele în folderul assets/galerie/ cu numele client-1.jpg, client-2.jpg, ...
// (jpg, png sau webp). Pozele lipsa sunt ascunse automat.
// Desktop: grilă. Mobil: pachet de cărți (swipe + săgeți).
const GALLERY_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MAX_GALLERY_SLOTS = 12;
const GALLERY_PHOTOS = [];
let galleryDeck = [];
let galleryAnimLock = false;
const GALLERY_TILT = [-7, 5, -4, 8, -8, 4, 7, -5];
const GALLERY_LIGHTBOX = { index: 0 };

function renderGallery() {
  const grid = $("#galleryGrid");
  const mobile = $("#galleryMobile");
  if (!grid) return;
  grid.innerHTML = "";
  if (mobile) mobile.innerHTML = "";
  GALLERY_PHOTOS.length = 0;

  let pending = 0;
  let probing = true;
  let built = false;
  const maybeBuild = () => {
    if (!probing && pending === 0 && !built) {
      built = true;
      buildGalleryDesktop(grid);
      if (mobile) buildGalleryDeck(mobile);
    }
  };

  const tryLoad = (slot) => {
    if (slot >= MAX_GALLERY_SLOTS) {
      probing = false;
      maybeBuild();
      return;
    }
    const attempt = (extIdx) => {
      if (extIdx >= GALLERY_EXTENSIONS.length) { tryLoad(slot + 1); return; }
      const ext = GALLERY_EXTENSIONS[extIdx];
      const src = `assets/galerie/client-${slot}.${ext}`;
      const img = new Image();
      pending++;
      img.onload = () => {
        if (!GALLERY_PHOTOS.includes(src)) GALLERY_PHOTOS.push(src);
        pending--;
        attempt(extIdx + 1);
        maybeBuild();
      };
      img.onerror = () => {
        pending--;
        attempt(extIdx + 1);
        maybeBuild();
      };
      img.src = src;
    };
    attempt(0);
  };
  tryLoad(1);
}

function buildGalleryDesktop(grid) {
  if (!GALLERY_PHOTOS.length) return;
  GALLERY_PHOTOS.forEach((src, i) => {
    const figure = document.createElement("figure");
    figure.className = "gallery-item reveal";
    figure.innerHTML = `
      <img src="${src}" alt="Client La Macrea ${i + 1}" loading="lazy" />
      <figcaption>💇 Tuns de la La Macrea</figcaption>`;
    figure.addEventListener("click", () => openLightbox(i));
    grid.appendChild(figure);
  });
  observeReveals();
}

function buildGalleryDeck(container) {
  if (!GALLERY_PHOTOS.length) return;
  galleryDeck = GALLERY_PHOTOS.map((_, i) => i);

  const deck = document.createElement("div");
  deck.className = "gallery-deck reveal";
  deck.id = "galleryDeck";
  container.appendChild(deck);

  const arrows = document.createElement("div");
  arrows.className = "gallery-arrows";
  arrows.innerHTML = `
    <button type="button" id="deckPrev" aria-label="Poza anterioară">‹</button>
    <span id="deckCounter"></span>
    <button type="button" id="deckNext" aria-label="Poza următoare">›</button>`;
  container.appendChild(arrows);

  layoutGalleryDeck();
  wireGallerySwipe(deck);
  observeReveals();
}

function layoutGalleryDeck() {
  const deck = $("#galleryDeck");
  if (!deck) return;
  deck.innerHTML = "";
  $("#deckCounter").textContent = `${galleryDeck[0] + 1} / ${GALLERY_PHOTOS.length}`;
  galleryDeck.forEach((photoIdx, pos) => {
    const figure = document.createElement("figure");
    figure.className = "gallery-card";
    figure.dataset.pos = pos;
    figure.style.setProperty("--tilt", GALLERY_TILT[pos % GALLERY_TILT.length] + "deg");
    figure.style.setProperty("--off-x", pos * 7 + "px");
    figure.style.setProperty("--off-y", pos * -6 + "px");
    figure.innerHTML = `<img src="${GALLERY_PHOTOS[photoIdx]}" alt="Client La Macrea ${photoIdx + 1}" loading="lazy" />`;
    if (pos === 0) figure.addEventListener("click", () => openLightbox(galleryDeck[0]));
    deck.appendChild(figure);
  });
}

function cycleGalleryDeck(dir) {
  if (galleryAnimLock || GALLERY_PHOTOS.length < 2) return;
  const deck = $("#galleryDeck");
  const top = deck?.querySelector('[data-pos="0"]');
  if (!top) return;
  galleryAnimLock = true;

  top.classList.add(dir > 0 ? "fly-left" : "fly-right");

  const next = deck.querySelector('[data-pos="1"]');
  if (next) {
    next.style.zIndex = "9";
    next.style.transform = "none";
  }
  const afterNext = deck.querySelector('[data-pos="2"]');
  if (afterNext) {
    afterNext.style.zIndex = "8";
    afterNext.style.transform = `rotate(${GALLERY_TILT[1]}deg) translate(7px, -6px)`;
  }

  setTimeout(() => {
    if (dir > 0) galleryDeck.push(galleryDeck.shift());
    else galleryDeck.unshift(galleryDeck.pop());
    layoutGalleryDeck();
    galleryAnimLock = false;
  }, 300);
}

function wireGallerySwipe(deck) {
  let startX = null;
  deck.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  deck.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) cycleGalleryDeck(dx < 0 ? 1 : -1);
  }, { passive: true });

  $("#deckNext").addEventListener("click", () => cycleGalleryDeck(1));
  $("#deckPrev").addEventListener("click", () => cycleGalleryDeck(-1));
}

function openLightbox(index) {
  if (!GALLERY_PHOTOS.length) return;
  GALLERY_LIGHTBOX.index = (index + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length;
  const lb = $("#lightbox");
  $("#lightboxImg").src = GALLERY_PHOTOS[GALLERY_LIGHTBOX.index];
  const counter = $("#lightboxCounter");
  if (counter) counter.textContent = `${GALLERY_LIGHTBOX.index + 1} / ${GALLERY_PHOTOS.length}`;
  lb.classList.add("open");
}

$("#lightboxPrev")?.addEventListener("click", (e) => {
  e.stopPropagation();
  openLightbox(GALLERY_LIGHTBOX.index - 1);
});
$("#lightboxNext")?.addEventListener("click", (e) => {
  e.stopPropagation();
  openLightbox(GALLERY_LIGHTBOX.index + 1);
});

(() => {
  const lb = $("#lightbox");
  if (!lb) return;
  let startX = null;
  lb.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (!lb.classList.contains("open") || startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) openLightbox(GALLERY_LIGHTBOX.index + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();

$("#lightbox")?.addEventListener("click", (e) => {
  if (e.target.id === "lightbox" || e.target.classList.contains("lightbox-close")) {
    $("#lightbox").classList.remove("open");
  }
});
document.addEventListener("keydown", (e) => {
  const lb = $("#lightbox");
  if (lb?.classList.contains("open")) {
    if (e.key === "Escape") lb.classList.remove("open");
    if (e.key === "ArrowLeft") openLightbox(GALLERY_LIGHTBOX.index - 1);
    if (e.key === "ArrowRight") openLightbox(GALLERY_LIGHTBOX.index + 1);
  }
});

document.addEventListener("click", (e) => {
  if (e.target.closest('a[href="#programare"], a[href="index.html#programare"]')) {
    warmMeroFrame();
  }
});

// ---------- Embed Mero ----------
function warmMeroFrame() {
  const frame = $("#meroFrame");
  if (!frame || frame.dataset.warmed === "1") return;
  frame.dataset.warmed = "1";
  frame.loading = "eager";
  frame.src = frame.getAttribute("src") || MERO_URL;
}

function initMeroEmbed() {
  const frame = $("#meroFrame");
  const placeholder = $("#meroPlaceholder");
  if (!frame) return;

  const hidePlaceholder = () => placeholder?.classList.add("hidden");
  frame.addEventListener("load", hidePlaceholder);
  setTimeout(hidePlaceholder, 8000);

  if (location.hash === "#programare") warmMeroFrame();
}

// ---------- Harta (consimțământ „two-click”) ----------
// Iframe-ul Google Maps NU se încarcă la deschiderea paginii — doar la apăsarea butonului,
// ca vizitatorul să își dea consimțământul înainte ca Google să primească datele lui.
$("#loadMapBtn")?.addEventListener("click", () => {
  const container = $("#mapConsent");
  const iframe = document.createElement("iframe");
  iframe.title = "Hartă La Macrea";
  iframe.allowFullscreen = true;
  iframe.src = "https://www.google.com/maps?q=Strada%20Electricenilor%2020%2C%20Sibiu&output=embed";
  container.innerHTML = "";
  container.appendChild(iframe);
});

// ---------- Navbar / hamburger ----------
const navbar = $("#navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
});

const hamburger = $("#hamburger");
const navLinks = $("#navLinks");
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  navLinks.classList.toggle("open");
});
navLinks.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    hamburger.classList.remove("open");
    navLinks.classList.remove("open");
  }
});

// ---------- Reveal on scroll ----------
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
function observeReveals() {
  document.querySelectorAll(".reveal:not(.visible)").forEach((el) => observer.observe(el));
}

// ---------- Init ----------
if ($("#reviewsGrid")) renderReviews();
if ($("#scheduleList")) renderSchedule();
if ($("#galleryGrid")) renderGallery();
initMeroEmbed();
observeReveals();
if ($("#scheduleList")) setInterval(renderSchedule, 60 * 1000);
