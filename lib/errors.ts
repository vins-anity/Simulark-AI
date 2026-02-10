import { logger } from "./logger";

export interface AppError extends Error {
  code: string;
  statusCode: number;
  isOperational: boolean;
}

export function createAppError(
  message: string,
  code: string,
  statusCode: number = 500,
  isOperational: boolean = true,
): AppError {
  const error = new Error(message) as AppError;
  error.code = code;
  error.statusCode = statusCode;
  error.isOperational = isOperational;
  error.name = "AppError";
  return error;
}

export const ErrorCodes = {
  // Auth errors
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",

  // Validation errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",

  // Resource errors
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",

  // Database errors
  DATABASE_ERROR: "DATABASE_ERROR",
  QUERY_FAILED: "QUERY_FAILED",

  // AI/Generation errors
  AI_GENERATION_FAILED: "AI_GENERATION_FAILED",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  MODEL_UNAVAILABLE: "MODEL_UNAVAILABLE",

  // General errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  TIMEOUT: "TIMEOUT",
} as const;

export function handleError(error: unknown): AppError {
  // If it's already an AppError, return it
  if (error instanceof Error && "code" in error) {
    return error as AppError;
  }

  // Handle specific error types
  if (error instanceof Error) {
    // Check for specific error patterns
    if (
      error.message.includes("timeout") ||
      error.message.includes("ETIMEDOUT")
    ) {
      return createAppError(
        "Request timed out. Please try again.",
        ErrorCodes.TIMEOUT,
        408,
      );
    }

    if (error.message.includes("rate limit") || error.message.includes("429")) {
      return createAppError(
        "Too many requests. Please wait a moment.",
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        429,
      );
    }

    if (error.message.includes("not found") || error.message.includes("404")) {
      return createAppError("Resource not found.", ErrorCodes.NOT_FOUND, 404);
    }

    // Default to internal error
    return createAppError(
      error.message || "An unexpected error occurred",
      ErrorCodes.INTERNAL_ERROR,
      500,
    );
  }

  // Handle non-Error types
  return createAppError(
    "An unexpected error occurred",
    ErrorCodes.INTERNAL_ERROR,
    500,
  );
}

export function logError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  const appError = handleError(error);

  if (appError.statusCode >= 500) {
    logger.error(
      `[${appError.code}] ${appError.message}`,
      appError instanceof Error ? appError : undefined,
      context,
    );
  } else {
    logger.warn(`[${appError.code}] ${appError.message}`, context);
  }
}

export function isOperationalError(error: unknown): boolean {
  if (error instanceof Error && "isOperational" in error) {
    return (error as AppError).isOperational;
  }
  return false;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}

export function getErrorStatusCode(error: unknown): number {
  if (error instanceof Error && "statusCode" in error) {
    return (error as AppError).statusCode;
  }
  return 500;
}
