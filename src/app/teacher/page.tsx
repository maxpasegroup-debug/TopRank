import { requireRole } from "@/server/auth/session";
import { PortalWorkspace } from "@/components/portal/PortalWorkspace";
import { PageContainer } from "@/components/ui/PageContainer";
export const dynamic = "force-dynamic";
export default async function Page() {
 await requireRole(["TEACHER"]);
 return <PageContainer><PortalWorkspace role="TEACHER" /></PageContainer>;
}
