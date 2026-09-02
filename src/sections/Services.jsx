import { useState } from "react";
import { SERVICES } from "../data/content.js";

export function Services({ onBookService }) {
  const [popup, setPopup] = useState(null);

  return (
    <section className="section" id="servicii">
      <div className="container">
        <p className="section-kicker reveal">Prețuri &amp; servicii</p>
        <h2 className="section-title reveal">Alege un <span className="gold">serviciu</span></h2>
        <p className="section-sub reveal">Frizerie și barber shop — fiecare serviciu se încheie cu un finish impecabil.</p>

        <div className="services-grid">
          {SERVICES.map((s, i) => (
            <article key={s.name} className="service-card reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="service-top">
                <h3 className="service-name">{s.name}</h3>
                <span className="service-price">{s.price}</span>
              </div>
              <span className="service-meta">⏱ {s.duration}</span>
              <a
                href="#programare"
                className="btn btn-outline"
                onClick={() => {
                  onBookService(s.name);
                  setPopup(s);
                }}
              >
                Programează →
              </a>
            </article>
          ))}
          <a href="#specialisti" className="service-card service-card-link reveal" style={{ transitionDelay: `${SERVICES.length * 80}ms` }}>
            <div className="service-top">
              <h3 className="service-name">Nu știi pe cine să alegi?</h3>
              <span className="service-price">✂︎</span>
            </div>
            <span className="service-meta">Echipa noastră de frizeri</span>
            <span className="btn btn-gold">Vezi specialiștii →</span>
          </a>
        </div>

        <div className="mero-cta reveal">
          <a className="btn btn-gold btn-lg" href="https://mero.ro/p/am-barber" target="_blank" rel="noopener noreferrer">
            Programează-te pe Mero →
          </a>
          <p className="muted small">Programare rapidă, direct pe platforma Mero.</p>
        </div>
      </div>

      {popup && (
        <div className="service-popup open">
          <button className="service-popup-close" aria-label="Închide" type="button" onClick={() => setPopup(null)}>✕</button>
          <h3 className="service-popup-name">{popup.name}</h3>
          <p className="service-popup-meta">⏱ {popup.duration} · {popup.price}</p>
          <p className="service-popup-desc">{popup.desc}</p>
        </div>
      )}
    </section>
  );
}
