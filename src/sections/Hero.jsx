import { useOpenStatus } from "../hooks/useOpenStatus.js";

export function Hero() {
  const status = useOpenStatus();

  return (
    <section className="hero" id="hero">
      <div className="hero-bg"></div>
      <div className="container hero-inner">
        <div className="hero-content">
          <div className="hero-rating reveal">
            <span className="stars">★★★★★</span>
            <strong>4.99</strong>
            <span className="muted">
              (1379 evaluări pe{" "}
              <a href="https://mero.ro/p/am-barber" target="_blank" rel="noopener noreferrer" className="rating-source">Mero</a>)
            </span>
          </div>
          <h1 className="reveal">Frizeria <span className="gold">„La Macrea”</span></h1>
          <p className="hero-sub reveal">Nu știi unde să te tunzi. Vino la La Macrea!</p>
          <div className="hero-actions reveal">
            <a href="#programare" className="btn btn-gold btn-lg">Programează-te acum</a>
            <a href="#servicii" className="btn btn-outline btn-lg">Vezi servicii &amp; prețuri</a>
          </div>
          <div className="hero-meta reveal">
            <span>📍 Electricenilor nr. 20, Sibiu</span>
            <span>{(status.open ? "🟢 " : "🔴 ") + status.text}</span>
          </div>
        </div>
        <div className="hero-card reveal logo-only">
          <img src="/assets/logo.png" alt="Frizeria La Macrea" className="hero-logo-img" />
        </div>
      </div>
      <div className="scroll-hint">▾</div>
    </section>
  );
}
