# Exploration: Página Monetizable "How I Do X"

**Project**: `hidx` (greenfield) · **Date**: 2026-04-28 · **Phase**: sdd-explore

## Current State

Repo `hidx/` vacío. Sin código, sin git, sin tooling. Greenfield total. Decisiones previas (sesión actual):
- Stack confirmado: Astro + MDX
- Hosting: Cloudflare Pages
- Idioma primario: EN, secundario ES (i18n)
- Monetización por capas según tráfico
- Contenido: long-form MDX con embeds + playgrounds opcionales
- 5 posts pillar antes de lanzar

## Affected Areas (greenfield — todo nuevo)

```
hidx/
├── astro.config.mjs                # Integraciones, i18n, sitemap, MDX
├── package.json                    # Astro 5.x + integrations
├── tsconfig.json                   # strict mode
├── wrangler.toml                   # Cloudflare Pages binding (R2, KV, D1 si paywall)
├── src/
│   ├── content/
│   │   ├── config.ts              # Content collections schema (Zod)
│   │   ├── posts/                 # MDX posts "how-i-do-x"
│   │   └── series/                # Multi-part walkthroughs
│   ├── components/
│   │   ├── mdx/                   # Callout, Steps, CodeDemo, Affiliate
│   │   ├── layout/                # Header, Footer, TOC, Newsletter
│   │   └── monetize/              # AffiliateLink, TipJar, AdSlot, Paywall
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── PostLayout.astro
│   ├── pages/
│   │   ├── index.astro            # Landing
│   │   ├── [...slug].astro        # Dynamic post route
│   │   ├── rss.xml.ts             # RSS feed
│   │   ├── sitemap.xml            # auto via @astrojs/sitemap
│   │   ├── og/[slug].png.ts       # Dynamic OG images (satori)
│   │   └── api/
│   │       ├── newsletter.ts      # Subscribe (Cloudflare Worker)
│   │       └── tip.ts             # Stripe payment intent (Capa 4)
│   ├── styles/global.css          # Tailwind v4 entry
│   └── lib/
│       ├── analytics.ts           # CF Web Analytics wrapper
│       └── seo.ts                 # JSON-LD builder (Article schema)
├── public/
│   ├── robots.txt
│   └── _headers                   # Cloudflare cache headers
└── tests/                         # Vitest + Playwright smoke
```

## Approaches

### 1. **Astro 5 + MDX + Tailwind v4 + Cloudflare Pages** (RECOMENDADO)
- **Pros**:
  - SSG por default → Lighthouse 100, SEO óptimo
  - Content Collections con Zod = type-safe frontmatter
  - Islands architecture: 0 JS por default, hidratación selectiva (calculator, paywall modal)
  - MDX = markdown + componentes React/Astro nativos
  - Cloudflare Pages free tier: unlimited bandwidth, 500 builds/mes
  - View Transitions API nativo Astro = SPA-feel sin SPA cost
- **Cons**:
  - SSR para paywall requiere adapter `@astrojs/cloudflare` (más complejo que SSG puro)
  - Ecosistema MDX components menos maduro que Next.js
- **Effort**: Medium

### 2. **Next.js 15 App Router + MDX + Vercel**
- **Pros**: ecosistema masivo, RSC potente, MDX nativo
- **Cons**: bundle JS pesado por default, Vercel cobra bandwidth ($$ a escala), overkill para sitio content-heavy
- **Effort**: Medium-High

### 3. **Hugo + custom theme**
- **Pros**: build instantáneo (segundos para 10k posts), zero JS
- **Cons**: Go templating doloroso, sin componentes interactivos sin hacks, MDX ausente
- **Effort**: High (custom theme)

## Recommendation

**Approach 1 — Astro 5 + MDX + Tailwind v4 + Cloudflare Pages.**

