import type { Certificate } from "../../data/progress";
import { Card } from "../ui/Card";

export function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <Card>
      <div className="certificate-ribbon" />
      <h3 className="progress-card-title">{certificate.title}</h3>
      <p className="card-copy">{certificate.detail}</p>
    </Card>
  );
}
