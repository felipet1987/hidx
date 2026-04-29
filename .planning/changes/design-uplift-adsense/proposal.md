# Proposal: Design Uplift A2 + Ethical/Carbon Ads (B3)

**Project**: `hidx` · **Date**: 2026-04-29 · **Phase**: sdd-propose · **Change**: `design-uplift-adsense` · **Status**: Draft v1

## Intent

Upgrade hidx visual identity from generic Tailwind starter to **premium dev-magazine aesthetic**, and wire the dev-friendly ad network track (EthicalAds + Carbon Ads). NO Google AdSense (rejected, see exploration §B). Goal: signal craft to dev audience and establish privacy-preserving monetization track BEFORE pillar content launches.

## Scope

### IN scope (Sprint S2.5 — wedged between content + verification)

#### Design uplift A2

1. **Typography stack**
   - `@fontsource-variable/inter` (sans) + `@fontsource-variable/jetbrains-mono` (mono) self-hosted, no Google Fonts CDN call
   - Preload subset, `font-display: swap` + `size-adjust` to neutralize CLS
   - Fluid typographic scale via `clamp()` (12 → 64px)
2. **Theme tokens**
   - Light + dark color variables in `:root` and `[data-theme="dark"]`
   - System default + user override stored in `localStorage.theme`
   - Inline `is:inline` script in `<head>` to set `data-theme` BEFORE first paint (no FOUC)
3. **Theme toggle**
   - `<ThemeToggle>` component, accessible button (sun/moon SVG inline)
   - Header right slot
4. **Monogram logo (CSS-only)**
   - `<Logo>` component renders "h" inside a 32×32 rounded square gradient (cyan → violet)
   - Hover: gradient angle animates
   - Used in Header + favicon SVG (single source via `<Logo size>`)
5. **Hero rebuild (LandingLayout)**
   - Gradient mesh background (radial-gradient layers)
   - Larger fluid display type for "how i do x"
   - Subtle marquee of pillar topic tags below tagline
   - Scroll-driven reveal on first viewport (CSS `@scroll-timeline` if supported, fallback static)
6. **Card polish**
   - Featured post cards: subtle inner glow on hover, gradient border, larger touch targets
   - Tag pills with consistent shape
7. **PostLayout polish**
   - Sticky reading progress bar (top, 2px)
   - Sidebar TOC at viewport ≥ 1024px (vs inline now)
   - Copy-to-clipboard button on every code block (Web Component, lazy)
   - Wider prose container (max-w-prose tuned), better line-height (1.7)
   - Section divider rules (gradient hr)
8. **Micro-interactions**
   - View Transitions API enabled (`<ViewTransitions />` in BaseLayout) — SPA-feel route changes
   - Reduced-motion respected (`@media (prefers-reduced-motion)`)
9. **Mobile**
   - Test viewport 320, 375, 414, 768, 1024, 1440, 1920
   - Header collapses to hamburger <640px
10. **Branding assets**
    - Favicon SVG (logo monogram), favicon.ico fallback, `apple-touch-icon.png` 180×180
    - Web manifest (`site.webmanifest`)

#### Monetization B3 (Ethical/Carbon Ads track)

11. **`<EthicalAdSlot>`** component
    - Lazy-loaded via IntersectionObserver
    - Fixed dimensions (no CLS)
    - Uses EthicalAds publisher script when `PUBLIC_ETHICAL_PUBLISHER_ID` env set
    - Renders `[Sponsored placeholder]` div in dev/preview
12. **`<CarbonAdSlot>`** component
    - Same pattern, separate publisher serial
    - Conditionally rendered ONLY if Carbon application accepted (env-gated)
13. **Slot placement**
    - PostLayout: ONE EthicalAd slot mid-article (after first H2)
    - LandingLayout: ONE CarbonAd slot in sidebar/below-fold
    - NEVER two ad slots per page
14. **Disclosure**
    - "Ads by EthicalAds" microcopy near each slot (network requirement)
    - Update `/disclosure` page with EthicalAds + Carbon Ads section
