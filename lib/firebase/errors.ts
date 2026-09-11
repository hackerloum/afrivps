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
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    const code = (error as { code: string }).code;
    if (code in MESSAGES) return MESSAGES[code]!;
  }
  return "Something went wrong. Please try again.";
}
