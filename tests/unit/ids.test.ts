import { describe, expect, it } from "vitest";

import {
  customerReference,
  invoiceNumber,
  orderReference,
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
});
