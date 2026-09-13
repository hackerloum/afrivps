# AfriVPS

**Cloud Infrastructure for Africa.** A production-grade VPS / cloud hosting
reseller platform: Linux VPS, Windows VPS/RDP and hosting, sold under the
AfriVPS brand. Built on Next.js 16 (App Router, TypeScript strict), Firebase
(Auth, Firestore, Storage, Admin SDK) and Tailwind CSS + Radix.

> This repository currently implements **Phase 1** of the master build plan
> (project + Firebase architecture, auth, authorization foundation, security
> rules, public website, products/pricing from Firestore, and the customer &
> admin shells). See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the
> architecture proposal, and "Phase status" below for what is deferred.

## Project structure

```
app/
  (public)/      Marketing site: /, /vps, /windows-vps, /web-hosting, /pricing,
                 /network, /status, /about, /contact, /support, /legal/*
  (auth)/        /login, /register, /forgot-password, /reset-password, /verify-email
  (dashboard)/   Customer control panel (protected) — /dashboard/*
  (admin)/       AfriVPS Admin (staff only, verified server-side) — /admin/*
  api/session/   Session-cookie mint/clear endpoint
components/      ui/ (Radix primitives), brand/, site/, marketing/, auth/, shell/
lib/             firebase/ (client, admin, auth, permissions, errors),
                 data/ (server plan access), env.ts, money.ts, ids.ts, session.ts
providers/       infrastructure/ (manual, bearhost placeholder), payments/
services/        Application-service layer (orders, invoices, payments,
                 provisioning, infrastructure, notifications, support, audit,
                 customers) + credentials/ (secure credential vault)
schemas/         Zod form schemas
types/           Domain types (customer-safe DTO shapes)
scripts/seed.ts  Development seed (emulator only)
tests/           unit/ (money, ids) and rules/ (Firestore security rules)
firestore.rules storage.rules firestore.indexes.json
firebase.json .firebaserc .env.example .cursor/environment.json
```

## Requirements

- **Node.js 20+** (developed on Node 22).
- **pnpm** (`corepack enable pnpm` or install globally).
- **Java 11+ JRE** — required by the Firestore & Storage emulators.
  On Debian/Ubuntu: `sudo apt-get update && sudo apt-get install -y default-jre`.
- **firebase-tools** — `pnpm add -g firebase-tools` (or use `npx firebase`).

## Firebase setup

Phase 1 runs **entirely against the Firebase Emulator Suite** — no real Firebase
project is required.

1. `cp .env.example .env.local` (defaults already target the emulators with the
   demo project `demo-afrivps` and `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`).
2. Install deps: `pnpm install`.

