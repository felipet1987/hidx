# Tasks: Design Uplift A2 + Ethical/Carbon Ads (B3)

> TDD where unit-testable; visual/integration tasks rely on Playwright + LH CI.

## Phase 1: Foundation — Theme tokens + fonts (S2.5a)

- [x] 1.1 Add `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono` to `package.json`
- [x] 1.2 Update `src/styles/global.css`: import variable font CSS, define `:root` (light) + `[data-theme="dark"]` token sets (bg, fg, muted, accent cyan, accent-2 violet, gradient stops); add fluid type scale via `clamp()`
- [x] 1.3 Configure Tailwind v4 `@variant dark` to use `[data-theme="dark"]` selector
- [x] 1.4 RED Vitest: `tests/unit/theme.test.ts` — `resolveTheme(stored, prefersDark)` truth table (4 cases) + `applyTheme()` writes attribute and localStorage
- [x] 1.5 GREEN: implement `src/lib/theme.ts` per design interface
- [x] 1.6 Add inline `<script is:inline>` block in `BaseLayout.astro` `<head>` calling `resolveTheme` + setting `documentElement.dataset.theme` BEFORE first paint
- [ ] 1.7 Preload one Inter weight + one JetBrains weight via `<link rel="preload">` in `BaseLayout` (DEFERRED — fontsource @import handles, preload micro-opt for later)

## Phase 2: Branding refactor (S2.5b)

- [x] 2.1 Create `src/components/Logo.astro` (props `size`, `gradient`) — SVG monogram "h" inside rounded square with cyan→violet gradient, hover animates angle
- [x] 2.2 Replace `public/favicon.svg` with monogram (32×32 viewBox)
- [ ] 2.3 Generate `public/apple-touch-icon.png` (180×180) using `resvg-cli` from favicon.svg (DEFERRED — needs binary install)
- [x] 2.4 Create `public/site.webmanifest` (icons, theme_color per scheme)
- [x] 2.5 Extract `src/components/Header.astro` from `BaseLayout` (logo + nav + theme toggle slot + hamburger ≤640px with `aria-expanded`)
- [x] 2.6 Extract `src/components/Footer.astro` from `BaseLayout`
- [x] 2.7 Wire Header + Footer back into `BaseLayout`

## Phase 3: Theme toggle + View Transitions (S2.5b)

- [x] 3.1 Create `src/components/ThemeToggle.astro` — button with sun/moon SVG, vanilla `<script>` calls `applyTheme(currentTheme === 'dark' ? 'light' : 'dark')`
- [x] 3.2 Mount `<ThemeToggle>` in Header right slot
- [x] 3.3 Add `<ViewTransitions />` in `BaseLayout` `<head>` (Astro 6 native — used `ClientRouter` from `astro:transitions` per Astro 6 rename)
- [x] 3.4 Honor `prefers-reduced-motion` in `global.css` (disable transition animations when set)

## Phase 4: Reading experience (S2.5c)

- [ ] 4.1 Create `src/components/ReadingBar.astro` — Web Component `<reading-bar>` (sticky 2px top, gradient fill on scroll progress)
- [ ] 4.2 Mount `<ReadingBar>` in `PostLayout`
- [ ] 4.3 Create `src/components/CopyButton.astro` — Web Component `<copy-button>` attached on connected to nearest `<pre>`, vanilla clipboard API
- [ ] 4.4 Inject `<CopyButton>` for every `<pre>` in `PostLayout` (post-render JS or rehype plugin)
- [ ] 4.5 Refactor `PostLayout` TOC: inline ≤1023px, sticky sidebar ≥1024px (CSS grid)
- [ ] 4.6 Tune prose: line-height 1.7, max-w 70ch, gradient `<hr>` between sections

## Phase 5: Hero rebuild + landing polish (S2.5b)

- [ ] 5.1 `LandingLayout`: replace plain hero with gradient mesh background (radial-gradient layers), fluid display type for "how i do x"
- [ ] 5.2 Add pillar topic tag marquee below tagline (CSS `@scroll-timeline` if supported)
- [ ] 5.3 Card polish: gradient border + inner glow on hover, larger touch targets

## Phase 6: Mobile pass (S2.5d)

- [ ] 6.1 Playwright visual snapshots at 320, 375, 414, 768, 1024, 1440, 1920 — landing + post + tags
- [ ] 6.2 Fix any horizontal overflow / cropped text per snapshot diff
- [ ] 6.3 Verify hamburger nav works keyboard + touch + screen reader

## Phase 7: Ad slots + disclosure (S2.5e)

- [ ] 7.1 Create `src/components/ads/EthicalAdSlot.astro` per design interface (lazy via IntersectionObserver, env-gated `PUBLIC_ETHICAL_PUBLISHER_ID`)
- [ ] 7.2 Create `src/components/ads/CarbonAdSlot.astro` (130×100 sidebar dim, `PUBLIC_CARBON_SERIAL`)
- [ ] 7.3 Mount `<EthicalAdSlot>` in `PostLayout` after first H2 (rehype plugin or first-occurrence wrapper)
- [ ] 7.4 Mount `<CarbonAdSlot>` in `LandingLayout` below featured posts
- [ ] 7.5 Update `src/pages/disclosure.astro` — add EthicalAds + Carbon Ads section with their privacy links
- [ ] 7.6 Update `src/pages/privacy.astro` — list both networks + zero-cookie statement
- [ ] 7.7 E2E Playwright: slot empty in dev (no env), placeholder visible, no script in Network panel until scroll

## Phase 8: Verification + apply (S2.5f)

- [ ] 8.1 Lighthouse CI budget update: enforce perf≥95 mobile, ≥98 desktop, CLS<0.05
- [ ] 8.2 Run full E2E suite + visual snapshot diff approval
- [ ] 8.3 Create `docs/ads-application.md` checklist (EthicalAds + Carbon Ads requirements)
- [ ] 8.4 Apply EthicalAds (BLOCKED until 5 pillar posts published — Phase S5 of original roadmap)
