/**
 * Map Firebase Auth error codes to safe, human-readable messages.
 * Never surface raw internal errors to customers (Section 58).
 */
const MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/invalid-email": "That email address looks invalid.",
  "auth/weak-password": "Please choose a stronger password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a moment and try again.",
  "auth/expired-action-code": "This link has expired. Please request a new one.",
  "auth/invalid-action-code":
    "This link is invalid or has already been used.",
  "auth/network-request-failed":
    "Network error. Check your connection and try again.",
};

export function authErrorMessage(error: unknown): string {
  const code = errorCode(error);
  if (code && code in MESSAGES) return MESSAGES[code]!;
  return "Something went wrong. Please try again.";
}

function errorCode(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  return null;
}

function errorName(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    typeof (error as { name: unknown }).name === "string"
  ) {
    return (error as { name: string }).name;
  }
  return null;
}

/**
 * A sanitized error safe to return to any client (Section 58): a friendly
 * message plus an HTTP status. Never carries stack traces, provider tokens,
 * Firebase Admin details, or raw internal error text.
 */
export interface SafeError {
  message: string;
  status: number;
}

/**
 * Map any thrown value to a {@link SafeError}. Recognizes the app's own
 * `AuthError` / `PermissionError` (matched by name to avoid importing
 * server-only modules into client bundles) and known Firebase auth codes.
 * Everything else collapses to a generic 500 so internals never leak.
 */
export function toSafeError(error: unknown): SafeError {
  switch (errorName(error)) {
    case "PermissionError":
      return {
        message: "You do not have permission to perform this action.",
        status: 403,
      };
    case "AuthError":
      return {
        message: "You need to be signed in to do that.",
        status: 401,
      };
  }

  const code = errorCode(error);
  if (code && code in MESSAGES) {
    const status = code === "auth/too-many-requests" ? 429 : 400;
    return { message: MESSAGES[code]!, status };
  }

  return { message: "Something went wrong. Please try again.", status: 500 };
}
