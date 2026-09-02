import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SERVICES, TEAM, SLOT_MIN } from "../data/content.js";
import { cancelBooking, createBooking, fetchTakenSlots, serviceDuration } from "../lib/bookings.js";
import { isFirebaseConfigured } from "../firebase.js";
import {
  addMyPhone,
  mySnapshots,
  myTokens,
  removeMyToken,
  removeSnapshot,
  saveMyToken,
  saveSnapshot,
} from "../lib/storage.js";
import {
  formatDateLabel,
  fromMinutes,
  isPast,
  localNowMinutes,
  localToday,
  parseHours,
  scheduleForDate,
} from "../lib/utils.js";

export function Booking({ service, specialist, onServiceChange, onSpecialistChange }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(localToday);
  const [time, setTime] = useState("");
  const [times, setTimes] = useState([]);
  const [timesNote, setTimesNote] = useState("");
  const [msg, setMsg] = useState({ text: "", kind: "" });
  const [busy, setBusy] = useState(false);
  const [mine, setMine] = useState(() => mySnapshots());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setTime("");
      setTimesNote("");
      const entry = scheduleForDate(date);
      if (!date) {
        setTimes([]);
        return;
      }
      if (!entry || entry.closed) {
        setTimes([]);
        setTimesNote("Închis în această zi");
        return;
      }
      const h = parseHours(entry.hours);
      const dur = serviceDuration(service);
      let taken = new Set();
      let serverOk = true;
      if (specialist && isFirebaseConfigured()) {
        try {
          taken = await fetchTakenSlots(date, specialist);
        } catch {
          serverOk = false;
        }
      }
      if (cancelled) return;
      const isToday = date === localToday();
      const nowMin = localNowMinutes();
      const free = [];
      for (let t = h.open; t + dur <= h.close; t += SLOT_MIN) {
        const label = fromMinutes(t);
        if (taken.has(label)) continue;
        if (isToday && t <= nowMin) continue;
        free.push(label);
      }
      setTimes(free);
      if (!free.length) setTimesNote(isToday ? "Nu mai sunt ore astăzi" : "Nicio oră liberă în această zi");
      else if (!serverOk) setTimesNote("⚠ Nu am putut verifica orele ocupate");
    }
    load();
    return () => { cancelled = true; };
  }, [date, specialist, service]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const payload = { name, phone, service, specialist, date, time };
    if (!payload.name || !payload.phone || !payload.service || !payload.specialist || !payload.date || !payload.time) {
      setMsg({ text: "Te rugăm să completezi toate câmpurile.", kind: "err" });
      return;
    }
    setBusy(true);
    setMsg({ text: "Se salvează programarea…", kind: "" });
    try {
      const b = await createBooking(payload);
      addMyPhone(b.phone);
      saveMyToken(b.id, b.cancelToken);
      saveSnapshot({
        id: b.id,
        service: b.service,
        specialist: b.specialist,
        date: b.date,
        time: b.time,
        duration: b.duration,
        phone: b.phone,
      });
      setMine(mySnapshots());
      const dateLabel = formatDateLabel(b.date);
      setMsg({ text: `✅ Programare salvată: ${b.service} cu ${b.specialist}, ${dateLabel} ora ${b.time}. Te așteptăm!`, kind: "ok" });
      setName("");
      setPhone("");
      setTime("");
      setDate(localToday());
    } catch (err) {
      setMsg({ text: err.message || "Nu am putut salva programarea. Încearcă din nou.", kind: "err" });
    } finally {
      setBusy(false);
    }
  };

  const onCancel = async (b) => {
    const token = myTokens()[b.id];
    if (!token) return;
    if (!confirm("Anulezi această programare?")) return;
    try {
      await cancelBooking({ ...b, token });
      removeMyToken(b.id);
      removeSnapshot(b.id);
      setMine(mySnapshots());
    } catch {
      alert("Anularea a eșuat. Încearcă din nou în câteva minute.");
    }
  };

  const upcoming = [...mine].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

  return (
    <section className="section section-booking" id="programare">
      <div className="container">
        <p className="section-kicker reveal">Rezervă-ți locul</p>
        <h2 className="section-title reveal">Sistem de <span className="gold">programări</span></h2>
        <p className="section-sub reveal">Completează formularul și te contactăm pentru confirmare. Programările tale salvate apar mai jos.</p>

        <form className="booking-form reveal" onSubmit={onSubmit}>
          <div className="form-grid">
            <label>Nume complet
              <input type="text" placeholder="Ex: Andrei Popescu" required value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>Telefon
              <input type="tel" placeholder="07xx xxx xxx" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label>Serviciu
              <select required value={service} onChange={(e) => onServiceChange(e.target.value)}>
                <option value="">— alege —</option>
                {SERVICES.map((s) => (
                  <option key={s.name} value={s.name}>{s.name} — {s.duration}, {s.price}</option>
                ))}
              </select>
            </label>
            <label>Specialist
              <select required value={specialist} onChange={(e) => onSpecialistChange(e.target.value)}>
                <option value="">— alege —</option>
                {TEAM.map((t) => (
                  <option key={t.name} value={t.name}>{t.name} ({t.role})</option>
                ))}
              </select>
            </label>
            <label>Data
              <input type="date" required min={localToday()} value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label>Ora
              <select required value={time} onChange={(e) => setTime(e.target.value)}>
                <option value="">— alege ora —</option>
                {times.map((t) => <option key={t} value={t}>{t}</option>)}
                {timesNote && <option disabled value="">{timesNote}</option>}
              </select>
            </label>
          </div>
          <button type="submit" className="btn btn-gold btn-lg" disabled={busy}>Confirmă programarea</button>
          <p className={`form-msg ${msg.kind}`}>{msg.text}</p>
          <p className="privacy-note">
            Prin trimitere, datele tale (nume, telefon) sunt salvate securizat în Firebase, pentru confirmarea programării. Vezi{" "}
            <Link to="/politica-confidentialitate">Politică de confidențialitate</Link>.
          </p>
        </form>

        {upcoming.length > 0 && (
          <div className="my-bookings reveal">
            <h3>Programările tale</h3>
            <div>
              {upcoming.map((b) => {
                const past = isPast(b.date, b.time);
                const canCancel = !past && myTokens()[b.id];
                return (
                  <div key={b.id} className={`booking-item${past ? " past" : ""}`}>
                    <div>
                      <strong>{b.service}</strong> · {b.specialist}
                      <div className="muted small">{formatDateLabel(b.date)} ora {b.time}</div>
                    </div>
                    {canCancel && (
                      <button className="booking-cancel" type="button" onClick={() => onCancel(b)}>Anulează</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
