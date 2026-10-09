import { describe, expect, it } from "vitest";
import { canAccessRole, parentRoles, platformAdminRoles, schoolRoles, studentRoles } from "@/server/auth/roles";

describe("role authorization helpers", () => {
  it("allows matching student roles", () => {
    expect(canAccessRole("STUDENT", studentRoles)).toBe(true);
    expect(canAccessRole("PARENT", studentRoles)).toBe(false);
  });

  it("allows platform admins through privileged role groups", () => {
    expect(canAccessRole("PLATFORM_ADMIN", studentRoles)).toBe(true);
    expect(canAccessRole("PLATFORM_ADMIN", parentRoles)).toBe(true);
    expect(canAccessRole("PLATFORM_ADMIN", schoolRoles)).toBe(true);
    expect(canAccessRole("PLATFORM_ADMIN", platformAdminRoles)).toBe(true);
  });

  it("keeps parent and school access separate", () => {
    expect(canAccessRole("PARENT", schoolRoles)).toBe(false);
    expect(canAccessRole("SCHOOL_ADMIN", parentRoles)).toBe(false);
  });
});
