import { requireRole } from "@/server/auth/session";
import { OperationsWorkspace } from "@/components/journey/OperationsWorkspace";
import { PageContainer } from "@/components/ui/PageContainer";
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  await requireRole(["PLATFORM_ADMIN"]);
  return <PageContainer><OperationsWorkspace /></PageContainer>;
}
