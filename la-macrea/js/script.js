/* ====== Frizeria „La Macrea” — script.js ====== */

// ---------- Date ----------
const SERVICES = [
  {
    name: "Tuns modern + Aranjat + Spălat",
    duration: "45 min",
    price: "60 - 70 lei",
    desc: "Este atât de simplu să fii fresh — comunică cu frizerul tău și povestește-i ce ți-ar plăcea să încerci.",
  },
  {
    name: "Tuns modern + Barbă + Aranjat + Spălat",
    duration: "1 h",
    price: "80 - 90 lei",
    desc: "Pachetul preferat al domnilor care acordă o atenție exclusivă bărbii, în concordanță cu tunsoarea bine finalizată!",
  },
  {
    name: "Barbă",
    duration: "30 min",
    price: "30 - 35 lei",
    desc: "Barba este elementul cheie al bărbatului îngrijit. Oferă-i atenția necesară prin scurtare și definirea clară a conturului.",
  },
  {
    name: "Pachet Tuns modern + Hairdesign",
    duration: "50 min",
    price: "70 - 80 lei",
    desc: "Pentru cei care vor ceva în plus: tunsoare modernă combinată cu design personalizat.",
  },
  {
    name: "Spălat + Aranjat freză bărbați",
    duration: "10 min",
    price: "25 lei",
    desc: "Refresh rapid între tunsori — spălare și aranjare profesionistă.",
  },
];

const TEAM = [
  { name: "Alex Macrea", role: "Specialist", rating: "5.00", reviews: 971, initials: "AM", image: "assets/alex.jpg" },
  { name: "Alexandru (Atomic) Văduva", role: "Frizer", rating: "4.97", reviews: 79, initials: "AV", image: "assets/atomic.jpg" },
];

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
  // fereastră de 6, avansată cu 6 pe zi — (d % L) * 6 % L era mereu 0 când L e multiplu de 6
  const start = (daysSinceEpoch * 6) % pool.length;
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

const OPENING = { weekday: { open: 10 * 60, close: 20 * 60 }, saturday: { open: 10 * 60 + 30, close: 16 * 60 } };

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

// ---------- Servicii ----------
function renderServices() {
  const grid = $("#servicesGrid");
  const cards = SERVICES.map(
    (s, i) => `
    <article class="service-card reveal" style="transition-delay:${i * 80}ms">
      <div class="service-top">
        <h3 class="service-name">${s.name}</h3>
        <span class="service-price">${s.price}</span>
      </div>
      <span class="service-meta">⏱ ${s.duration}</span>
      <a href="#programare" class="btn btn-outline" data-book-service="${s.name}" data-service-index="${i}">Programează →</a>
    </article>`
  );
  // cardul de redirectionare către Specialiști
  cards.push(`
    <a href="#specialisti" class="service-card service-card-link reveal" style="transition-delay:${SERVICES.length * 80}ms">
      <div class="service-top">
        <h3 class="service-name">Nu știi pe cine să alegi?</h3>
        <span class="service-price">✂︎</span>
      </div>
      <span class="service-meta">Echipa noastră de frizeri</span>
      <span class="btn btn-gold">Vezi specialiștii →</span>
    </a>`);
  grid.innerHTML = cards.join("");
}

