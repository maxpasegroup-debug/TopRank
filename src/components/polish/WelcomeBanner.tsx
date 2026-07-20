import { Button } from "../ui/Button";
import { demoStudent } from "../../data/demo";
import { DemoBadge } from "./DemoBadge";

type WelcomeBannerProps = {
  demo?: boolean;
};

export function WelcomeBanner({ demo = false }: WelcomeBannerProps) {
  return (
    <section className="welcome-banner">
      <div>
        {demo ? <DemoBadge /> : null}
        <p className="eyebrow">Welcome back</p>
        <h1>Good morning, {demoStudent.name}</h1>
        <p>You are on a {demoStudent.streak}. One small action keeps the mission alive.</p>
      </div>
      <Button href="/practice">Start Today's Practice</Button>
    </section>
  );
}
