# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Website + sistem de programări pentru Frizeria „La Macrea” (Sibiu) — aplicație React + Vite, date în Firebase (Firestore + Auth). Tot textul către utilizator e în română (`lang="ro"`).

## Running

```
cp .env.example .env   # completează config-ul Firebase
npm install
npm run dev
# http://127.0.0.1:8462
```

Build + hosting: `npm run build` apoi `npx -y firebase-tools@latest deploy`. Vezi `DEPLOY.md`.

Dashboard admin: `http://127.0.0.1:8462/admin` (Firebase Auth, e-mail + parolă). Primul admin: user în Authentication, apoi document `admins/{uid}` în Firestore (din Console).

## Architecture

- `src/data/content.js` — **sursa de adevăr pentru conținut**: `SERVICES`, `TEAM`, `REVIEWS`, `EXTRA_REVIEWS`, `MERO_REVIEWS`, `SCHEDULE`. Modifică aici prețuri, frizeri, program. Duratele (`durationMin`) trebuie să rămână aliniate cu `firestore.rules`.
- `src/lib/bookings.js` — programări în Firestore (`bookings`, `slots`, `phones`, `cancelAttempts`).
- `src/styles/style.css` — tema dark/gold, mobile-first.
- `src/pages/Admin.jsx` + `src/styles/admin.css` — dashboard-ul de la `/admin`.
- `public/assets/` — logo, poze echipă, galerie, fonturi locale.

Comportamente importante:

- **Programări**: formularul scrie în Firestore. Sloturile ocupate vin din colecția `slots`. Telefon: `/^0[0-9]{9}$/`.
- **Recenzii**: recenziile trimise de vizitatori stau în `localStorage` (`lm_reviews`), doar 4+ stele, doar în browserul autorului. `MERO_REVIEWS` e pentru recenzii reale de pe Mero — recenziile false sunt ilegale; se afișează 6 pe zi în rotație, nimic dacă array-ul e gol.
- **Galerie**: poze `client-1.jpg` … în `public/assets/galerie/`. Lista e în `GALLERY_PHOTOS`.
- **Confidențialitate**: nu se încarcă Google Maps în pagină; doar link de navigare după click.
- **XSS**: textul de la utilizator se randează ca text React (nu `innerHTML`).