// ---------- Echipa ----------
function renderTeam() {
  $("#teamGrid").innerHTML = TEAM.map(
    (t, i) => `
    <article class="team-card reveal" style="transition-delay:${i * 100}ms">
      <div class="avatar">${t.image ? `<img src="${escapeHtml(t.image)}" alt="${escapeHtml(t.name)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;" />` : escapeHtml(t.initials)}</div>
      <h3>${escapeHtml(t.name)}</h3>
      <p class="team-role">${t.role}</p>
      <p class="team-score"><span class="stars">${stars(5)}</span> ${t.rating} <span class="muted">(${t.reviews} evaluări)</span></p>
      <a href="#programare" class="btn btn-gold" data-book-specialist="${t.name}">Alege</a>
    </article>`
  ).join("");
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
const GALLERY_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MAX_GALLERY_SLOTS = 12;

// Toate pozele gasite, in ordinea sloturilor.
const GALLERY_PHOTOS = [];
// Ordinea cartilor din pachet (indici in GALLERY_PHOTOS). Prima este cartea de deasupra.
let galleryDeck = [];
let galleryAnimLock = false;
// Inclinatii alternative pentru cartile din spate — una intr-o parte, alta in cealalta.
const GALLERY_TILT = [-7, 5, -4, 8, -8, 4, 7, -5];
const GALLERY_LIGHTBOX = { index: 0 };

function renderGallery() {
  const grid = $("#galleryGrid");
  grid.innerHTML = "";
  let pending = 0;    // cate sondaje de imagine sunt in aer
  let probing = true; // mai avem sloturi de verificat

  // Cand nu mai sunt sondaje in aer si turul s-a terminat, construim pachetul (o singura data).
  let built = false;
  const maybeBuild = () => {
    if (!probing && pending === 0 && !built) {
      built = true;
      buildGalleryDeck(grid);
    }
  };
  // Sondam sloturile în ordine; ne oprim la prima extensie găsită (fără 404-uri în plus
  // pentru formate alternative) și abandonăm după MAX_EMPTY_SLOTS sloturi consecutive goale.
  const MAX_EMPTY_SLOTS = 2;
  let emptyStreak = 0;
  const tryLoad = (slot) => {
    if (slot >= MAX_GALLERY_SLOTS || emptyStreak >= MAX_EMPTY_SLOTS) {
      probing = false;
      maybeBuild();
      return;
    }
    const attempt = (extIdx) => {
      if (extIdx >= GALLERY_EXTENSIONS.length) {
        emptyStreak++;
        tryLoad(slot + 1);
        return;
      }
      const ext = GALLERY_EXTENSIONS[extIdx];
      const src = `assets/galerie/client-${slot}.${ext}`;
      const img = new Image();
      pending++;
      img.onload = () => {
        emptyStreak = 0; // am găsit poza — șirul de sloturi goale se întrerupe
        if (!GALLERY_PHOTOS.includes(src)) GALLERY_PHOTOS.push(src);
        pending--;
        tryLoad(slot + 1); // trecem la slotul următor (fără a mai încerca alte extensii pentru acesta)
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

// Pachetul de carti: toate pozele stivuite una peste alta, prima e deasupra.
function buildGalleryDeck(grid) {
  if (!GALLERY_PHOTOS.length) return;
  galleryDeck = GALLERY_PHOTOS.map((_, i) => i);

  const deck = document.createElement("div");
  deck.className = "gallery-deck reveal";
  deck.id = "galleryDeck";
  grid.appendChild(deck);

  const arrows = document.createElement("div");
  arrows.className = "gallery-arrows";
  arrows.innerHTML = `
    <button type="button" id="deckPrev" aria-label="Poza anterioară">‹</button>
    <span id="deckCounter"></span>
    <button type="button" id="deckNext" aria-label="Poza următoare">›</button>`;
  grid.appendChild(arrows);

  layoutGalleryDeck();
  wireGallerySwipe(deck);
  observeReveals();
}

// Pozitioneaza fiecare carte in functie de pozitia din pachet.
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

// Cartea de deasupra "zboara" intr-o parte, iar urmatoarele carti aluneca
// in acelasi timp in fata — o singura miscare fluida, fara salturi.
function cycleGalleryDeck(dir) {
  if (galleryAnimLock || GALLERY_PHOTOS.length < 2) return;
  const deck = $("#galleryDeck");
  const top = deck?.querySelector('[data-pos="0"]');
  if (!top) return;
  galleryAnimLock = true;

  top.classList.add(dir > 0 ? "fly-left" : "fly-right");

  // Promovam vizual cartea urmatoare in timp ce cea de sus zboara.
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

// Swipe stanga/dreapta direct pe pachet + sagetile de sub el.
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
  $("#lightboxCounter").textContent = `${GALLERY_LIGHTBOX.index + 1} / ${GALLERY_PHOTOS.length}`;
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

// Swipe pe mobil in lightbox
(() => {
  const lb = $("#lightbox");
  if (!lb) return;
  let startX = null;
  lb.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) openLightbox(GALLERY_LIGHTBOX.index + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();

// Click pe fundal sau pe ✕ inchide; click pe poza nu face nimic.
$("#lightbox")?.addEventListener("click", (e) => {
  if (e.target.id === "lightbox" || e.target.classList.contains("lightbox-close")) {
    $("#lightbox").classList.remove("open");
  }
});
document.addEventListener("keydown", (e) => {
  const lb = $("#lightbox");
  if (!lb?.classList.contains("open")) return;
  if (e.key === "Escape") lb.classList.remove("open");
  if (e.key === "ArrowLeft") openLightbox(GALLERY_LIGHTBOX.index - 1);
  if (e.key === "ArrowRight") openLightbox(GALLERY_LIGHTBOX.index + 1);
});

// ---------- Programări ----------
// „Programările tale" vin de pe server, identificate după numărul de telefon —
// așa nu se mai pierd la restart sau când deschizi site-ul din alt browser.
const MY_PHONES_KEY = "lm_phones"; // listă de telefoane de pe acest dispozitiv (nu le suprascriem între rezervări)
const MY_TOKENS_KEY = "lm_tokens"; // { idProgramare: tokenDeAnulare } — primit la creare, reținut local

// „azi" în ora locală a vizitatorului — toISOString() ar da YESTERDAY între 00:00 și 02:59 (UTC)
function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function localNowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
function myPhones() {
  try { return JSON.parse(localStorage.getItem(MY_PHONES_KEY)) || []; } catch { return []; }
}
function addMyPhone(phone) {
  const list = myPhones().filter((p) => p !== phone);
  list.push(phone);
  localStorage.setItem(MY_PHONES_KEY, JSON.stringify(list.slice(-5))); // max 5 telefoane reținute
}
function myTokens() {
  try { return JSON.parse(localStorage.getItem(MY_TOKENS_KEY)) || {}; } catch { return {}; }
}
function saveMyToken(id, token) {
  const tokens = myTokens();
  tokens[id] = token;
  localStorage.setItem(MY_TOKENS_KEY, JSON.stringify(tokens));
}

function formatDateLabel(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("ro-RO", {
    weekday: "long", day: "numeric", month: "long",
  });
}
// programarea e în trecut? (comparație pe dată/oră locală, text simplu)
function isPast(dateStr, timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(dateStr + "T00:00:00");
  d.setHours(h, m, 0, 0);
  return d.getTime() <= Date.now();
}

async function renderBookings() {
  const box = $("#myBookings");
  const phones = myPhones();
  if (!phones.length) { box.hidden = true; return; }

  // interogăm serverul pentru TOATE telefoanele folosite de pe acest dispozitiv
  let bookings = [];
  const results = await Promise.allSettled(
    phones.map(async (phone) => {
      const res = await fetch(`/api/my-bookings?phone=${encodeURIComponent(phone)}`);
      if (!res.ok) return [];
      return (await res.json()).bookings || [];
    })
  );
  const seen = new Set();
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    for (const b of r.value) {
      if (!seen.has(b.id)) { seen.add(b.id); bookings.push(b); }
    }
  }

  // sortăm: cele mai apropiate primele
  bookings.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

  if (!bookings.length) { box.hidden = true; return; }
  box.hidden = false;
  const tokens = myTokens();
  $("#bookingsList").innerHTML = bookings
    .map((b) => {
      const past = isPast(b.date, b.time);
      // Anulăm DOAR dacă avem tokenul secret primit la creare și programarea nu e trecută
      const canCancel = !past && tokens[b.id];
      return `
      <div class="booking-item${past ? " past" : ""}">
        <div>
          <strong>${escapeHtml(b.service)}</strong> · ${escapeHtml(b.specialist)}
          <div class="muted small">${escapeHtml(formatDateLabel(b.date))} ora ${escapeHtml(b.time)}</div>
        </div>
        ${canCancel ? `<button class="booking-cancel" data-cancel="${escapeHtml(b.id)}">Anulează</button>` : ""}
      </div>`;
    })
    .join("");
}

$("#bookingsList")?.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-cancel]");
  if (!btn) return;
  const id = btn.dataset.cancel;
  const token = myTokens()[id];
  if (!token) return;
  if (!confirm("Anulezi această programare?")) return;
  btn.disabled = true;
  let ok = false;
  try {
    const res = await fetch(`/api/my-bookings?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`, { method: "DELETE" });
    // ștergem tokenul local DOAR dacă serverul a confirmat anularea (sau programarea
    // oricum nu mai există) — altfel utilizatorul rămâne fără token și programarea activă
    ok = res.ok || res.status === 404;
    if (!ok) alert("Anularea a eșuat. Încearcă din nou în câteva minute.");
  } catch {
    alert("Anularea a eșuat — serverul nu răspunde. Programarea rămâne activă.");
  }
  if (ok) {
    const tokens = myTokens();
    delete tokens[id];
    localStorage.setItem(MY_TOKENS_KEY, JSON.stringify(tokens));
    renderBookings();
    populateTimes(); // ora anulată devine din nou disponibilă în formular
  } else {
    btn.disabled = false;
  }
});

// populează selecturile
function populateBookingSelects() {
  const serviceSel = $("#bkService");
  SERVICES.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.name;
    opt.textContent = `${s.name} — ${s.duration}, ${s.price}`;
    serviceSel.appendChild(opt);
  });
  const specSel = $("#bkSpecialist");
  TEAM.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.name;
    opt.textContent = `${t.name} (${t.role})`;
    specSel.appendChild(opt);
  });
}

