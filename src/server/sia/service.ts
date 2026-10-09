import type { AuthUser } from "@/server/auth/session";
import { getJourney, getMissionBoard } from "@/server/journey/service";
export async function getSiaGuidance(user: AuthUser) {
  const journey = await getJourney(user);
  const plan = await getMissionBoard(user);
  const next = plan?.tasks.find((task) => task.status === "TODO");
  return { source: "deterministic" as const, externalProviderConnected: false,
    goal: journey.profile?.dreamCollege ?? null,
    suggestion: next ? `Your next step is ${next.title}. You have allocated ${next.minutes} minutes.` :
      plan ? "Your current tasks are complete or skipped. Review your board and choose what comes next." : "Save your goals and review a seven-day mission plan.",
    href: next?.href ?? (plan ? "/home" : "/onboarding") };
}
