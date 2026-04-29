# Proposal: monetizable-howto-platform

**Project**: `hidx` · **Date**: 2026-04-28 · **Phase**: sdd-propose · **Status**: Draft v1

## Intent

Construir plataforma de contenido técnico long-form ("How I do X") monetizable, optimizada para SEO orgánico y conversión progresiva. Audiencia primaria: developers EN. Stack ligero, costo cero hasta escala.

## Scope (MVP — Sprint 0 → 1)

### IN scope MVP

1. **Astro 5 + MDX + Tailwind v4** scaffold con TypeScript strict
2. **Cloudflare Pages** deploy via GitHub Actions (auto on push to `main`)
3. **Content Collections** type-safe con Zod schema:
   - `posts` collection (slug, title, description, date, tags, cover, draft, hreflang)
   - `series` collection (multi-part walkthroughs)
4. **Layouts core**:
   - `BaseLayout.astro` (head, header, footer, analytics)
   - `PostLayout.astro` (TOC, reading time, share, affiliate disclosure)
   - `LandingLayout.astro` (hero, featured posts, newsletter CTA)
5. **MDX components**:
   - `<Callout type="info|warn|tip">`
   - `<Steps>` numbered walkthrough
   - `<CodeDemo lang code>` syntax-highlighted (Shiki)
   - `<AffiliateLink href>` con disclosure auto FTC-compliant
   - `<TipJar provider="ko-fi" handle>`
6. **Pages**:
   - `/` landing EN
   - `/posts/[slug]` dynamic routes
   - `/tags/[tag]` tag filter
   - `/about`, `/now`, `/privacy`, `/disclosure`
   - `/rss.xml`, `/sitemap-index.xml`
   - `/og/[slug].png` dynamic OG via Satori
7. **SEO baseline**:
   - JSON-LD `Article` + `HowTo` schema
   - Canonical URLs, OG tags, Twitter Cards
   - `robots.txt`, `llms.txt`
   - `hreflang` ready (EN only en MVP)
8. **Analytics**: Cloudflare Web Analytics (no cookies, no consent banner)
9. **Newsletter**: Beehiiv embed form + API webhook handler (Worker)
10. **Monetización Capa 1**: AffiliateLink components + TipJar Ko-fi
11. **5 pillar posts** publicados (temas TBD en kickoff)
12. **CI/CD**: GitHub Actions
    - Lint (Biome o ESLint)
    - TypeCheck
    - Build
    - Lighthouse CI (budget: perf>95, a11y>95, SEO=100)
    - Deploy CF Pages
13. **Testing**:
    - Vitest unit (utils, schema validators)
    - Playwright smoke (render landing + 1 post + RSS valid)
14. **Branding placeholder**: dark zinc theme + cyan-500 accent, logo wordmark text
15. **License**: content CC-BY-NC 4.0, code MIT, dual `LICENSE` files
16. **Domain**: `hidx.dev` (compra usuario, DNS apunta a CF Pages)

### OUT of scope MVP (futuras fases)

- Capa 2-4 monetización (EthicalAds, sponsorships, paywall Stripe+D1)
- ES translation + i18n routing activo
- Comments (Giscus o similar)
- Search (Pagefind o Algolia)
- Code playgrounds interactivos (Sandpack/StackBlitz embeds)
- Email digest automation
- Member-only content
- Analytics dashboard custom
- A/B testing framework
- Branding final (logo profesional, paleta custom)

## Approach

### Sprint plan

| Sprint | Goal | Deliverable | Días |
|--------|------|-------------|------|
| **S0 — Scaffold** | Astro init + CI/CD + deploy hello-world | URL en CF Pages serving | 1 |
| **S1 — Core layouts + MDX** | BaseLayout, PostLayout, MDX components, content collection schema | 1 dummy post renderiza con TOC + Callout + Steps | 2 |
| **S2 — SEO + RSS + OG** | sitemap, RSS, JSON-LD, OG dynamic, robots, llms | Validators (rich-results test, RSS validator) pasan | 1 |
| **S3 — Monetization Capa 1** | AffiliateLink, TipJar, disclosure component, /disclosure page | Affiliate disclosure auto-injected, FTC-compliant | 1 |
| **S4 — Newsletter + Analytics** | Beehiiv embed + Worker webhook + CF Web Analytics | Subscribe funcional, analytics events flowing | 1 |
| **S5 — Pillar content** | 5 posts MDX redactados + cover images + OG previews | 5 posts live indexables | 5 |
| **S6 — Lighthouse + polish** | Perf budget enforced, a11y audit, copy review | LH CI passing, posts indexados Google Search Console | 1 |

Total estimado: ~12 días dev + tiempo redacción contenido.

### Architectural decisions

