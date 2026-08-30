# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static website for Frizeria „AMC" (barber shop in Sibiu, Romania) — plain HTML/CSS/JS, no build step, no package manager, no dependencies. All content is in Romanian (`lang="ro"`); keep user-facing text in Romanian.

## Running

No build/lint/test tooling. To preview, serve the `la-macrea/` folder (the site uses no fetch calls, so opening `index.html` directly also works):

```
python -m http.server 8000   # then open http://localhost:8000/la-macrea/
```

## Architecture

- `la-macrea/index.html` — single-page site. Sections are static HTML; grids for services, team, reviews, and gallery are empty `<div>`s populated by JS.
- `la-macrea/js/script.js` — all logic and **all site data**. The arrays at the top (`SERVICES`, `TEAM`, `REVIEWS`, `EXTRA_REVIEWS`, `MERO_REVIEWS`, `SCHEDULE`, `OPENING`, `BARBER_WHATSAPP`) are the content source of truth: prices, barbers, hours, WhatsApp numbers. Edit these to change content — not the HTML.
- `la-macrea/css/style.css` — single stylesheet, dark/gold theme, mobile-first with hamburger nav.
- `la-macrea/politica-confidentialitate.html` — standalone privacy policy page.

Key behaviors wired across both files:

- **Booking flow**: form saves to `localStorage` (`lm_bookings`), then opens WhatsApp (`wa.me`) with a pre-filled message to the chosen barber (numbers in `BARBER_WHATSAPP`, keyed by exact `TEAM[].name`). Time slots are 30-min intervals derived from `SCHEDULE`. Duplicate (date+time+specialist) bookings are rejected. Phone must match `/^0[0-9]{9}$/`.
- **Reviews**: user-submitted reviews are stored locally in `localStorage` (`lm_reviews`), shown only at 4+ stars, and only their author's browser sees them (there is no backend). `MERO_REVIEWS` is for real reviews copied from Mero — the code comments stress that fake reviews are illegal; it displays 6 per day in daily rotation and shows nothing while the array is empty.
- **Gallery**: drop photos named `client-1.jpg`, `client-2.jpg`, … (jpg/jpeg/png/webp) into `assets/galerie/`. JS probes up to 12 slots and silently hides missing files — no HTML change needed to add photos.
- **Privacy**: the Google Maps iframe loads only after an explicit "Încarcă harta" click (two-click consent, GDPR-driven design choice — keep it).
- **XSS**: all user-supplied text interpolated into `innerHTML` must go through `escapeHtml()` (see its comment in script.js).

## Known gaps / TODO in code

- Footer legal IDs (CUI, ONRC, phone, email) are placeholders marked `<!-- COMPLETEAZĂ -->`.
- `hero-sub` text contains a typo ("AMC nu stii unde sa te tunzi") and the hero H1 says "AMC" while title/branding elsewhere says "La Macrea".