// ore disponibile (sloturi de 30 min în intervalele de program)
// orele ocupate vin de la server (una singură sursă de adevăr pentru toți clienții)
let timesFetchGen = 0; // garde anti-curse: răspunsurile vechi de la availability nu mai suprascriu lista
async function populateTimes() {
  const timeSel = $("#bkTime");
  const gen = ++timesFetchGen;
  timeSel.innerHTML = '<option value="">— alege ora —</option>';
  const dateVal = $("#bkDate").value;
  if (!dateVal) return;
  const d = new Date(dateVal + "T00:00:00");
  const entry = SCHEDULE.find((x) => x.jsDay === d.getDay());
  if (!entry || entry.closed) {
    const opt = document.createElement("option");
    opt.textContent = "Închis în această zi";
    timeSel.appendChild(opt);
    return;
  }
  const h = parseHours(entry.hours);

  // interogăm serverul pentru orele deja rezervate
  let taken = new Set();
  let serverOk = true;
  try {
    const specialist = encodeURIComponent($("#bkSpecialist").value);
    const res = await fetch(`/api/availability?date=${dateVal}&specialist=${specialist}`);
    if (res.ok) taken = new Set((await res.json()).taken);
    else serverOk = false;
  } catch { serverOk = false; }
  if (gen !== timesFetchGen) return; // între timp s-a schimbat data/specialistul — ignorăm

  const isToday = dateVal === localToday();
  const nowMin = localNowMinutes();
  // durata serviciului ales — slotul trebuie să încapă PÂNĂ la închidere, altfel
  // serverul respinge cu „Ora este în afara programului" deși ora apărea liberă
  // (SINCRON cu SERVICE_DURATIONS din server-php/app/init.php)
  const svc = SERVICES.find((s) => s.name === $("#bkService")?.value);
  const dm = svc ? /^(\d+)\s*(min|h)\b/i.exec(svc.duration) : null;
  let dur = 30; // fallback
  if (dm) dur = dm[2].toLowerCase() === "h" ? Number(dm[1]) * 60 : Number(dm[1]);
  let anyFree = false;
  for (let t = h.open; t + dur <= h.close; t += 30) {
    const label = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
    if (taken.has(label)) continue; // orele deja rezervate nu mai apar
    if (isToday && t <= nowMin) continue; // orele care au trecut azi nu se mai pot alege
    anyFree = true;
    const opt = document.createElement("option");
    opt.value = label;
    opt.textContent = label;
    timeSel.appendChild(opt);
  }
  if (!anyFree) {
    const opt = document.createElement("option");
    opt.textContent = isToday ? "Nu mai sunt ore astăzi" : "Nicio oră liberă în această zi";
    timeSel.appendChild(opt);
  } else if (!serverOk) {
    // serverul nu a răspuns — sloturile pot fi depășite, avertizăm în loc să părem că totul e liber
    const note = document.createElement("option");
    note.disabled = true;
    note.textContent = "⚠ Nu am putut verifica orele ocupate";
    timeSel.appendChild(note);
  }
}