1. **`output: 'static'`** en S0-S5. Migrar a `'hybrid'` solo cuando entre paywall (post-MVP).
2. **Content Collections** strict mode con Zod schemas que validen frontmatter al build → no se puede mergear post roto.
3. **Componentes MDX en carpeta `src/components/mdx/`** auto-importados via `mdx-components.ts` (no imports manuales en cada post).
4. **OG images runtime** via Cloudflare Pages Function endpoint (`/og/[slug].png`) usando Satori — cache infinito por slug.
5. **AffiliateLink disclosure**: componente inyecta `<small>` con disclosure debajo del link automáticamente, NO depende de redactor recordarlo.
6. **Cloudflare Pages env vars**: `BEEHIIV_API_KEY`, `STRIPE_SECRET` (futuro), via dashboard + `.dev.vars` local.
7. **Sin React runtime en posts por default** — usar Astro components MDX. React solo si componente necesita state (futuro: paywall modal).
8. **Tailwind v4 con `@tailwindcss/typography`** plugin para prose styling MDX.
9. **Shiki** para syntax highlighting build-time (sin JS runtime, theme dual light/dark).
10. **Repo público GitHub** desde S0 (transparency + SEO from PR/discussions backlinks).

## Success Criteria

### Technical (gates a cumplir antes de "MVP done")

- [ ] Lighthouse: Performance ≥95, Accessibility ≥95, SEO =100, Best Practices ≥95
- [ ] Build time < 30s para 5 posts
- [ ] Bundle JS < 50KB en posts sin componentes interactivos
- [ ] Zero hydration en landing (HTML puro)
- [ ] CI verde: lint + typecheck + build + Lighthouse CI
- [ ] Deploy preview por cada PR vía CF Pages
- [ ] All 5 pillar posts indexados por Google en 14 días post-launch
- [ ] RSS feed valida en W3C RSS validator
- [ ] Rich results test pasa para `Article` + `HowTo` schema
- [ ] OG images renderizan correcto en Twitter card validator + LinkedIn post inspector
- [ ] Affiliate disclosure visible en cada link (FTC compliance)
- [ ] No cookies set por default (audit DevTools Application tab)
- [ ] llms.txt servido y válido

### Business / content

- [ ] Newsletter form funcional, primer suscriptor de prueba flow end-to-end
- [ ] Tip jar (Ko-fi) link operativo
- [ ] 5 pillar posts publicados, cada uno con:
  - 1500+ palabras
  - Code samples ejecutables
  - 3+ affiliate o tool mentions contextuales
  - Cover image + OG image custom
  - Tags + tags page entry
- [ ] `/disclosure` page con FTC + EU compliance copy
- [ ] `/privacy` page con copy honesto (no cookies, CF Web Analytics, Beehiiv)

## Open Questions (resolver durante S0-S1)

1. **Linter**: Biome (rápido, all-in-one) vs ESLint+Prettier (clásico, más plugins). Sugiero Biome.
2. **Package manager**: pnpm (preferido) vs npm vs bun. Sugiero pnpm.
3. **Node version**: pinear con `.nvmrc` (sugiero 22 LTS).
4. **Branch protection**: ¿require PR + CI green antes merge a main? Sugiero sí.
5. **Pillar post topics**: brainstorm en kickoff S5. Necesito 5 temas "How I do X" donde X = problema dev real con tooling/infra opinión.
6. **Brand name final**: ¿"hidx" es nombre definitivo o placeholder? (suena a "how I do X" abreviado, funciona).
7. **Cover image strategy**: ¿generadas (Unsplash API + caption overlay), custom design (Figma manual), o screenshot terminal/code? Sugiero custom Figma para hero, Unsplash para resto.

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Tailwind v4 break entre alphas/RC | Medium | Medium | Pin exact version, snapshot test critical pages |
| CF Pages adapter SSR edge cases (futuro paywall) | Medium | High | SSG-only en MVP, validar adapter en spike antes Capa 4 |
| Content velocity bottleneck (5 posts es laburo) | High | High | Series approach: 1 pillar + 4 satellites del mismo dominio reusan investigación |
| AI scrapers consumen contenido sin atribución | High | Medium | llms.txt + CF Bot Fight Mode + license CC-BY-NC visible |
| Beehiiv free tier limit (2.5k subs) | Low (MVP) | Low | Migration path a Buttondown/Resend si crece |
| Domain `hidx.dev` no disponible | Low | Low | Alternativas: `howidox.dev`, `hidx.tech`, `doingx.dev` |
| Lighthouse SEO=100 regression con MDX components | Medium | Medium | Lighthouse CI en cada PR bloquea merge si regresa |
| FTC affiliate compliance miss → demanda/multa | Low | High | Componente AffiliateLink inyecta disclosure forzado, lint rule custom para detectar `href` raw a Amazon/affiliates |

## Architectural Decisions Record (ADR seeds — formalizar en sdd-design)

- ADR-001: Astro 5 over Next.js 15 (perf + cost)
- ADR-002: Cloudflare Pages over Vercel (free bandwidth + Workers integration)
- ADR-003: SSG-only MVP, hybrid postponed to paywall phase
- ADR-004: Beehiiv newsletter (vs Buttondown/Resend) — sponsorship marketplace
- ADR-005: CC-BY-NC content + MIT code (dual license)
- ADR-006: Tailwind v4 + Typography plugin (vs CSS modules / Panda)
- ADR-007: pnpm + Biome (vs npm + ESLint)
- ADR-008: Content Collections + Zod (vs raw markdown frontmatter parsing)

## Next Phase

→ `/sdd-spec monetizable-howto-platform` — formalizar requirements como specs verificables con scenarios.
→ `/sdd-design monetizable-howto-platform` — ADRs + diagrama componentes + data flow.
