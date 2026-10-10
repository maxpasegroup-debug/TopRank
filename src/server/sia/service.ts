import type { AuthUser } from "@/server/auth/session";
import { getJourney, getMissionBoard } from "@/server/journey/service";
import { getMockRevision } from "@/server/mock/service";
import { getCompetitionSuggestion } from "@/server/competition/service";
export function portalGuidance(activity: { completedTasks: number; completedLessons: number; recordedMinutes: number } | null) {
 return { source: "deterministic" as const, externalProviderConnected: false,
   suggestion: activity ? `Shared activity records show ${activity.completedTasks} completed missions and ${activity.completedLessons} lessons marked complete. Discuss the learner's next planned step.` : "No learning activity is shared within your current access scope." };
}
export async function getSiaGuidance(user: AuthUser) {
  const journey = await getJourney(user);
  const plan = await getMissionBoard(user);
  const next = plan?.tasks.find((task) => task.status === "TODO");
  const revision = plan && !next ? (await getMockRevision(user)).find((entry) => !entry.reviewedAt) : null;
  const competition = plan && !next && !revision ? await getCompetitionSuggestion(user) : null;
  return { source: "deterministic" as const, externalProviderConnected: false,
    goal: journey.profile?.dreamCollege ?? null,
    suggestion: next ? `Your next step is ${next.title}. You have allocated ${next.minutes} minutes.` :
      revision ? `Review ${revision.subject} from your saved mock attempt (${revision.reasons.join(", ").toLowerCase()}).` :
      competition ? competition.suggestion :
      plan ? "Your current tasks are complete or skipped. Review your board and choose what comes next." : "Save your goals and review a seven-day mission plan.",
    href: next?.href ?? (revision ? "/practice/revision" : competition?.href ?? (plan ? "/home" : "/onboarding")) };
}
