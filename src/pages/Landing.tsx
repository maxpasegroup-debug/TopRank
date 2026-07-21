import { useEffect, useState } from "react";

const platformItems = [
  { label: "today's mission", value: "physics - motion" },
  { label: "today's practice", value: "30 questions" },
  { label: "current streak", value: "12 days" },
  { label: "progress", value: "64%" },
];

const showcaseItems = [
  { title: "Mission Control", label: "today", value: "motion basics", detail: "64%" },
  { title: "Learn", label: "lesson", value: "distance", detail: "12 min" },
  { title: "Practice", label: "set", value: "30 questions", detail: "medium" },
  { title: "Progress", label: "streak", value: "12 days", detail: "steady" },
  { title: "Tara", label: "mentor", value: "start small", detail: "next step" },
];

const audienceCards = [
  {
    eyebrow: "For students",
    title: "One focused goal for today.",
    rows: ["Today's Goal", "Physics", "Continue"],
  },
  {
    eyebrow: "For parents",
    title: "See effort without pressure.",
    rows: ["Progress", "Attendance", "Weekly Summary"],
  },
  {
    eyebrow: "For schools",
    title: "Understand engagement quickly.",
    rows: ["Engagement", "Participation", "Weekly Activity"],
  },
];

export function Landing() {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const hasSeenIntro = window.sessionStorage.getItem("toprank_intro_seen");

    if (!hasSeenIntro) {
      setShowIntro(true);
      window.sessionStorage.setItem("toprank_intro_seen", "true");
      const timer = window.setTimeout(() => setShowIntro(false), 2100);

      return () => window.clearTimeout(timer);
    }
  }, []);

  return (
    <main className="tr-landing">
      {showIntro ? (
        <div className="tr-intro" aria-label="TopRank intro">
          <h1>TopRank</h1>
          <p>Personalized Entrance Preparation</p>
          <span />
        </div>
      ) : null}

      <nav className="tr-nav" aria-label="Public navigation">
        <a className="tr-logo" href="/">
          <span>TopRank</span>
          <small>Personalized Entrance Prep</small>
        </a>
        <div className="tr-nav-links">
          <a href="/">Home</a>
          <a href="#platform">Platform</a>
          <a href="#parents">Parents</a>
          <a href="#schools">Schools</a>
          <a href="#about">About</a>
        </div>
        <div className="tr-nav-actions">
          <a className="tr-login" href="/login">Login</a>
          <a className="tr-demo tr-arrow" href="/demo/start">Start Demo</a>
        </div>
      </nav>

      <section className="tr-hero">
        <div className="tr-hero-copy">
          <p className="tr-eyebrow">Personalized daily preparation for entrance success</p>
          <h1>Every Dream Begins With Today's Mission.</h1>
          <p className="tr-hero-subtitle">
            TopRank gives students a clear daily mission, guided practice, steady progress,
            and Tara's calm mentor support for NEET, JEE, KEAM, CUET and school exams.
          </p>
          <div className="tr-hero-actions">
            <a className="tr-primary tr-arrow" href="/demo/start">Experience Mission Control</a>
            <a className="tr-secondary" href="/presentation-summary">Watch Student Journey</a>
          </div>
        </div>

        <div className="tr-product-preview" id="platform" aria-label="TopRank Mission Control preview">
          <div className="tr-preview-top">
            <div>
              <p>Mission Control</p>
              <h2>Rahul's day plan</h2>
            </div>
            <span>NEET 2028</span>
          </div>

          <div className="tr-preview-main">
            <section className="tr-mission-card">
              <p>Today's Mission</p>
              <h3>Master Motion basics</h3>
              <div className="tr-progress-line">
                <span />
              </div>
            </section>

            <section className="tr-tara-card">
              <div className="tr-tara-avatar">T</div>
              <div>
                <p>Tara</p>
                <strong>Start with 10 easy questions.</strong>
              </div>
            </section>
          </div>

          <div className="tr-preview-grid">
            {platformItems.map((item) => (
              <section key={item.label}>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="tr-showcase" aria-label="TopRank product flow">
        {showcaseItems.map((item, index) => (
          <article className="tr-showcase-card" key={item.title}>
            <div className="tr-showcase-top">
              <span>{index + 1}</span>
              <strong>{item.title}</strong>
            </div>
            <div className="tr-mini-ui">
              <p>{item.label}</p>
              <h3>{item.value}</h3>
              <small>{item.detail}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="tr-section tr-three" id="parents">
        {audienceCards.map((card) => (
          <div id={card.eyebrow === "For schools" ? "schools" : undefined} key={card.eyebrow}>
            <p className="tr-eyebrow">{card.eyebrow}</p>
            <h2>{card.title}</h2>
            <div className="tr-audience-preview">
              {card.rows.map((row) => (
                <span key={row}>{row}</span>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="tr-section tr-about" id="about">
        <p className="tr-eyebrow">Ready for your first mission?</p>
        <h2>Every great rank starts with one focused day.</h2>
        <a className="tr-primary tr-arrow" href="/demo/start">Experience Mission Control</a>
      </section>
    </main>
  );
}
