import { SCHEDULE } from "../data/content.js";

export function stars(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

export function initialsFromName(name) {
  return name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() || "")
    .slice(0, 2)
    .join("");
}

export function toMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(mins) {
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}

export function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isBookingExpired(dateStr, today = localToday()) {
  return typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && dateStr < today;
}

export function localNowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export function parseHours(hours) {
  const [a, b] = hours.split(" - ");
  return { open: toMinutes(a), close: toMinutes(b) };
}

export function scheduleForDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return SCHEDULE.find((x) => x.jsDay === d.getDay());
}

export function openStatusNow() {
  const now = new Date();
  const entry = SCHEDULE.find((d) => d.jsDay === now.getDay());
  if (!entry || entry.closed) return { open: false, text: "Închis astăzi" };
  const h = parseHours(entry.hours);
  const mins = now.getHours() * 60 + now.getMinutes();
  if (mins >= h.open && mins < h.close) return { open: true, text: "Deschis acum" };
  return { open: false, text: "Închis" };
}

export function formatDateLabel(dateStr, extra = {}) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...extra,
  });
}

export function isPast(dateStr, timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(h, m, 0, 0);
  return d.getTime() <= Date.now();
}

export function mapsHref(query) {
  const isMobile =
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && window.innerWidth < 900);
  return isMobile
    ? `geo:0,0?q=${encodeURIComponent(query)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function copyrightYears(start) {
  const now = new Date().getFullYear();
  return now > start ? `${start}–${now}` : String(start);
}

export function specialistKey(name) {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function slotDocId(date, specialist, time) {
  return `${date}__${specialistKey(specialist)}__${time.replace(":", "")}`;
}

export function occupiedTimes(startTime, durationMin, slotMin = 30) {
  const start = toMinutes(startTime);
  const end = start + durationMin;
  const times = [];
  for (let t = start - (start % slotMin); t < end; t += slotMin) {
    times.push(fromMinutes(t));
  }
  return times;
}

export function startConflictsTaken(startTime, durationMin, taken, slotMin = 30) {
  return occupiedTimes(startTime, durationMin, slotMin).some((t) => taken.has(t));
}

export function randomToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}
