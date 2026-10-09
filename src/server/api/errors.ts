export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export class ValidationApiError extends ApiError {
  constructor(message = "Invalid request") {
    super(400, "VALIDATION_ERROR", message);
  }
}

export class AuthenticationApiError extends ApiError {
  constructor(message = "Authentication required") {
    super(401, "AUTHENTICATION_REQUIRED", message);
  }
}

export class AuthorizationApiError extends ApiError {
  constructor(message = "You do not have permission to access this resource") {
    super(403, "AUTHORIZATION_REQUIRED", message);
  }
}

export class ConflictApiError extends ApiError {
  constructor(message = "Resource already exists") {
    super(409, "CONFLICT", message);
  }
}
