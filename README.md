# GenX Digital

Domain, hosting, SSL and email reseller storefront for **genxdigital.com.au**,
powered by the [Dreamscape Reseller REST API](https://doc-reseller-api.ds.network/).

Customers search and buy domains, hosting, SSL certificates and business email.
A flagship **AI website builder** (enter your domain → we build and email you a
fresh site) is planned as a dedicated phase.

## Architecture

| Layer | Technology |
|-------|------------|
| Frontend + Backend | Next.js (App Router) + TypeScript + Tailwind CSS |
| Hosting | Vercel |
| Database + Auth | Supabase (Postgres) |
| Payments | Stripe *(deferred — clean seam already in place)* |
| Reseller backend | Dreamscape Reseller REST API (sandbox first) |

### Security model — read this first

The Dreamscape API authenticates with a **secret API key** and a **signed
request** (`Api-Request-Id` + `Api-Signature`, both MD5 hashes) on every call.
That key controls real money (your reseller balance), so:

- The key lives **only** in server-side environment variables (`DREAMSCAPE_API_KEY`).
- All Dreamscape calls go through `src/lib/dreamscape/*`, which is marked
  `server-only`. It is never bundled into client code.
- The browser only ever talks to our own API routes under `src/app/api/*`,
  which validate input, call Dreamscape server-side, apply retail markup, and
  return only what the customer should see.

Never add the key to a `NEXT_PUBLIC_*` variable or import the Dreamscape client
into a Client Component.

## Project layout

```
src/
  app/
    page.tsx                       Landing page + domain search
    layout.tsx                     Root layout
    api/domains/availability/      Domain availability + pricing endpoint
  components/
    DomainSearch.tsx               Client-side search box + results
  lib/
    dreamscape/
      config.ts                    Resolves env, sandbox vs production
      client.ts                    Signed request layer (server-only)
      domains.ts                   Domain availability + TLD pricing
      types.ts                     Response shapes
    pricing.ts                     Cost price -> retail price (markup)
    validation.ts                  Input validation + TLD expansion
supabase/
  migrations/0001_init.sql         Orders, order items, pricing overrides
```

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your env file:
   ```bash
   cp .env.example .env.local
   ```
3. Add your Dreamscape API key to `.env.local`
   (Reseller Console → Account Settings → API & WHMCS → API Setup).
   Keep `DREAMSCAPE_ENV=sandbox` while testing.
4. Run the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000. Without a key, domain search shows a friendly
   "not connected yet" message instead of erroring.

## Roadmap

1. **Foundation** *(this phase)* — Next.js app, secure Dreamscape client, domain
   search against sandbox, Supabase schema.
2. **Domain search & pricing** — full availability + retail pricing, cart.
3. **Hosting & SSL & email catalogue** — product plans and pages.
4. **Accounts + checkout** — Supabase auth, cart, Stripe checkout.
5. **Provisioning + orders** — place orders via Dreamscape on payment, customer
   dashboard.
6. **AI website builder** — domain → generated site → emailed link.
7. **Go-live** — production keys, connect genxdigital.com.au.

> **Sandbox vs production:** everything defaults to the Dreamscape sandbox. Going
> live is a deliberate switch of `DREAMSCAPE_ENV` to `production` with the
> production key.
