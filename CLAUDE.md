# Project Context
This is the Cloudsmith Onboarding Hub, built with Next.js 15 (App Router) and Tailwind CSS.
The frontend UI migration is complete. We are now focusing on backend integration, security, and infrastructure.

## Architecture Rules
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Components:** Server Components by default; use `'use client'` ONLY when React state/hooks are required.
- **API Routes:** Use Next.js Route Handlers (`/app/api/...`) for all backend logic.
- **Dependencies:** All npm packages MUST be pulled through the internal Cloudsmith dependency firewall.

## Hard Rules
- **Security:** NEVER expose API keys (Anthropic, Okta, Database) in client-side code. All third-party API calls must be proxied through our Next.js backend.
- **Step-by-Step:** Do not execute massive architectural changes at once. Write code incrementally and test frequently.