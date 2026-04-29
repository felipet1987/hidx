# Tasks: YachayTree S1 Mini-MVP

> Mostly visual/refactor work. TDD where lib code testable (schema extension, lesson loader extras, MaterialsList logic).

## Phase 1: Rebrand (D1-D3 / M1)

- [x] 1.1 gh repo rename → https://github.com/felipet1987/yachaytree
- [x] 1.2 git remote SSH set yachaytree
- [ ] 1.3 ~~Local dir rename~~ DEFERRED (Docker bind mount + cwd risk; manual user)
- [ ] 1.4 ~~CF Pages project rename~~ DEFERRED (sin CLI command; cosmetic OK on hidx.pages.dev)
- [x] 1.5 package.json name=yachaytree + description STEAM
- [x] 1.6 README reescrito YachayTree mission LatAm + Docker dev
- [x] 1.7 public/site.webmanifest YachayTree + theme verde STEAM
- [x] 1.8 public/favicon.svg "Y" + árbol mini gradient verde→naranja
- [x] 1.9 public/llms.txt STEAM + CC + URL yachaytree
- [x] 1.10 astro.config site URL kept hidx.pages.dev (defer rename)
- [x] 1.11 Logo.astro "Y" + árbol mini SVG STEAM gradient
- [x] 1.12 Header nav: Explorar / Rutas / Padres / Sobre + brand YachayTree
- [x] 1.13 Footer Copyright YachayTree + GitHub link updated
- [x] 1.14 authors.ts bio Felipe STEAM-aware "papá curioso + LatAm"
- [x] 1.15 about/now/privacy/disclosure/index reescritos (COPPA + Khan-complementary)
- [x] 1.16 Deleted /posts/* + /tags/* + hello.mdx orphans
- [x] 1.17 Deploy https://hidx.pages.dev/ HTTP 200 sirviendo YachayTree

## Phase 2: Schema + design tokens (D4-D5)

- [x] 2.1 Migration `20260429064422_yachaytree_extension.sql` ALTER articles ADD STEAM cols (age_min/age_max/difficulty/duration_minutes/steam_categories/materials/safety_notes/parent_tip/video_url/printable_pdf) all nullable defaults
- [x] 2.2 `supabase db push` Cloud ✅; ⚠️ local DEFERRED (CLI v2.48 storage image version glitch — defer hasta upgrade CLI)
- [x] 2.3 RED 15 Vitest cases — lesson defaults, full STEAM, difficulty range, steam categories, materials, safety notes
- [x] 2.4 GREEN `src/content/schemas.ts` — lessonSchema + materialSchema + safetyNoteSchema + trackSchema + STEAM enum; backwards-compat aliases postSchema/seriesSchema
- [x] 2.5 `pnpm add @fontsource-variable/quicksand`; Inter sigue en deps por compat (no importado)
- [x] 2.6 `src/styles/global.css` STEAM tokens swap (5 letter colors + accent verde→naranja + bg bone + slate ink + Quicksand); WCAG AAA contrast pairs
- [x] 2.7 Build OK 6 pages + deploy live (color-s/a/m visible en HTML)

## Phase 3: Components (D6-D7)

- [ ] 3.1 Create `src/components/mdx/MaterialsList.astro` — checklist visual qty + opcional + sourceUrl
- [ ] 3.2 Create `src/components/mdx/SafetyNote.astro` — callout per type icono (cortante/calor/químico/electrico/supervisión)
- [ ] 3.3 Create `src/components/mdx/AgeBadge.astro` — pill 8-12 / 13-17 / 18+ colored
- [ ] 3.4 Create `src/components/mdx/STEAMBadge.astro` — 5 iconos cuadrados S/T/E/A/M
- [ ] 3.5 Create `src/components/mdx/DifficultyStars.astro` — 1-5 estrellas
- [ ] 3.6 Create `src/components/mdx/DurationBadge.astro` — clock + minutes
- [ ] 3.7 Create `src/components/mdx/ParentTip.astro` — collapsible callout audiencia padres
- [ ] 3.8 Create `src/components/mdx/ExperimentSteps.astro` — Steps con foto/video por paso
- [ ] 3.9 Create `src/components/mdx/PrintablePDFButton.astro` — button descarga PDF
- [ ] 3.10 Create `src/components/mdx/MercadoLibreProduct.astro` — affiliate link + disclosure
- [ ] 3.11 Modify `src/components/mdx/index.ts` → +10 exports + WHITELIST extended; mover dev components (CodeTabs/CodeDiff/Terminal/Mermaid/RepoCard/TweetStatic/AffiliateLink/CodeDemo) a array `_DEPRECATED` separate (no remove archivos)

## Phase 4: Routes (D8)

- [ ] 4.1 Create `src/pages/explorar.astro` — catálogo lessons filterable por edad/STEAM/dificultad/duración
- [ ] 4.2 Create `src/pages/rutas/index.astro` — index rutas curadas
- [ ] 4.3 Create `src/pages/rutas/[slug].astro` — ruta overview + outline lessons (renombra desde /tracks)
- [ ] 4.4 Create `src/pages/rutas/[slug]/[lesson].astro` — activity page con breadcrumb + ArticleNavBar + MaterialsList + SafetyNote + ExperimentSteps + ParentTip
- [ ] 4.5 Create `src/pages/padres.astro` — guía pedagógica padres
- [ ] 4.6 Create `src/pages/escuelas.astro` — placeholder coming soon

## Phase 5: CLI + verify (D9-D10)

- [ ] 5.1 Create `scripts/new-lesson.ts` — scaffold con todos campos STEAM extended
- [ ] 5.2 Delete `scripts/new-post.ts` (replaced)
- [ ] 5.3 `pnpm test` 32+ tests pass (incluye 5+ nuevos schema)
- [ ] 5.4 `pnpm check` 0 errors / 0 warnings
- [ ] 5.5 Deploy + Lighthouse Mobile ≥95 perf, a11y ≥98 (WCAG AAA), SEO 100
- [ ] 5.6 Mobile responsive verify 320 → 1920 con Playwright snapshots
- [ ] 5.7 axe-core scan WCAG AAA contrast all routes

## Phase 6: Content production (M2 — paralelo, manual)

- [ ] 6.1 Brainstorm + lock 10 lessons E+A para kids 8-12
- [ ] 6.2-6.11 Producir 10 lessons (4-6h c/u): testeo físico + foto/video proceso + redacción MDX + materiales + safety + parent_tip
- [ ] 6.12 Brainstorm + lock 3 rutas curadas (Inventos cartón / Arte luz / Mecánica chicos)
- [ ] 6.13-6.15 Crear 3 tracks Supabase + asignar lessons via track_articles join

## Phase 7: Docs + verify launch (M3)

- [ ] 7.1 Create `docs/authoring-stem.md` — cómo escribir lección STEAM smartphone foto/video tips
- [ ] 7.2 Create `docs/voice.md` — tono LatAm rioplatense kids-friendly examples
- [ ] 7.3 Create `docs/parent-tips.md` — pedagogía padres-niños lab home
- [ ] 7.4 Update `docs/components.md` con +10 nuevos components
- [ ] 7.5 E2E Playwright: explorar → ruta → lesson → marcar leído (localStorage)
- [ ] 7.6 Soft launch: anuncio Twitter/Mastodon/LinkedIn LatAm padres/maestros
- [ ] 7.7 Analytics setup: CF Web Analytics dashboard chequear pageviews
