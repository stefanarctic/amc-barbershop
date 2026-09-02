const PHONES_KEY = "lm_phones";
const TOKENS_KEY = "lm_tokens";
const SNAPSHOTS_KEY = "lm_booking_snapshots";
const REVIEWS_KEY = "lm_reviews";
const COOKIE_KEY = "lm_cookie_choice";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function myPhones() {
  return readJson(PHONES_KEY, []);
}

export function addMyPhone(phone) {
  const list = myPhones().filter((p) => p !== phone);
  list.push(phone);
  localStorage.setItem(PHONES_KEY, JSON.stringify(list.slice(-5)));
}

export function myTokens() {
  return readJson(TOKENS_KEY, {});
}

export function saveMyToken(id, token) {
  const tokens = myTokens();
  tokens[id] = token;
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

export function removeMyToken(id) {
  const tokens = myTokens();
  delete tokens[id];
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

export function mySnapshots() {
  return readJson(SNAPSHOTS_KEY, []);
}

export function saveSnapshot(booking) {
  const list = mySnapshots().filter((b) => b.id !== booking.id);
  list.push(booking);
  localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(list));
}

export function removeSnapshot(id) {
  localStorage.setItem(
    SNAPSHOTS_KEY,
    JSON.stringify(mySnapshots().filter((b) => b.id !== id)),
  );
}

export function getUserReviews() {
  return readJson(REVIEWS_KEY, []);
}

export function setUserReviews(reviews) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

export function getCookieChoice() {
  return localStorage.getItem(COOKIE_KEY);
}

export function setCookieChoice(choice) {
  localStorage.setItem(COOKIE_KEY, choice);
}
