import { DemoBadge } from "../components/polish/DemoBadge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageContainer } from "../components/ui/PageContainer";

export function DemoStart() {
  return (
    <PageContainer>
      <div className="ready-screen">
        <Card>
          <div className="demo-start-card">
            <DemoBadge />
            <h1>Welcome to TopRank Demo</h1>
            <p>This is a guided prototype experience for live presentations.</p>
            <Button href="/demo?demo=1">Begin Journey</Button>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
