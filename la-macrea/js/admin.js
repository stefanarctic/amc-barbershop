// ---------- Dashboard admin — programări (prin API) ----------
// Login-ul e acum server-side (pagina /admin, formular POST cu CSRF) —
// acest script doar randează lista și face ștergerile (cu header CSRF).

const CSRF = document.querySelector('meta[name="csrf"]')?.content || '';
const $ = (sel) => document.querySelector(sel);
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

// echipa reală — ȚINUT SINCRON cu TEAM din script.js (admin.html nu încarcă script.js)
const TEAM = [
  { name: "Alex Macrea", role: "Specialist" },
  { name: "Alexandru (Atomic) Văduva", role: "Frizer" },
];

// ---------- Sesiune ----------
// Randăm direct: dacă sesiunea a expirat, API-ul răspunde 401
// și pagina se reîncarcă ca formularul de login de la /admin.
renderAdminBookings();

// ---------- Filtre ----------
$("#filterBarber")?.addEventListener("change", renderAdminBookings);
$("#filterWhen")?.addEventListener("change", renderAdminBookings);

// ---------- Randare listă ----------
async function renderAdminBookings() {
  let bookings;
  try {
    const res = await fetch("/api/bookings");
    if (res.status === 401) { // sesiune expirată → login
      location.href = "/admin";
      return;
    }
    bookings = (await res.json()).bookings || [];
  } catch {
    bookings = [];
  }

  const sel = $("#filterBarber");
  const barber = sel.value;
  const when = $("#filterWhen").value;
  const now = new Date();

  // filtrul de specialiști vine din echipa reală (TEAM), nu doar din programările existente,
  // și se reconstruiește la fiecare randare, păstrând selecția
  const teamNames = [...new Set(TEAM.map((t) => t.name))];
  const extraNames = [...new Set(bookings.map((b) => b.specialist))].filter((n) => !teamNames.includes(n));
  sel.innerHTML = '<option value="">Toți specialiștii</option>';
  [...teamNames, ...extraNames].sort().forEach((n) => {
    const opt = document.createElement("option");
    opt.value = n;
    opt.textContent = n;
    sel.appendChild(opt);
  });
  if ([...sel.options].some((o) => o.value === barber)) sel.value = barber;

  const filtered = bookings
    .filter((b) => {
      // „end" = început + durata reală — altfel o programare în desfășurare
      // (începută acum 20 min, durată 60 min) e clasificată greșit la „Trecute"
      const end = new Date(`${b.date}T${b.time || "00:00"}:00`);
      end.setMinutes(end.getMinutes() + (b.duration || 30));
      if (barber && b.specialist !== barber) return false;
      if (when === "upcoming") return end >= now;
      if (when === "past") return end < now;
      return true;
    })
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

  $("#adminEmpty").hidden = filtered.length > 0;
  $("#adminBookings").innerHTML = filtered
    .map((b) => {
      const gcalUrl = gcalLink(b);
      return `
      <div class="admin-item">
        <div class="admin-item-when">
          <span class="admin-date">${esc(dateLabel(b))}</span>
          <span class="admin-time">${esc(b.time)}</span>
        </div>
        <div class="admin-item-info">
          <strong>${esc(b.service)}</strong> · ${esc(b.specialist)}
          <div class="muted small">${esc(b.name)} · ${esc(b.phone)}</div>
        </div>
        <div class="admin-item-actions">
          <a class="btn btn-outline" href="${gcalUrl}" target="_blank" rel="noopener">Google Calendar</a>
          <button class="admin-delete" data-del="${esc(b.id)}">Șterge</button>
        </div>
      </div>`;
    })
    .join("");
}

function dateLabel(b) {
  return new Date(b.date + "T00:00:00").toLocaleDateString("ro-RO", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// Link oficial „creare eveniment" Google Calendar (fără API — deschide
// formularul de eveniment precompletat în contul de Google al adminului).
function gcalLink(b) {
  const start = b.date.replace(/-/g, "") + "T" + b.time.replace(":", "") + "00";
  const [h, m] = b.time.split(":").map(Number);
  const endMin = h * 60 + m + (b.duration || 45); // durata reală a serviciului (salvată de server)
  const end = b.date.replace(/-/g, "") + "T" +
    String(Math.floor(endMin / 60)).padStart(2, "0") + String(endMin % 60).padStart(2, "0") + "00";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${b.service} — ${b.name}`,
    details: `Client: ${b.name}\nTelefon: ${b.phone}\nFrizer: ${b.specialist}\nProgramare făcută pe site-ul La Macrea.`,
    location: "Frizeria La Macrea, Strada Electricenilor 20, Sibiu",
  });
  return `https://calendar.google.com/calendar/render?${params}&dates=${start}/${end}`;
}

// ---------- Ștergere (prin API) ----------
$("#adminBookings")?.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-del]");
  if (!btn) return;
  if (!confirm("Ștergi această programare?")) return;
  btn.disabled = true;
  try {
    const res = await fetch(`/api/bookings/${encodeURIComponent(btn.dataset.del)}`, {
      method: "DELETE",
      headers: { "X-CSRF-TOKEN": CSRF },
    });
    if (res.status === 403) {
      // token CSRF expirat (sesiune veche) — pagina de login îl regenerează
      alert("Sesiunea a expirat. Reîncarcă pagina și încearcă din nou.");
    } else if (!res.ok) {
      alert("Ștergerea a eșuat. Încearcă din nou.");
    }
  } catch {
    alert("Ștergerea a eșuat — serverul nu răspunde.");
  }
  btn.disabled = false;
  renderAdminBookings();
});