15. **Compliance**
    - NO consent banner needed (both networks privacy-first, zero tracking, no cookies)
    - Update `/privacy` page noting both networks + linking their privacy policies
    - Maintain `/llms.txt` cookie-free promise
16. **Application kit**
    - Snippet docs `docs/ads-application.md` with publisher application links + readiness checklist
    - Apply EthicalAds at 10+ posts (lower threshold than Carbon)
    - Apply Carbon Ads at 10k unique/month (publisher requirement)

### OUT of scope (explicitly)

- Google AdSense (rejected per exploration §B; revisit at 12+ months)
- Paid sponsorships marketplace integration (newsletter Capa 3 — separate change)
- Custom illustrated heroes per post (Approach A3, deferred)
- A/B testing framework
- Heatmap analytics (Hotjar etc — privacy violator)
- Logo from external designer/Figma (CSS monogram is the spec)
- Cookie consent banner (not needed under B3)

## Approach

### Sprint plan

| Sprint | Goal | Deliverable | Días |
|--------|------|-------------|------|
| **S2.5a — Theme + fonts** | Light/dark, fonts loaded, FOUC-free toggle | Toggle works on every page, no flash, fonts preload | 1 |
| **S2.5b — Layouts polish** | Hero gradient mesh, cards, monogram, View Transitions | Landing hero impactante, route transitions smooth | 1 |
| **S2.5c — Reading experience** | Reading bar, sidebar TOC ≥1024px, code copy button | Hello.mdx pasa "5-min reading test" sin fricción | 1 |
| **S2.5d — Mobile pass** | 6 viewports tested, hamburger nav <640px | Lighthouse Mobile ≥95 perf | 0.5 |
| **S2.5e — Ethical/Carbon slots** | Components + placement + env wiring + disclosure update | Slot lazy-loads in dev, placeholder visible, disclosure live | 1 |
| **S2.5f — Apply to networks** | Submit EthicalAds application | Ticket open with EthicalAds | 0.25 |

Total: ~5 días dev. Parallel with S5 content work.

### Architectural decisions

1. **Monogram via SVG component** — single `<Logo>` source feeds Header + favicon (`<Logo size={32}>` reused), no asset duplication.
2. **Theme strategy**: CSS variables via `:root` + `[data-theme="dark"]` selector. Inline `<script is:inline>` in `<head>` reads localStorage + system preference, sets attribute BEFORE first render. Tailwind v4 `@variant dark` configured to use the data attribute.
3. **View Transitions opt-in**: enable globally in BaseLayout. Add `data-astro-transition` to nav links; reduce-motion query disables animations but keeps document swap.
4. **Font loading**: `@fontsource-variable/*` packages avoid third-party requests. `link rel="preload"` for one weight (Inter 400 + JetBrains 400). Other weights lazy.
5. **Ad components**: Slot is a `<div>` with reserved height + width matching network ad dimensions. IntersectionObserver triggers script append only when slot is within 200px of viewport.
6. **Env contract**: `PUBLIC_ETHICAL_PUBLISHER_ID`, `PUBLIC_CARBON_SERIAL` — public env (Astro `import.meta.env.PUBLIC_*`). Empty in dev → slots render placeholder.
7. **Reading progress bar**: lone Web Component (~300B vanilla JS), hydrated on `client:load` only on PostLayout.
8. **Copy-to-clipboard button**: Custom Element (`<copy-button>`), zero deps, attached to every `<pre>` in MDX.
9. **No design system library** — custom is fine for solo project, lighter than Radix/HeadlessUI.
10. **Tailwind v4 only** — no extra UI lib (shadcn etc).

## Success Criteria

### Technical gates

