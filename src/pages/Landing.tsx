import { useEffect, useState } from "react";

const platformItems = [
  { label: "today's mission", value: "physics - motion" },
  { label: "today's practice", value: "30 questions" },
  { label: "current streak", value: "12 days" },
  { label: "progress", value: "64%" },
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
          <p>AI Entrance Preparation Platform</p>
          <span />
        </div>
      ) : null}

      <nav className="tr-nav" aria-label="Public navigation">
        <a className="tr-logo" href="/">
          <span>TopRank</span>
          <small>AI Entrance Preparation</small>
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
          <a className="tr-demo" href="/demo/start">Start Demo</a>
        </div>
      </nav>

      <section className="tr-hero">
        <div className="tr-hero-copy">
          <p className="tr-eyebrow">India's next-generation AI entrance preparation platform</p>
          <h1>Every Dream Begins With Today's Mission.</h1>
          <p className="tr-hero-subtitle">
            TopRank helps students prepare for NEET, JEE, KEAM, CUET and school exams through
            daily missions, smart practice, progress tracking, and Tara mentor guidance.
          </p>
          <div className="tr-hero-actions">
            <a className="tr-primary" href="/demo/start">Experience Mission Control</a>
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

      <section className="tr-section tr-three" id="parents">
        <div>
          <p className="tr-eyebrow">For students</p>
          <h2>One clear next step, every day.</h2>
        </div>
        <div>
          <p className="tr-eyebrow">For parents</p>
          <h2>Know your child is moving forward.</h2>
        </div>
        <div id="schools">
          <p className="tr-eyebrow">For schools</p>
          <h2>See engagement without admin clutter.</h2>
        </div>
      </section>

      <section className="tr-section tr-about" id="about">
        <p className="tr-eyebrow">Built for entrance success</p>
        <h2>TopRank turns preparation into a calm daily system of learning, practice, revision, and mentoring.</h2>
        <a className="tr-primary" href="/demo/start">Start Demo</a>
      </section>
    </main>
  );
}
