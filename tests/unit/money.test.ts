import { describe, expect, it } from "vitest";

import {
  absMoney,
  addMoney,
  allocateMoney,
  bpsToPercent,
  compareMoney,
  financials,
  formatMoney,
  formatMoneyAmount,
  gross,
  isMoney,
  isNegativeMoney,
  isZeroMoney,
  marginBps,
  money,
  multiplyMoney,
  negateMoney,
  parseToMinorUnits,
  percentageOf,
  subtractMoney,
  sumMoney,
  toDecimalString,
  tryParseMoney,
  tryParseToMinorUnits,
  zeroMoney,
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

  it("strips currency symbols/codes and rejects excess fraction digits", () => {
    expect(parseToMinorUnits("$25.99", "USD")).toBe(2599);
    expect(parseToMinorUnits("USD 25.99", "USD")).toBe(2599);
    expect(parseToMinorUnits("TZS 25,000", "TZS")).toBe(25000);
    expect(() => parseToMinorUnits("25.999", "USD")).toThrow();
  });

  it("provides non-throwing parse variants", () => {
    expect(tryParseToMinorUnits("25.99", "USD")).toBe(2599);
    expect(tryParseToMinorUnits("nope", "USD")).toBeNull();
    expect(tryParseMoney("25.99", "USD")).toEqual({
      amount: 2599,
      currency: "USD",
    });
    expect(tryParseMoney("nope", "USD")).toBeNull();
  });
});

describe("money — helpers", () => {
  it("builds zero and guards Money values", () => {
    expect(zeroMoney("USD")).toEqual({ amount: 0, currency: "USD" });
    expect(isZeroMoney(zeroMoney("TZS"))).toBe(true);
    expect(isMoney({ amount: 100, currency: "USD" })).toBe(true);
    expect(isMoney({ amount: 1.5, currency: "USD" })).toBe(false);
    expect(isMoney({ amount: 100, currency: "GBP" })).toBe(false);
    expect(isMoney(null)).toBe(false);
  });

  it("negates, abs, and detects sign", () => {
    expect(negateMoney(money(2599, "USD")).amount).toBe(-2599);
    expect(absMoney(money(-2599, "USD")).amount).toBe(2599);
    expect(isNegativeMoney(money(-1, "USD"))).toBe(true);
    expect(isNegativeMoney(money(1, "USD"))).toBe(false);
  });

  it("compares same-currency amounts", () => {
    expect(compareMoney(money(100, "USD"), money(200, "USD"))).toBeLessThan(0);
    expect(compareMoney(money(200, "USD"), money(200, "USD"))).toBe(0);
    expect(compareMoney(money(300, "USD"), money(200, "USD"))).toBeGreaterThan(
      0,
    );
    expect(() => compareMoney(money(1, "USD"), money(1, "TZS"))).toThrow();
  });

  it("sums lists safely and rejects mixed currencies", () => {
    expect(sumMoney([], "USD")).toEqual({ amount: 0, currency: "USD" });
    expect(
      sumMoney([money(100, "USD"), money(250, "USD"), money(1, "USD")], "USD")
        .amount,
    ).toBe(351);
    expect(() =>
      sumMoney([money(100, "USD"), money(100, "TZS")], "USD"),
    ).toThrow();
  });

  it("allocates without losing minor units", () => {
    const parts = allocateMoney(money(1000, "USD"), 3);
    expect(parts.map((p) => p.amount)).toEqual([334, 333, 333]);
    expect(sumMoney(parts, "USD").amount).toBe(1000);

    const negParts = allocateMoney(money(-1000, "USD"), 3);
    expect(sumMoney(negParts, "USD").amount).toBe(-1000);

    expect(() => allocateMoney(money(100, "USD"), 0)).toThrow();
  });

  it("formats from raw amount and converts bps", () => {
    expect(formatMoneyAmount(2599, "USD")).toBe("$25.99");
    expect(bpsToPercent(4000)).toBe(40);
  });

  it("computes an internal financial breakdown with a gateway fee", () => {
    const result = financials(
      money(10000, "TZS"),
      money(6000, "TZS"),
      money(300, "TZS"),
    );
    expect(result).toEqual({
      currency: "TZS",
      retail: 10000,
      providerCost: 6000,
      gatewayFee: 300,
      grossProfit: 3700,
      marginBps: 3700,
    });
  });

  it("defaults the gateway fee to zero and handles zero retail", () => {
    expect(financials(money(10000, "TZS"), money(6000, "TZS")).grossProfit).toBe(
      4000,
    );
    expect(financials(money(0, "USD"), money(0, "USD")).marginBps).toBe(0);
  });
});