function initDateInput() {
  const dateInput = $("#bkDate");
  const today = localToday(); // ora locală, nu UTC (altfel ieri între 00:00–02:59 noaptea)
  dateInput.min = today;
  dateInput.value = today;
  populateTimes();
}

$("#bkDate")?.addEventListener("change", populateTimes);
$("#bkSpecialist")?.addEventListener("change", populateTimes);
$("#bkService")?.addEventListener("change", populateTimes); // durata afectează sloturile care mai încap

$("#bookingForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = $("#bookingMsg");
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');

  const payload = {
    name: $("#bkName").value.trim(),
    phone: $("#bkPhone").value.trim(),
    service: $("#bkService").value,
    specialist: $("#bkSpecialist").value,
    date: $("#bkDate").value,
    time: $("#bkTime").value,
  };

  // validare rapidă pe client (validarea completă o face serverul)
  if (!payload.name || !payload.phone || !payload.service || !payload.specialist || !payload.date || !payload.time) {
    msg.textContent = "Te rugăm să completezi toate câmpurile.";
    msg.className = "form-msg err";
    return;
  }
  if (!/^0[0-9]{9}$/.test(payload.phone.replace(/\s/g, ""))) {
    msg.textContent = "Număr de telefon invalid (ex: 0722123456).";
    msg.className = "form-msg err";
    return;
  }
  if (form.dataset.busy === "1") return; // un singur trimis simultan — fără programări duble

  msg.textContent = "Se salvează programarea…";
  msg.className = "form-msg";
  form.dataset.busy = "1";
  submitBtn.disabled = true; // fără dublu-click → fără programări duble

  const dateLabel = new Date(payload.date + "T00:00:00").toLocaleDateString("ro-RO", {
    weekday: "long", day: "numeric", month: "long",
  });

  const finish = (ok) => {
    form.dataset.busy = "";
    submitBtn.disabled = false;
  };

  try {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      msg.textContent = data.error || "Nu am putut salva programarea. Încearcă din nou.";
      msg.className = "form-msg err";
      finish(false);
      return;
    }

    const b = data.booking;
    // reținem telefonul + tokenul de anulare (fără token, nimeni nu poate anula programarea)
    addMyPhone(b.phone);
    if (b.cancelToken) saveMyToken(b.id, b.cancelToken);
    renderBookings();

    msg.textContent = `✅ Programare salvată: ${b.service} cu ${b.specialist}, ${dateLabel} ora ${b.time}. Te așteptăm!`;
    msg.className = "form-msg ok";
    form.reset();
    initDateInput(); // reîmprospătează orele — ora abia rezervată dispare din listă
    finish(true);
  } catch {
    msg.textContent = "Serverul nu răspunde. Verifică conexiunea și încearcă din nou.";
    msg.className = "form-msg err";
    finish(false);
  }
});

