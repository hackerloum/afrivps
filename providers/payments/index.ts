/**
 * Payment provider package barrel (Sections 30, 67).
 *
 * Import from `@/providers/payments` so callers stay agnostic to individual
 * adapter files.
 */
export * from "./types";
export * from "./registry";
export { ManualPaymentProvider } from "./manual";
export { FlutterwaveProvider } from "./flutterwave";
export { PesapalProvider } from "./pesapal";
