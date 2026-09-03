import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { SERVICES, MAX_FUTURE_BOOKINGS, PHONE_RE, SLOT_MIN } from "../data/content.js";
import { db, isFirebaseConfigured } from "../firebase.js";
import {
  isBookingExpired,
  isPast,
  localToday,
  occupiedTimes,
  randomToken,
  scheduleForDate,
  slotDocId,
  toMinutes,
} from "./utils.js";

function requireDb() {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase nu este configurat. Adaugă variabilele VITE_FIREBASE_* în .env");
  }
  return db;
}

export function serviceDuration(serviceName) {
  return SERVICES.find((s) => s.name === serviceName)?.durationMin ?? 30;
}

export function validateBookingClient(payload) {
  const name = (payload.name || "").trim();
  const phone = (payload.phone || "").replace(/\s/g, "");
  const service = (payload.service || "").trim();
  const specialist = (payload.specialist || "").trim();
  const date = (payload.date || "").trim();
  const time = (payload.time || "").trim();

  if (name.length < 2) return { error: "Nume invalid." };
  if (!PHONE_RE.test(phone)) return { error: "Număr de telefon invalid (ex: 0722123456)." };
  if (!service) return { error: "Alege un serviciu." };
  if (!specialist) return { error: "Alege un specialist." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Dată invalidă." };
  if (!/^\d{2}:\d{2}$/.test(time)) return { error: "Oră invalidă." };

  const entry = scheduleForDate(date);
  if (!entry || entry.closed) return { error: "Frizeria este închisă în această zi." };

  const duration = serviceDuration(service);
  const tMins = toMinutes(time);
  if (tMins % SLOT_MIN !== 0) return { error: "Ora trebuie să fie pe interval de 30 de minute." };
  if (tMins < toMinutes(entry.open) || tMins + duration > toMinutes(entry.close)) {
    return { error: "Ora este în afara programului." };
  }
  if (date < localToday()) return { error: "Nu poți programa în trecut." };
  if (date === localToday() && isPast(date, time)) return { error: "Ora este în trecut." };

  return { booking: { name, phone, service, specialist, date, time }, duration };
}

function slotTimeFromDoc(d) {
  const time = d.data().time;
  if (typeof time === "string" && time) return time;
  const match = /__(\d{4})$/.exec(d.id);
  return match ? `${match[1].slice(0, 2)}:${match[1].slice(2)}` : "";
}

function takenSetFromDocs(docs, specialist) {
  return new Set(
    docs
      .filter((d) => !specialist || d.data().specialist === specialist)
      .map(slotTimeFromDoc)
      .filter(Boolean),
  );
}

export async function fetchTakenSlots(date, specialist) {
  const firestore = requireDb();
  const q = query(collection(firestore, "slots"), where("date", "==", date));
  const snap = await getDocs(q);
  return takenSetFromDocs(snap.docs, specialist);
}

export function subscribeTakenSlots(date, specialist, onChange) {
  const firestore = requireDb();
  const q = query(collection(firestore, "slots"), where("date", "==", date));
  return onSnapshot(
    q,
    (snap) => onChange(takenSetFromDocs(snap.docs, specialist), true),
    () => onChange(new Set(), false),
  );
}

export async function createBooking(payload) {
  const firestore = requireDb();
  const v = validateBookingClient(payload);
  if (v.error) throw new Error(v.error);

  const { booking, duration } = v;
  const id = crypto.randomUUID();
  const cancelToken = randomToken();
  const times = occupiedTimes(booking.time, duration, SLOT_MIN);
  const startsAt = `${booking.date}T${booking.time}`;

  await runTransaction(firestore, async (tx) => {
    const slotRefs = times.map((t) => doc(firestore, "slots", slotDocId(booking.date, booking.specialist, t)));
    for (const ref of slotRefs) {
      const slotSnap = await tx.get(ref);
      if (slotSnap.exists()) {
        throw new Error("Există deja o programare care se suprapune cu ora aleasă. Alege alt interval.");
      }
    }

    const phoneRef = doc(firestore, "phones", booking.phone);
    const phoneSnap = await tx.get(phoneRef);
    const futureIds = phoneSnap.exists() ? phoneSnap.data().futureIds || [] : [];
    if (futureIds.length >= MAX_FUTURE_BOOKINGS) {
      throw new Error("Ai deja o programare activă pe acest număr. Anuleaz-o sau sună la frizerie.");
    }

    tx.set(doc(firestore, "bookings", id), {
      name: booking.name,
      phone: booking.phone,
      service: booking.service,
      specialist: booking.specialist,
      date: booking.date,
      time: booking.time,
      duration,
      startMin: toMinutes(booking.time),
      startsAt,
      cancelToken,
      cancelled: false,
      createdAt: serverTimestamp(),
    });

    for (let i = 0; i < times.length; i++) {
      tx.set(slotRefs[i], {
        date: booking.date,
        specialist: booking.specialist,
        time: times[i],
        startMin: toMinutes(times[i]),
        duration,
        bookingId: id,
      });
    }

    tx.set(phoneRef, {
      phone: booking.phone,
      futureIds: [...futureIds, id],
      updatedAt: serverTimestamp(),
    });
  });

  return { ...booking, id, duration, cancelToken, createdAt: new Date().toISOString() };
}

export async function cancelBooking({ id, token, phone, date, specialist, time, duration }) {
  const firestore = requireDb();
  const bookingRef = doc(firestore, "bookings", id);
  const attemptRef = doc(firestore, "cancelAttempts", id);

  await runTransaction(firestore, async (tx) => {
    tx.set(attemptRef, { token, createdAt: serverTimestamp() });
    tx.update(bookingRef, { cancelled: true });
  });

  const times = occupiedTimes(time, duration || 30, SLOT_MIN);
  await Promise.all(
    times.map((t) => deleteDoc(doc(firestore, "slots", slotDocId(date, specialist, t)))),
  );

  if (phone) {
    const phoneRef = doc(firestore, "phones", phone);
    await runTransaction(firestore, async (tx) => {
      const snap = await tx.get(phoneRef);
      if (!snap.exists()) return;
      const futureIds = (snap.data().futureIds || []).filter((x) => x !== id);
      tx.set(phoneRef, {
        phone,
        futureIds,
        updatedAt: serverTimestamp(),
      });
    });
  }
}

export async function fetchAdminBookings() {
  const firestore = requireDb();
  const snap = await getDocs(collection(firestore, "bookings"));
  const bookings = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || "",
    };
  });

  const stale = [];
  const current = [];
  for (const booking of bookings) {
    if (isBookingExpired(booking.date)) stale.push(booking);
    else current.push(booking);
  }

  const purged = await Promise.allSettled(stale.map((booking) => adminDeleteBooking(booking)));
  purged.forEach((result, i) => {
    if (result.status === "rejected") current.push(stale[i]);
  });

  try {
    await syncMissingSlots(current);
  } catch {
    /* backfill best-effort — lista de programări rămâne vizibilă */
  }
  return current;
}

