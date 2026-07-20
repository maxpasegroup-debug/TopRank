import { FeatureCard } from "../components/public/FeatureCard";
import { PublicHeader } from "../components/public/PublicHeader";
import { StudentCard } from "../components/public/StudentCard";
import { PlaceholderIllustration } from "../components/prototype/PlaceholderIllustration";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Icon } from "../components/ui/Icon";
import { SectionHeader } from "../components/ui/SectionHeader";

export function Landing() {
  return (
    <main className="public-page">
      <PublicHeader />
      <section className="hero public-hero">
        <div className="hero-copy">
          <p className="eyebrow">Entrance coaching, made daily</p>
          <h1 className="headline">Your Daily Mission Towards a Top Rank.</h1>
          <p className="lead">
            TopRank turns preparation into simple daily steps for students who want focus,
            confidence, and a clear path.
          </p>
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
        <Card padded={false}>
          <PlaceholderIllustration />
        </Card>
      </section>

      <section className="public-section" id="explore">
        <SectionHeader eyebrow="Why TopRank" title="A calmer way to prepare" />
        <div className="grid grid-3">
          <FeatureCard icon={<Icon name="learn" />} title="Learn Daily" text="Small lessons that fit real life." />
          <FeatureCard icon={<Icon name="practice" />} title="Practice Smart" text="Focused practice without pressure." />
          <FeatureCard icon={<Icon name="progress" />} title="Improve Faster" text="Progress that feels easy to read." />
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
