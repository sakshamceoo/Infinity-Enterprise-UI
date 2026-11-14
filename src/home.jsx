import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { sectors } from "./data";
import { ProjectsShowcase } from "./projects";
import DotField from "./DotField";
import { ArrowLink, scrollToId } from "./chrome";

const visuals = {
  construction: "/assets/construction.webp",
  electrical: "/assets/electrical.webp",
  "it-security": "/assets/it-security.webp",
  technology: "/assets/tech.webp",
  manufacturing: "/assets/manufacturing.webp",
  "waste-management": "/assets/waste-management.webp",
  sanitation: "/assets/sanitation.webp",
  export: "/assets/exports.webp",
  "food-processing": "/assets/food.webp",
  "agri-business": "/assets/agri.webp",
};

function Morph() {
  return (
    <section className="morph">
      <video className="hero-video" autoPlay muted loop playsInline preload="auto" src="/assets/hero.mp4" />
      <div className="hero-shade" />
      <DotField />
      <div className="morph-copy">
        <h1 className="display">
          Infinity Enterprise
          <span className="name-place">India</span>
        </h1>
        <p>One enterprise. Infinite possibilities.</p>
      </div>
      <button className="hero-explore" type="button" onClick={() => scrollToId("manifesto")}>
        Explore
      </button>
    </section>
  );
}

function Manifesto() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  return (
    <section className="manifesto" id="manifesto">
      <h2 className="display">Building businesses.</h2>
      <p
        className="display warp"
        onMouseMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          setOffset({
            x: (event.clientX - box.left) / box.width - 0.5,
            y: (event.clientY - box.top) / box.height - 0.5,
          });
        }}
        onMouseLeave={() => setOffset({ x: 0, y: 0 })}
        style={{ transform: `translate3d(${offset.x * 16}px, ${offset.y * 8}px, 0) skewX(${offset.x * -7}deg)` }}
      >
        CREATING WHAT LASTS.
      </p>
      <p className="lede">
        Infinity Enterprise India operates across construction, electrical, IT and security, technology, manufacturing, waste management, sanitation, export, food processing and agri business.
      </p>
      <button className="arrow-link arrow-button" type="button" onClick={() => scrollToId("universe")}>
        Explore our businesses
        <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}