async function syncMissingSlots(bookings) {
  const firestore = requireDb();
  await Promise.all(
    bookings
      .filter((b) => !b.cancelled && b.date && b.specialist && b.time)
      .map(async (b) => {
        const times = occupiedTimes(b.time, b.duration || 30, SLOT_MIN);
        await Promise.all(
          times.map(async (t) => {
            const ref = doc(firestore, "slots", slotDocId(b.date, b.specialist, t));
            const existing = await getDoc(ref);
            if (existing.exists()) return;
            await setDoc(ref, {
              date: b.date,
              specialist: b.specialist,
              time: t,
              startMin: toMinutes(t),
              duration: b.duration || 30,
              bookingId: b.id,
            });
          }),
        );
      }),
  );
}

export async function adminDeleteBooking(booking) {
  const firestore = requireDb();
  if (!booking.cancelled) {
    const times = occupiedTimes(booking.time, booking.duration || 30, SLOT_MIN);
    await Promise.all(
      times.map((t) => deleteDoc(doc(firestore, "slots", slotDocId(booking.date, booking.specialist, t)))),
    );
  }
  if (booking.phone) {
    const phoneRef = doc(firestore, "phones", booking.phone);
    await runTransaction(firestore, async (tx) => {
      const snap = await tx.get(phoneRef);
      if (!snap.exists()) return;
      tx.set(phoneRef, {
        phone: booking.phone,
        futureIds: (snap.data().futureIds || []).filter((x) => x !== booking.id),
        updatedAt: serverTimestamp(),
      });
    });
  }
  await deleteDoc(doc(firestore, "bookings", booking.id));
  await deleteDoc(doc(firestore, "cancelAttempts", booking.id)).catch(() => {});
}

export function gcalLink(b) {
  const start = b.date.replace(/-/g, "") + "T" + b.time.replace(":", "") + "00";
  const [h, m] = b.time.split(":").map(Number);
  const endMin = h * 60 + m + (b.duration || 45);
  const end =
    b.date.replace(/-/g, "") +
    "T" +
    String(Math.floor(endMin / 60)).padStart(2, "0") +
    String(endMin % 60).padStart(2, "0") +
    "00";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${b.service} — ${b.name}`,
    details: `Client: ${b.name}\nTelefon: ${b.phone}\nFrizer: ${b.specialist}\nProgramare făcută pe site-ul La Macrea.`,
    location: "Frizeria La Macrea, Strada Electricenilor 20, Sibiu",
  });
  return `https://calendar.google.com/calendar/render?${params}&dates=${start}/${end}`;
}
