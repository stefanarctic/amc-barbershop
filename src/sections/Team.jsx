import { TEAM } from "../data/content.js";
import { stars } from "../lib/utils.js";

export function Team({ onBookSpecialist }) {
  return (
    <section className="section section-alt" id="specialisti">
      <div className="container">
        <p className="section-kicker reveal">Echipa</p>
        <h2 className="section-title reveal">Alege <span className="gold">specialistul</span></h2>
        <div className="team-grid">
          {TEAM.map((t, i) => (
            <article key={t.name} className="team-card reveal" style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="avatar">
                {t.image ? (
                  <img src={t.image} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }} />
                ) : t.initials}
              </div>
              <h3>{t.name}</h3>
              <p className="team-role">{t.role}</p>
              <p className="team-score">
                <span className="stars">{stars(5)}</span> {t.rating}{" "}
                <span className="muted">({t.reviews} evaluări)</span>
              </p>
              <a href="#programare" className="btn btn-gold" onClick={() => onBookSpecialist(t.name)}>Alege</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
