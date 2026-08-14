# Design

## Direction

Tera Business Finance landing-page structure: confident headline, clear CTA, isometric-style hero visual, minimal nav, and a small chat widget. Green replaces purple as the brand color to match RentalFinder AI’s friendly, fresh identity.

## Color

Primary brand color: green. Strategy: Restrained product default with a committed green accent for CTAs and success states.

```css
:root {
  --color-bg: oklch(1.000 0.000 0);                 /* pure white */
  --color-surface: oklch(0.985 0.003 220);          /* barely cool off-white for panels */
  --color-ink: oklch(0.150 0.020 220);              /* deep cool grey */
  --color-muted: oklch(0.500 0.015 220);            /* secondary text */
  --color-primary: oklch(0.520 0.170 145);          /* confident forest green */
  --color-primary-hover: oklch(0.440 0.180 145);    /* deeper green */
  --color-primary-subtle: oklch(0.950 0.035 145);   /* light green tint */
  --color-accent: oklch(0.700 0.100 85);            /* warm sand for small highlights */
  --color-success: oklch(0.600 0.150 145);          /* viewing booked */
  --color-warning: oklch(0.700 0.130 85);           /* pending landlord */
  --color-error: oklch(0.550 0.180 25);             /* failed outreach */
}
```

## Typography

One sans family, clean and trustworthy.

```css
:root {
  --font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "SF Mono", ui-monospace, monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 2rem;
  --text-4xl: 2.5rem;
  --text-5xl: 3.5rem;
  --text-6xl: 5rem;

  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  --leading-tight: 1.1;
  --leading-snug: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}
```

## Spacing

8px base grid.

```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;
}
```

## Layout

### Landing page
- Sticky top nav: logo left, nav center, CTA right.
- Hero: 2-column grid (55% text / 45% visual) on desktop; stacked on mobile.
- Max content width: 1280px.
- Generous vertical padding: 80–120px.

### Demo
- Split-pane chat + dashboard on desktop.
- Tabbed view on mobile.

## Components

### Landing
- **Eyebrow:** uppercase, wide tracking, muted color.
- **Headline:** large display sans, tight leading.
- **Script accent:** optional italic serif for the emotional phrase (keep it green, not purple).
- **Primary CTA:** dark green button with white text, rounded-full.
- **Secondary link:** text link with arrow.
- **Chat bubble widget:** bottom-right floating pill.

### Chat
- User message: green primary button color, white text, right-aligned.
- Bot message: `--color-primary-subtle` background, left-aligned, green dot avatar.
- Quick-reply chips: outlined buttons.
- Typing indicator: three dots pulsing.

### Dashboard
- Funnel cards: Matches → Outreach → Viewings.
- Property row: image placeholder, title, price, badges.
- Timeline: outreach steps with status icons.
- Status pills: success/warning/error/neutral.

## Motion

150–250ms ease-out-quart on state changes. Reduced-motion fallback to instant or crossfade.

## Accessibility

WCAG 2.1 AA. Visible focus rings, readable contrast, semantic headings, ARIA labels.
