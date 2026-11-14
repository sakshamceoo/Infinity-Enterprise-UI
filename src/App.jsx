import { useEffect } from "react";
import { Cursor, Footer, Header, scrollToId, useRoute } from "./chrome";
import Home from "./home";
import { AboutPage, ContactPage, InsightsPage, SectorPage } from "./pages";
import { sectorBySlug, siteDescription, siteName } from "./data";

export default function App() {
  const route = useRoute();
  const page = route[0] === "work" ? "projects" : route[0];

  useEffect(() => {
    const names = {
      projects: "Our Projects",
      about: "About",
      contact: "Contact",
      insights: "Insights",
    };
    let title = `${siteName} — One enterprise. Infinite possibilities.`;
    if (page === "business") {
      const sector = sectorBySlug(route[1]);
      if (sector) title = `${sector.name} — ${siteName}`;
    } else if (names[page]) {
      title = `${names[page]} — ${siteName}`;
    }
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", siteDescription);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", siteDescription);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", siteDescription);
  }, [page, route.join("/")]);

  useEffect(() => {
    if (page === "projects") {
      requestAnimationFrame(() => scrollToId("our-projects"));
      return;
    }
    const target = !page ? sessionStorage.getItem("ie-scroll") : null;
    if (target) {
      sessionStorage.removeItem("ie-scroll");
      requestAnimationFrame(() => scrollToId(target));
      return;
    }
    window.scrollTo(0, 0);
  }, [route.join("/")]);

  let content = <Home />;
  if (page === "business") content = <SectorPage slug={route[1]} />;
  if (page === "about") content = <AboutPage />;
  if (page === "contact") content = <ContactPage />;
  if (page === "insights") content = <InsightsPage />;

  return (
    <>
      <Cursor />
      <Header />
      <main>{content}</main>
      <Footer />
    </>
  );
}
