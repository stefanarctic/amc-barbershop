import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CookieBanner } from "../components/CookieBanner.jsx";
import { Footer } from "../components/Footer.jsx";
import { Navbar } from "../components/Navbar.jsx";
import { useReveal } from "../hooks/useReveal.js";
import { Booking } from "../sections/Booking.jsx";
import { CompanyInfo } from "../sections/CompanyInfo.jsx";
import { Gallery } from "../sections/Gallery.jsx";
import { Hero } from "../sections/Hero.jsx";
import { Location } from "../sections/Location.jsx";
import { Reviews } from "../sections/Reviews.jsx";
import { Services } from "../sections/Services.jsx";
import { Team } from "../sections/Team.jsx";

export function Home() {
  const [service, setService] = useState("");
  const [specialist, setSpecialist] = useState("");
  const location = useLocation();
  useReveal([service, specialist]);

  useEffect(() => {
    if (!location.hash) return;
    const el = document.querySelector(location.hash);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, [location.hash]);

  return (
    <>
      <Navbar variant="home" />
      <Hero />
      <Services onBookService={setService} />
      <Team onBookSpecialist={setSpecialist} />
      <Reviews />
      <Booking
        service={service}
        specialist={specialist}
        onServiceChange={setService}
        onSpecialistChange={setSpecialist}
      />
      <Gallery />
      <Location />
      <CompanyInfo />
      <Footer />
      <CookieBanner />
    </>
  );
}
