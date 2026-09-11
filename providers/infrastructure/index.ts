/**
 * Infrastructure provider package barrel (Sections 24, 66).
 *
 * Import from `@/providers/infrastructure` so callers never depend on a
 * specific upstream adapter file.
 */
export * from "./types";
export * from "./registry";
export { ManualProvider } from "./manual";
export { BearHostProvider, NotImplementedError } from "./bearhost";
