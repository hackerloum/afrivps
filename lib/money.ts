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

/** A zero-valued Money in the given currency. */
export function zeroMoney(currency: Currency): Money {
  return { amount: 0, currency };
}

/** Runtime type guard for a well-formed integer Money value. */
export function isMoney(value: unknown): value is Money {
  return (
    typeof value === "object" &&
    value !== null &&
    "amount" in value &&
    "currency" in value &&
    typeof (value as { amount: unknown }).amount === "number" &&
    Number.isInteger((value as { amount: number }).amount) &&
    (value as { currency: unknown }).currency !== undefined &&
    (value as { currency: string }).currency in FRACTION_DIGITS
  );
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

/** Negate a money amount (preserves currency). */
export function negateMoney(a: Money): Money {
  return money(-a.amount, a.currency);
}

/** Absolute value of a money amount. */
export function absMoney(a: Money): Money {
  return money(Math.abs(a.amount), a.currency);
}

export function isZeroMoney(a: Money): boolean {
  return a.amount === 0;
}

export function isNegativeMoney(a: Money): boolean {
  return a.amount < 0;
}

/**
 * Compare two same-currency amounts. Returns a negative number when `a < b`,
 * zero when equal, and a positive number when `a > b`.
 */
export function compareMoney(a: Money, b: Money): number {
  assertSameCurrency(a, b);
  return a.amount - b.amount;
}

/**
 * Sum a list of same-currency amounts. The currency must be supplied so an
 * empty list still yields a well-typed zero value.
 */
export function sumMoney(items: readonly Money[], currency: Currency): Money {
  let total = 0;
  for (const item of items) {
    if (item.currency !== currency) {
      throw new Error(
        `Currency mismatch in sum: expected ${currency}, got ${item.currency}.`,
      );
    }
    total += item.amount;
  }
  return money(total, currency);
}

/**
 * Split an amount into `parts` integer minor-unit portions with no loss of
 * value: the remainder is distributed one minor unit at a time to the earliest
 * portions. Useful for proration and splitting totals across line items.
 */
export function allocateMoney(a: Money, parts: number): Money[] {
  if (!Number.isInteger(parts) || parts <= 0) {
    throw new Error(`allocateMoney requires a positive integer parts: ${parts}`);
  }
  const base = Math.trunc(a.amount / parts);
  let remainder = a.amount - base * parts;
  const step = remainder >= 0 ? 1 : -1;
  remainder = Math.abs(remainder);
  const out: Money[] = [];
  for (let i = 0; i < parts; i++) {
    const extra = i < remainder ? step : 0;
    out.push(money(base + extra, a.currency));
  }
  return out;
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

/** Convert basis points to a human percentage number (e.g. 4000 -> 40). */
export function bpsToPercent(bps: number): number {
  return bps / 100;
}

/**
 * Internal financial breakdown for a single price point (Section 18 / 46).
 *
 * SERVER-INTERNAL: the returned figures include provider cost and margin and
 * must never be serialized into customer-facing payloads. Callers own the
 * boundary — this pure helper only does the arithmetic.
 */
export interface MoneyFinancials {
  currency: Currency;
  retail: number;
  providerCost: number;
  gatewayFee: number;
  grossProfit: number;
  marginBps: number;
}

export function financials(
  retail: Money,
  providerCost: Money,
  gatewayFee: Money = zeroMoney(retail.currency),
): MoneyFinancials {
  assertSameCurrency(retail, providerCost);
  assertSameCurrency(retail, gatewayFee);
  const grossProfitAmount =
    retail.amount - providerCost.amount - gatewayFee.amount;
  return {
    currency: retail.currency,
    retail: retail.amount,
    providerCost: providerCost.amount,
    gatewayFee: gatewayFee.amount,
    grossProfit: grossProfitAmount,
    marginBps:
      retail.amount === 0
        ? 0
        : Math.round((grossProfitAmount / retail.amount) * 10000),
  };
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

/** Convenience: format from raw integer minor units + currency. */
export function formatMoneyAmount(amount: number, currency: Currency): string {
  return formatMoney(money(amount, currency));
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
  const normalized = input
    .trim()
    // Strip a leading currency symbol / ISO code and surrounding whitespace.
    .replace(/^(TZS|USD|\$)\s*/i, "")
    .replace(/,/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
    throw new Error(`Invalid money input: ${input}`);
  }
  const [whole = "0", frac = ""] = normalized.split(".");
  if (frac.length > digits) {
    throw new Error(
      `Too many fraction digits for ${currency} (max ${digits}): ${input}`,
    );
  }
  const negative = whole.startsWith("-");
  const wholeDigits = whole.replace("-", "");
  const paddedFrac = frac.padEnd(digits, "0").slice(0, digits);
  const combined = `${wholeDigits}${paddedFrac}`;
  const amount = Number.parseInt(combined || "0", 10);
  return negative ? -amount : amount;
}

/**
 * Non-throwing variant of {@link parseToMinorUnits}. Returns null on any
 * invalid input — convenient for form validation paths.
 */
export function tryParseToMinorUnits(
  input: string,
  currency: Currency,
): number | null {
  try {
    return parseToMinorUnits(input, currency);
  } catch {
    return null;
  }
}

/** Parse directly into a {@link Money}, or null when invalid. */
export function tryParseMoney(input: string, currency: Currency): Money | null {
  const amount = tryParseToMinorUnits(input, currency);
  return amount === null ? null : { amount, currency };
}

export function fractionDigits(currency: Currency): number {
  return FRACTION_DIGITS[currency];
}
