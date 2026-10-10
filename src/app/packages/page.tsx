import { MockFrame } from "@/components/mock/MockFrame";
import { CommerceWorkspace } from "@/components/commerce/CommerceWorkspace";
export const dynamic = "force-dynamic";
export default function Page() { return <MockFrame currentPath="/progress"><CommerceWorkspace /></MockFrame>; }
