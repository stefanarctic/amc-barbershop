import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { TEAM } from "../data/content.js";
import { auth, isFirebaseConfigured } from "../firebase.js";
import { adminDeleteBooking, fetchAdminBookings, gcalLink } from "../lib/bookings.js";
import { formatDateLabel } from "../lib/utils.js";
import "../styles/admin.css";

function BrandLink() {
  return (
    <Link to="/" className="brand" aria-label="Pagina principală">
      La Macrea <em>admin</em>
    </Link>
  );
}

export function Admin() {
  const [user, setUser] = useState(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [barber, setBarber] = useState("");
  const [when, setWhen] = useState("upcoming");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add("admin-page");
    document.title = "Dashboard programări | Frizeria „La Macrea”";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    return () => {
      document.body.classList.remove("admin-page");
      document.title = "La Macrea — Frizeria & Barber Shop, Sibiu";
      robots.remove();
    };
  }, []);

  useEffect(() => {
    if (!auth) {
      setUser(null);
      return undefined;
    }
    return onAuthStateChanged(auth, setUser);
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      setBookings(await fetchAdminBookings());
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const onLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!auth) {
      setLoginError("Firebase nu este configurat.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setLoginError("E-mail sau parolă greșită.");
    }
  };

  const specialists = useMemo(() => {
    const teamNames = TEAM.map((t) => t.name);
    const extra = [...new Set(bookings.map((b) => b.specialist))].filter((n) => !teamNames.includes(n));
    return [...teamNames, ...extra].sort();
  }, [bookings]);

  const filtered = useMemo(() => {
    const now = new Date();
    return bookings
      .filter((b) => {
        if (b.cancelled) return when === "all" || when === "past";
        const end = new Date(`${b.date}T${b.time || "00:00"}:00`);
        end.setMinutes(end.getMinutes() + (b.duration || 30));
        if (barber && b.specialist !== barber) return false;
        if (when === "upcoming") return end >= now && !b.cancelled;
        if (when === "past") return end < now || b.cancelled;
        return true;
      })
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  }, [bookings, barber, when]);

  const onDelete = async (b) => {
    if (!confirm("Ștergi această programare?")) return;
    try {
      await adminDeleteBooking(b);
      await load();
    } catch {
      alert("Ștergerea a eșuat. Încearcă din nou.");
    }
  };

  if (user === undefined) {
    return (
      <>
        <header className="admin-bar"><BrandLink /></header>
        <main className="admin-main"><p className="muted">Se încarcă…</p></main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <header className="admin-bar"><BrandLink /></header>
        <main className="admin-main">
          <section className="login-gate">
            <h1>Dashboard programări</h1>
            <p className="muted">Introdu e-mailul și parola de administrator.</p>
            {!isFirebaseConfigured() && (
              <p className="form-msg err">Firebase nu este configurat. Copiază .env.example în .env.</p>
            )}
            <form onSubmit={onLogin} autoComplete="off">
              <input type="email" placeholder="E-mail admin" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
              <input type="password" placeholder="Parolă admin" required maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              <button type="submit" className="btn btn-gold">Intră</button>
              {loginError && <p className="form-msg err">{loginError}</p>}
            </form>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <header className="admin-bar">
        <BrandLink />
        <button type="button" className="btn btn-outline" onClick={() => signOut(auth)}>Deconectare</button>
      </header>
      <main className="admin-main">
        <section className="dash">
          <div className="dash-head">
            <h1>Programări</h1>
            <div className="dash-filters">
              <select value={barber} onChange={(e) => setBarber(e.target.value)}>
                <option value="">Toți specialiștii</option>
                {specialists.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <select value={when} onChange={(e) => setWhen(e.target.value)}>
                <option value="upcoming">Viitoare</option>
                <option value="past">Trecute</option>
                <option value="all">Toate</option>
              </select>
            </div>
          </div>
          <p className="muted dash-note">
            Programările sosesc live din Firebase. Sincronizează-le în Google Calendar cu butoanele de mai jos.
            {loading ? " Se actualizează…" : ""}
          </p>
          <div className="admin-list">
            {filtered.map((b) => (
              <div className="admin-item" key={b.id}>
                <div className="admin-item-when">
                  <span className="admin-date">{formatDateLabel(b.date, { year: "numeric" })}</span>
                  <span className="admin-time">{b.time}</span>
                </div>
                <div className="admin-item-info">
                  <strong>{b.service}</strong> · {b.specialist}
                  <div className="muted small">{b.name} · {b.phone}{b.cancelled ? " · anulată" : ""}</div>
                </div>
                <div className="admin-item-actions">
                  <a className="btn btn-outline" href={gcalLink(b)} target="_blank" rel="noopener noreferrer">Google Calendar</a>
                  <button className="admin-delete" type="button" onClick={() => onDelete(b)}>Șterge</button>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && <p className="muted">Nicio programare aici.</p>}
        </section>
      </main>
    </>
  );
}
