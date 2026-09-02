import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SocialIcons } from "./SocialIcons.jsx";

export function Navbar({ variant = "home" }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const home = (hash) => (variant === "home" ? hash : `/${hash}`);

  return (
    <header className={`navbar${scrolled ? " scrolled" : ""}`}>
      <div className="container nav-inner">
        <Link to="/" className="logo">
          <img src="/assets/logo.png" alt="Frizeria La Macrea" className="nav-logo-img" />
        </Link>
        <nav className={`nav-links${open ? " open" : ""}`}>
          {variant === "home" && <SocialIcons />}
          <a href={home("#servicii")}>Servicii</a>
          <a href={home("#specialisti")}>Specialiști</a>
          <a href={home("#recenzii")}>Recenzii</a>
          {variant === "home" && <a href="#program">Program</a>}
          {variant === "home" && <a href="#locatie">Locație</a>}
          <Link to="/politica-confidentialitate">Confidențialitate</Link>
          <a href={home("#programare")} className="btn btn-gold nav-cta">Programează-te</a>
        </nav>
        <button
          className={`hamburger${open ? " open" : ""}`}
          aria-label="Meniu"
          type="button"
          onClick={() => setOpen((v) => !v)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}