// popup cu descrierea serviciului în dreapta ecranului
// butoanele „Programează” duc la secțiunea de programare
function ensureServicePopup() {
  let popup = $("#servicePopup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "servicePopup";
    popup.className = "service-popup";
    popup.innerHTML = `
      <button class="service-popup-close" aria-label="Închide">✕</button>
      <h3 class="service-popup-name"></h3>
      <p class="service-popup-meta"></p>
      <p class="service-popup-desc"></p>`;
    document.body.appendChild(popup);
    popup.querySelector(".service-popup-close").addEventListener("click", () => closeServicePopup());
  }
  return popup;
}

function openServicePopup(index) {
  const s = SERVICES[index];
  if (!s) return;
  const popup = ensureServicePopup();
  popup.querySelector(".service-popup-name").textContent = s.name;
  popup.querySelector(".service-popup-meta").textContent = `⏱ ${s.duration} · ${s.price}`;
  popup.querySelector(".service-popup-desc").textContent = s.desc;
  popup.classList.add("open");
}

function closeServicePopup() {
  $("#servicePopup")?.classList.remove("open");
}

document.addEventListener("click", (e) => {
  const svc = e.target.closest("[data-book-service]");
  const spec = e.target.closest("[data-book-specialist]");
  if (svc) {
    $("#bkService").value = svc.dataset.bookService;
    openServicePopup(Number(svc.dataset.serviceIndex));
  }
  if (spec) $("#bkSpecialist").value = spec.dataset.bookSpecialist;
  // închide popup-ul la click în afară
  if (!svc && !e.target.closest("#servicePopup")) closeServicePopup();
});

