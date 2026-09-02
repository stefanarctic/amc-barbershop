import { Link } from "react-router-dom";
import { CookieBanner } from "../components/CookieBanner.jsx";
import { Footer } from "../components/Footer.jsx";
import { Navbar } from "../components/Navbar.jsx";
import { useReveal } from "../hooks/useReveal.js";

export function Terms() {
  useReveal();

  return (
    <>
      <Navbar variant="legal" />
      <section className="section section-alt" id="termeni">
        <div className="container policy-content">
          <p className="section-kicker">Legal</p>
          <h1 className="section-title left">Termeni și <span className="gold">condiții</span></h1>
          <p className="muted">Ultima actualizare: 3 septembrie 2026</p>

          <h2>1. Cine suntem</h2>
          <p>
            Site-ul este operat de Frizeria „La Macrea”, CUI 46306564, nr. înregistrare
            Reg. Comerț F2022000481324, cu sediul în Strada Electricenilor nr. 20, Sibiu
            („noi”, „frizeria”). Prin utilizarea site-ului, accepți termenii de mai jos.
          </p>

          <h2>2. Ce oferim prin site</h2>
          <p>
            Site-ul prezintă serviciile frizeriei, prețurile, echipa, galeria și permite
            efectuarea de programări online, fie direct pe site, fie prin platforma
            terță <a href="https://mero.ro/p/am-barber" target="_blank" rel="noopener noreferrer">Mero</a>.
            Informațiile (prețuri, program, servicii) pot fi modificate oricând, fără
            notificare prealabilă.
          </p>

          <h2>3. Programări și anulate</h2>
          <p>
            O programare devine fermă după confirmarea salvării în sistemul frizeriei.
            Poți anula oricând din secțiunea „Programările mele”, folosind dispozitivul
            de pe care ai făcut programarea. La mai mult de două întârzieri sau neprezentări
            fără anulare, frizeria își rezervă dreptul de a refuza programări viitoare.
          </p>

          <h2>4. Limitarea răspunderii</h2>
          <p>
            Site-ul este furnizat „ca atare”. Nu oferim garanții că site-ul va fi disponibil
            neîntrerupt sau fără erori. <strong>Nu suntem responsabili pentru daune directe
            sau indirecte</strong> rezultate din utilizarea site-ului, din întreruperi ale
            disponibilității, din erori de afișare a informațiilor sau din evenimente care
            nu ne pot fi controlate (defecte tehnice, pene de curent/internet, acțiuni ale
            unor terți). Prețurile afișate pe site au caracter informativ; prețul final
            este cel afișat în salon.
          </p>

          <h2>5. Datele cu caracter personal</h2>
          <p>
            Nu folosim cookie-uri de urmărire, analytics sau publicitate. Colectăm doar
            datele strict necesare programării (nume, telefon), în condițiile descrise în{" "}
            <Link to="/politica-confidentialitate">Politică de confidențialitate</Link>,
            care face parte integrantă din acești termeni.
          </p>

          <h2>6. Proprietate intelectuală</h2>
          <p>
            Logo-ul, textele și imaginile din galerie aparțin frizeriei. Nu folosi conținutul
            site-ului în scopuri comerciale fără acordul nostru scris.
          </p>

          <h2>7. Linkuri către site-uri terțe</h2>
          <p>
            Site-ul trimite către platforme terțe (Mero, Google Maps, rețele sociale, ANPC, Firebase).
            Nu controlăm conținutul acestora și nu răspundem pentru politicile sau
            practicile lor.
          </p>

          <h2>8. Legea aplicabilă și litigii</h2>
          <p>
            Relația cu vizitatorii și clienții este guvernată de legea română. Consumatorii
            pot apela la <strong>Soluționarea Alternativă a Litigiilor (SAL)</strong>:{" "}
            <a href="https://www.anpc.ro/sal" target="_blank" rel="noopener noreferrer">anpc.ro/sal</a>
            {" "}și aplicația <a href="https://reclamatiisal.anpc.ro/" target="_blank" rel="noopener noreferrer">ANPC SOL</a>.
            Pentru orice neajuns, ne poți contacta întâi direct la salon sau pe rețelele
            sociale („lamacrea” / „La Macrea Sibiu”) — rezolvăm aproape orice pe loc.
          </p>

          <h2>9. Modificări</h2>
          <p>
            Putem actualiza acești termeni odată cu schimbări ale site-ului sau ale
            serviciilor. Versiunea curentă este mereu disponibilă aici.
          </p>
          <p><Link to="/">← Înapoi la pagina principală</Link></p>
        </div>
      </section>
      <Footer />
      <CookieBanner />
    </>
  );
}