For a **real** project later: create a Firebase project, enable
Email/Password auth, Firestore and Storage, put the Web SDK config in the
`NEXT_PUBLIC_FIREBASE_*` vars, and provide Admin SDK credentials
(`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) as
server-only secrets. Set `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false`.

## Connecting to the live Firebase project (`afri-vps`)

The live project is `afri-vps`. `.env.example` ships its **public** Web SDK
config as the example values, so `cp .env.example .env.local` already points the
browser SDK at `afri-vps`. `.env.local` is gitignored and is where local secrets
live.

### 1. Public Web SDK config (safe to expose)

The entire Firebase **Web** config — including `apiKey` — is public by design.
It identifies the project and is safe in the client bundle / `NEXT_PUBLIC_*`
(master spec Section 62). These are the `afri-vps` values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDd4EtPc4kJr_BMrn0t-RDi4R5xoWVaOjM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=afri-vps.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=afri-vps
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=afri-vps.firebasestorage.app  # new-style bucket domain
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=188021762578
NEXT_PUBLIC_FIREBASE_APP_ID=1:188021762578:web:4add113a7a01554d0046cb
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-JV6Q33R6L1   # optional — enables Analytics in the browser
```

`NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` is optional. When set, Firebase Analytics
initializes lazily in the browser only (never during SSR, never in emulator
mode, and only when `isSupported()` is true). Leave it unset to disable
analytics.

### 2. Server-only Admin SDK credentials (SECRET — never commit)

Server-side features (session cookies, `/api/session`, admin verification,
custom claims, any Admin SDK Firestore/Storage access) require a **service
account**. The private key is a secret and must **never** be committed or put in
a `NEXT_PUBLIC_*` variable. Provide it via Cursor Secrets (or your deployment
env / `.env.local`):

```bash
FIREBASE_PROJECT_ID=afri-vps
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@afri-vps.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Generate these in the Firebase console: **Project settings → Service accounts →
Generate new private key**. Paste the key with literal `\n` newlines inside
double quotes.

Without the Admin service-account key, login/session/admin/server features will
not work against the live project, though the **public web SDK** (client auth,
analytics) still works.

### 3. Switch off the emulators

Emulator mode stays the default for local dev. To target the live project set:

```bash
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
```

Env validation then **requires** the three Admin vars above and fails with a
clear message listing any that are missing.

### 4. Firebase console + deploy steps (project `afri-vps`)

Before the live project is usable, in the Firebase console:

1. **Authentication → Sign-in method:** enable **Email/Password**.
2. **Firestore Database:** create the database in **Native mode**.
3. **Storage:** enable Cloud Storage.

Then deploy the rules and indexes from this repo to `afri-vps`:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage --project afri-vps
```

`.firebaserc` keeps `demo-afrivps` as the default (so the emulator suite and
`pnpm test:emulated` keep working) and adds an `afri-vps` alias for the commands
above (`--project afri-vps`).

## Firebase Emulator setup

The emulators are configured in `firebase.json` (Auth `9099`, Firestore `8080`,
Storage `9199`, UI `4000`).

```bash
pnpm emulators        # start Auth + Firestore + Storage (+ UI on :4000)
```

## Running development

Open two terminals (or use the documented commands / `.cursor/environment.json`):

```bash
# terminal 1 — emulators
pnpm emulators

# terminal 2 — seed demo data, then start Next.js
pnpm seed             # requires emulators running
pnpm dev              # http://localhost:3000
```

Alternatively seed inside a one-shot emulator run:

```bash
pnpm seed:emulated
```

### Development accounts (emulator only)

`pnpm seed` creates DEV accounts (never valid in production):

- **super_admin** — `admin@afrivps.dev` / `AfriVPS-dev-admin-1`
- **customer** — `customer@afrivps.dev` / `AfriVPS-dev-customer-1`

## Products & pricing

Plans, locations and operating systems are stored in **Firestore** and are never
hardcoded in components. The public `/pricing`, `/vps` and `/windows-vps` pages
load active plans server-side (customer-safe fields only). Provider cost lives in
the server-only `providerProducts` collection and is never sent to customers.

## Firestore indexes

Composite indexes are declared in `firestore.indexes.json`. Deploy to a real
project with:

```bash
firebase deploy --only firestore:indexes
```

## Security Rules deployment

```bash
firebase deploy --only firestore:rules      # firestore.rules
firebase deploy --only storage              # storage.rules
```

Rules are covered by emulator tests (see Testing).

## Testing

```bash
pnpm typecheck        # tsc --noEmit (strict)
pnpm lint             # eslint
pnpm test             # unit tests (money, ids)
pnpm test:rules       # Firestore security-rules tests inside the emulators
pnpm test:emulated    # all tests inside the emulators
```

The security-rules tests (`tests/rules/firestore.test.ts`) verify the Section 70
cases: cross-customer isolation, customers cannot flip invoice/service state or
edit provider cost/config, support cannot change super_admin roles, and
unauthenticated access is denied.

## Building

```bash
pnpm build            # next build (production)
pnpm start            # serve the production build
```

## Deployment

Designed for Vercel. Provide the `NEXT_PUBLIC_FIREBASE_*` values and the
server-only Admin credentials as environment variables / secrets, set
`NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false`, and deploy Firestore/Storage rules
and indexes with the Firebase CLI.

## Admin role creation & custom claims

Staff roles (`super_admin`, `admin`, `support`, `finance`) are Firebase **custom
claims**, never stored in client-writable data. The seed script grants
`super_admin` to the dev admin. In production, claims are set server-side via the
Admin SDK; only `super_admin` may change staff roles (Section 42). The
permission mapping lives in `lib/firebase/permissions.ts`.

## Provider architecture

`providers/infrastructure` exposes a provider-agnostic `InfrastructureProvider`
interface. `ManualProvider` works at launch (operators complete provisioning);
`BearHostProvider` is a **safe placeholder** with no invented endpoints — it
throws until official BearHost API docs are available. The upstream provider is
never shown to customers.

## Payment architecture

`providers/payments` exposes a `PaymentProvider` interface. `ManualPaymentProvider`
(Mobile Money / Bank Transfer / admin confirmation) is present and never
auto-confirms — payments are verified server-side. `Flutterwave` and `Pesapal`
adapters are disabled placeholders.

## Application services

`services/` centralizes business state transitions so Firestore mutations never
scatter across pages/components (Sections 64, 65). Each domain has a typed
contract: `OrderService`, `InvoiceService`, `PaymentService`,
`ProvisioningService`, `InfrastructureService`, `NotificationService`,
`SupportService`, `AuditService`, `CustomerService`. Phase 1 ships the
interfaces and the parts genuinely available today — `PaymentService` and
`InfrastructureService` delegate to the provider registries, and
`computeInvoiceTotals` performs money-safe (integer minor-unit) totals.
Persistence-bound methods throw `ServiceNotImplementedError` until their phase,
so "not yet implemented" is explicit rather than faked.

## Server credential security

Server login credentials are extremely sensitive and are never stored in
customer-accessible documents, audit logs, or notifications (Section 21).
`services/credentials/vault.ts` defines the `CredentialVault` contract, but the
default `DisabledCredentialVault` stores/reveals nothing and throws
`CredentialStorageUnavailableError`. Production persistence stays unavailable
until a real secret-management mechanism (e.g. Cloud KMS envelope encryption or
Secret Manager) is injected via `configureCredentialVault`. Elsewhere,
credentials are referenced only by an opaque `credentialReference`.

## Phase status

- **Delivered (Phase 1):** scaffold, Firebase client/admin, env validation,
  emulators, security rules (+ tests), Firestore indexes, auth flows + session
  cookies, permission layer, provider/payment abstractions, money/id utilities,
  public website (Firestore-backed pricing), customer dashboard shell, admin
  shell, dev seed, docs.
- **Deferred (later phases):** cart/checkout, orders, invoices, manual payments,
  provisioning workflow, email/notifications, support tickets, audit logging,
  renewals, payment API + BearHost adapters, and full security hardening.
- **Unavailable until configured:** BearHost provisioning (needs official API
  docs) and encrypted **server credential persistence** (interface exists;
  production persistence is intentionally disabled until a secret-management
  mechanism is configured — Section 21).
