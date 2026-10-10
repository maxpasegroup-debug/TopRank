import { requireRole } from "@/server/auth/session";
import { PageContainer } from "@/components/ui/PageContainer";
import { AdminCommerce } from "@/components/commerce/CommerceWorkspace";
export const dynamic = "force-dynamic";
export default async function Page() { await requireRole(["PLATFORM_ADMIN"]); return <PageContainer><AdminCommerce /></PageContainer>; }
