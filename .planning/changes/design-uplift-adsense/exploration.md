# Exploration: Design Uplift + Google AdSense Monetization

**Project**: `hidx` · **Date**: 2026-04-29 · **Phase**: sdd-explore · **Change**: `design-uplift-adsense`

## Current State

### Design (post-Phase 2)

| Aspect | What exists |
|--------|-------------|
| Colors | Dark zinc bg (`oklch(0.18 0.01 260)`), cyan accent (`oklch(0.78 0.14 200)`), zero gradient/depth |
| Typography | `Inter` + `JetBrains Mono` declared in CSS but **not loaded** (no `@fontsource` or Google Fonts import) — falls back to system-ui |
| Layout | 3xl max-width container, basic header/footer, prose-invert via Tailwind Typography |
| Hero | Plain centered text "how i do x" + tagline, no visual interest, no image, no animation |
| Cards | Bordered boxes (`border-(--color-accent-soft)`), basic hover (border color shift) |
| Branding | Text-only "hidx" wordmark, no logo, no favicon real (default Astro favicon.svg) |
| Animations | None (no View Transitions, no scroll reveals, no micro-interactions) |
| Theme toggle | Dark only — no light mode |
| Code blocks | Shiki dual theme configured but only dark renders |
| Mobile | Tailwind responsive but never tested at <640px |

### Monetization (per original proposal)

| Layer | Status | Notes |
|-------|--------|-------|
| Affiliate links | ✅ implemented (`<AffiliateLink>` + `[aff]` disclosure) | FTC-compliant inline |
| Tip jar | ✅ implemented (`<TipJar provider="ko-fi">`) | external link only |
| Newsletter | ⏳ Phase 4 (Beehiiv) | sponsorship marketplace path |
| EthicalAds | ⏳ post-1k visitors/mes | proposal Capa 2 |
| Sponsorships | ⏳ post-5k visitors/mes | proposal Capa 3 |
| Paywall | ⏳ Capa 4 (Stripe + D1) | post-MVP |
| **AdSense** | ❌ **explicitly rejected in proposal** | "AdSense en sitio dev = $0.50 RPM. Sponsorships = $30-100 RPM" |

## Affected Areas

### Design uplift
- `src/styles/global.css` — fuente loading, theme tokens, typographic scale, light/dark vars
- `src/layouts/BaseLayout.astro` — header polish, footer richer, View Transitions API
- `src/layouts/LandingLayout.astro` — hero rebuild (gradient, depth, illustration), section rhythm
- `src/layouts/PostLayout.astro` — TOC sidebar (currently inline), reading bar progress, prose width tuning
- `src/components/mdx/{Callout,Steps,CodeDemo}.astro` — depth, shadows, micro-animations, copy-button
- `src/components/{Header,Footer,ThemeToggle,Logo}.astro` — new components
- `public/{favicon.ico,favicon.svg,apple-touch-icon.png}` — real branding
- `package.json` — `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono`

### AdSense integration
- `astro.config.mjs` — script src allowlist for CSP
- `src/components/ads/AdSenseSlot.astro` — new component (lazy-loaded, intersection-observer)
- `src/components/CookieConsent.astro` — new (AdSense personalization needs consent)
- `src/layouts/BaseLayout.astro` — `<script async src="adsbygoogle.js?client=...">`
- `src/pages/privacy.astro` — rewrite (cookies + Google ads disclosure)
- `src/pages/disclosure.astro` — add Google ads section
- `public/_headers` — relax CSP for `pagead2.googlesyndication.com`, `googleads.g.doubleclick.net`
- `public/llms.txt` — note ads (transparency)
- `ads.txt` (new) — `public/ads.txt` with Google publisher ID
- New env: `PUBLIC_ADSENSE_CLIENT_ID` (publisher ID is public, OK to inline)

## Approaches

### Design Uplift

**A1 — Polish current dark zinc theme** (additive, low-risk)
- Pros: keeps tone, low effort, no breaking changes
- Cons: still feels generic, no real brand identity
- Effort: Low

**A2 — Premium magazine layout** (rebuild visual language)
- New typographic scale (clamp-based fluid), real fonts, refined hero with gradient mesh background, hero illustration (CSS-only or SVG asset), subtle scroll-reveal, View Transitions API for SPA-feel between routes, copy-to-clipboard on code blocks, reading progress bar, glass-morphism cards
- Light + dark theme toggle (system preference + override stored localStorage), proper code theme switching
- Custom monogram logo (SVG), favicon set, apple-touch-icon
- Mobile-first review (320-1920 viewport tested)
- Pros: differentiates, dev audiences notice craft, 100% SSG-compatible, no JS cost in baseline
- Cons: bigger lift, requires logo asset
- Effort: Medium

**A3 — Heavy rebrand with custom illustrations**
- Hire illustrator or use AI-generated heroes per pillar topic
- Pros: signature brand, social-first
- Cons: costly, bottleneck, asset rot
- Effort: High

### AdSense Monetization

**B1 — AdSense primary** (user request as-is)
- Single Auto-Ads script in `<head>`, Google decides placements
- Pros: zero per-page wiring, fastest to ship
- Cons: terrible UX, kills Lighthouse perf (AdSense Auto Ads = ~200KB JS, runtime layout shift), Google injects intrusive interstitials/anchor ads, banned design control, $0.50-2 RPM dev sites, requires consent banner everywhere (breaks our cookie-free promise)
- Effort: Low (technically) — but high reputational/perf cost
- **Approval blocker**: AdSense rejects sites with <30 posts / <6 mo age / low traffic. **hidx has 1 post**. Will be denied.

