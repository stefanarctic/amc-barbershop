export const SERVICES = [
  {
    name: "Tuns modern + Aranjat + Spălat",
    duration: "45 min",
    durationMin: 45,
    price: "60 - 70 lei",
    desc: "Este atât de simplu să fii fresh — comunică cu frizerul tău și povestește-i ce ți-ar plăcea să încerci.",
  },
  {
    name: "Tuns modern + Barbă + Aranjat + Spălat",
    duration: "1 h",
    durationMin: 60,
    price: "80 - 90 lei",
    desc: "Pachetul preferat al domnilor care acordă o atenție exclusivă bărbii, în concordanță cu tunsoarea bine finalizată!",
  },
  {
    name: "Barbă",
    duration: "30 min",
    durationMin: 30,
    price: "30 - 35 lei",
    desc: "Barba este elementul cheie al bărbatului îngrijit. Oferă-i atenția necesară prin scurtare și definirea clară a conturului.",
  },
  {
    name: "Pachet Tuns modern + Hairdesign",
    duration: "50 min",
    durationMin: 50,
    price: "70 - 80 lei",
    desc: "Pentru cei care vor ceva în plus: tunsoare modernă combinată cu design personalizat.",
  },
  {
    name: "Spălat + Aranjat freză bărbați",
    duration: "10 min",
    durationMin: 10,
    price: "25 lei",
    desc: "Refresh rapid între tunsori — spălare și aranjare profesionistă.",
  },
];

export const TEAM = [
  { name: "Alex Macrea", role: "Specialist", rating: "5.00", reviews: 971, initials: "AM", image: "/assets/alex.jpg" },
  { name: "Alexandru (Atomic) Văduva", role: "Frizer", rating: "4.97", reviews: 79, initials: "AV", image: "/assets/atomic.jpg" },
];

export const REVIEWS = [
  { name: "Mihai C.", initials: "MC", stars: 5, text: "Apelați cu încredere la Alex, tunde exact cum vă doriți 🫡" },
  { name: "Patrick S.", initials: "PS", stars: 5, text: "Servicii de calitate, cu oameni care de fiecare dată te fac să te simți bine. Cât despre tuns — excelent! Recomand!" },
  { name: "Adrian S.", initials: "AS", stars: 5, text: "Recomand" },
  { name: "Darius C.", initials: "DC", stars: 5, text: "Cele mai bune servicii" },
];

export const EXTRA_REVIEWS = [
  { name: "Vlad M.", initials: "VM", stars: 5, text: "Cel mai bun frizer din Sibiu, fără discuții." },
  { name: "George P.", initials: "GP", stars: 5, text: "Programare ușoară, zero așteptare. Simți diferența de la prima tuns." },
  { name: "Radu T.", initials: "RT", stars: 5, text: "Alexandru e un artist cu barba. Recomand cu încredere!" },
];

// Recenzii reale de pe Mero — goale până se adaugă copii 1:1. Recenziile false sunt ilegale.
export const MERO_REVIEWS = [];

export const SCHEDULE = [
  { day: "Luni", hours: "10:00 - 20:00", closed: false, jsDay: 1, open: "10:00", close: "20:00" },
  { day: "Marți", hours: "10:00 - 20:00", closed: false, jsDay: 2, open: "10:00", close: "20:00" },
  { day: "Miercuri", hours: "10:00 - 20:00", closed: false, jsDay: 3, open: "10:00", close: "20:00" },
  { day: "Joi", hours: "10:00 - 20:00", closed: false, jsDay: 4, open: "10:00", close: "20:00" },
  { day: "Vineri", hours: "10:00 - 20:00", closed: false, jsDay: 5, open: "10:00", close: "20:00" },
  { day: "Sâmbătă", hours: "10:30 - 16:00", closed: false, jsDay: 6, open: "10:30", close: "16:00" },
  { day: "Duminică", hours: "Închis", closed: true, jsDay: 0 },
];

export const SLOT_MIN = 30;
export const DEFAULT_DURATION = 30;
export const MAX_FUTURE_BOOKINGS = 1;
export const ADDRESS_QUERY = "Strada Electricenilor 20, Sibiu";
export const PHONE_RE = /^0[0-9]{9}$/;
export const GALLERY_PHOTOS = [
  "/assets/galerie/client-1.jpg",
  "/assets/galerie/client-2.jpg",
  "/assets/galerie/client-3.jpg",
  "/assets/galerie/client-4.jpg",
];
export const COPYRIGHT_START = 2026;
