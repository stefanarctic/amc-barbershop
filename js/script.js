/* ====== Frizeria „AMC” — script.js ====== */

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

const OPENING = { weekday: { open: 10 * 60, close: 20 * 60 }, saturday: { open: 10 * 60 + 30, close: 16 * 60 } };

// Numerele de WhatsApp ale frizerilor (format internațional, fără +)
const BARBER_WHATSAPP = {
  "Alex Macrea": "40753985205",
  "Alexandru (Atomic) Văduva": "40771606823",
};

// Mesajul de programare trimis pe WhatsApp, construit din ce a ales clientul
function buildWhatsAppMessage(b) {
  return (
    `💈 *Programare nouă — AMC*\n\n` +
    `👤 Client: ${b.name}\n` +
    `📞 Telefon: ${b.phone}\n` +
    `✂️ Serviciu: ${b.service}\n` +
    `👨‍🔧 Frizer: ${b.specialist}\n` +
    `📅 Data: ${b.dateLabel}\n` +
    `🕐 Ora: ${b.time}`
  );
}

// Deschide WhatsApp pe telefonul clientului cu mesajul gata scris către frizerul ales
function sendBookingToWhatsApp(booking) {
  const number = BARBER_WHATSAPP[booking.specialist];
  if (!number) return;
  const url = `https://wa.me/${number}?text=${encodeURIComponent(buildWhatsAppMessage(booking))}`;
  window.open(url, "_blank");
}

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

function renderGallery() {
  const grid = $("#galleryGrid");
  grid.innerHTML = "";
  let index = 0;

  const tryLoad = (slot) => {
    if (slot >= MAX_GALLERY_SLOTS) return;
    const attempt = (extIdx) => {
      if (extIdx >= GALLERY_EXTENSIONS.length) { tryLoad(slot + 1); return; }
      const ext = GALLERY_EXTENSIONS[extIdx];
      const src = `assets/galerie/client-${slot}.${ext}`;
      const img = new Image();
      img.onload = () => {
        const figure = document.createElement("figure");
        figure.className = "gallery-item reveal";
        figure.innerHTML = `
          <img src="${src}" alt="Client AMC ${slot}" loading="lazy" />
          <figcaption>💇 Tuns de la AMC</figcaption>`;
        figure.addEventListener("click", () => openLightbox(src));
        grid.appendChild(figure);
        observeReveals();
        attempt(extIdx + 1); // o poza poate exista si in mai multe formate — verificam si restul
      };
      img.onerror = () => attempt(extIdx + 1);
      img.src = src;
    };
    attempt(0);
  };
  tryLoad(1);
}

function openLightbox(src) {
  const lb = $("#lightbox");
  $("#lightboxImg").src = src;
  lb.classList.add("open");
}

$("#lightbox")?.addEventListener("click", () => $("#lightbox").classList.remove("open"));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") $("#lightbox")?.classList.remove("open");
});

// ---------- Programări ----------
function getBookings() {
  try { return JSON.parse(localStorage.getItem("lm_bookings") || "[]"); } catch { return []; }
}
function saveBookings(list) {
  localStorage.setItem("lm_bookings", JSON.stringify(list));
}

// Șterge automat programările ale căror dată + oră au trecut (se rulează la deschiderea paginii).
function prunePastBookings() {
  const bookings = getBookings();
  const now = new Date();
  const kept = bookings.filter((b) => {
    const end = new Date(`${b.date}T${b.time || "00:00"}:00`);
    return !Number.isNaN(end.getTime()) && end > now;
  });
  if (kept.length !== bookings.length) saveBookings(kept);
  return kept;
}

function renderBookings() {
  const bookings = getBookings();
  const box = $("#myBookings");
  if (!bookings.length) { box.hidden = true; return; }
  box.hidden = false;
  $("#bookingsList").innerHTML = bookings
    .map(
      (b, i) => `
      <div class="booking-item">
        <div>
          <strong>${escapeHtml(b.service)}</strong> · ${escapeHtml(b.specialist)}
          <div class="muted small">${escapeHtml(b.dateLabel)} ora ${escapeHtml(b.time)} · ${escapeHtml(b.name)}</div>
        </div>
        <button class="booking-cancel" data-cancel="${i}">Anulează</button>
      </div>`
    )
    .join("");
}

