import { NextResponse } from "next/server";
import { ConflictApiError } from "@/server/api/errors";
import { apiOk, getRequestId, handleApiError } from "@/server/api/responses";
import { createSession, sessionCookieOptions, SESSION_COOKIE } from "@/server/auth/session";
import { signupSchema } from "@/server/auth/validation";
import { hashPassword } from "@/server/auth/password";
import { prisma } from "@/server/db";
import { logger } from "@/server/logger";

export async function POST(request: Request) {
  const requestId = getRequestId(request);

  try {
    const body = signupSchema.parse(await request.json());
    const existingUser = await prisma.user.findUnique({ where: { email: body.email } });

    if (existingUser) {
      throw new ConflictApiError("An account with this email already exists");
    }

    const passwordHash = await hashPassword(body.password);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: body.email,
          name: body.name,
          passwordHash,
          role: body.role,
        },
      });

      if (createdUser.role === "STUDENT") {
        await tx.studentProfile.create({ data: { userId: createdUser.id } });
      } else if (createdUser.role === "PARENT") {
        await tx.parentProfile.create({ data: { userId: createdUser.id } });
      } else if (createdUser.role === "TEACHER") {
        await tx.teacherProfile.create({ data: { userId: createdUser.id } });
      }

      return createdUser;
    });

    const session = await createSession(user.id);
    const response = apiOk({ user: { id: user.id, email: user.email, name: user.name, role: user.role } }, requestId, {
      status: 201,
    });

    response.cookies.set(SESSION_COOKIE, session.token, sessionCookieOptions(session.expiresAt));
    logger.info({ requestId, userId: user.id, role: user.role }, "User signed up");

    return response;
  } catch (error) {
    return handleApiError(error, requestId);
  }
}
