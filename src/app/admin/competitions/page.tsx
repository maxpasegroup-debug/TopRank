import { requireRole } from "@/server/auth/session";
import { assertPlatformAdmin } from "@/server/operations/service";
import { AdminCompetitions } from "@/components/competition/AdminCompetitions";
import { PageContainer } from "@/components/ui/PageContainer";
export const dynamic = "force-dynamic";
export default async function Page() { assertPlatformAdmin(await requireRole(["PLATFORM_ADMIN"])); return <PageContainer><AdminCompetitions /></PageContainer>; }
