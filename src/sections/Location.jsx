import { ADDRESS_QUERY, SCHEDULE } from "../data/content.js";
import { useOpenStatus } from "../hooks/useOpenStatus.js";
import { mapsHref } from "../lib/utils.js";

const ORDER = [5, 6, 0, 1, 2, 3, 4];

export function Location() {
  const status = useOpenStatus();
  const today = new Date().getDay();
  const maps = mapsHref(ADDRESS_QUERY);

  return (
    <section className="section section-alt" id="locatie">
      <div className="container loc-grid">
        <div className="loc-col reveal" id="program">
          <h2 className="section-title left">Program</h2>
          <p className="open-status">{status.text}</p>
          <ul className="schedule">
            {ORDER.map((idx) => {
              const d = SCHEDULE[idx];
              const cls = d.jsDay === today ? "today" : d.closed ? "closed-day" : "";
              return (
                <li key={d.day} className={cls}>
                  <span>{d.day}</span>
                  <span>{d.hours}</span>
                </li>
              );
            })}
          </ul>
          <p className="muted small">Închis duminică.</p>
        </div>
        <div className="loc-col reveal">
          <h2 className="section-title left">Locație</h2>
          <p className="loc-address">📍 Electricenilor nr. 20, Sibiu</p>
          <p className="muted">
            Intrarea se face prin parcarea casei (inscripționată <strong>„Casa Portocalie”</strong>), situată lângă școală!
          </p>
          <a className="btn btn-outline" href={maps}>Vezi direcții de navigare →</a>
          <p className="muted small">
            Pe telefon, butonul deschide aplicația ta de hărți (cea setată implicit); pe calculator, Google Maps. Nu se încarcă nicio hartă în pagină.
          </p>
        </div>
      </div>
    </section>
  );
}
