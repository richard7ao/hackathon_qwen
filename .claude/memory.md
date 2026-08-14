## Decisions

- [2026-08-14] Product scope: rental-property chatbot that interviews users, finds matches, and automates viewing outreach (voice/email/WhatsApp).
- [2026-08-14] Stack: Next.js 14 App Router + Tailwind CSS, deployed to Vercel.
- [2026-08-14] SIE/Alibaba Cloud integration is mocked for the demo; integration seams are explicit so real providers can be swapped in.
- [2026-08-14] Design direction: Tera Business Finance landing-page structure (hero + isometric illustration + clear CTA) with green replacing purple.
- [2026-08-14] Structure: marketing landing page (`/`) plus separate demo app (`/demo`) with chat + dashboard.

## Patterns

- Keep UI state in React hooks; server state in Next.js API route handlers.
- Use Tailwind OKLCH color tokens via CSS custom properties for consistency.
- Dashboard + chat split-pane on desktop; tabbed on mobile.
- Outreach status uses semantic color pills (pending/sent/confirmed/failed).

## Gotchas

- Next.js App Router API routes run server-side; mock responses should be deterministic for the demo.
- Tera-style hero needs a strong visual asset — if no custom illustration, use a clean abstract SVG or generated image.
- Vercel free tier has function execution limits; keep API routes simple and avoid heavy processing.
- Node 26 is installed; Next.js 14 is pinned for stability.

## Open Questions

- Do we have real API keys for Twilio/WhatsApp/SendGrid, or should outreach remain simulated?
- Should the landing page use a generated hero illustration or a simpler CSS/SVG composition?
- Does the demo need actual SIE Python integration, or is the mock routing enough for the hackathon video?
