import { Link } from "react-router-dom";
import { ADDRESS_QUERY, COPYRIGHT_START } from "../data/content.js";
import { copyrightYears, mapsHref } from "../lib/utils.js";

export function Footer() {
  const maps = mapsHref(ADDRESS_QUERY);

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="logo">
          <img src="/assets/logo.png" alt="Frizeria La Macrea" className="footer-logo-img" />
        </div>
        <p>
          <a className="addr-link" href={maps}>{ADDRESS_QUERY.replace("Strada ", "").replace(", Sibiu", "")}, Sibiu</a>
          {" · "}Frizerie &amp; Barber Shop
        </p>
        <p className="muted small legal-ids">
          Frizeria „La Macrea” · CUI: 46306564 · Nr. înregistrare Reg. Comerț: F2022000481324
          <br />
          Sediul: <a className="addr-link" href={maps}>Str. Electricenilor nr. 20, Sibiu</a>
          {" · "}Tel: <a href="tel:0753985205">0753 985 205</a>
        </p>
        <p className="muted small">
          © <a href="/#date-firma" className="footer-firma-link">Frizeria „La Macrea”</a>{" "}
          <span>{copyrightYears(COPYRIGHT_START)}</span>. Toate drepturile rezervate.
        </p>
        <p className="muted small footer-links">
          <Link to="/politica-confidentialitate">Politică de confidențialitate</Link>
          {" · "}
          <Link to="/termeni-conditii">Termeni și condiții</Link>
        </p>
        <p className="muted small footer-links anpc-links">
          <a href="https://www.anpc.ro/sal" target="_blank" rel="noopener noreferrer">SOL — Soluționarea Alternativă a Litigiilor</a>
          {" · "}
          <a href="https://reclamatiisal.anpc.ro/" target="_blank" rel="noopener noreferrer">Aplicația ANPC SOL</a>
          {" · "}
          <a href="https://www.anpc.ro/" target="_blank" rel="noopener noreferrer">Protecția Consumatorului — ANPC</a>
        </p>
        <div className="anpc-badge">
          <a href="https://www.anpc.ro/sal" target="_blank" rel="noopener noreferrer" title="ANPC — Soluționarea Alternativă a Litigiilor">
            <img src="/assets/anpc-logo.png" alt="ANPC — Autoritatea Națională pentru Protecția Consumatorilor" width="171" height="80" />
          </a>
        </div>
      </div>
    </footer>
  );
}
