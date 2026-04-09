# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it **privately**. Do not open a public issue.

1. Go to the [Security tab](../../security/advisories) of this repository
2. Click **"Report a vulnerability"**
3. Describe the issue in detail, including:
   - What the vulnerability is
   - How to reproduce it
   - The potential impact

You will receive a response acknowledging receipt within 48 hours, and a follow-up with next steps within 7 days.

If GitHub Security Advisories are not enabled, you may email the maintainer directly (contact available via the repository profile).

## What to Expect

- **Valid reports** will be acknowledged, investigated, and fixed before public disclosure
- **Security patches** will be released as soon as possible, with credit to the reporter if desired
- **Responsible disclosure** means keeping the vulnerability private until a fix is available

## Supported Versions

Only the `main` branch (latest production release) receives security fixes. The `develop` branch may contain experimental code that has not been hardened.

## Security Practices

This project employs the following security measures:

| Measure | Description |
|---------|-------------|
| **Clerk JWT verification** | Convex backend validates Clerk-issued JWT tokens with signature verification |
| **Webhook signature validation** | All Clerk webhooks are verified using Svix HMAC signature validation |
| **Credential encryption** | Integration credentials (Telegram, WhatsApp, etc.) are encrypted at rest using `ENCRYPTION_KEY` |
| **Multi-tenant isolation** | Data is scoped to `orgId` and `projectId` with ownership assertions on write operations |
| **CSP headers** | Content Security Policy configured via `vercel.json` with explicit trusted domains |
| **Security headers** | X-Frame-Options, X-Content-Type-Options, HSTS, and Permissions-Policy enforced |
| **Rate limiting** | AI endpoint rate limiting via `@convex-dev/rate-limiter` |

## What Not to Report

The following are **not** considered security vulnerabilities:

- Bugs in dependencies (report those to the upstream project)
- Issues that only affect users who have misconfigured their environment
- Spam or abuse reports (contact the hosting provider directly)
