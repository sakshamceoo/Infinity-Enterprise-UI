import { mail, projectBySlug, projects, relatedProjectsFor, sectorBySlug } from "./data";
import LiquidField from "./LiquidField";
import { ArrowLink, FinalCta } from "./chrome";
import { ProjectsShowcase, ProjectVisual } from "./projects";

function Missing({ label }) {
  return (
    <section className="page-hero">
      <p className="kicker">Infinity Enterprise India</p>
      <h1 className="display">{label}</h1>
      <ArrowLink href="#/">Return home</ArrowLink>
    </section>
  );
}

export function SectorPage({ slug }) {
  const sector = sectorBySlug(slug);
  const related = projects.filter((project) => project.sector === slug);
  if (!sector) return <Missing label="Business not found" />;

  return (
    <>
      <section className="sector-hero">
        <div>
          <p className="kicker">Infinity Enterprise India · {sector.number}</p>
          <h1 className="display">{sector.name}</h1>
          <p className="sector-line">{sector.line}</p>
          <p className="lede">{sector.statement}</p>
        </div>
        <div className="sector-visual">
          {sector.slug === "technology" ? <LiquidField /> : <img src={sector.image} alt="" />}
        </div>
      </section>
      <section className="info-block">
        <div>
          <p className="kicker">What we do</p>
          <h2 className="display">The work of this business.</h2>
        </div>
        <ul className="service-list">
          {sector.services.map((service) => (
            <li key={service}>{service}</li>
          ))}
        </ul>
      </section>
      <section className="info-block">
        <div>
          <p className="kicker">Our work</p>
          <h2 className="display">Profiles from {sector.name}.</h2>
        </div>
        {related.length ? (
          <div className="profile-list">
            {related.map((project) => (
              <article className="profile" key={project.slug}>
                <ProjectVisual project={project} />
                <span>
                  <small>
                    {project.number} — {project.category}
                  </small>
                  <strong>{project.title}</strong>
                  <em>{project.location}</em>
                </span>
              </article>
            ))}
          </div>
        ) : (
          <p className="lede">Project profiles for this business will appear when they are ready to share.</p>
        )}
      </section>
      <FinalCta />
    </>
  );
}

export function ProjectsPage() {
  return (
    <>
      <ProjectsShowcase heading="h1" page />
      <FinalCta />
    </>
  );
}

