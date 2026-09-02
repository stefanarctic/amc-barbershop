import { useMemo, useState } from "react";
import { EXTRA_REVIEWS, MERO_REVIEWS, REVIEWS } from "../data/content.js";
import { getUserReviews, setUserReviews } from "../lib/storage.js";
import { initialsFromName, stars } from "../lib/utils.js";

const REVIEWS_INITIAL = 6;
const REVIEWS_MORE = 4;

function todayMeroReviews() {
  const pool = MERO_REVIEWS.filter((r) => r.stars >= 4);
  if (!pool.length) return [];
  const daysSinceEpoch = Math.floor(Date.now() / 86400000);
  const start = (daysSinceEpoch * 6) % pool.length;
  const today = [];
  for (let i = 0; i < 6 && i < pool.length; i++) {
    today.push({ ...pool[(start + i) % pool.length], source: "mero" });
  }
  return today;
}

export function Reviews() {
  const [userReviews, setLocalReviews] = useState(() => getUserReviews());
  const [shown, setShown] = useState(REVIEWS_INITIAL);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [starsN, setStarsN] = useState("5");

  const all = useMemo(
    () => [...REVIEWS, ...EXTRA_REVIEWS, ...todayMeroReviews(), ...userReviews.filter((r) => r.stars >= 4)],
    [userReviews],
  );
  const list = all.slice(0, shown);

  const persist = (next) => {
    setUserReviews(next);
    setLocalReviews(next);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedText = text.trim();
    if (!trimmedName || !trimmedText) return;
    const next = [
      {
        id: Date.now(),
        name: trimmedName,
        initials: initialsFromName(trimmedName),
        stars: Number(starsN),
        text: trimmedText,
        source: "user",
      },
      ...userReviews,
    ];
    persist(next);
    setShown(REVIEWS.length + EXTRA_REVIEWS.length + todayMeroReviews().length + next.length);
    setName("");
    setText("");
    setStarsN("5");
  };

  return (
    <section className="section" id="recenzii">
      <div className="container">
        <p className="section-kicker reveal">Ce spun clienții</p>
        <h2 className="section-title reveal">Recenzii &amp; <span className="gold">evaluări</span></h2>
        <div className="reviews-summary reveal">
          <div className="big-score">4.99</div>
          <div>
            <div className="stars big">★★★★★</div>
            <p className="muted">
              1379 evaluări pe{" "}
              <a href="https://mero.ro/p/am-barber" target="_blank" rel="noopener noreferrer" className="rating-source">Mero</a>
            </p>
          </div>
        </div>
        <div className="reviews-grid">
          {list.map((r) => (
            <article key={`${r.source || "site"}-${r.id || r.name}-${r.text}`} className="review-card reveal visible">
              <div className="review-head">
                <div className="review-avatar">{r.initials}</div>
                <div>
                  <div className="review-name">
                    {r.name}
                    {r.source === "mero" ? <span className="muted small"> · Mero</span> : null}
                  </div>
                  <div className="stars">{stars(r.stars)}</div>
                </div>
                {r.source === "user" && (
                  <button
                    className="review-delete"
                    type="button"
                    aria-label="Șterge recenzia"
                    title="Șterge recenzia ta"
                    onClick={() => persist(userReviews.filter((x) => String(x.id) !== String(r.id)))}
                  >
                    🗑
                  </button>
                )}
              </div>
              <p className="review-text">{r.text}</p>
            </article>
          ))}
        </div>
        {shown < all.length && (
          <div className="center reveal">
            <button className="btn btn-outline" type="button" onClick={() => setShown((n) => n + REVIEWS_MORE)}>
              Vezi mai multe recenzii
            </button>
          </div>
        )}
        <div className="add-review-box reveal">
          <h3>Adaugă o recenzie</h3>
          <form onSubmit={onSubmit}>
            <div className="form-row">
              <input type="text" placeholder="Numele tău" required value={name} onChange={(e) => setName(e.target.value)} />
              <select required value={starsN} onChange={(e) => setStarsN(e.target.value)}>
                <option value="5">★★★★★ (5)</option>
                <option value="4">★★★★ (4)</option>
                <option value="3">★★★ (3)</option>
                <option value="2">★★ (2)</option>
                <option value="1">★ (1)</option>
              </select>
            </div>
            <textarea rows="3" placeholder="Povestește experiența ta..." required value={text} onChange={(e) => setText(e.target.value)} />
            <button type="submit" className="btn btn-gold">Trimite recenzia</button>
          </form>
        </div>
      </div>
    </section>
  );
}
