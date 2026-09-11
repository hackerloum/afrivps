import { describe, expect, it } from "vitest";

import {
  addMoney,
  formatMoney,
  gross,
  marginBps,
  money,
  multiplyMoney,
  parseToMinorUnits,
  percentageOf,
  subtractMoney,
  toDecimalString,
} from "@/lib/money";

describe("money — integer minor units", () => {
  it("rejects non-integer amounts", () => {
    expect(() => money(10.5, "USD")).toThrow();
  });

  it("adds and subtracts within the same currency", () => {
    expect(addMoney(money(2599, "USD"), money(1401, "USD")).amount).toBe(4000);
    expect(subtractMoney(money(4000, "USD"), money(1500, "USD")).amount).toBe(
      2500,
    );
  });

  it("refuses cross-currency arithmetic", () => {
    expect(() => addMoney(money(100, "USD"), money(100, "TZS"))).toThrow();
  });

  it("multiplies by integer quantity only", () => {
    expect(multiplyMoney(money(2500, "TZS"), 3).amount).toBe(7500);
    expect(() => multiplyMoney(money(2500, "TZS"), 1.5)).toThrow();
  });

  it("computes percentages with deterministic rounding", () => {
    // 15% of 2599 = 389.85 -> rounds to 390 cents
    expect(percentageOf(money(2599, "USD"), 15).amount).toBe(390);
  });

  it("computes gross profit and margin in basis points", () => {
    const retail = money(10000, "TZS");
    const cost = money(6000, "TZS");
    expect(gross(retail, cost).amount).toBe(4000);
    expect(marginBps(retail, cost)).toBe(4000); // 40.00%
  });

  it("avoids floating point errors accumulating over sums", () => {
    // 0.1 + 0.2 in float is 0.30000000000000004; integer minor units are exact.
    let total = money(0, "USD");
    total = addMoney(total, money(10, "USD"));
    total = addMoney(total, money(20, "USD"));
    expect(total.amount).toBe(30);
    expect(toDecimalString(total)).toBe("0.30");
  });

  it("formats TZS with zero fraction digits and USD with two", () => {
    expect(formatMoney(money(25000, "TZS"))).toBe("TZS 25,000");
    expect(formatMoney(money(2599, "USD"))).toBe("$25.99");
  });

  it("parses major-unit strings into minor units", () => {
    expect(parseToMinorUnits("25.99", "USD")).toBe(2599);
    expect(parseToMinorUnits("25,000", "TZS")).toBe(25000);
    expect(parseToMinorUnits("25", "USD")).toBe(2500);
    expect(() => parseToMinorUnits("abc", "USD")).toThrow();
  });
});
