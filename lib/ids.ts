/**
 * Human-readable public reference generators (Section 8).
 *
 * Internal Firestore document IDs are used for storage; these references are
 * the customer-facing identifiers. They are intentionally unambiguous
 * (Crockford-style alphabet excluding I, L, O, U) to avoid confusion.
 */

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford base32

function randomToken(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * ALPHABET.length);
    out += ALPHABET[idx];
  }
  return out;
}

export function customerReference(): string {
  return `AF-CUS-${randomToken(5)}`;
}

export function orderReference(): string {
  return `AF-ORD-${randomToken(5)}`;
}

export function serviceReference(): string {
  return `AF-SRV-${randomToken(5)}`;
}

export function ticketReference(): string {
  return `AF-TKT-${randomToken(5)}`;
}

export function paymentReference(): string {
  return `AF-PAY-${randomToken(6)}`;
}

export function provisioningJobReference(): string {
  return `AF-PRV-${randomToken(6)}`;
}

/**
 * Invoice numbers are sequential per year: AFV-YYYY-NNNNNN.
 * The sequence value must be supplied by an atomic server-side counter.
 */
export function invoiceNumber(year: number, sequence: number): string {
  return `AFV-${year}-${String(sequence).padStart(6, "0")}`;
}
