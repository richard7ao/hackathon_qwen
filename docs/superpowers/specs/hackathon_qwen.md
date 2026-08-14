# hackathon_qwen — Spec

## T1 — Marketing Landing Page + Demo App

**Description:** Build a public-facing landing page that explains the rental-viewing problem to hackathon judges, plus an interactive demo where users can try the chatbot and watch the dashboard update in real time.

### T1.1 — Design System & Assets

**Description:** Lock the visual direction and create shared assets before building pages.

#### T1.1.1 — Color Strategy Update

**Description:** Replace teal with green as the primary brand color. Update DESIGN.md and Tailwind config.
**Requires:** none

**Verify:**

```bash
# tier1_build
grep -q "oklch.*145\|green" DESIGN.md tailwind.config.ts && bun run build
```

```bash
# tier2_simplify
# Run /simplify on DESIGN.md tailwind.config.ts
```

```bash
# tier3_unit
# N/A — config-only stage; build is the behavior check
```

```bash
# tier4_integration
# N/A — no integration surface
```

#### T1.1.2 — Hero Visual Asset

**Description:** Create or source a hero illustration/abstract visual for the landing page that fits the green rental/assistant theme.
**Requires:** T1.1.1

**Verify:**

```bash
# tier1_build
test -f public/hero-visual.svg || test -f public/hero-visual.png
```

```bash
# tier2_simplify
# Run /simplify on generated asset files
```

```bash
# tier3_unit
# N/A
```

```bash
# tier4_integration
# N/A
```

### T1.2 — Landing Page

**Description:** Build the `/` route: a Tera-style marketing page with problem statement, how it works, and a CTA to `/demo`.

#### T1.2.1 — Hero Section

**Description:** Top nav + hero with headline, subheadline, primary CTA to demo, and hero visual.
**Requires:** T1.1.1, T1.1.2

**Verify:**

```bash
# tier1_build
bun run build
```

```bash
# tier2_simplify
# Run /simplify on app/page.tsx app/layout.tsx components/landing/*
```

```bash
# tier3_unit
# Screenshot landing page and verify hero CTA links to /demo
```

```bash
# tier4_integration
# N/A — static page
```

#### T1.2.2 — Problem + How It Works Sections

**Description:** Sections explaining the rental-viewing pain point and the three-step product flow.
**Requires:** T1.2.1

**Verify:**

```bash
# tier1_build
bun run build
```

```bash
# tier2_simplify
# Run /simplify on landing section files
```

```bash
# tier3_unit
# Verify sections render at mobile and desktop breakpoints via screenshot
```

```bash
# tier4_integration
# N/A
```

### T1.3 — Demo App

**Description:** Build the `/demo` route: chatbot questionnaire + live dashboard showing matches, outreach, and viewings.

#### T1.3.1 — Chat Flow

**Description:** Interview flow in the chat panel (location, budget, bedrooms, move-in, must-haves) with quick-reply chips.
**Requires:** T1.1.1

**Verify:**

```bash
# tier1_build
bun run build
```

```bash
# tier2_simplify
# Run /simplify on components/chat.tsx and app/api/chat/route.ts
```

```bash
# tier3_unit
# curl -X POST http://localhost:3000/api/chat -d '{"message":"San Francisco","history":[]}' | grep -q "budget"
```

```bash
# tier4_integration
# Run demo in browser; complete chat and confirm dashboard updates
```

#### T1.3.2 — Dashboard Panel

**Description:** Display matches, outreach timeline, and confirmed viewings in the dashboard.
**Requires:** T1.3.1

**Verify:**

```bash
# tier1_build
bun run build
```

```bash
# tier2_simplify
# Run /simplify on components/dashboard.tsx
```

```bash
# tier3_unit
# Complete chat flow and verify dashboard shows properties and outreach
```

```bash
# tier4_integration
# Verify responsive layout at desktop and mobile viewports
```

### T1.4 — Polish & Deploy

**Description:** Final visual pass, lint/build verification, and Vercel deployment.

#### T1.4.1 — Final Build & Lint

**Description:** Ensure `bun run build` and `bun run lint` pass.
**Requires:** T1.2.2, T1.3.2

**Verify:**

```bash
# tier1_build
bun run build && bun run lint
```

```bash
# tier2_simplify
# Run /simplify on all changed files
```

```bash
# tier3_unit
# N/A
```

```bash
# tier4_integration
# N/A
```

#### T1.4.2 — Vercel Deploy

**Description:** Push to GitHub and deploy to Vercel. Capture live URL.
**Requires:** T1.4.1

**Verify:**

```bash
# tier1_build
# N/A — deploy stage
```

```bash
# tier2_simplify
# N/A
```

```bash
# tier3_unit
# N/A
```

```bash
# tier4_integration
# curl -f https://<deployed-url>/ && curl -f https://<deployed-url>/demo
```
