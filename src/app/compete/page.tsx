import { MockFrame } from "@/components/mock/MockFrame";
import { CompetitionWorkspace } from "@/components/competition/CompetitionWorkspace";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
 const { id } = await searchParams; return <MockFrame currentPath="/compete"><CompetitionWorkspace id={id} /></MockFrame>;
}
