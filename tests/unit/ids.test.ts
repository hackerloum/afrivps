import { describe, expect, it } from "vitest";

import {
  customerReference,
  generateReference,
  invoiceNumber,
  isValidInvoiceNumber,
  isValidReference,
  orderReference,
  parseInvoiceNumber,
  paymentReference,
  provisioningJobReference,
  REFERENCE_PREFIXES,
  serviceReference,
  ticketReference,
} from "@/lib/ids";

describe("id generators", () => {
  it("produces prefixed, unambiguous references", () => {
    expect(customerReference()).toMatch(/^AF-CUS-[0-9A-HJKMNP-TV-Z]{5}$/);
    expect(orderReference()).toMatch(/^AF-ORD-[0-9A-HJKMNP-TV-Z]{5}$/);
    expect(serviceReference()).toMatch(/^AF-SRV-[0-9A-HJKMNP-TV-Z]{5}$/);
    expect(ticketReference()).toMatch(/^AF-TKT-[0-9A-HJKMNP-TV-Z]{5}$/);
  });

  it("excludes ambiguous characters (I, L, O, U) in the random token", () => {
    const token = customerReference().split("-")[2]!;
    expect(token).not.toMatch(/[ILOU]/);
  });

  it("formats sequential invoice numbers", () => {
    expect(invoiceNumber(2026, 142)).toBe("AFV-2026-000142");
    expect(invoiceNumber(2026, 1)).toBe("AFV-2026-000001");
  });

  it("rejects out-of-range invoice inputs", () => {
    expect(() => invoiceNumber(1999, 1)).toThrow();
    expect(() => invoiceNumber(2026, -1)).toThrow();
    expect(() => invoiceNumber(2026, 1.5)).toThrow();
  });

  it("uses longer tokens for payment and provisioning references", () => {
    expect(paymentReference()).toMatch(/^AF-PAY-[0-9A-HJKMNP-TV-Z]{6}$/);
    expect(provisioningJobReference()).toMatch(
      /^AF-PRV-[0-9A-HJKMNP-TV-Z]{6}$/,
    );
  });

  it("exposes prefixes and a generic builder", () => {
    expect(REFERENCE_PREFIXES.customer).toBe("AF-CUS");
    expect(generateReference("AF-CUS", 5)).toMatch(
      /^AF-CUS-[0-9A-HJKMNP-TV-Z]{5}$/,
    );
  });

  it("generates statistically unique references", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) seen.add(serviceReference());
    // 32^5 space — 1000 draws should not collide in practice.
    expect(seen.size).toBe(1000);
  });
});

describe("reference validation", () => {
  it("validates references by kind and generically", () => {
    const ref = customerReference();
    expect(isValidReference(ref, "customer")).toBe(true);
    expect(isValidReference(ref, "order")).toBe(false);
    expect(isValidReference(ref)).toBe(true);
    expect(isValidReference("AF-CUS-ILOU1", "customer")).toBe(false);
    expect(isValidReference("nonsense")).toBe(false);
  });

  it("validates and parses invoice numbers", () => {
    expect(isValidInvoiceNumber("AFV-2026-000142")).toBe(true);
    expect(isValidInvoiceNumber("AFV-26-142")).toBe(false);
    expect(parseInvoiceNumber("AFV-2026-000142")).toEqual({
      year: 2026,
      sequence: 142,
    });
    expect(parseInvoiceNumber("bad")).toBeNull();
  });
});
