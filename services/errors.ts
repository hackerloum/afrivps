/**
 * Shared error types for the application-service layer (Section 65).
 */

/**
 * Thrown by service methods whose full business logic is intentionally deferred
 * to a later phase. Phase 1 ships the typed contract and wiring; the persistence
 * and state-machine logic land in Phases 2–4. This makes "not yet implemented"
 * explicit and greppable rather than silently returning fake data.
 */
export class ServiceNotImplementedError extends Error {
  readonly service: string;
  readonly operation: string;
  readonly phase: string;
  constructor(service: string, operation: string, phase = "a later phase") {
    super(
      `${service}.${operation}() is not implemented in Phase 1; it is delivered in ${phase}.`,
    );
    this.name = "ServiceNotImplementedError";
    this.service = service;
    this.operation = operation;
    this.phase = phase;
  }
}
