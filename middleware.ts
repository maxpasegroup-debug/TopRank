import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("x-request-id", requestId);
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("x-frame-options", "DENY");
  const sharedAchievement = request.nextUrl.pathname.startsWith("/shared/achievements/");
  response.headers.set("referrer-policy", sharedAchievement ? "no-referrer" : "strict-origin-when-cross-origin");
  if (sharedAchievement) response.headers.set("cache-control", "private, no-store");
  response.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
