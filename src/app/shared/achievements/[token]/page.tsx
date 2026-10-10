import { notFound } from "next/navigation";
import { getSharedAchievement } from "@/server/competition/achievements";
import { PageContainer } from "@/components/ui/PageContainer";
import { Icon } from "@/components/ui/Icon";
export const dynamic = "force-dynamic";
export const metadata = { title: "Shared TopRank achievement", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function Page({ params }: { params: Promise<{ token: string }> }) {
 const { token } = await params; const achievement = await getSharedAchievement(token); if (!achievement) notFound();
 return <PageContainer><div className="journey-shell"><span className="journey-kicker">TOPRANK ACHIEVEMENT</span><span className="competition-badge" aria-hidden="true"><Icon name={achievement.badge as "compete"} /></span><h1>{achievement.title}</h1><p>{achievement.explanation}</p><p>Awarded {new Date(achievement.awardedAt).toLocaleDateString()}</p></div></PageContainer>;
}
