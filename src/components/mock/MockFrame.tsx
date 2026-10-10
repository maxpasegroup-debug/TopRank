import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireRole } from "@/server/auth/session";
import { assertStudent } from "@/server/student/service";
import { prisma } from "@/server/db";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/ui/PageContainer";
export async function MockFrame({ children, currentPath = "/learn" }: { children: ReactNode; currentPath?: string }) {
 const user = await requireRole(["STUDENT"]); assertStudent(user);
 const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id }, select: { onboardingCompletedAt: true } });
 if (!profile?.onboardingCompletedAt) redirect("/onboarding");
 return <AppShell currentPath={currentPath}><PageContainer>{children}</PageContainer></AppShell>;
}
