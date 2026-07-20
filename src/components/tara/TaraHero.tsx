import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { demoStudent } from "../../data/demo";
import { Avatar } from "./Avatar";

export function TaraHero() {
  return (
    <Card>
      <div className="tara-hero">
        <Avatar />
        <div>
          <p className="eyebrow">Tara Mentor</p>
          <h1 className="tara-headline">Hello {demoStudent.name}</h1>
          <p className="section-subtitle">Ready for today's mission?</p>
        </div>
        <Button href="/tara/chat/study">Talk to Tara</Button>
      </div>
    </Card>
  );
}
