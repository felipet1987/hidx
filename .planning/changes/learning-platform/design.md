# Design: ChispaLab Mini-MVP S1 (STEAM LatAm)

## Technical Approach

Reusar 100% infra hidx (Astro 6 SSG + Supabase + CF Pages). **Rebrand puro** — rename repo + project + dominio; mantiene git history, schema base, components reusables. Schema **extiende** `articles` table con columnas STEAM opcionales (vs nueva tabla `lessons` — evita migration loader). Components dev (`CodeTabs`, `Terminal`, etc) **deprecate-export** del WHITELIST (no delete archivos — defer Fase 2 ruta "Programación para chicos"). Design system swap vía CSS variables (paleta STEAM 5 colores + Quicksand font + Tabler icons + WCAG AAA contrast). Content flow: lesson MDX en Supabase con `materials` JSON + `safety_notes` array + `parent_tip` text. Routes nuevas `/explorar` `/rutas` `/padres` montadas sobre loader existente. Sin auth MVP; localStorage para "completado" flag.

## Architecture Decisions

| ADR | Choice | Alternatives | Rationale |
|-----|--------|--------------|-----------|
| 501 | Pivot ChispaLab STEAM | Sub-brand separado / multi-foco | Total commitment vs split focus |
| 503 | Reuse infra 100% (rebrand only) | Replatform from scratch | Gana 2-3 sem, mantiene supabase + CF + git |
| 504 | Extend `articles` table (NO new `lessons`) | Separate lessons table | Evita migration loader; campos opt nullables |
| 505 | localStorage progress only | Auth + server state | YAGNI MVP; COPPA-safe sin PII |
| 506 | Spanish neutral LatAm + guiños rioplatenses | España / MX-only | Wider audience LatAm sin perder identidad |
| 507 | WCAG AAA enforced | AA estándar | Kids accesibilidad real, padres trust |
| 508 | NO ads MVP (Mediavine post-10k mo) | Day-1 ads | UX limpio + approval threshold |
| 509 | Mercado Libre primary affiliate (LatAm) | Amazon-only | LatAm market fit pricing/shipping |
| 511 | COPPA strict — zero PII <13 | Newsletter sign-up direct | Compliance + trust padres |
| 514 | Domain `.lat` TLD | `.com` / `.com.ar` | LatAm specific, available |
| 515 | Logo CSS monogram "C" | $200 fiverr | MVP cero costo, refactor después |

## Data Flow

```
Author CLI:
  pnpm new:lesson "Catapulta cartón" --age=8-12 --steam=E,A --difficulty=2 --duration=30
    → INSERT articles (extended schema)
    → Returns Studio edit URL

Build:
  Astro loader fetches articles from Supabase (anon read published)
    → MDX compile (mantiene rich components: Image, Video, Steps, Callout, etc)
    → New components (MaterialsList, SafetyNote, ParentTip) render
    → Static HTML out

Reader (kid + parent):
  / landing → /explorar catálogo → /rutas/[slug] outline → /rutas/[slug]/[lesson] activity
    → localStorage flag "leído" toggle (no server)
    → Print PDF descargable (build-time generated R2 URL)

Affiliate:
  <MercadoLibreProduct asin/handle> → link tracker via lib/affiliate.ts (replaces AffiliateLink dev)

Monetización (defer):
  >10k visits/mo → apply Mediavine Family
  Sponsorship outreach paralelo (manual)
```

## File Changes

### Rebrand (todos los archivos)

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | name: hidx → chispalab; description STEAM |
| `README.md` | Replace | ChispaLab intro + STEAM + LatAm + dev local |
| `public/site.webmanifest` | Modify | name + theme_color STEAM verde-azul |
| `public/favicon.svg` | Replace | Monograma "C" gradient STEAM (verde→naranja) |
| `public/llms.txt` | Modify | Reflejar STEAM platform + CC license |
| `src/components/Logo.astro` | Replace | "C" letra + STEAM gradient en lugar de "h" |
| `src/components/Header.astro` | Modify | nav: Explorar / Rutas / Padres / Sobre |
| `src/components/Footer.astro` | Modify | Copyright "ChispaLab", links pies updated |
| `src/layouts/BaseLayout.astro` | Modify | site URL, default OG |
| `src/lib/authors.ts` | Modify | Bio STEAM-aware "experimentos hands-on LatAm" |
| `src/pages/about.astro` | Replace | About ChispaLab + missión LatAm |
| `src/pages/now.astro` | Modify | Estado actual lessons en producción |
| `src/pages/privacy.astro` | Modify | COPPA + zero-PII statement |
| `src/pages/disclosure.astro` | Modify | Affiliate Mercado Libre + ads disclosure |
| `src/pages/index.astro` | Replace | Landing kids friendly hero + 3 CTAs |
| `astro.config.mjs` | Modify | site = `https://chispalab.lat` |

