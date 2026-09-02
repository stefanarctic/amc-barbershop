import { Link } from "react-router-dom";
import { CookieBanner } from "../components/CookieBanner.jsx";
import { Footer } from "../components/Footer.jsx";
import { Navbar } from "../components/Navbar.jsx";
import { useReveal } from "../hooks/useReveal.js";

export function Privacy() {
  useReveal();

  return (
    <>
      <Navbar variant="legal" />
      <section className="section section-alt" id="politica">
        <div className="container policy-content">
          <p className="section-kicker">Confidențialitate</p>
          <h1 className="section-title left">Politică de <span className="gold">confidențialitate</span></h1>
          <p className="muted">Ultima actualizare: 3 septembrie 2026</p>

          <h2>Cine suntem</h2>
          <p>
            Frizeria „La Macrea”, Electricenilor nr. 20, Sibiu — operatorul datelor personale
            preluate prin acest site. Ne poți contacta direct la salon sau prin rețelele
            sociale (TikTok / Instagram / Facebook: „lamacrea” / „La Macrea Sibiu”)
            pentru orice întrebare legată de datele tale.
          </p>

          <h2>Ce date colectăm și de ce</h2>
          <h3>1. Formularul de programare</h3>
          <p>
            Când completezi formularul de programare, datele tale (nume, telefon, serviciu,
            specialist, dată și oră) sunt salvate <strong>în Firebase (Google Cloud)</strong>,
            cu scopul unic de a-ți confirma și administra programarea.
          </p>
          <ul>
            <li>Programarea ta este vizibilă doar frizeriei (cont de administrator), nu altor vizitatori.</li>
            <li>Poți anula singur programarea oricând, cu butonul „Anulează” din secțiunea „Programările mele” — dispozitivul tău reține un cod unic de anulare primit la momentul salvării.</li>
            <li>În dispozitivul tău rămân salvate local: telefoanele cu care ai programat, detaliile programărilor tale și codurile de anulare. Le poți șterge oricând din setările browserului.</li>
          </ul>

          <h3>2. Recenziile</h3>
          <p>
            Dacă lași o recenzie, se salvează <strong>doar în browserul tău</strong> și este
            afișată doar pe dispozitivul tău, împreună cu numele pe care l-ai scris. Nu
            ajunge pe niciun server și nu este vizibilă altor vizitatori. O poți șterge
            oricând cu butonul de coș de pe recenzia ta.
          </p>

          <h3>3. Harta / navigare</h3>
          <p>
            <strong>Nu încărcăm nicio hartă în pagină</strong> (fără Google Maps embed).
            Butonul „Vezi direcții de navigare” te duce, la apăsarea ta, spre aplicația ta
            implicită de hărți (pe telefon) sau către Google Maps (pe calculator) — moment
            în care se aplică politicile acelui furnizor. Până atunci, nu se transmite nimic.
          </p>

          <h4>Nu folosim:</h4>
          <ul>
            <li>cookie-uri de urmărire (tracking), analytics sau publicitate;</li>
            <li>reclame sau pixeli de social media;</li>
            <li>fonturi sau alte resurse încărcate de la terți la deschiderea paginii — toate resursele (fonturi, imagini) sunt găzduite de noi.</li>
          </ul>
          <p>
            Site-ul afișează un <strong>informator de cookie-uri</strong> la prima vizită,
            care explică exact ce se salvează local pe dispozitivul tău (programările tale,
            codurile de anulare, telefoanele folosite, alegerea ta privind bannerul).
            Alegerea ta este reținută pe dispozitiv și poți oricând șterge aceste date din
            setările browserului. Nu transmitem nimic către terți fără o acțiune explicită
            a ta (ex. deschiderea hărții prin butonul de navigare), în afara stocării
            programării în Firebase.
          </p>

          <h2>Fundamentarea prelucrării</h2>
          <p>
            Prelucrarea datelor din programare se bazează pe <strong>măsuri precontractuale</strong>
            (art. 6 (1) (b) GDPR — ne dăm silința să-ți confirmăm și să-ți oferim serviciul
            programat). Nicio hartă nu se încarcă în pagină; deschiderea hărții are loc doar
            la <strong>acțiunea ta explicită</strong>, prin apăsarea butonului de navigare.
          </p>

          <h2>Cât timp păstrăm datele</h2>
          <ul>
            <li><strong>Programări:</strong> în Firebase până la anularea lor de către tine sau până la evidența periodică a agendei de către frizerie.</li>
            <li><strong>Telefoane și coduri de anulare:</strong> doar în dispozitivul tău, până le ștergi tu din browser.</li>
            <li><strong>Recenzii:</strong> în browserul tău până le ștergi.</li>
          </ul>

          <h2>Ce drepturi ai</h2>
          <p>Conform GDPR, ai dreptul de:</p>
          <ul>
            <li><strong>acces</strong> — să ne ceri confirmarea datelor tale pe care le prelucrăm;</li>
            <li><strong>rectificare</strong> — să corectezi date inexacte;</li>
            <li><strong>ștergere</strong> — să ceri ștergerea datelor tale;</li>
            <li><strong>restricționare</strong> — să ceri limitarea prelucrării;</li>
            <li><strong>portabilitate</strong> — să primești datele tale într-un format citibil automat;</li>
            <li><strong>opziție</strong> — să te opui prelucrării;</li>
            <li><strong>retragerea consimțământului</strong> — oricând, fără a afecta legalitatea prelucrării anterioare.</li>
          </ul>
          <p>
            Ne poți exercita drepturile prezentându-te la salon sau scriindu-ne pe rețelele
            sociale. De asemenea, ai dreptul să depui o plângere la
            <strong> ANSPDCP</strong> (Autoritatea Națională de Supraveghere a Prelucrării
            Datelor cu Caracter Personal, B-dul G-ral. Gheorghe Magheru 28-30, București,{" "}
            <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">dataprotection.ro</a>).
          </p>

          <h2>Securitate</h2>
          <p>
            Programările sunt transmise criptat (HTTPS) către Firebase, unde sunt
            accesibile doar managementului (autentificare cu e-mail și parolă).
            Fiecare programare are un cod unic de anulare, cunoscut doar de dispozitivul
            care a făcut programarea. Site-ul nu folosește tracking. Îți recomandăm să
            folosești un dispozitiv și un browser la zi.
          </p>
          <p>
            Google Ireland Limited prelucrează datele ca persoană împuternicită (Firebase /
            Firestore), conform{" "}
            <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">politicii Firebase</a>.
          </p>

          <h2>Modificări ale politicii</h2>
          <p>
            Putem actualiza această politică odată cu schimbări ale site-ului. Versiunea
            curentă este mereu disponibilă aici, cu data ultimei actualizări în vârful paginii.
          </p>
          <p><Link to="/">← Înapoi la pagina principală</Link></p>
        </div>
      </section>
      <Footer />
      <CookieBanner />
    </>
  );
}
