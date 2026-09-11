# AfriVPS — Architecture Proposal (Phase 1)

This document is the concise architecture proposal required by Section 80 of the
master build prompt. Because this build runs autonomously, the proposal is
documented here **and** implemented in Phase 1.

## 1. Next.js folder architecture

App Router with route groups that map to the three surfaces (Section 14):

```
app/
  (public)/            # marketing site + public routes (Section 15)
  (auth)/              # login, register, forgot/reset, verify-email
  (dashboard)/         # customer control panel (protected)
  (admin)/             # AfriVPS admin (staff-only, verified server-side)
  api/session/         # session-cookie mint/clear endpoint
components/
  ui/                  # shadcn/ui-style primitives (Radix based)
  brand/ site/ marketing/ auth/ shell/   # feature-scoped components
lib/
  firebase/            # client, admin, auth, permissions, errors
  data/                # server-side data access (plans, ...)
  env.ts money.ts ids.ts utils.ts session.ts
providers/
  infrastructure/      # types, manual, bearhost (placeholder), registry, barrel
  payments/            # types, manual, flutterwave/pesapal (placeholder), registry, barrel
services/              # application-service layer (Section 65)
  order/invoice/payment/provisioning/infrastructure/notification/
  support/audit/customer services + credentials/ (secure vault)
schemas/ types/ scripts/ tests/ docs/
```

Business logic lives in `lib/`, `providers/` and `services/`, never inside large
React components (Sections 64, 65). The service layer centralizes Firestore
state transitions; Phase 1 ships the typed contracts plus the provider/payment
delegations and money-safe invoice totals that are genuinely available today.

## 2. Firebase client architecture

`lib/firebase/client.ts` (`"use client"`) initializes the Web SDK with a
duplicate-init guard (`getApps().length ? getApp() : initializeApp(...)`) and
connects to the Auth/Firestore/Storage emulators exactly once when
`NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`. Only `NEXT_PUBLIC_*` config reaches
the browser.

## 3. Firebase Admin architecture

`lib/firebase/admin.ts` is marked `import "server-only"`. It reuses a single App
across hot reloads / serverless invocations, connects to emulators via the
standard `*_EMULATOR_HOST` env vars when enabled, and otherwise uses a service
account from server-only env (`FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`).
Admin credentials are never placed in `NEXT_PUBLIC_*`.

## 4. Firestore collection design

Top-level collections aligned to access patterns (Section 7): `users`,
`customers`, `staff`, `products`, `plans`, `locations`, `operatingSystems`,
`orders`, `invoices`, `payments`, `services`, `providers`, `providerProducts`
(server-only cost mapping), `provisioningJobs`, `supportTickets` (+`messages`
subcollection), `notifications`, `discountCodes`, `auditLogs`, `systemSettings`,
`paymentProviders`. Customer-owned documents carry a `customerId` field for
rule-based ownership.

## 5. Authentication flow

Firebase Auth email/password. Register → create profile doc (`role: customer`
only) → send verification email → establish server session. Login → server
session. Verified email is required before purchasing (Section 3). Google auth
can be added later without structural change.

## 6. Session strategy

The client obtains a Firebase ID token and posts it to `POST /api/session`. The
Admin SDK verifies it and mints a **Firebase session cookie** stored as
`HttpOnly`, `SameSite=Lax`, `Secure` in production, with a sensible expiry
(`SESSION_COOKIE_DAYS`, max 14). Protected layouts verify the cookie
server-side (`verifySessionCookie(cookie, true)`), so privileged rendering never
depends on browser auth state (Section 6).

## 7. Firebase Custom Claims

Staff roles (`super_admin`, `admin`, `support`, `finance`) live exclusively in
verified custom claims — never in client-writable data. Only `super_admin` may
change claims/staff records, and that path is server-only.

## 8. Firestore Security Rules

Production-grade `firestore.rules`: customers read only their own resources;
sensitive collections (orders, invoices, payments, services, provisioningJobs,
providerProducts, auditLogs) have **no client writes**; provider cost/config is
readable only by admins (support excluded); default deny. Covered by emulator
rules tests (Section 70).

## 9. Staff permission architecture

`lib/firebase/permissions.ts` maps each staff role to a capability set and
exposes `can()` / `assertCan()`. Session helpers `requireStaff()` and
`requirePermission()` gate server code. Role checks are centralized, not
scattered (Section 5).

## 10. Provider abstraction

`providers/infrastructure/types.ts` defines `InfrastructureProvider`.
`ManualProvider` is fully functional (human-completed provisioning; remote
control throws rather than faking success). `BearHostProvider` is a **safe
placeholder** — no invented endpoints or auth; every op throws
`NotImplementedError` until official docs arrive. A registry resolves providers
by code (with `describeInfrastructureProviders()` exposing honest, capability-
aware descriptors for admin UI) so nothing hardcodes BearHost (Sections 24, 66).
`InfrastructureService` wraps the registry as the application-facing entry point.

## 11. Payment abstraction

`providers/payments/types.ts` defines `PaymentProvider`.
`ManualPaymentProvider` is structurally present and never auto-confirms; staff
confirm payments server-side. `FlutterwaveProvider` / `PesapalProvider` are
disabled placeholders. Checkout stays provider-agnostic via a registry
(Sections 30, 67), and `PaymentService` delegates initialize/verify/webhook/
getTransaction to the resolved provider — payment status is confirmed
server-side and never trusted from the browser (Sections 30, 32).

## 12. Security boundaries

- Admin SDK and secrets are server-only (`server-only` import guard).
- Money is integer minor units; provider cost / margins never reach customers.
- Server credential persistence is intentionally **not implemented** — the
  `CredentialVault` interface exists in `services/credentials/vault.ts`, but the
  default `DisabledCredentialVault` throws `CredentialStorageUnavailableError`
  until a secret-management mechanism is injected via `configureCredentialVault`
  (Section 21). Credentials are referenced only by opaque `credentialReference`.
  No fake security.
- Errors returned to customers are sanitized (Section 58).
