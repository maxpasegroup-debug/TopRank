import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  // Public registration defaults to student and rejects all other roles.
  role: z.literal("STUDENT").default("STUDENT"),
  targetExam: z.string().trim().max(32).optional(),
});

export const loginSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
});
