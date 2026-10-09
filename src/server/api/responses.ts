import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "../logger";
import { ApiError, ValidationApiError } from "./errors";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  requestId: string;
};

export type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
  requestId: string;
};

export function getRequestId(request: Request) {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}

export function apiOk<T>(data: T, requestId: string, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data, requestId }, init);
}

export function apiFailure(error: ApiError, requestId: string) {
  return NextResponse.json<ApiFailure>(
    {
      ok: false,
      error: {
        code: error.code,
        message: error.message,
      },
      requestId,
    },
    { status: error.status },
  );
}

export function handleApiError(error: unknown, requestId: string) {
  if (error instanceof ZodError) {
    return apiFailure(new ValidationApiError("Request validation failed"), requestId);
  }

  if (error instanceof ApiError) {
    return apiFailure(error, requestId);
  }

  logger.error({ err: error, requestId }, "Unhandled API error");

  return apiFailure(new ApiError(500, "INTERNAL_SERVER_ERROR", "Something went wrong"), requestId);
}
