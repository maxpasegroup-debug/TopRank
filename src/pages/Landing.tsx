import { FeatureCard } from "../components/public/FeatureCard";
import { PublicHeader } from "../components/public/PublicHeader";
import { StudentCard } from "../components/public/StudentCard";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Icon } from "../components/ui/Icon";
import { SectionHeader } from "../components/ui/SectionHeader";

const exams = ["NEET", "JEE Main", "JEE Advanced", "KEAM", "CUET", "Board Exams", "Foundation", "School Tests"];

export function Landing() {
  return (
    <main className="public-page landing-page">
      <section className="toprank-hero-stage">
        <PublicHeader />
        <div className="toprank-hero-content">
          <div className="hero-copy hero-copy-cinematic">
            <p className="eyebrow">AI-powered hybrid coaching for school students</p>
            <div className="staggered-title" aria-label="learn practice rank">
              <h1 className="hero-title-word word-learn">learn</h1>
              <h1 className="hero-title-word word-practice">practice</h1>
              <h1 className="hero-title-word word-rank">rank</h1>
            </div>
          <p className="lead">
            TopRank blends daily missions, smart practice, Tara mentor guidance, and progress
            tracking for NEET, JEE, KEAM, CUET, and school exam preparation.
          </p>
          <div className="hero-proof-row" aria-label="TopRank outcomes">
            <span>Learn</span>
            <span>Practice</span>
            <span>Revise</span>
            <span>Improve</span>
          </div>
          <div className="actions">
            <Button href="/signup">Start Your Journey</Button>
            <Button href="#explore" variant="secondary">
              Explore
            </Button>
            <Button href="/demo/start" variant="ghost">
              Demo Mode
            </Button>
          </div>
        </div>

          <div className="ai-hero-visual cinematic-visual" aria-label="AI powered entrance coaching preview">
            <div className="student-focus-card">
              <span className="student-chip">Class 11 - NEET 2028</span>
              <h2>Rahul's Mission</h2>
              <p>Physics Motion - 30 questions</p>
              <div className="mission-bars">
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="mentor-orbit">
              <div className="mentor-avatar">T</div>
              <div>
                <strong>Tara</strong>
                <span>Revise once. Practice next.</span>
              </div>
            </div>
            <div className="rank-card-mini">
              <strong>AIIMS Delhi</strong>
              <span>dream college path</span>
            </div>
          </div>
        </div>

        <div className="hero-stat top-stat">
          <strong>64%</strong>
          <span>mission progress</span>
        </div>
        <div className="hero-stat bottom-stat">
          <strong>12</strong>
          <span>day streak</span>
        </div>

        <section className="exam-marquee-section hero-exam-belt" aria-label="Competitive exams offered">
          <p className="eyebrow">Hybrid coaching for competitive exams</p>
          <div className="exam-marquee">
            <div className="exam-track">
              {[...exams, ...exams].map((exam, index) => (
                <span key={`${exam}-${index}`}>{exam}</span>
              ))}
            </div>
          </div>
        </section>
      </section>

      <section className="public-section" id="explore">
        <SectionHeader eyebrow="Why TopRank" title="Daily coaching without the noise" />
        <div className="grid grid-3">
          <FeatureCard icon={<Icon name="learn" />} title="Learn Daily" text="One focused mission for school and entrance prep." />
          <FeatureCard icon={<Icon name="practice" />} title="Practice Smart" text="Question practice that always points to the next step." />
          <FeatureCard icon={<Icon name="tara" />} title="Tara Mentor" text="Calm guidance that brings students back to action." />
        </div>
      </section>

      <section className="public-section">
        <SectionHeader eyebrow="How it works" title="Four simple steps" />
        <div className="steps-row">
          {["Join", "Learn", "Practice", "Achieve"].map((step, index) => (
            <Card key={step}>
              <div className="step-number">{index + 1}</div>
              <h3 className="card-title">{step}</h3>
            </Card>
          ))}
        </div>
      </section>

      <section className="public-section">
        <SectionHeader eyebrow="Student success preview" title="Demo learners, real motivation" />
        <div className="grid grid-3">
          <StudentCard name="Rahul" exam="NEET 2028" streak="12 day" progress={74} />
          <StudentCard name="Asha" exam="JEE 2027" streak="8 day" progress={61} />
          <StudentCard name="Meera" exam="KEAM 2027" streak="15 day" progress={82} />
        </div>
      </section>

      <footer className="public-footer">
        <p>TopRank</p>
        <p>Your Daily Mission Towards Success</p>
      </footer>
    </main>
  );
}
