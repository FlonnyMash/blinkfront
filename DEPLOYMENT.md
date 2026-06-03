# Deployment Guide

This document describes how to configure domain-agnostic publishing for generated sites via the Vercel REST API.

## Prerequisites checklist

1. **Purchase a domain** and add it to your Vercel account or team.
2. **Configure wildcard DNS** so tenant subdomains resolve to Vercel:
   - Add a DNS record: `*.yourdomain.com` → Vercel (follow [Vercel custom domain docs](https://vercel.com/docs/domains)).
3. **Create a Vercel project** for published tenant sites (recommended: separate from the builder app).
4. **Generate a Vercel access token** with deployment permissions from [Vercel Account Settings → Tokens](https://vercel.com/account/tokens).
5. **Set environment variables** on the builder Next.js project (see below).
6. **Redeploy the builder app** after changing environment variables.

## Environment variables

Copy `.env.example` to `.env.local` for local development, and configure the same variables in your Vercel project settings for production.

| Variable | Required | Description |
|----------|----------|-------------|
| `VERCEL_TOKEN` | Yes | Bearer token for Vercel REST API |
| `VERCEL_PROJECT_ID` | Yes | Target project ID for tenant static deployments |
| `VERCEL_TEAM_ID` | No | Team ID when deploying under a Vercel team |
| `DEPLOYMENT_DOMAIN` | Yes | Base domain for published sites (e.g. `yourdomain.com`) |
| `NEXT_PUBLIC_DEPLOYMENT_DOMAIN` | Yes | Same value as `DEPLOYMENT_DOMAIN`; used only for UI subdomain preview |
| `OPENAI_API_KEY` | Yes | Required for AI site generation (existing feature) |

Published sites are served at:

```
https://{subdomain}.${DEPLOYMENT_DOMAIN}
```

Example: if `DEPLOYMENT_DOMAIN=yourdomain.com` and the user publishes with subdomain `my-awesome-site`, the live URL is `https://my-awesome-site.yourdomain.com`.

## How publishing works

1. The dashboard sends the current `Website` JSON and subdomain slug to `POST /api/publish`.
2. The API renders static `index.html` and `style.css` from the existing block components.
3. `lib/deploy/vercel.ts` uploads both files to the Vercel REST API and assigns a production alias.
4. The UI polls deployment status until the site is ready, then shows the live URL.

## Local development notes

- Run `npm run build:publish-css` to generate `lib/deploy/site.css` before testing publish locally.
- The full `npm run build` command runs CSS generation automatically.
- Publishing will fail until `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, and `DEPLOYMENT_DOMAIN` are configured and the domain is verified on Vercel.
