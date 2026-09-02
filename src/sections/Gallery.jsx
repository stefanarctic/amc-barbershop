import { useEffect, useRef, useState } from "react";
import { GALLERY_PHOTOS } from "../data/content.js";

const TILT = [-7, 5, -4, 8, -8, 4, 7, -5];

export function Gallery() {
  const [deck, setDeck] = useState(() => GALLERY_PHOTOS.map((_, i) => i));
  const [lock, setLock] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [flying, setFlying] = useState(null);
  const startX = useRef(null);

  const cycle = (dir) => {
    if (lock || GALLERY_PHOTOS.length < 2) return;
    setLock(true);
    setFlying(dir > 0 ? "left" : "right");
    setTimeout(() => {
      setDeck((prev) => {
        const next = [...prev];
        if (dir > 0) next.push(next.shift());
        else next.unshift(next.pop());
        return next;
      });
      setFlying(null);
      setLock(false);
    }, 300);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (lightbox === null) return;
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowLeft") setLightbox((i) => (i + GALLERY_PHOTOS.length - 1) % GALLERY_PHOTOS.length);
      if (e.key === "ArrowRight") setLightbox((i) => (i + 1) % GALLERY_PHOTOS.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox]);

  if (!GALLERY_PHOTOS.length) return null;

  return (
    <section className="section" id="galerie">
      <div className="container">
        <p className="section-kicker reveal">Galerie</p>
        <h2 className="section-title reveal">Clienții noștri, <span className="gold">fresh</span></h2>
        <p className="section-sub reveal">Rezultate reale, direct din scaunul frizeriei. Tag-uiește-ne pe social media să aparții și tu aici!</p>
        <div className="gallery-grid">
          <div
            className="gallery-deck reveal"
            onTouchStart={(e) => { startX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (startX.current === null) return;
              const dx = e.changedTouches[0].clientX - startX.current;
              startX.current = null;
              if (Math.abs(dx) > 40) cycle(dx < 0 ? 1 : -1);
            }}
          >
            {deck.map((photoIdx, pos) => (
              <figure
                key={`${photoIdx}-${pos}`}
                className={`gallery-card${pos === 0 && flying === "left" ? " fly-left" : ""}${pos === 0 && flying === "right" ? " fly-right" : ""}`}
                data-pos={pos}
                style={{
                  "--tilt": `${TILT[pos % TILT.length]}deg`,
                  "--off-x": `${pos * 7}px`,
                  "--off-y": `${pos * -6}px`,
                  zIndex: pos === 0 ? 10 : 9 - pos,
                }}
                onClick={() => pos === 0 && setLightbox(photoIdx)}
              >
                <img src={GALLERY_PHOTOS[photoIdx]} alt={`Client La Macrea ${photoIdx + 1}`} loading="lazy" />
              </figure>
            ))}
          </div>
          <div className="gallery-arrows">
            <button type="button" aria-label="Poza anterioară" onClick={() => cycle(-1)}>‹</button>
            <span>{deck[0] + 1} / {GALLERY_PHOTOS.length}</span>
            <button type="button" aria-label="Poza următoare" onClick={() => cycle(1)}>›</button>
          </div>
        </div>
      </div>

      {lightbox !== null && (
        <div
          className="lightbox open"
          onClick={(e) => {
            if (e.target.classList.contains("lightbox") || e.target.classList.contains("lightbox-close")) {
              setLightbox(null);
            }
          }}
          onTouchStart={(e) => { startX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (startX.current === null) return;
            const dx = e.changedTouches[0].clientX - startX.current;
            startX.current = null;
            if (Math.abs(dx) > 40) {
              setLightbox((i) => (i + (dx < 0 ? 1 : -1) + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length);
            }
          }}
        >
          <button className="lightbox-close" aria-label="Închide" type="button">✕</button>
          <button className="lightbox-arrow lightbox-prev" type="button" aria-label="Poza anterioară" onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i + GALLERY_PHOTOS.length - 1) % GALLERY_PHOTOS.length); }}>‹</button>
          <img src={GALLERY_PHOTOS[lightbox]} alt="Poză mărită" />
          <button className="lightbox-arrow lightbox-next" type="button" aria-label="Poza următoare" onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i + 1) % GALLERY_PHOTOS.length); }}>›</button>
          <div className="lightbox-counter">{lightbox + 1} / {GALLERY_PHOTOS.length}</div>
        </div>
      )}
    </section>
  );
}
