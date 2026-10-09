import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiOk, getRequestId, handleApiError } from "@/server/api/responses";
import { revokeSession, SESSION_COOKIE } from "@/server/auth/session";

async function logout(request: Request) {
  const requestId = getRequestId(request);

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (token) {
      await revokeSession(token);
    }

    const acceptsHtml = request.headers.get("accept")?.includes("text/html");
    const response = acceptsHtml ? NextResponse.redirect(new URL("/login", request.url)) : apiOk({ loggedOut: true }, requestId);

    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return handleApiError(error, requestId);
  }
}

export async function POST(request: Request) {
  return logout(request);
}

export async function GET(request: Request) {
  return logout(request);
}