- [ ] Lighthouse Mobile: Performance ≥95, Accessibility ≥95, SEO =100, Best Practices ≥95
- [ ] Lighthouse Desktop: Performance ≥98
- [ ] CLS < 0.05 across landing + post + tags
- [ ] No FOUC: theme attribute set before paint (verified DevTools Performance panel)
- [ ] Bundle JS on landing < 30KB (theme toggle + view-transitions only)
- [ ] Bundle JS on post < 50KB (+ progress bar + copy buttons + ad slot)
- [ ] All pages render correctly at 320 / 375 / 414 / 768 / 1024 / 1440 / 1920
- [ ] `prefers-reduced-motion` honored (no animation when set)
- [ ] `prefers-color-scheme` honored on first visit
- [ ] EthicalAds slot lazy-loads (verified Network panel: script not requested until scroll)
- [ ] Code copy button works in 3 browsers (Safari/Chrome/Firefox)

### Business / content

- [ ] EthicalAds application submitted with portfolio link
- [ ] `/disclosure` updated to mention EthicalAds + Carbon Ads
- [ ] `/privacy` updated with ad networks + their policies linked
- [ ] `docs/ads-application.md` checklist published
- [ ] Hello.mdx renders all polished components (sidebar TOC, copy button, ethical slot placeholder, reading bar)

### UX gates

- [ ] Theme toggle works without page reload + persists
- [ ] Route transitions smooth on Chrome (View Transitions) + graceful on Firefox/Safari
- [ ] Hover states on cards feel responsive (<100ms)
- [ ] Mobile nav hamburger keyboard-accessible

## Open Questions

- [ ] **Color palette**: dark accent stays cyan, ¿second accent for gradients? Sugiero violet-500 (`oklch(0.62 0.21 295)`) → magenta-style monogram gradient
- [ ] **Light theme palette**: sugiero ivory bg (`oklch(0.98 0.005 80)`) + slate ink (`oklch(0.25 0.02 260)`) + cyan accent kept
- [ ] **Mono weight loading**: 400 only, or 400 + 700 (bold for inline `code`)? Sugiero solo 400, bold via CSS `font-weight: 600` is fine for a variable font
- [ ] **EthicalAds approval timing**: aplicar AHORA (1 post) o esperar 5 pillar posts? Sugiero esperar pillar posts publicados → mejor approval rate
- [ ] **Carbon Ads dimensions**: 130×100 (sidebar) vs 728×90 (banner) — sugiero 130×100 sidebar, no banner

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Theme FOUC despite inline script | Medium | Medium | Test all routes after each commit; snapshot HTML head order |
| View Transitions break Firefox/Safari nav | Medium | Low | Feature-detect `document.startViewTransition`; fallback to plain navigation |
| Self-hosted fonts increase first build size | Low | Low | Subset to Latin only (fontsource defaults); preload one weight, lazy others |
| EthicalAds reject on first apply | Medium | Medium | Reapply after 5 pillar posts published; fallback to Carbon Ads only |
| Carbon Ads requires 10k unique/mo | High (early) | Low | Render slot only when env serial set; absent → empty space (no layout impact) |
| Lighthouse perf regression from V Transitions JS | Low | Medium | View Transitions adds <2KB; if regression, gate behind reduce-motion |
| Mobile hamburger a11y | Medium | Medium | Use `<button aria-expanded aria-controls>` + focus trap |
| Logo SVG not crisp at favicon size | Medium | Low | Render at 32×32 viewBox (favicon native size); test in browser tab |

## Architectural Decisions Record (ADR seeds)

- **ADR-101**: Monogram CSS/SVG over external logo asset
- **ADR-102**: Light + dark theme with system-preference + user override
- **ADR-103**: View Transitions API enabled globally
- **ADR-104**: `@fontsource-variable/*` self-hosted (no Google Fonts CDN)
- **ADR-105**: B3 monetization (EthicalAds + Carbon Ads), AdSense rejected
- **ADR-106**: One ad slot per page maximum (UX guardrail)
- **ADR-107**: Tailwind v4 `@variant dark` driven by `data-theme` attribute
- **ADR-108**: Web Components (vanilla) for tiny interactive bits (no React/Preact in baseline)

## Next Phase

→ `/sdd-design design-uplift-adsense` — finalize ADRs, component diagrams, theme token table, ad slot interfaces, file map.
→ Skip `/sdd-spec` (this change is mostly visual + small components; specs would be heavy ceremony for low-risk UI). Optional later if needed.
