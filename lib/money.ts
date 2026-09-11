import type { Currency } from "@/types";

/**
 * Money utilities.
 *
 * All monetary values are stored and manipulated as INTEGER minor units to
 * avoid floating-point errors. TZS has no minor unit in practice but we still
 * treat it as an integer count of shillings (fractionDigits = 0). USD uses
 * cents (fractionDigits = 2).
 */

const FRACTION_DIGITS: Record<Currency, number> = {
  TZS: 0,
  USD: 2,
};

export interface Money {
  /** Integer minor units. */
  readonly amount: number;
  readonly currency: Currency;
}

function assertInteger(amount: number): void {
  if (!Number.isInteger(amount)) {
    throw new Error(`Money amount must be an integer minor unit: ${amount}`);
  }
}

export function money(amount: number, currency: Currency): Money {
  assertInteger(amount);
  return { amount, currency };
}

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amount + b.amount, a.currency);
}

export function subtractMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amount - b.amount, a.currency);
}

/** Multiply a money amount by an integer quantity. */
export function multiplyMoney(a: Money, quantity: number): Money {
  assertInteger(quantity);
  return money(a.amount * quantity, a.currency);
}

/**
 * Apply a percentage using integer-safe rounding (banker-free, round-half-up).
 * `percent` is expressed in basis points to avoid float inputs where possible,
 * but a plain number is accepted and rounded deterministically.
 */
export function percentageOf(a: Money, percent: number): Money {
  const raw = (a.amount * percent) / 100;
  return money(Math.round(raw), a.currency);
}

export function gross(retail: Money, cost: Money): Money {
  return subtractMoney(retail, cost);
}

/** Margin as an integer number of basis points (100% = 10000 bps). */
export function marginBps(retail: Money, cost: Money): number {
  assertSameCurrency(retail, cost);
  if (retail.amount === 0) return 0;
  return Math.round(((retail.amount - cost.amount) / retail.amount) * 10000);
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(
      `Currency mismatch: ${a.currency} vs ${b.currency}. Cross-currency math is not supported.`,
    );
  }
}

/** Convert integer minor units to a major-unit decimal string (no locale). */
export function toDecimalString(m: Money): string {
  const digits = FRACTION_DIGITS[m.currency];
  if (digits === 0) return String(m.amount);
  const sign = m.amount < 0 ? "-" : "";
  const abs = Math.abs(m.amount);
  const divisor = 10 ** digits;
  const major = Math.floor(abs / divisor);
  const minor = abs % divisor;
  return `${sign}${major}.${String(minor).padStart(digits, "0")}`;
}

/** Human-readable formatting for display (e.g. "TZS 25,000", "$25.99"). */
export function formatMoney(m: Money): string {
  const digits = FRACTION_DIGITS[m.currency];
  const value = m.amount / 10 ** digits;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

  return m.currency === "USD"
    ? `$${formatted}`
    : `${m.currency} ${formatted}`;
}

/** Parse a major-unit input (e.g. "25.99") into integer minor units. */
export function parseToMinorUnits(input: string, currency: Currency): number {
  const digits = FRACTION_DIGITS[currency];
  const normalized = input.trim().replace(/,/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
    throw new Error(`Invalid money input: ${input}`);
  }
  const [whole = "0", frac = ""] = normalized.split(".");
  const negative = whole.startsWith("-");
  const wholeDigits = whole.replace("-", "");
  const paddedFrac = frac.padEnd(digits, "0").slice(0, digits);
  const combined = `${wholeDigits}${paddedFrac}`;
  const amount = Number.parseInt(combined || "0", 10);
  return negative ? -amount : amount;
}

export function fractionDigits(currency: Currency): number {
  return FRACTION_DIGITS[currency];
}
