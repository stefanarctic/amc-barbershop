# Publicarea site-ului (Firebase)

Site-ul e o aplicație React (Vite) găzduită pe Firebase Hosting. Programările stau în Cloud Firestore. Adminul se autentifică cu Firebase Authentication (e-mail + parolă).

## Local

```
copy .env.example .env
# completează VITE_FIREBASE_* din Firebase Console → Project settings → Your apps
npm install
npm run dev
# http://127.0.0.1:8462
```

Dashboard: `http://127.0.0.1:8462/admin`

## Firebase — prima dată

1. Creează un proiect Firebase (sau folosește unul existent).
2. Activează **Authentication → Email/Password**.
3. Creează baza **Cloud Firestore** (regiune `europe-west`, de exemplu `europe-west3` / Frankfurt).
4. Înregistrează o aplicație Web și copiază config-ul în `.env`.
5. Creează userul admin: Authentication → Users → Add user (e-mail + parolă).
6. Copiază **UID**-ul userului și creează în Firestore documentul `admins/{UID}` cu câmpurile:
   - `email` (string, același e-mail)
   - `createdAt` (timestamp)
7. Deploy reguli + hosting:

```
npx -y firebase-tools@latest login
npx -y firebase-tools@latest use --add
npm run build
npx -y firebase-tools@latest deploy
```

Am setat reguli de securitate prototip pentru Firestore. Sunt gândite să țină datele clienților (nume, telefon) departe de vizitatori, să blocheze suprapunerile de ore prin documente `slots` unice și să permită anularea doar cu tokenul primit la programare. Verifică-le înainte de a da site-ul public. Dacă vrei, le putem întări împreună.

## Ce trebuie reținut

- Programările nu mai stau pe disc local — Firestore persistă între deploy-uri.
- HTTPS vine inclus pe Firebase Hosting.
- Primul admin se creează din Console (regulile nu permit auto-promovarea).
- Recenziile rămân doar în browserul vizitatorului (`localStorage`).