### Schema Supabase

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/<ts>_chispalab_extension.sql` | Create | ALTER articles ADD: age_min/age_max/difficulty/duration_minutes/steam_categories/materials/safety_notes/parent_tip/video_url/printable_pdf (todos nullable defaults) |
| `src/content/schemas.ts` | Modify | Zod schema extends optional fields; tracks renamed mental model "rutas" UI |

### Design system swap

| File | Action | Description |
|------|--------|-------------|
| `src/styles/global.css` | Modify | New tokens: `--color-s` (verde) / `--color-t` (azul) / `--color-e` (naranja) / `--color-a` (rosa) / `--color-m` (púrpura); accent yellow; bone bg; Quicksand font import (replaces Inter); WCAG AAA contrast pairs |
| `package.json` | Modify | Add `@fontsource-variable/quicksand`; keep `jetbrains-mono` for rare code |

### Components nuevos

| File | Action | Description |
|------|--------|-------------|
| `src/components/mdx/MaterialsList.astro` | Create | Checklist visual qty + opcional + source link |
| `src/components/mdx/SafetyNote.astro` | Create | Callout per type (cortante/calor/químico/supervisión) |
| `src/components/mdx/AgeBadge.astro` | Create | Pill 8-12/13-17/18+ |
| `src/components/mdx/STEAMBadge.astro` | Create | 5 iconos colored |
| `src/components/mdx/DifficultyStars.astro` | Create | 1-5 estrellas |
| `src/components/mdx/DurationBadge.astro` | Create | Clock + minutes |
| `src/components/mdx/ParentTip.astro` | Create | Callout audiencia padres |
| `src/components/mdx/ExperimentSteps.astro` | Create | Steps con foto/video por paso |
| `src/components/mdx/PrintablePDFButton.astro` | Create | Descarga PDF |
| `src/components/mdx/MercadoLibreProduct.astro` | Create | Affiliate link LatAm + disclosure |
| `src/components/mdx/index.ts` | Modify | + 10 exports + WHITELIST extension; deprecate dev components (mover a `_deprecated` array, no remove archivos) |

### Routes nuevas

| File | Action | Description |
|------|--------|-------------|
| `src/pages/explorar.astro` | Create | Catálogo lessons filterable |
| `src/pages/rutas/index.astro` | Create | Rutas index |
| `src/pages/rutas/[slug].astro` | Create | Ruta overview (renombra desde /tracks/[slug]) |
| `src/pages/rutas/[slug]/[lesson].astro` | Create | Activity page con breadcrumb |
| `src/pages/padres.astro` | Create | Guía pedagógica padres |
| `src/pages/escuelas.astro` | Create | Placeholder coming soon |
| `src/pages/posts/*` | Delete | Reemplazado por /explorar + /rutas |

### CLI

| File | Action | Description |
|------|--------|-------------|
| `scripts/new-lesson.ts` | Create | Scaffold lesson MDX con todos campos STEAM (replaces new-post) |
| `scripts/new-post.ts` | Delete | Reemplazado |

## Interfaces

```ts
// src/components/mdx/MaterialsList.astro
interface Material {
  name: string;
  qty: string;       // "2 unidades" / "30cm"
  optional?: boolean;
  sourceUrl?: string;  // Mercado Libre link
}
interface Props { items: Material[] }
```

```ts
// extended articles schema (Zod)
export const lessonExtraSchema = z.object({
  ageMin: z.number().int().min(0).max(99).default(8),
  ageMax: z.number().int().min(0).max(99).default(12),
  difficulty: z.number().int().min(1).max(5).default(2),
  durationMinutes: z.number().int().min(1).default(30),
  steamCategories: z.array(z.enum(['S','T','E','A','M'])).min(1).max(5),
  materials: z.array(z.object({ name: z.string(), qty: z.string(), optional: z.boolean().default(false), sourceUrl: z.url().optional() })).default([]),
  safetyNotes: z.array(z.object({ type: z.enum(['cortante','calor','quimico','supervision','electrico']), text: z.string() })).default([]),
  parentTip: z.string().optional(),
  videoUrl: z.string().optional(),  // YouTube ID
  printablePdf: z.string().optional(),
});
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Lesson schema extends parses | Vitest + zod safeParse |
| Unit | MaterialsList renders qty + optional | Vitest snapshot |
| Unit | SafetyNote per-type icon mapping | Vitest |
| Visual | Landing kids + lesson + ruta at 6 viewports | Playwright snapshot |
| A11y | Axe-core scan WCAG AAA contrast | Playwright + axe |
| Smoke | Build with 3 sample lessons OK | CI step (manual ahora) |
| E2E | Reader: explorar → ruta → lesson → marcar leído (localStorage) | Playwright |

## Migration / Rollout

### Sequence (M1 rebrand week)

1. **D1**: GitHub repo rename `hidx` → `chispalab`; remote update; CF Pages project rename
2. **D2**: Local dir rename; package.json + README + manifest + favicon + Logo
3. **D3**: Site copy reescribir (about/now/privacy/disclosure/landing); remove /posts/*
4. **D4**: Schema migration extend articles + Zod extend
5. **D5**: Design tokens swap (paleta STEAM + Quicksand)
6. **D6**: Components nuevos batch 1 (Materials/Safety/Badges)
7. **D7**: Components nuevos batch 2 (ExperimentSteps/ParentTip/PrintablePDF/MercadoLibre)
8. **D8**: Routes nuevas (explorar/rutas/padres)
9. **D9**: CLI new-lesson scaffold
10. **D10**: Verify deploy + WCAG AAA audit

### Rollback path

`git revert d557c90a..HEAD` (reverts pivot commits desde rename). Domain hidx.pages.dev preservado durante rebrand (CF Pages rename = mismo project, nuevo URL).

## Open Questions

- [ ] **Domain final**: `.lat` (sugerido) confirmar?
- [ ] **PDF generation tool**: pdfkit (Node) vs puppeteer (heavy) vs satori-pdf? Sugiero `pdfkit` simple
- [ ] **localStorage key naming**: `chispalab:done:{lessonSlug}` o `chispalab:lesson:{slug}:done`? Sugiero el primero
- [ ] **GitHub repo rename SEO impact**: redirect old hidx URL → chispalab? Sugiero crear redirect manual via repo description
- [ ] **Mantener /posts/[slug] redirect a /rutas?**: SEO 301 redirects 1:1 si articles existen, sino /explorar landing
