import { requireRole } from "@/server/auth/session";
import { PortalWorkspace } from "@/components/portal/PortalWorkspace";
import { PageContainer } from "@/components/ui/PageContainer";
export const dynamic = "force-dynamic";
export default async function Page() {
 await requireRole(["PARENT"]);
 return <PageContainer><PortalWorkspace role="PARENT" /></PageContainer>;
}