**B2 — AdSense manual placements** (controlled)
- Single `<AdSenseSlot>` component, manually placed (e.g. mid-article + end-of-article only), lazy-loaded with `loading="lazy"` + `IntersectionObserver`, fixed dimensions (avoid CLS), behind cookie consent gate
- Pros: keeps perf budget, predictable layout, FTC-compliant disclosure
- Cons: still low RPM, still needs consent banner, still pending approval
- Effort: Medium

**B3 — EthicalAds + Carbon Ads (proposal original — recomendado pre)**
- EthicalAds: aceptan sitios chicos, no cookies, devs no bloquean, $1-3 RPM
- Carbon Ads: top tier dev/design, $3-10 RPM, ultra clean, requires application + traffic
- Pros: perfect fit dev audience, zero tracking, no consent needed, preserva /privacy promesa
- Cons: lower fill rate vs AdSense (geographic gaps)
- Effort: Low (script tag + slot)

**B4 — Hybrid** (EthicalAds primary, AdSense fallback gated)
- EthicalAds renders by default
- If `noFill` event → fallback to AdSense slot, but only if user accepted cookies
- Pros: max revenue, preserves UX for adblock users
- Cons: complex, two compliance regimes, two scripts
- Effort: High

## Recommendation

### Design: **A2 — Premium magazine layout**

Razones:
1. Dev audience JUDGES craft — generic Tailwind starter screams "AI-generated site"
2. Pillar posts SOLD as long-form: typography + reading experience are the product
3. View Transitions API + light/dark + custom monogram cost ~1-2 días dev, perceived value 10×
4. Stays SSG (zero perf regression)
5. Sets brand floor before traffic arrives (rebrand later = costlier)

### Monetization: **B3 (EthicalAds + Carbon Ads)** — pushback honesto sobre AdSense

**Por qué NO AdSense ahora**:
1. **Approval blocker**: Google rechaza sitios con 1 post, 0 traffic, <6 meses. **No te van a aprobar hasta tener 30+ posts + 6 meses + tráfico orgánico**. Cero ROI corto plazo.
2. **RPM real dev sites**: $0.50-2 (vs Carbon Ads $3-10, EthicalAds $1-3, sponsorships $30-100). Worst tier.
3. **Adblock**: dev audience bloquea AdSense en >70% sesiones. Carbon/EthicalAds whitelist más alto.
4. **Privacy promise rompe**: AdSense requiere cookie consent banner (GDPR/ePrivacy). Tu `/privacy` y `/llms.txt` actuales prometen cookie-free. Deshacer eso = pérdida credibilidad.
5. **Perf**: Auto Ads inyecta ~200KB JS + CLS. Lighthouse SEO=100 baja a ~85 ⇒ ranking baja ⇒ menos tráfico ⇒ peor RPM. Death spiral.
6. **UX**: Auto Ads inyecta interstitial + anchor ads que tu audiencia ODIA.

**Si insistís AdSense**: aplicar B2 (manual + consent + lazy + fixed slots) **DESPUÉS** de tener 30+ posts publicados y tráfico orgánico estable. No antes. Tiempo estimado para approval: 6-12 meses post-launch.

**Camino recomendado AHORA**:
1. Semana 1: A2 design uplift
2. Semana 1-3: 5 pillar posts (S5 original)
3. Lanzar + indexar
4. Mes 2-3: aplicar a EthicalAds (umbral bajo)
5. Mes 6: aplicar a Carbon Ads (necesita ~10k visits/mes)
6. Mes 12+: evaluar AdSense como capa adicional si tiene sentido

## Risks

- **Design A2 over-engineering**: View Transitions API tiene quirks (focus management, scroll restoration). Mitigar: feature-detect + graceful degradation
- **Theme toggle sin SSR flash**: light mode requiere inline script en `<head>` para evitar FOUC. Solución conocida (script `is:inline` setea `data-theme` antes de paint)
- **Font loading CLS**: usar `font-display: optional` + `size-adjust` o cargar `@fontsource-variable/*` con preload
- **AdSense (si forzamos)**: rejection risk alto, perf regression certera, GDPR consent obligatorio
- **EthicalAds aceptación**: requiere thematic match (open-source / dev focus). hidx califica
- **Asset/logo bottleneck**: A2 sin logo es 80% completo. Pedir Figma/Midjourney logo en paralelo

## Ready for Proposal

**Yes — pero con bifurcación**:

1. **Design uplift A2**: ready full propose. Necesito decisión sobre:
   - ¿Logo custom (Figma/Midjourney) o monogram CSS-only?
   - ¿Light + dark toggle o dark-only?
   - ¿View Transitions API ON desde día 1?

2. **Monetización**:
   - Si aceptás recomendación → B3 (EthicalAds + Carbon Ads): ready propose
   - Si insistís AdSense → B2 con caveat scoping (sin approval por ahora, infra lista para cuando llegue) → ready propose
   - Si querés ambos paths → B4 hybrid: ready propose pero costoso

**Decime** antes de `/sdd-propose`:
1. Design: ¿logo custom o monogram CSS?
2. Monetización: ¿B3 (recomendado), B2 (AdSense ahora), B4 (híbrido)?
