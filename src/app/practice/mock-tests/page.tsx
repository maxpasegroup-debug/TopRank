import { MockFrame } from "@/components/mock/MockFrame";
import { MockDirectory } from "@/components/mock/StudentMocks";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: Promise<{ mockId?: string }> }) {
 const { mockId } = await searchParams;
 return <MockFrame><MockDirectory mockId={mockId} /></MockFrame>;
}
