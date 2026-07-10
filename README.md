# RentNest API

Backend REST API for a property-rental platform connecting **tenants**, **landlords**, and **admins**. Tenants browse available properties, request rentals, and pay via Stripe; landlords list properties and approve requests; admins manage users and categories.

Built with Express 5 + TypeScript, PostgreSQL via Prisma, JWT auth, and Stripe payments.

---

## Tech stack

| Concern | Choice |
|---|---|
| Runtime / framework | Node.js, Express 5 (ES modules, TypeScript) |
| Database | PostgreSQL |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Auth | JWT (access + refresh), bcryptjs, cookie-based |
| Payments | Stripe Checkout + webhooks |
| Validation | Zod (per-route middleware) |
| Scheduling | node-cron (rental expiry job) |

---

## Project structure

```
src/
  app.ts                 # Express app: middleware + route mounting
  server.ts              # Bootstraps DB connection, server, cron jobs
  config/                # Env config
  lib/                   # prisma client, stripe client, scheduler
  middlewares/           # auth, validateRequest, globalErrorHandler, notFound
  utils/                 # catchAsync, jwt, sendResponse
  modules/
    auth/                # register, login, profiles, admin user mgmt
    category/            # property categories (admin)
    property/            # listings
    rentalRequest/       # tenant rental requests + lifecycle
    payment/             # Stripe checkout + webhook
    review/              # tenant reviews after a completed rental
prisma/
  schema/                # one .prisma file per model
  migrations/            # SQL migrations (incl. hand-written partial indexes)
```

Each module follows a `route → controller → service → interface` split.

---

## Getting started

### Prerequisites

Node.js 20+, a PostgreSQL database, and a Stripe account (for payments).

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env` and fill in:

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
PORT=5000
APP_URL=http://localhost:3000
BCRYPT_SALT_ROUNDS=10
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
STRIPE_PRODUCT_PRICE_ID=price_xxx
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Database

```bash
npx prisma migrate deploy   # apply migrations
npx prisma generate         # generate the client
```

### Run

```bash
npm run dev     # tsx watch (development)
npm run build   # tsc -> dist/
npm start       # node dist/server.js (production)
```

For local Stripe webhooks:

```bash
npm run stripe  # stripe listen --forward-to http://localhost:3000/api/payments/confirm
```

> Note: `PORT` defaults to `5000`, but the `stripe` script forwards to `:3000`. Align these to your actual server port.

---

## Conventions

### Response envelope

Every JSON response follows this shape (via `sendResponse`):

```json
{
  "success": true,
  "statusCode": 200,
  "message": "…",
  "data": { },
  "meta": { "page": 1, "limit": 10, "total": 42 }
}
```

`meta` is only present on paginated endpoints.

### Authentication

Send the access token as either an `httpOnly` cookie (`accessToken`, set automatically on login) or an `Authorization: Bearer <token>` header. Protected routes also enforce **roles** — a request with a valid token but the wrong role gets rejected. Blocked users (`activeStatus: BLOCKED`) are denied.

Roles: `TENANT` (default), `LANDLORD`, `ADMIN`.

### Errors

Errors return the standard envelope with `success: false` and an appropriate status code. Validation failures (Zod) return `400` with a per-field `errors` array. Prisma errors are mapped (e.g. `P2002` → `409 Conflict`, `P2025` → `404 Not Found`).

---

## Domain lifecycle

**Rental status:** `PENDING` → `APPROVED` → `ACTIVE` → `COMPLETED` (or `REJECTED`).

1. Tenant submits a request → `PENDING` (a pending `Payment` is created).
2. Landlord approves → `APPROVED` (or `REJECTED`).
3. Tenant pays via Stripe → webhook marks payment `COMPLETED`, rental `ACTIVE`, property `RENTED`.
4. When the rental period (`moveInDate` + `durationMonths`) passes, a daily cron job marks the rental `COMPLETED` and frees the property back to `AVAILABLE`.
5. Once `COMPLETED`, the tenant may leave one review.

**Property status:** `AVAILABLE` → `RENTED` → `AVAILABLE` (also `UNAVAILABLE`, set manually).

Integrity guarantees enforced at the DB level: at most one *open* rental request per tenant+property, and at most one *active* rental per property (both via partial unique indexes).

---

## API reference

Base URL: `http://localhost:<PORT>`
All routes are prefixed as shown. **Auth** column = required role(s); "Public" = no token needed.

