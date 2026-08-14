## Decisions

- [2026-08-14] Product scope: rental-property chatbot that interviews users, finds matches, and automates viewing outreach (voice/email/WhatsApp).
- [2026-08-14] Stack: Next.js 14 App Router + Tailwind CSS, deployed to Vercel.
- [2026-08-14] SIE chat completions and embeddings are now live via `lib/sie.ts` using Qwen models on Superlinked.
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
- Vercel deploy succeeded; project is aliased to `https://hackathonqwen.vercel.app` and connected to GitHub.
- Landing images generated with Alibaba `qwen-image-3.0` (script `scripts/gen-images.mjs`, output `public/generated/`).
- Voice calling is LIVE: Twilio (trial) dials, Qwen3-TTS makes the voice. Trial accounts require the `Url` param (inline `Twiml` is blocked), so we host `/api/voice/twiml` which plays the OSS WAV. Verified real call to +44 7402184536 (completed, 6s).
- Twilio from number: +447460041934. Env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, DEMO_CALL_TO, APP_BASE_URL — all in Vercel + .env.local.
- Alibaba can only call registered businesses, so Twilio is the dialer.

## Open Questions

- Do we have real API keys for Twilio/WhatsApp/SendGrid, or should outreach remain simulated?
- Should we record the 2-minute demo video now, or polish the chat/dashboard interactions first?
- What social platform and handle should we use for the social media track post?
- Should we add a small floating chat widget on the landing page (like Tera’s Jasmine)?