function BusinessUniverse() {
  const sectionRef = useRef(null);
  const visualRef = useRef(null);
  const barRef = useRef(null);
  const indexRef = useRef(0);
  const lockRef = useRef(false);
  const swipeRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [leave, setLeave] = useState(null);
  const [direction, setDirection] = useState(1);
  const [mounted, setMounted] = useState(() => new Set([0, 1]));
  const [compact, setCompact] = useState(() => window.matchMedia("(max-width: 1200px)").matches);
  const active = sectors[index];

  const reveal = (sectorIndex) => {
    setMounted((current) => {
      const next = new Set(current);
      next.add(sectorIndex);
      next.add(Math.min(sectorIndex + 1, sectors.length - 1));
      if (sectorIndex > 0) next.add(sectorIndex - 1);
      return next;
    });
  };

  const select = (sectorIndex, fromScroll = false) => {
    const next = Math.min(sectors.length - 1, Math.max(0, sectorIndex));
    if (next === indexRef.current) return;
    setDirection(next > indexRef.current ? 1 : -1);
    setLeave(indexRef.current);
    indexRef.current = next;
    setIndex(next);
    reveal(next);
    barRef.current?.style.setProperty("--p", String(next / (sectors.length - 1)));
    if (window.matchMedia("(max-width: 900px)").matches) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById(`sector-${sectors[next].slug}`)?.scrollIntoView({
        inline: "center",
        block: "nearest",
        behavior: reduce ? "auto" : "smooth",
      });
    }
    if (fromScroll || compact) return;
    const section = sectionRef.current;
    if (!section) return;
    const travel = section.offsetHeight - window.innerHeight;
    const top = window.scrollY + section.getBoundingClientRect().top;
    lockRef.current = true;
    window.scrollTo({ top: top + (next / (sectors.length - 1)) * travel, behavior: "auto" });
    window.setTimeout(() => {
      lockRef.current = false;
    }, 60);
  };

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1200px)");
    const onChange = () => setCompact(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (compact) return undefined;
    const section = sectionRef.current;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (lockRef.current) return;
      const travel = section.offsetHeight - window.innerHeight;
      const progress = travel <= 0 ? 0 : Math.min(1, Math.max(0, -section.getBoundingClientRect().top / travel));
      barRef.current?.style.setProperty("--p", String(progress));
      const next = Math.min(sectors.length - 1, Math.max(0, Math.round(progress * (sectors.length - 1))));
      if (next !== indexRef.current) select(next, true);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [compact]);

  const onMove = (event) => {
    const box = visualRef.current?.getBoundingClientRect();
    if (!box || compact) return;
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    visualRef.current.style.setProperty("--px", `${x * 16}px`);
    visualRef.current.style.setProperty("--py", `${y * 10}px`);
    visualRef.current.style.setProperty("--rx", `${8 - y * 10}deg`);
    visualRef.current.style.setProperty("--ry", `${-12 + x * 14}deg`);
  };

  const onKey = (event) => {
    const move = (step) => {
      event.preventDefault();
      select(indexRef.current + step);
      const next = sectors[indexRef.current];
      document.getElementById(`sector-${next.slug}`)?.focus({ preventScroll: true });
    };
    if (event.key === "ArrowDown" || event.key === "ArrowRight") move(1);
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") move(-1);
  };

  return (
    <section className={compact ? "universe is-compact" : "universe"} id="universe" ref={sectionRef}>
      <div className="universe-stage">
        <div className="universe-copy">
          <div className="universe-nav">
            <p className="kicker">Our businesses</p>
            <div className="universe-list" role="listbox" aria-label="Businesses" aria-activedescendant={`sector-${active.slug}`} onKeyDown={onKey}>
              {sectors.map((sector, sectorIndex) => (
                <button
                  id={`sector-${sector.slug}`}
                  className={sectorIndex === index ? "is-on" : ""}
                  type="button"
                  role="option"
                  aria-selected={sectorIndex === index}
                  key={sector.slug}
                  onClick={() => select(sectorIndex)}
                >
                  <small>{sector.number}</small>
                  <span>{sector.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="universe-detail" aria-live="polite">
            <div key={active.slug}>
              <p className="universe-name">{active.name}</p>
              <p className="universe-line">{active.line}</p>
              <p className="universe-statement">{active.statement}</p>
              <ArrowLink href={`#/business/${active.slug}`}>Explore {active.name}</ArrowLink>
            </div>
          </div>
        </div>
        <div
          className="universe-visual"
          ref={visualRef}
          style={{ "--dir": direction }}
          onPointerMove={onMove}
          onPointerLeave={() => {
            visualRef.current?.style.setProperty("--px", "0px");
            visualRef.current?.style.setProperty("--py", "0px");
            visualRef.current?.style.setProperty("--rx", "8deg");
            visualRef.current?.style.setProperty("--ry", "-12deg");
          }}
          onPointerDown={(event) => {
            if (!compact) return;
            swipeRef.current = event.clientX;
          }}
          onPointerUp={(event) => {
            if (!compact || swipeRef.current == null) return;
            const delta = event.clientX - swipeRef.current;
            swipeRef.current = null;
            if (delta < -48) select(indexRef.current + 1);
            if (delta > 48) select(indexRef.current - 1);
          }}
        >
          {sectors.map((sector, sectorIndex) => {
            if (!mounted.has(sectorIndex)) return null;
            const state = sectorIndex === index ? "is-on" : sectorIndex === leave ? "is-leave" : "is-wait";
            return (
              <div className={`universe-frame ${state}`} key={sector.slug}>
                <img src={visuals[sector.slug]} alt="" draggable="false" decoding="async" />
              </div>
            );
          })}
          <div className="universe-progress" ref={barRef} aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}

const record = [
  {
    key: "pipeline",
    value: "280",
    unit: "m",
    spoken: "280 metres",
    name: "HDPE pipeline installed",
    note: "Pipeline installation near NH9, Shiva Dhaba.",
    delay: 0,
  },
  {
    key: "vehicles",
    value: "05",
    name: "Waste collection vehicles",
    note: "Vehicles deployed in Doom Kheda, Uttar Pradesh.",
    delay: 160,
  },
  {
    key: "documented",
    value: "05",
    name: "Projects documented",
    note: "Five projects showcased across infrastructure, industrial construction, sanitation and waste management.",
    delay: 240,
  },
  {
    key: "areas",
    value: "03",
    name: "Areas of execution",
    note: "Infrastructure, industrial construction, and waste management.",
    delay: 320,
  },
];

function GlanceStat({ item, className = "" }) {
  return (
    <article className={`glance-stat${className ? ` ${className}` : ""}`} style={{ "--d": `${item.delay}ms` }}>
      <p className="glance-figure" aria-label={item.spoken}>
        <span aria-hidden={item.spoken ? true : undefined}>{item.value}</span>
        {item.unit ? <small aria-hidden="true">{item.unit}</small> : null}
      </p>
      <h3 className="glance-label">{item.name}</h3>
      <p className="glance-note">{item.note}</p>
    </article>
  );
}

function Glance() {
  const ref = useRef(null);
  const [motion, setMotion] = useState(false);
  const [shown, setShown] = useState(true);
  const [pipeline, vehicles, documented, areas] = record;

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;
    if (reduce || !el || !("IntersectionObserver" in window)) return undefined;
    setMotion(true);
    setShown(false);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { threshold: 0.01, rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`glance${motion ? " can-motion" : ""}${shown ? " is-in" : ""}`}
      id="track-record"
      ref={ref}
      aria-labelledby="glance-title"
    >
      <div className="glance-board">
        <header className="glance-head">
          <p className="kicker">Our track record</p>
          <h2 className="display" id="glance-title">
            Infinity at a glance.
          </h2>
          <p className="lede">Measured through real work, practical execution, and tangible project outcomes.</p>
        </header>
        <GlanceStat item={pipeline} className="glance-lead" />
        <div className="glance-pair">
          <GlanceStat item={vehicles} />
          <GlanceStat item={documented} />
        </div>
        <GlanceStat item={areas} className="glance-close" />
      </div>
    </section>
  );
}

function AboutTeaser() {
  return (
    <section className="about-teaser">
      <div>
        <p className="kicker">The enterprise</p>
        <h2 className="display">Built over time.</h2>
      </div>
      <div>
        <p>
          Infinity Enterprise India is being shaped across construction, electrical, IT and security, technology, manufacturing, waste management, sanitation, export, food processing and agri business. The range is wide. The standard is specific: publish the work when it is real.
        </p>
        <ArrowLink href="#/about">About the enterprise</ArrowLink>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Morph />
      <Manifesto />
      <BusinessUniverse />
      <ProjectsShowcase />
      <Glance />
      <AboutTeaser />
    </>
  );
}
