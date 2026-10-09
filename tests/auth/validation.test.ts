import { describe, expect, it } from "vitest";
import { loginSchema, signupSchema } from "@/server/auth/validation";

describe("auth validation", () => {
  it("normalizes signup email and defaults to student role", () => {
    const result = signupSchema.parse({
      name: "Rahul",
      email: "RAHUL@example.com",
      password: "password123",
    });

    expect(result.email).toBe("rahul@example.com");
    expect(result.role).toBe("STUDENT");
  });

  it("rejects short passwords", () => {
    expect(() =>
      signupSchema.parse({
        name: "Rahul",
        email: "rahul@example.com",
        password: "short",
      }),
    ).toThrow();
  });

  it("validates login input", () => {
    expect(loginSchema.parse({ email: "a@b.com", password: "secret" })).toEqual({
      email: "a@b.com",
      password: "secret",
    });
  });
});