export function ProjectPage({ slug }) {
  const project = projectBySlug(slug);
  if (!project) return <Missing label="Project not found" />;
  const related = relatedProjectsFor(project);

  return (
    <>
      <section className="case-hero">
        <ProjectVisual project={project} priority />
        {project.heroImage ? <div className="hero-shade" /> : null}
        <div className="case-hero-copy">
          <p className="kicker">
            Project {project.number} · {project.category}
          </p>
          <h1 className="display">{project.title}</h1>
          {project.location ? <p className="sector-line">{project.location}</p> : null}
        </div>
      </section>
      <section className="case-body">
        <dl className="case-meta">
          {project.location ? (
            <div>
              <dt>Location</dt>
              <dd>{project.location}</dd>
            </div>
          ) : null}
          <div>
            <dt>Category</dt>
            <dd>{project.category}</dd>
          </div>
          {project.highlights?.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
          {project.completionYear ? (
            <div>
              <dt>Year</dt>
              <dd>{project.completionYear}</dd>
            </div>
          ) : null}
          {project.companyRole ? (
            <div>
              <dt>Role</dt>
              <dd>{project.companyRole}</dd>
            </div>
          ) : null}
        </dl>
        <div className="case-story">
          <p className="kicker">Overview</p>
          <p className="lede">{project.overview}</p>
          {project.scopeOfWork?.length ? (
            <>
              <p className="kicker">Scope of work</p>
              <ul className="scope-list">
                {project.scopeOfWork.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          ) : null}
          {project.outcomes?.length ? (
            <>
              <p className="kicker">Outcome</p>
              {project.outcomes.map((item) => (
                <p className="lede" key={item}>
                  {item}
                </p>
              ))}
            </>
          ) : null}
        </div>
      </section>
      {project.gallery?.length ? (
        <section className="project-gallery" aria-label="Project photographs">
          {project.gallery.map((shot) => (
            <figure key={shot.src || shot.brief}>
              {shot.src ? (
                <img src={shot.src} alt={shot.alt || ""} loading="lazy" decoding="async" />
              ) : (
                <div className="project-placeholder" aria-hidden="true">
                  <p>Photograph required</p>
                  <p>{shot.brief}</p>
                </div>
              )}
            </figure>
          ))}
        </section>
      ) : null}
      {related.length ? (
        <section className="info-block">
          <div>
            <p className="kicker">Related projects</p>
            <h2 className="display">Other work.</h2>
          </div>
          <div className="profile-list">
            {related.map((item) => (
              <a className="profile" href={`#/projects/${item.slug}`} key={item.slug}>
                <ProjectVisual project={item} />
                <span>
                  <small>
                    {item.number} — {item.category}
                  </small>
                  <strong>{item.title}</strong>
                  <em>{item.location}</em>
                </span>
              </a>
            ))}
          </div>
          <ArrowLink href="#/projects">All projects</ArrowLink>
        </section>
      ) : null}
      <section className="cta project-cta">
        <p className="kicker">Next</p>
        <h2 className="display">Have a project in mind?</h2>
        <p className="lede">Let&apos;s discuss your project requirements.</p>
        <ArrowLink href="#/contact">Contact our team</ArrowLink>
      </section>
    </>
  );
}

export function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <p className="kicker">About Infinity Enterprise India</p>
        <h1 className="display">
          Built for
          <br />
          more.
        </h1>
        <p className="lede">
          A diversified Indian enterprise with the range to see across industries and the discipline to publish only what is real.
        </p>
      </section>
      <section className="steps">
        <article>
          <p className="kicker">01</p>
          <h2>Range</h2>
          <p>Ten operating directions, held as one enterprise.</p>
        </article>
        <article>
          <p className="kicker">02</p>
          <h2>Standard</h2>
          <p>Work, numbers and credentials appear when they are verified.</p>
        </article>
        <article>
          <p className="kicker">03</p>
          <h2>Direction</h2>
          <p>Construction, electrical, IT and security, technology, manufacturing, waste, sanitation, export, food and agri business — built to execute.</p>
        </article>
      </section>
      <section className="info-block">
        <div>
          <p className="kicker">Our story</p>
          <h2 className="display">One enterprise. Many possibilities.</h2>
        </div>
        <div className="story">
          <p>
            Infinity Enterprise India is being shaped as a group of businesses operating across construction, electrical, IT and security, technology, manufacturing, waste management, sanitation, export, food processing and agri business.
          </p>
          <p>We are early in the journey, and intentional about showing only what is real. The ambition is broad. The standard is specific.</p>
          <a className="arrow-link" href={mail}>
            Start a conversation
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
      <FinalCta />
    </>
  );
}

export function ContactPage() {
  return (
    <section className="cta cta-page">
      <p className="kicker">Connect</p>
      <h1 className="display">
        Let&apos;s build
        <br />
        what&apos;s next.
      </h1>
      <p className="lede">Partner with Infinity Enterprise India.</p>
      <ArrowLink href={mail}>Start a conversation</ArrowLink>
      <p className="contact-meta">connect@infinityenterprise.in · India</p>
    </section>
  );
}

export function InsightsPage() {
  return (
    <>
      <section className="page-hero">
        <p className="kicker">Perspectives</p>
        <h1 className="display">
          Signals for
          <br />
          what&apos;s next.
        </h1>
        <p className="lede">Notes on technology, operations, industry and the work of building a modern enterprise.</p>
      </section>
      <section className="info-block">
        <p className="lede">Essays will be published here when they are ready.</p>
      </section>
      <FinalCta />
    </>
  );
}
