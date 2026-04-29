# Design: Design Uplift A2 + Ethical/Carbon Ads (B3)

## Technical Approach

CSS-first uplift on top of existing Astro 6 SSG: theme tokens via CSS variables driven by `data-theme` attribute on `<html>`, set by an inline script before paint to eliminate FOUC. Self-hosted variable fonts (`@fontsource-variable`). Monogram is a single `<Logo>` Astro component reused for header + favicon. View Transitions enabled globally. Tiny vanilla Web Components for reading-bar + copy-to-clipboard (no React runtime). Ads via two slot components that lazy-load network scripts on intersection. Zero new server code; all SSG.

## Architecture Decisions

| ADR | Choice | Alternatives | Rationale |
|-----|--------|--------------|-----------|
| 101 | CSS/SVG monogram | Figma logo, Midjourney | Zero asset rot, single source, faster favicon parity |
| 102 | Light + dark + system + override | Dark only | Wider audience, accessibility, low cost with CSS vars |
| 103 | View Transitions API global | Per-page, none | SPA feel without SPA cost; feature-detect fallback |
| 104 | `@fontsource-variable/*` self-host | Google Fonts CDN, system | No 3rd-party request, GDPR-clean, preload control |
| 105 | EthicalAds + Carbon Ads (B3) | AdSense (B1/B2), hybrid (B4) | Higher RPM dev audience, no cookies, preserves /privacy promise |
| 106 | Max one ad slot per page | Multi-slot | UX guardrail, perf budget |
| 107 | Tailwind v4 `@variant dark` via `data-theme` | `prefers-color-scheme` only, class strategy | Lets toggle override system pref deterministically |
| 108 | Vanilla Web Components for interactivity | React/Preact island | <2KB total JS vs ~40KB React baseline |

## Data Flow

```
Theme:
  user toggle ──► localStorage.theme ──► <html data-theme="...">
                                           │
  inline <head> script ──► reads localStorage ──► sets attribute (pre-paint)
                            │ fallback ──► matchMedia('(prefers-color-scheme: dark)')

View Transition:
  <a href> click ──► startViewTransition() ──► fetch+swap document
                       │ no support ──► plain navigation

Ad slot:
  <EthicalAdSlot> rendered (placeholder div) ──► IntersectionObserver fires (200px)
    ──► append <script src="ethicalads.min.js"> ──► slot fills (fixed dims)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | + `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono` |
| `src/styles/global.css` | Modify | Theme tokens (light + dark), `@variant dark` config, font-face imports, fluid type scale, gradient utility classes |
| `src/components/Logo.astro` | Create | SVG monogram, props `size` + `gradient` |
| `src/components/ThemeToggle.astro` | Create | Button + sun/moon SVG, calls vanilla setter |
| `src/components/Header.astro` | Create | Extracted from BaseLayout: logo + nav + theme toggle + hamburger ≤640px |
| `src/components/Footer.astro` | Create | Extracted from BaseLayout |
| `src/components/ReadingBar.astro` | Create | Web Component `<reading-bar>` (sticky 2px) |
| `src/components/CopyButton.astro` | Create | Web Component `<copy-button>` for `<pre>` blocks |
| `src/components/ads/EthicalAdSlot.astro` | Create | Lazy slot, env-gated |
| `src/components/ads/CarbonAdSlot.astro` | Create | Lazy slot, env-gated |
| `src/layouts/BaseLayout.astro` | Modify | Inline theme script, `<ViewTransitions />`, mount Header/Footer |
| `src/layouts/LandingLayout.astro` | Modify | Hero gradient mesh, Carbon slot below fold |
| `src/layouts/PostLayout.astro` | Modify | Sidebar TOC ≥1024px, ReadingBar, CopyButton injection, Ethical slot mid-article |
| `src/pages/privacy.astro` | Modify | Add ad networks + their privacy policy links |
| `src/pages/disclosure.astro` | Modify | Add EthicalAds + Carbon Ads section |
| `public/favicon.svg` | Replace | Render Logo at 32×32 viewBox |
| `public/apple-touch-icon.png` | Create | 180×180 raster of monogram (one-time export) |
| `public/site.webmanifest` | Create | PWA manifest (icons, theme_color) |
| `docs/ads-application.md` | Create | EthicalAds + Carbon Ads application checklist |
| `tests/unit/theme.test.ts` | Create | Vitest: localStorage setter logic |
| `tests/e2e/theme-toggle.spec.ts` | Create | Playwright: toggle + persistence + reduced-motion |

## Interfaces

```ts
// src/lib/theme.ts
export type Theme = 'light' | 'dark';
export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (stored === 'light' || stored === 'dark') return stored;
  return prefersDark ? 'dark' : 'light';
}
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
}
```

```astro
<!-- EthicalAdSlot.astro -->
---
const id = crypto.randomUUID();
const publisher = import.meta.env.PUBLIC_ETHICAL_PUBLISHER_ID;
---
<div
  id={id}
  class="ethical-slot min-h-[200px] my-8"
  data-ea-publisher={publisher}
  data-ea-type="text"
></div>
<script is:inline define:vars={{ id, publisher }}>
  if (publisher) new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    const s = document.createElement('script');
    s.src = 'https://media.ethicalads.io/media/client/ethicalads.min.js';
    s.async = true;
    document.head.append(s);
    o.disconnect();
  }, { rootMargin: '200px' }).observe(document.getElementById(id));
</script>
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `resolveTheme`, `applyTheme` | Vitest jsdom, mock matchMedia + localStorage |
| Unit | Logo component renders viewBox 32×32 | Vitest snapshot |
| E2E | Toggle persists across reload, FOUC-free | Playwright + screenshot diff |
| E2E | View Transitions: nav between landing → post smooth | Playwright trace |
| E2E | Ad slot stays empty in dev (no env), placeholder visible | Playwright |
| E2E | Mobile hamburger keyboard accessible | Playwright `aria-expanded` assertions |
| Perf | Lighthouse Mobile + Desktop budget | `@lhci/cli` in CI |
| Visual | Snapshot landing + post + tags at 6 viewports | Playwright `toHaveScreenshot` |

## Migration / Rollout

No data migration. Visual + additive only. Order:
1. ADR-104 fonts + ADR-107 theme tokens (foundation)
2. ADR-101 Logo + Header/Footer extraction (refactor before features)
3. ADR-102 toggle + ADR-103 View Transitions
4. ReadingBar + CopyButton + sidebar TOC
5. ADR-105/106 ad slots (env-gated, no live render until publisher IDs set)

Each step ships as standalone PR. Lighthouse CI enforces no perf regression. Feature flags unnecessary — slots stay empty until env populated.

## Open Questions

- [ ] Final Inter weight set: 400 + 600 + 800 (sugiero) vs full variable axis
- [ ] Apple-touch-icon export tooling: `resvg-cli` from SVG, or hand-export Figma
- [ ] Web manifest `theme_color`: dark `#0d1117` vs light `#fafafa` (use `meta name="theme-color"` per scheme)