// ---------- Locație: redirect spre hărți (fără hartă încărcată în pagină) ----------
// Pe telefon folosim URI-ul standard „geo:” → se deschide aplicația implicită de hărți
// a utilizatorului (Google Maps, Apple Plans etc.). Pe calculator deschidem Google Maps.
// Nicio cerere către Google până când vizitatorul apasă butonul.
const ADDRESS_QUERY = "Strada Electricenilor 20, Sibiu";
{
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && window.innerWidth < 900);
  // Orice element cu [data-nav-address] devine link spre hartă (butonul din
  // secțiunea Locație, adresa din footer etc.), cu adresa proprie ca valoare.
  document.querySelectorAll("[data-nav-address]").forEach((el) => {
    const q = el.dataset.navAddress || ADDRESS_QUERY;
    el.href = isMobile
      ? `geo:0,0?q=${encodeURIComponent(q)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  });
}

// ---------- Copyright cu an automat (© an-fondare – anul curent) ----------
// Anul de start e scris în HTML; JS adaugă doar anul curent dacă e mai mare.
document.querySelectorAll("#copyYear").forEach((el) => {
  const start = parseInt(el.dataset.start || "2026", 10);
  const now = new Date().getFullYear();
  el.textContent = now > start ? `${start}–${now}` : String(start);
});

// ---------- Pop-up cookie (stocare locală esențială) ----------
// Site-ul nu folosește cookie-uri de urmărire — bannerul informează despre
// stocarea locală necesară programărilor și reține alegerea vizitatorului.
{
  const banner = $("#cookieBanner");
  if (banner && !localStorage.getItem("lm_cookie_choice")) {
    banner.hidden = false;
  }
  banner?.querySelectorAll("[data-cookie-choice]").forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.setItem("lm_cookie_choice", btn.dataset.cookieChoice);
      banner.hidden = true;
    });
  });
}

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
renderServices();
renderTeam();
renderReviews();
renderSchedule();
renderGallery();
observeReveals();
populateBookingSelects();
initDateInput();
renderBookings();
setInterval(renderSchedule, 60 * 1000);
