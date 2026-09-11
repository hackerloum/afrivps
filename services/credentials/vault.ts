/**
 * Secure server-credential abstraction (Section 21).
 *
 * Server login credentials (passwords, private keys) are extremely sensitive.
 * They must NEVER be written into ordinary customer-accessible Firestore
 * documents, audit logs, notifications, analytics, or general API payloads.
 *
 * This module defines the credential-storage CONTRACT and an explicitly
 * DISABLED implementation. Production credential persistence stays unavailable
 * until a real secret-management mechanism (e.g. Cloud KMS envelope encryption,
 * Secret Manager, or an HSM-backed vault) is configured and injected via
 * `configureCredentialVault`. We do not fake security: with nothing configured,
 * every persistence/reveal call throws `CredentialStorageUnavailableError`.
 *
 * Everywhere else in the system, credentials are referenced only by an opaque
 * `credentialReference` — the raw secret material never crosses this boundary
 * except through an authorized, audited `reveal` on a configured vault.
 */

/** Raw secret material. Only ever handled inside a configured vault. */
export interface ServerCredential {
  username?: string;
  password?: string;
  privateKey?: string;
  /** Non-secret operator note (e.g. "root via console"). Never the secret. */
  hint?: string;
}

/** Opaque handle stored on service records in place of the raw credential. */
export interface StoredCredentialRef {
  credentialReference: string;
}

export interface CredentialVault {
  /**
   * Whether real credential persistence is available. `false` for the disabled
   * vault — callers must surface "unavailable" rather than storing plaintext.
   */
  readonly available: boolean;

  /** Encrypt-and-store credentials for a service, returning an opaque ref. */
  store(
    serviceId: string,
    credential: ServerCredential,
  ): Promise<StoredCredentialRef>;

  /**
   * Reveal credentials for an authorized, audited operation. This is a
   * privileged server-only path and MUST be gated by permission checks and
   * audit logging at the call site.
   */
  reveal(ref: StoredCredentialRef): Promise<ServerCredential>;

  /** Replace stored credentials (e.g. after a password reset). */
  rotate(
    ref: StoredCredentialRef,
    credential: ServerCredential,
  ): Promise<StoredCredentialRef>;

  /** Permanently remove stored credentials (e.g. on service termination). */
  revoke(ref: StoredCredentialRef): Promise<void>;
}

export class CredentialStorageUnavailableError extends Error {
  readonly operation: string;
  constructor(operation: string) {
    super(
      `Secure credential storage is unavailable: "${operation}" cannot run until a secret-management mechanism is configured (Section 21). Plaintext credential storage is intentionally not permitted.`,
    );
    this.name = "CredentialStorageUnavailableError";
    this.operation = operation;
  }
}

/**
 * The default vault. It stores NOTHING and reveals NOTHING — it exists so the
 * rest of the codebase can depend on the interface today while honestly
 * reporting that secure persistence is not yet configured.
 */
export class DisabledCredentialVault implements CredentialVault {
  readonly available = false;

  private unavailable(operation: string): never {
    throw new CredentialStorageUnavailableError(operation);
  }

  async store(): Promise<StoredCredentialRef> {
    this.unavailable("store");
  }
  async reveal(): Promise<ServerCredential> {
    this.unavailable("reveal");
  }
  async rotate(): Promise<StoredCredentialRef> {
    this.unavailable("rotate");
  }
  async revoke(): Promise<void> {
    this.unavailable("revoke");
  }
}

let configuredVault: CredentialVault | null = null;

/**
 * Inject a real, secret-management-backed vault. Left uncalled in Phase 1, so
 * `getCredentialVault()` returns the disabled vault.
 */
export function configureCredentialVault(vault: CredentialVault): void {
  configuredVault = vault;
}

/** Resolve the active credential vault (disabled until one is configured). */
export function getCredentialVault(): CredentialVault {
  return configuredVault ?? new DisabledCredentialVault();
}

/** Convenience predicate for callers/UI to check availability honestly. */
export function isCredentialStorageAvailable(): boolean {
  return getCredentialVault().available;
}