Razones técnicas:
1. **Performance budget**: posts 100% estáticos, JS solo donde paywall/calculator. Web Vitals >95 directo.
2. **Type-safety contenido**: Content Collections + Zod schema = imposible publicar post con frontmatter roto.
3. **Costo cero hasta escala**: CF Pages free hasta 100k req/día. R2 sin egress. Workers 100k req/día gratis.
4. **Monetización progresiva**: empezás SSG puro (Capa 1-2 ads/affiliate). Migrás a `output: 'hybrid'` cuando agregás paywall (Capa 4) sin reescribir.
5. **i18n nativo Astro 5**: sin libs externas, routing automático `/en/...` `/es/...`.

### Stack lock-in propuesto

| Capa | Tech | Versión |
|------|------|---------|
| Framework | Astro | `^5.x` |
| Content | MDX via `@astrojs/mdx` | `^4.x` |
| Styling | Tailwind v4 + `@tailwindcss/typography` | `^4.x` |
| Adapter | `@astrojs/cloudflare` | `^11.x` |
| Sitemap | `@astrojs/sitemap` | latest |
| Icons | `astro-icon` (Iconify) | latest |
| OG images | `satori` + `@vercel/og`-style endpoint | — |
| Analytics | Cloudflare Web Analytics (no cookies) | nativo |
| Newsletter | Buttondown / ConvertKit API | API key only |
| Paywall (Capa 4) | Stripe + Cloudflare D1 (members) | — |
| Forms | Cloudflare Pages Functions | nativo |
| Testing | Vitest + Playwright | latest |
| CI | GitHub Actions → CF Pages auto-deploy | — |

### Monetización: implementación por fase

| Capa | Trigger | Componentes | Backend |
|------|---------|-------------|---------|
| 1. Affiliate + Tip | Día 1 | `<AffiliateLink>`, `<TipJar href="ko-fi.com/...">` | none (links) |
| 2. Ethical Ads | 1k unique/mes | `<AdSlot id="..."/>` lazy-load | EthicalAds script |
| 3. Sponsorships | 5k unique/mes | `<SponsorCallout>` MDX component | manual content |
| 4. Paywall | Audience fiel | `<Paywall>` + Stripe Checkout | Worker + D1 + JWT cookie |

### SEO + Discoverability checklist

- JSON-LD `Article` + `HowTo` schema (Google rich results para "how-to")
- Dynamic OG images per post via Satori (CTR boost en Twitter/LinkedIn)
- Sitemap XML auto-generado por idioma
- RSS feed por idioma + por tag
- `hreflang` tags i18n
- Canonical URLs estrictas
- robots.txt + llms.txt (AI crawlers)

## Risks

- **Cloudflare adapter SSR**: features SSR de Astro tienen edge cases en Workers runtime (no Node APIs). Mitigar: SSG puro hasta Capa 4, validar Worker runtime antes paywall.
- **Tailwind v4 alpha→stable**: v4 todavía nuevo (2026-04). Si rompe, fallback a v3. Lock version.
- **MDX component API churn**: Astro MDX integration cambia entre majors. Pinear `^4.x`.
- **Stripe + D1 latency edge**: D1 en regiones limitadas, paywall check puede agregar 50-100ms. Mitigar con KV cache de session tokens.
- **Affiliate compliance**: disclosure obligatorio (FTC + EU). Componente `<AffiliateLink>` debe inyectar disclosure auto.
- **GDPR sin cookies**: CF Web Analytics no usa cookies → no consent banner needed. Pero newsletter sí requiere double opt-in.
- **AI scraper drain**: posts long-form son target #1 de scrapers. Mitigar con `_headers` + CF Bot Fight Mode + llms.txt.

## Next Steps

Listo para `/sdd-propose` con cambio nombrado `monetizable-howto-platform`. Propuesta cubrirá:
1. Scope MVP (5 posts + landing + RSS + sitemap + analytics + affiliate links)
2. Fuera de scope MVP (paywall, ads, sponsorships, ES translation)
3. Success criteria (Lighthouse 100, primer post indexado en 7 días, deploy <2min)
4. Decisiones abiertas: ¿newsletter provider? ¿theme palette? ¿logo/branding?

## Ready for Proposal

**Yes** — base técnica sólida, sin bloqueantes. Sugiero ejecutar `/sdd-propose monetizable-howto-platform` para formalizar scope y criteria.
