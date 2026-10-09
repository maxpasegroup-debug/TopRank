import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "@/server/auth/session";
const mocks = vi.hoisted(() => ({ journey: vi.fn(), board: vi.fn() }));
vi.mock("@/server/journey/service", () => ({ getJourney: mocks.journey, getMissionBoard: mocks.board }));
import { getSiaGuidance } from "@/server/sia/service";
const user: AuthUser = { id: "student", role: "STUDENT", name: "S", email: "s@example.com" };
beforeEach(() => { vi.resetAllMocks(); mocks.journey.mockResolvedValue({ profile: { dreamCollege: "My career goal" } }); });
describe("SIA deterministic guidance", () => {
  it("grounds suggestions in saved unfinished missions without sending personal data externally", async () => {
    mocks.board.mockResolvedValue({ tasks: [{ status: "COMPLETED", title: "Old", minutes: 60 }, { status: "TODO", title: "Cells", minutes: 45, href: "/learn/cells" }] });
    const result = await getSiaGuidance(user); expect(result).toMatchObject({ source: "deterministic", externalProviderConnected: false, href: "/learn/cells" });
    expect(result.suggestion).toContain("Cells"); expect(result.suggestion).toContain("45"); expect(JSON.stringify(result)).not.toContain(user.email);
    expect(mocks.journey).toHaveBeenCalledWith(user); expect(mocks.board).toHaveBeenCalledWith(user);
  });
  it("recommends onboarding when no plan exists", async () => { mocks.board.mockResolvedValue(null); expect(await getSiaGuidance(user)).toMatchObject({ href: "/onboarding", externalProviderConnected: false }); });
  it("does not fabricate a mission after all tasks are complete", async () => { mocks.board.mockResolvedValue({ tasks: [{ status: "COMPLETED", title: "Cells", minutes: 45 }] }); expect(await getSiaGuidance(user)).toMatchObject({ href: "/home" }); });
});
