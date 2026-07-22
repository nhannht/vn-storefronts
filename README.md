# vn-storefronts

Portfolio e-commerce demos: three Next.js storefronts sharing one Medusa v2
backend. Each storefront pairs a distinct design system with a distinct
commerce mechanic. Bilingual (vi/en), dual-region (VND/USD), receipts-first
(every claim links to a live URL).

This is a public portfolio project. It is a demo, not a real store.

## Architecture

```
        vn-storefronts (bun-workspaces monorepo)
        +--------------------------------------------+
        | backend/   Medusa v2 . Postgres . Redis    |
        |   regions: VN (VND, COD + VNPay later)     |
        |            INTL (USD, Stripe test)         |
        +----+-------------+--------------+-----------+
      sales  | + publ. key |              |
        +----+-----+  +-----+-----+  +----+------+
        | tiem-tao |  |  remart   |  |    mot    |
        | luxury   |  | dense/COD |  | editorial |
        +----------+  +-----------+  +-----------+
         3x Next.js (App Router, next-intl vi/en, Tailwind v4)
```

Storefronts land in `storefronts/*` in later phases. This phase (P0) delivers
the backend and the monorepo scaffold.

## Stack

- Backend: Medusa v2 (2.17.x), Postgres, Redis
- Storefronts: Next.js (App Router), next-intl, Tailwind v4 (planned)
- Package manager: bun (workspaces). Do not use npm, yarn, or pnpm.

## Prerequisites (dev, macOS, no docker)

- Postgres 17 and Redis, running locally, bound to localhost only:
  ```
  brew install postgresql@17 redis
  brew services start postgresql@17
  brew services start redis
  ```
- bun (https://bun.sh)
- Node 24 for the backend. Medusa v2 supports Node 20 through 24. The dev
  machine may run a newer Node (for example Node 26) that Medusa v2 does not
  support, so the backend pins Node 24 via `backend/mise.toml` (mise):
  ```
  brew install mise
  mise install node@24
  ```
  With mise activated in your shell, commands run inside `backend/` use Node 24
  automatically. Without shell activation, prefix commands with
  `mise exec node@24 --`.

## Setup

1. Install dependencies at the repo root (wires the bun workspaces):
   ```
   bun install
   ```
2. Configure the backend env. Copy the example and fill in real values:
   ```
   cp backend/.env.example backend/.env
   ```
   `backend/.env` is gitignored. Never commit real secrets.
3. Create the database and run migrations:
   ```
   createdb vn_storefronts
   cd backend
   mise exec node@24 -- bunx medusa db:migrate
   ```
4. Create an admin user:
   ```
   cd backend
   mise exec node@24 -- bunx medusa user -e you@example.com -p your-password
   ```

## Run the backend

```
cd backend
mise exec node@24 -- bun run dev
```

- Admin dashboard: http://localhost:9000/app
- Health check: http://localhost:9000/health (returns 200)
- Store API: http://localhost:9000/store (requires a publishable API key)

## Layout

```
vn-storefronts/
  backend/          Medusa v2 backend (this phase)
  storefronts/      Next.js storefronts (later phases)
  package.json      bun workspaces: ["backend", "storefronts/*"]
```
