import { MockFrame } from "@/components/mock/MockFrame";
import { AchievementHistory } from "@/components/competition/CompetitionWorkspace";
export const dynamic = "force-dynamic";
export default function Page() { return <MockFrame currentPath="/progress"><AchievementHistory /></MockFrame>; }
