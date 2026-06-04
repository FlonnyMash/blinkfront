# Deployment Guide

This document describes how to configure domain-agnostic publishing for generated sites via the Vercel REST API.

## Prerequisites checklist

1. **Purchase a domain** and add it to your Vercel account or team.
2. **Configure wildcard DNS** so tenant subdomains resolve to Vercel:
   - Add a DNS record: `*.yourdomain.com` → Vercel (follow [Vercel custom domain docs](https://vercel.com/docs/domains)).
3. **Create a separate Vercel project** for published tenant sites — do **not** reuse your Next.js builder project. The builder runs `npm install` / `npm run build`; file-only API uploads have no `package.json` and will fail with `Command "npm install" exited with 254`. Create a static project (no framework) in the Vercel dashboard, or use the API with `"framework": null`.
4. **Generate a Vercel access token** with deployment permissions from [Vercel Account Settings → Tokens](https://vercel.com/account/tokens).
5. **Set environment variables** on the builder Next.js project (see below).
6. **Redeploy the builder app** after changing environment variables.

## Environment variables

Copy `.env.example` to `.env.local` for local development, and configure the same variables in your Vercel project settings for production.

| Variable | Required | Description |
|----------|----------|-------------|
| `VERCEL_TOKEN` | Yes | Bearer token for Vercel REST API |
| `PUBLISH_VERCEL_PROJECT_ID` | Yes | Target static project ID for tenant deployments. Do **not** use `VERCEL_PROJECT_ID` — on Vercel that name is reserved for the builder app itself. |
| `VERCEL_TEAM_ID` | No | Team ID when deploying under a Vercel team |
| `DEPLOYMENT_DOMAIN` | Yes | Base domain for published sites (e.g. `yourdomain.com`) |
| `NEXT_PUBLIC_DEPLOYMENT_DOMAIN` | Yes | Same value as `DEPLOYMENT_DOMAIN`; used only for UI subdomain preview |
| `NEXT_PUBLIC_APP_URL` | Yes (lead capture) | Absolute URL of this builder app (e.g. `https://your-builder.vercel.app`). Baked into published static HTML so tenant sites can `POST` to `/api/leads`. |
| `DATABASE_URL` | Yes (lead capture) | PostgreSQL connection in **`.env.local`**. Use `npm run db:push` (loads `.env.local` for Prisma). |
| `OPENAI_API_KEY` | Yes | Required for AI site generation (existing feature) |

Published sites are served at:

```
https://{subdomain}.${DEPLOYMENT_DOMAIN}
```

Example: if `DEPLOYMENT_DOMAIN=yourdomain.com` (verified on the **publish** project) and the user publishes with subdomain `my-awesome-site`, the live URL is `https://my-awesome-site.yourdomain.com`.

Without a verified custom domain, published sites use their unique Vercel deployment URL (e.g. `https://blinkfront-published-sites-abc123-flonnymashs-projects.vercel.app`). Do **not** use another project's default `*.vercel.app` domain here — subdomains like `slug.blinkfront-five.vercel.app` will not have valid SSL.

## How publishing works

1. The dashboard sends the current `Website` JSON and subdomain slug to `POST /api/publish`.
2. The API renders static `index.html` and `style.css` from the existing block components.
3. `lib/deploy/vercel.ts` uploads both files to the Vercel REST API (with `encoding: "base64"`) and assigns a production alias.
4. The UI polls deployment status until the site is ready, then shows the live URL.
5. A `Site` row is upserted before deploy so `siteId` can be embedded in CTA/Hero lead forms; submissions go to `POST /api/leads` (CORS-enabled for static tenant origins).
6. Published HTML uses **plain `<form>` / `<input>` / `<button>` markup** plus an inlined vanilla script (`lib/deploy/lead-capture-script.ts`) — no React hydration on tenant sites. Set `NEXT_PUBLIC_APP_URL` to your builder’s public origin **before** publishing so `data-api-url` in the static HTML is correct.

After schema changes, run `npm run db:push` and `npm run db:generate`. After lead-form style changes, run `npm run build:publish-css` (included in `npm run build`).

### Base64 publish payload

If your generator emits Base64-encoded assets instead of `Website` JSON, POST:

```json
{
  "encodedHtml": "<base64 or data:text/html;base64,...>",
  "encodedCss": "<base64 or data:text/css;base64,...>",
  "subdomain": "my-site"
}
```

The API decodes both files server-side, deploys them, and responds with `{ success, url, deploymentId }` only — never the raw HTML/CSS.

**Important:** Each inlined file in the Vercel deployments API must include `"encoding": "base64"`. Without it, Vercel serves the Base64 string literally in the browser instead of decoding it to HTML.

## Local development notes

- Run `npm run build:publish-css` to generate `lib/deploy/site.css` before testing publish locally.
- The full `npm run build` command runs CSS generation automatically.
- Publishing will fail until `VERCEL_TOKEN`, `PUBLISH_VERCEL_PROJECT_ID`, and `DEPLOYMENT_DOMAIN` are configured and the domain is verified on Vercel.
