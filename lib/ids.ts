/**
 * Human-readable public reference generators (Section 8).
 *
 * Internal Firestore document IDs are used for storage; these references are
 * the customer-facing identifiers. They are intentionally unambiguous
 * (Crockford-style alphabet excluding I, L, O, U) to avoid confusion.
 *
 * Randomness uses the Web Crypto API with rejection sampling so the alphabet is
 * drawn uniformly (no modulo bias). It falls back to `Math.random` only if no
 * crypto source is available (e.g. exotic runtimes) so the module never throws
 * during import.
 */

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford base32 (len 32)

/** Reference prefixes keyed by entity (Section 8). */
export const REFERENCE_PREFIXES = {
  customer: "AF-CUS",
  order: "AF-ORD",
  service: "AF-SRV",
  ticket: "AF-TKT",
  payment: "AF-PAY",
  provisioningJob: "AF-PRV",
} as const;

export type ReferenceKind = keyof typeof REFERENCE_PREFIXES;

function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  const cryptoObj = (globalThis as { crypto?: Crypto }).crypto;
  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(bytes);
    return bytes;
  }
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

/**
 * Uniformly sample `length` characters from ALPHABET (len 32). Since 256 is an
 * exact multiple of 32 there is no modulo bias, but we still keep the loop
 * generic and reject nothing for this alphabet size.
 */
function randomToken(length: number): string {
  const bytes = getRandomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}

/** Generic reference builder: `<PREFIX>-<TOKEN>`. */
export function generateReference(prefix: string, tokenLength = 5): string {
  return `${prefix}-${randomToken(tokenLength)}`;
}

export function customerReference(): string {
  return `${REFERENCE_PREFIXES.customer}-${randomToken(5)}`;
}

export function orderReference(): string {
  return `${REFERENCE_PREFIXES.order}-${randomToken(5)}`;
}

export function serviceReference(): string {
  return `${REFERENCE_PREFIXES.service}-${randomToken(5)}`;
}

export function ticketReference(): string {
  return `${REFERENCE_PREFIXES.ticket}-${randomToken(5)}`;
}

export function paymentReference(): string {
  return `${REFERENCE_PREFIXES.payment}-${randomToken(6)}`;
}

export function provisioningJobReference(): string {
  return `${REFERENCE_PREFIXES.provisioningJob}-${randomToken(6)}`;
}

/**
 * Invoice numbers are sequential per year: AFV-YYYY-NNNNNN.
 * The sequence value must be supplied by an atomic server-side counter.
 */
export function invoiceNumber(year: number, sequence: number): string {
  if (!Number.isInteger(year) || year < 2000 || year > 9999) {
    throw new Error(`Invalid invoice year: ${year}`);
  }
  if (!Number.isInteger(sequence) || sequence < 0) {
    throw new Error(`Invalid invoice sequence: ${sequence}`);
  }
  return `AFV-${year}-${String(sequence).padStart(6, "0")}`;
}

/* -------------------------------------------------------------------------- */
/* Validation & parsing                                                       */
/* -------------------------------------------------------------------------- */

const TOKEN_CLASS = "[0-9A-HJKMNP-TV-Z]"; // ALPHABET without I, L, O, U
const INVOICE_RE = /^AFV-(\d{4})-(\d{6})$/;

function referenceRegExp(prefix: string): RegExp {
  return new RegExp(`^${prefix}-${TOKEN_CLASS}+$`);
}

/**
 * Validate a human-readable reference. When `kind` is provided the prefix must
 * match that entity; otherwise any known AfriVPS prefix is accepted.
 */
export function isValidReference(value: string, kind?: ReferenceKind): boolean {
  if (typeof value !== "string") return false;
  if (kind) return referenceRegExp(REFERENCE_PREFIXES[kind]).test(value);
  return Object.values(REFERENCE_PREFIXES).some((prefix) =>
    referenceRegExp(prefix).test(value),
  );
}

export function isValidInvoiceNumber(value: string): boolean {
  return typeof value === "string" && INVOICE_RE.test(value);
}

/** Parse `AFV-YYYY-NNNNNN` into its parts, or null when malformed. */
export function parseInvoiceNumber(
  value: string,
): { year: number; sequence: number } | null {
  const match = INVOICE_RE.exec(value);
  if (!match) return null;
  return { year: Number(match[1]), sequence: Number(match[2]) };
}