### Auth — `/api/auth`

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/register` | Public | `{ name, email, password, phone, role? }` | Register a user (returns user without password). |
| POST | `/login` | Public | `{ email, password }` | Log in; sets `accessToken`/`refreshToken` cookies and returns both tokens. |
| POST | `/refresh-token` | Public (uses `refreshToken` cookie) | — | Issue a new access token. |
| GET | `/me` | TENANT, LANDLORD, ADMIN | — | Current user's profile. |
| PATCH | `/my-profile` | TENANT, LANDLORD, ADMIN | `{ name?, phone? }` | Update own name/phone. |
| GET | `/users` | ADMIN | — | List all landlords and tenants. |
| PUT | `/users/:userId` | ADMIN | `{ activeStatus: "ACTIVE" \| "BLOCKED" }` | Block/unblock a user. |

### Categories — `/api/categories`

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/` | ADMIN | `{ name }` | Create a category. |
| GET | `/` | ADMIN, LANDLORD, TENANT | — | List categories. |
| PUT | `/:categoryId` | ADMIN | `{ name }` | Rename a category. |
| DELETE | `/:categoryId` | ADMIN | — | Delete a category (blocked if in use). |

### Properties — `/api/properties`

| Method | Path | Auth | Body / Query | Description |
|---|---|---|---|---|
| POST | `/` | LANDLORD | `{ title, description, location, address, rentAmount, bedrooms, bathrooms, areaSquareFt?, amenities[], status?, categoryId }` | Create a listing. |
| GET | `/` | ADMIN | — | List all properties. |
| GET | `/my-properties` | LANDLORD | — | List the landlord's own (non-deleted) properties. |
| GET | `/available` | Public | Query params (below) | Paginated list of available properties. |
| GET | `/:propertyId` | Public | — | Get a single property. |
| PATCH | `/:propertyId` | LANDLORD | Any subset of the create body | Update own property. |
| DELETE | `/:propertyId` | LANDLORD | — | Soft-delete own property. |

**`GET /available` query params:** `searchTerm` (matches location), `minPrice`, `maxPrice`, `categoryId`, `amenities` (JSON array string, e.g. `["wifi","parking"]`), `page` (default 1), `limit` (default 10), `sortBy` (default `createdAt`), `sortOrder` (`asc`|`desc`, default `desc`). Returns `data` + `meta`.

### Rental requests — `/api/rentals`

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/:propertyId` | TENANT | `{ moveInDate, durationMonths? }` | Submit a rental request (creates a pending payment). `durationMonths` must be a whole number ≥ 1. |
| GET | `/` | ADMIN | — | List all rental requests. |
| GET | `/my-rental` | LANDLORD | — | Requests on the landlord's properties. |
| GET | `/my-request` | TENANT | — | The tenant's own requests. |
| PUT | `/:requestId/status` | LANDLORD | `{ status: "APPROVED" \| "REJECTED" \| … }` | Update a request's status (landlord must own the property). |

### Payments — `/api/payments`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/checkout/:rentalRequestId` | TENANT | Create a Stripe Checkout session; returns the payment URL. Total = monthly rent × `durationMonths`. Rejected if the property is no longer available. |
| POST | `/confirm` | Stripe (webhook) | Stripe webhook endpoint. Expects the raw body and a `stripe-signature` header. On `checkout.session.completed`, fulfills the payment and activates the rental. |

### Reviews — `/api/reviews`

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/:rentalRequestId` | TENANT | `{ rating, comment? }` | Leave one review for a completed rental. `rating` is an integer 1–5. |

### Misc

| Method | Path | Description |
|---|---|---|
| GET | `/` | Health check — returns `Hello, World!`. |

---

## Scheduled jobs

A daily cron job (00:05, `src/lib/scheduler.ts`) runs `expireOverdueRentals`: it finds `ACTIVE` rentals whose `endDate` has passed, marks them `COMPLETED`, and frees their properties to `AVAILABLE`. It is transactional and idempotent.

> If deploying to a serverless platform (e.g. Vercel), node-cron will not run — use the platform's scheduler to call an equivalent endpoint instead.

---

## Notes & limitations

- `Payment.amount` stores the **monthly** rent; the multi-month total is computed at checkout time.
- The double-booking guard flags a lost-race payment for refund (logs it) but does not yet auto-refund via Stripe.
- `getPaymentHistory` is implemented in the payment service/controller but is not currently wired to a route.
- `error: err.stack` is returned in error responses — gate this behind a non-production check before deploying.
