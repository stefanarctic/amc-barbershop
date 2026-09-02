import { useState } from "react";
import { Link } from "react-router-dom";
import { getCookieChoice, setCookieChoice } from "../lib/storage.js";

export function CookieBanner() {
  const [visible, setVisible] = useState(() => !getCookieChoice());

  if (!visible) return null;

  const choose = (choice) => {
    setCookieChoice(choice);
    setVisible(false);
  };

  return (
    <div className="cookie-banner">
      <p>
        Folosim doar <strong>stocare locală esențială</strong> pe dispozitivul tău (programările
        tale și preferințele de pe site) — <em>fără</em> cookie-uri de urmărire, analytics sau
        publicitate. Vezi <Link to="/politica-confidentialitate">Politică de confidențialitate</Link>.
      </p>
      <div className="cookie-actions">
        <button type="button" className="btn btn-gold" onClick={() => choose("accepted")}>Accept</button>
        <button type="button" className="btn btn-outline" onClick={() => choose("essential")}>Doar esențiale</button>
      </div>
    </div>
  );
}
