import { z } from "zod";

/**
 * Environment validation.
 *
 * Public config (NEXT_PUBLIC_*) is safe for the browser bundle.
 * Server-only config (Admin SDK credentials, secrets) is validated lazily and
 * must NEVER be imported into client components.
 */

const truthy = z
  .string()
  .optional()
  .transform((v) => v === "true" || v === "1");

/**
 * Turn a ZodError into a clear, human-readable message. Each invalid or missing
 * variable is listed on its own line so misconfiguration is obvious at a glance
 * and can be fixed against `.env.example`.
 */
function formatEnvError(
  scope: "public" | "server",
  error: z.ZodError,
): string {
  const lines = error.issues.map((issue) => {
    const name = issue.path.join(".") || "(root)";
    return `  - ${name}: ${issue.message}`;
  });
  return [
    `Invalid ${scope} environment configuration:`,
    ...lines,
    `Fix the ${scope === "public" ? "NEXT_PUBLIC_* (browser-safe)" : "server-only"} variables above. See .env.example for the full list.`,
  ].join("\n");
}

const publicSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_USE_FIREBASE_EMULATORS: truthy,
});

// Read explicitly so Next.js can statically inline NEXT_PUBLIC_* values.
const rawPublic = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_USE_FIREBASE_EMULATORS:
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS,
};

function parsePublicEnv(): z.infer<typeof publicSchema> {
  const result = publicSchema.safeParse(rawPublic);
  if (!result.success) {
    throw new Error(formatEnvError("public", result.error));
  }
  return result.data;
}

export const publicEnv = parsePublicEnv();

export const useEmulators = publicEnv.NEXT_PUBLIC_USE_FIREBASE_EMULATORS;

/**
 * Server-only environment. Validated on first access from server code.
 * When running against emulators, Admin credentials are optional because the
 * Admin SDK connects to the emulator without real service-account keys.
 */
const serverSchema = z.object({
  FIREBASE_PROJECT_ID: z.string().min(1).optional(),
  FIREBASE_CLIENT_EMAIL: z.string().min(1).optional(),
  FIREBASE_PRIVATE_KEY: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().optional().default(""),
  APP_URL: z.string().url().default("http://localhost:3000"),
  SESSION_COOKIE_DAYS: z.coerce.number().int().min(1).max(14).default(5),
  FIREBASE_AUTH_EMULATOR_HOST: z.string().optional(),
  FIRESTORE_EMULATOR_HOST: z.string().optional(),
  FIREBASE_STORAGE_EMULATOR_HOST: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cachedServerEnv: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv;

  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(formatEnvError("server", result.error));
  }
  const parsed = result.data;

  // When not using emulators, Admin credentials are mandatory.
  if (!useEmulators) {
    const missing: string[] = [];
    if (!parsed.FIREBASE_PROJECT_ID) missing.push("FIREBASE_PROJECT_ID");
    if (!parsed.FIREBASE_CLIENT_EMAIL) missing.push("FIREBASE_CLIENT_EMAIL");
    if (!parsed.FIREBASE_PRIVATE_KEY) missing.push("FIREBASE_PRIVATE_KEY");
    if (missing.length > 0) {
      throw new Error(
        `Missing Firebase Admin credentials (required when NEXT_PUBLIC_USE_FIREBASE_EMULATORS is false): ${missing.join(", ")}`,
      );
    }
  }

  cachedServerEnv = parsed;
  return parsed;
}
