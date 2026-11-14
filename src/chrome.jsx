import { useEffect, useRef, useState } from "react";
import { mail, sectors, siteName } from "./data";

export function useRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return hash.replace(/^#\/?/, "").split("/").filter(Boolean);
}

export function ArrowLink({ href, children, onClick }) {
  return (
    <a className="arrow-link" href={href} onClick={onClick}>
      {children}
      <span aria-hidden="true">→</span>
    </a>
  );
}

function goToProjects(event) {
  event.preventDefault();
  const hash = window.location.hash;
  const onHome = hash === "" || hash === "#" || hash === "#/";
  if (onHome) {
    scrollToId("our-projects");
    return;
  }
  sessionStorage.setItem("ie-scroll", "our-projects");
  window.location.hash = "#/";
}

function goToUniverse(event) {
  event.preventDefault();
  const hash = window.location.hash;
  const onHome = hash === "" || hash === "#" || hash === "#/";
  if (onHome) {
    scrollToId("universe");
    return;
  }
  sessionStorage.setItem("ie-scroll", "universe");
  window.location.hash = "#/";
}

export function scrollToId(id) {
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  document.getElementById(id)?.scrollIntoView({ behavior });
}

export function Cursor() {
  const dot = useRef(null);

  useEffect(() => {
    const el = dot.current;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce || !el) return undefined;
    document.documentElement.classList.add("has-cursor");
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    let raf = 0;
    const move = (event) => {
      x = event.clientX;
      y = event.clientY;
      el.classList.toggle("on-link", Boolean(event.target.closest?.("a, button")));
    };
    const loop = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="cursor" ref={dot} aria-hidden="true">
      <span />
    </div>
  );
}

export function Header() {
  const [solid, setSolid] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const hash = window.location.hash;
      const home = hash === "" || hash === "#" || hash === "#/";
      setSolid(home ? window.scrollY > window.innerHeight * 0.82 : window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menu);
    if (!menu) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  useEffect(() => {
    const close = () => setMenu(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, []);

  return (
    <header className={`site-header ${solid || menu ? "is-solid" : ""}`}>
      <a className="brand" href="#/" aria-label={`${siteName} home`}>
        Infinity
        <br />
        Enterprise
        <span className="brand-place">India</span>
      </a>
      <nav className="desktop-nav" aria-label="Primary">
        <div className="nav-business">
          <a href="#/" onClick={goToUniverse}>
            Businesses
          </a>
          <div className="mega">
            <p className="kicker">The portfolio</p>
            <div className="mega-grid">
              {sectors.map((sector) => (
                <a href={`#/business/${sector.slug}`} key={sector.slug}>
                  <small>{sector.number}</small>
                  <span>
                    <strong>{sector.name}</strong>
                    <em>{sector.short}</em>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
        <a href="#/" onClick={goToProjects}>Work</a>
        <a href="#/about">About</a>
        <a href="#/contact">Contact</a>
      </nav>
      <button className="menu-button" type="button" aria-expanded={menu} onClick={() => setMenu((open) => !open)}>
        {menu ? "Close" : "Menu"}
      </button>
      {menu ? (
        <div className="menu-overlay">
          <nav aria-label="Full index">
            <p className="kicker">Businesses</p>
            <div className="menu-sectors">
              {sectors.map((sector) => (
                <a href={`#/business/${sector.slug}`} key={sector.slug}>
                  <small>{sector.number}</small>
                  {sector.name}
                </a>
              ))}
            </div>
            <div className="menu-links">
              <a href="#/" onClick={goToProjects}>Work</a>
              <a href="#/about">About</a>
              <a href="#/contact">Contact</a>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <p className="brand">
            Infinity
            <br />
            Enterprise
            <span className="brand-place">India</span>
          </p>
          <p className="footer-line">
            One enterprise.
            <br />
            Infinite possibilities.
          </p>
        </div>
        <div className="footer-cols">
          <div>
            <p className="kicker">Businesses</p>
            {sectors.map((sector) => (
              <a href={`#/business/${sector.slug}`} key={sector.slug}>
                {sector.name}
              </a>
            ))}
          </div>
          <div>
            <p className="kicker">Index</p>
            <a href="#/" onClick={goToProjects}>Work</a>
            <a href="#/about">About</a>
            <a href="#/contact">Contact</a>
            <a href="#/insights">Insights</a>
          </div>
          <div>
            <p className="kicker">Connect</p>
            <a href={mail}>connect@infinityenterprise.in</a>
            <p>India</p>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 {siteName}</span>
        <span>Built for what comes next.</span>
      </div>
    </footer>
  );
}

export function FinalCta() {
  return (
    <section className="cta">
      <p className="kicker">Partner with {siteName}</p>
      <h2 className="display">
        Let&apos;s build
        <br />
        what&apos;s next.
      </h2>
      <ArrowLink href={mail}>Start a conversation</ArrowLink>
    </section>
  );
}
