import { useLayoutEffect, useRef, useState } from "react";
import { projects } from "./data";

export function ProjectVisual({ project, priority = false }) {
  if (project.heroImage) {
    return (
      <img
        src={project.heroImage}
        alt={project.imageAlt || ""}
        width="1600"
        height="1000"
        loading="eager"
        decoding="async"
      />
    );
  }

  return (
    <div className="project-placeholder" aria-hidden="true">
      <p>Photograph required</p>
      <p>{project.imageBrief}</p>
    </div>
  );
}

function ProjectItem({ project, index }) {
  const ref = useRef(null);
  const [motion, setMotion] = useState(false);
  const [shown, setShown] = useState(true);
  const [open, setOpen] = useState(false);
  const frame = project.frame || "wide";

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
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={ref}
      className={`project-item is-${frame}${motion ? " can-motion" : ""}${shown ? " is-in" : ""}`}
      style={{ "--order": project.visualOrder || index + 1 }}
    >
      <div className="project-visual">
        <ProjectVisual project={project} />
        {project.mark ? <p className="project-mark">{project.mark}</p> : null}
      </div>
      <div className="project-copy">
        <span className="project-accent" aria-hidden="true" />
        <p className="project-kicker">
          <span>{project.number}</span>
          {project.category}
        </p>
        <h3>{project.title}</h3>
        {project.location ? <p className="project-location">{project.location}</p> : null}
        <p className="project-summary">{project.shortDescription}</p>
        <button type="button" className="arrow-link" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? "Close" : "View project"}
          <span aria-hidden="true">{open ? "↑" : "→"}</span>
        </button>
        {open ? (
          <div className="project-more">
            {project.highlights?.length ? (
              <dl>
                {project.highlights.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {project.scopeOfWork?.length ? (
              <ul>
                {project.scopeOfWork.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function ProjectsShowcase({ heading = "h2", page = false }) {
  const Title = heading;
  const count = String(projects.length).padStart(2, "0");

  return (
    <section className={page ? "projects-showcase is-page" : "projects-showcase"} id={page ? undefined : "our-projects"}>
      <header className="projects-intro">
        <div>
          <p className="kicker">Our projects</p>
          <Title className="display">
            Built on the ground.
            <span>Delivered with purpose.</span>
          </Title>
        </div>
        <div className="projects-intro-aside">
          <p className="lede">
            From essential infrastructure to industrial development and waste management, our projects reflect our commitment to practical execution and tangible outcomes.
          </p>
          <p className="projects-count">Selected projects / {count}</p>
        </div>
      </header>
      <div className="project-grid">
        {projects.filter((project) => project.frame === "feature").map((project) => (
          <ProjectItem project={project} key={project.id} />
        ))}
        <div className="project-split">
          {projects.filter((project) => project.frame === "portrait").map((project) => (
            <ProjectItem project={project} key={project.id} />
          ))}
          <div className="project-stack">
            {projects.filter((project) => project.frame === "fill").map((project) => (
              <ProjectItem project={project} key={project.id} />
            ))}
            {projects.filter((project) => project.frame === "landscape").map((project) => (
              <ProjectItem project={project} key={project.id} />
            ))}
          </div>
        </div>
        {projects.filter((project) => project.frame === "wide").map((project) => (
          <ProjectItem project={project} key={project.id} />
        ))}
      </div>
    </section>
  );
}