$("#bookingsList")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cancel]");
  if (!btn) return;
  const bookings = getBookings();
  bookings.splice(Number(btn.dataset.cancel), 1);
  saveBookings(bookings);
  renderBookings();
  populateTimes(); // ora anulată devine din nou disponibilă în formular
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
function populateTimes() {
  const timeSel = $("#bkTime");
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
  // orele deja rezervate la SPECIALISTUL ales în data respectivă nu mai apar ca opțiuni
  const specialist = $("#bkSpecialist").value;
  const taken = new Set(
    getBookings()
      .filter((b) => b.date === dateVal && b.specialist === specialist)
      .map((b) => b.time)
  );
  for (let t = h.open; t + 30 <= h.close; t += 30) {
    const label = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
    const opt = document.createElement("option");
    opt.value = label;
    opt.textContent = label;
    timeSel.appendChild(opt);
  }
}

function initDateInput() {
  const dateInput = $("#bkDate");
  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;
  dateInput.value = today;
  populateTimes();
}

$("#bkDate")?.addEventListener("change", populateTimes);
$("#bkSpecialist")?.addEventListener("change", populateTimes);

$("#bookingForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = $("#bookingMsg");
  const name = $("#bkName").value.trim();
  const phone = $("#bkPhone").value.trim();
  const service = $("#bkService").value;
  const specialist = $("#bkSpecialist").value;
  const date = $("#bkDate").value;
  const time = $("#bkTime").value;

  if (!name || !phone || !service || !specialist || !date || !time) {
    msg.textContent = "Te rugăm să completezi toate câmpurile.";
    msg.className = "form-msg err";
    return;
  }
  if (!/^0[0-9]{9}$/.test(phone.replace(/\s/g, ""))) {
    msg.textContent = "Număr de telefon invalid (ex: 0722123456).";
    msg.className = "form-msg err";
    return;
  }

  const bookings = getBookings();
  const duplicate = bookings.some((b) => b.date === date && b.time === time && b.specialist === specialist);
  if (duplicate) {
    msg.textContent = "Există deja o programare la această oră cu acest specialist. Alege altă oră.";
    msg.className = "form-msg err";
    return;
  }

  const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("ro-RO", {
    weekday: "long", day: "numeric", month: "long",
  });
  const booking = { name, phone, service, specialist, date, dateLabel, time, createdAt: new Date().toISOString() };
  bookings.push(booking);
  saveBookings(bookings);
  renderBookings();

  // trimitem programarea pe WhatsApp-ul frizerului ales
  sendBookingToWhatsApp(booking);

  msg.textContent = `✅ Programare salvată: ${service} cu ${specialist}, ${dateLabel} ora ${time}. Se deschide WhatsApp pentru a trimite programarea către ${specialist} — apasă Send!`;
  msg.className = "form-msg ok";
  e.target.reset();
  initDateInput();
});

// butoanele „Programează” / „Alege” precompleta formularul
// + popup cu descrierea serviciului în dreapta ecranului
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

// ---------- Harta (consimțământ „two-click”) ----------
// Iframe-ul Google Maps NU se încarcă la deschiderea paginii — doar la apăsarea butonului,
// ca vizitatorul să își dea consimțământul înainte ca Google să primească datele lui.
$("#loadMapBtn")?.addEventListener("click", () => {
  const container = $("#mapConsent");
  const iframe = document.createElement("iframe");
  iframe.title = "Hartă AMC";
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
renderServices();
renderTeam();
renderReviews();
renderSchedule();
populateBookingSelects();
initDateInput();
prunePastBookings();
renderBookings();
renderGallery();
observeReveals();
setInterval(renderSchedule, 60 * 1000);
