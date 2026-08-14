# Agent Operating Manual — hackathon_qwen

## Project Context

Hackathon project for the Qwen/Superlinked/Alibaba Cloud hackathon. Building RentalFinder AI: a rental-property chatbot that interviews users, finds matches, and automates outreach to landlords (voice/email/WhatsApp) with a live dashboard.

## Tech Stack

- **Frontend:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes (mocked for demo)
- **Deployment:** Vercel
- **AI/Routing:** Superlinked Inference Engine (SIE) — mocked for demo, integration seams explicit
- **Cloud offload:** Alibaba Cloud — mocked for demo

## Build & Run

```bash
bun install
bun run dev      # localhost:3000
bun run build    # production build
bun run lint     # eslint
```

## Project Structure

```
app/              # Next.js App Router pages and API routes
components/       # React components
lib/              # Types, mock data, utilities
public/           # Static assets
PRODUCT.md        # Product brief
DESIGN.md         # Visual design system
```

## Routes

- `/` — Marketing landing page (Tera-inspired, green palette)
- `/demo` — Interactive chat + dashboard demo

## Design System

See `DESIGN.md`. Key notes:
- Primary brand color is green (OKLCH), replacing Tera’s purple.
- Restrained palette: pure white background, green for actions/status, warm sand for small accents.
- Font: Inter / system-ui stack.

## Skill Routing

When the user's request matches an available skill, invoke it via the Skill tool. Key routes:

- Product ideas / brainstorming → `/office-hours`
- Architecture review before coding → `/plan-eng-review`
- Design system / brand guidelines → `/design-consultation` or `/impeccable`
- Visual QA / polish → `/design-review`
- QA test and fix → `/qa`
- Ship / create PR → `/ship`
- Generate docs → `/document-generate`

## Autonomous Building Notes

- Read `.claude/memory.md` before touching code.
- Read `tasks/state.json` to locate the current stage.
- Each stage must pass its verify blocks before marking complete.
- Prefer small, focused files. Keep chat and dashboard components separate.
- Mock external APIs unless real keys are provided.
