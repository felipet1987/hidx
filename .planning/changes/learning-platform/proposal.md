# Proposal: hidx Learning Tracks (A5 + 5-min articles)

**Project**: `hidx` · **Date**: 2026-04-29 · **Phase**: sdd-propose · **Change**: `learning-platform` · **Status**: Draft v1

## Intent

Pivot content strategy: long-form pillar posts (1500w) → **bite-sized 5-min articles (~1100w)** agrupados en **tracks visuales** estilo roadmap.sh. Mantiene SSG (cero auth, cero pivot técnico). Diferenciación: Spanish-first + opinionated senior-dev lens. Sin LMS state, sin progress tracking server-side (localStorage opcional para "leído").

**Monetización pivot: PUBLICIDAD primary** (mover de Capa 1 affiliate de roadmap original a P0). Aplica B3 propuesto en `design-uplift-adsense` change (EthicalAds + Carbon Ads; **NO Google AdSense** — RPM bajo + UX hostil + rejection blocker). Tracks aceleran inventory: más page-views por sesión (article → next article → next…) = más impressions = más revenue. Affiliate + TipJar quedan como capa secundaria.

## Scope

### IN scope (Sprint S6 — ~2-3 semanas)

#### Schema Supabase (extensión)

1. **Migration `tracks` table**: top-level learning path
   - `id` uuid PK
   - `slug` text unique (regex `^[a-z0-9-]+$`)
   - `title` text (1-80)
   - `description` text (1-280) — más largo que article
   - `cover` text optional
   - `level` enum (`beginner`/`intermediate`/`advanced`)
   - `tags` text[] (1-6)
   - `published_at` timestamptz
   - `draft` boolean default true
   - RLS pública lectura published only

2. **Migration `track_articles` join table**:
   - `track_id` uuid FK
   - `article_id` uuid FK
   - `position` int (orden dentro del track)
   - `chapter` text optional (agrupa lessons en sub-secciones del track)
   - PK composite (track_id, article_id)
   - Index on (track_id, position)

3. **Migration `articles.reading_minutes` denormalized column** (auto-computed via trigger)
   - Calcula `body_mdx` words / 220, redondea a min 1
   - Trigger AFTER INSERT/UPDATE recalcula
   - Permite filtrar tracks por tiempo total

#### Astro routes (nuevas)

4. **`/tracks`** — landing index todos los tracks publicados
   - Cards con cover + title + descripción + N articles + tiempo total + level badge
   - Filter por level + tags
   - Sort por posicion editorial o popularidad (sin metric real → sort estable por título)

5. **`/tracks/[slug]`** — track overview
   - Hero con title + descripción + cover + nivel + tags + tiempo total
   - Sidebar/inline TOC navegable: lista de articles ordenados con `position` + chapter dividers
   - Each article entry: title + reading minutes + checkbox "leído" (localStorage)
   - CTA "Empezar track" → primer article
   - Previous/next nav entre tracks (si pertenece a series)

6. **`/tracks/[slug]/[articleSlug]`** — article view dentro de track context
   - Mismo PostLayout que `/posts/[slug]` PERO con:
   - Breadcrumb: Tracks → Track Title → Article Title
   - Sticky bottom bar "← Anterior | Marcar leído | Siguiente →"
   - Mini progress bar arriba mostrando posición en el track (X de N)
   - Checkbox "leído" persiste localStorage (key: `hidx:read:{trackSlug}:{articleSlug}`)
   - Related articles (en el mismo track) reemplaza related global

7. **`/tracks/[slug]/visual.svg.ts`** (opcional) — endpoint Satori que renderiza diagrama del track tipo roadmap.sh
   - Útil para OG image + share link
   - Defer si bloquea — usar cover image fija en MVP

#### Components nuevos

8. **`<TrackProgress>`** — visual bar showing N de M articles read (localStorage source)
9. **`<TrackOutline>`** — sidebar/inline TOC con chapters + articles + reading time + read state
10. **`<TrackCard>`** — card preview en /tracks index
11. **`<ArticleNavBar>`** — sticky bottom anterior/siguiente + marcar leído
12. **`<ReadCheckbox>`** — Web Component minimal que toggle localStorage flag
13. **`<LevelBadge>`** — pill colorada per level (beginner verde, intermediate cyan, advanced violet)

#### Layout updates

14. **`PostLayout.astro`** — accept optional `track` prop; if present, render breadcrumb + ArticleNavBar + replace RelatedPosts with TrackOutline mini
15. **Header**: agregar nav link "Tracks" entre "artículos" y "sobre"
16. **`<RelatedPosts>`** — extender lib `related.ts` para opcionalmente agrupar por track (priorizar same-track first)

#### Content strategy

17. **Split pillar posts existentes**: cada uno (~1500-3000w) → 3-5 articles cortos (~1100w c/u). Total objetivo: 20-25 articles cortos en 5 tracks
18. **Track inicial sugerido (5 propuestos)**:
    - "Astro 6 producción de cero a CF Pages" (~5 articles)
    - "Supabase como backend SSG" (~4 articles)
    - "Patterns de monetización web sin AdSense" (~4 articles)
    - "Postgres para devs JS/TS" (~5 articles)
    - "MDX rich content con Astro" (~4 articles)

#### CLI updates (coord con inject-articles)

19. **Modify `scripts/new-post.ts`**: nuevo flag `--track=<slug>` que inserta join row + auto-asigna position al final
20. **New `scripts/new-track.ts`**: `pnpm new:track "Title" --slug=astro-prod --level=intermediate --tags=astro,deploy` crea row tracks
21. **New `scripts/reorder-track.ts`**: `pnpm reorder:track <slug>` UI CLI inline para reordenar articles por position

#### Docs

22. **`docs/tracks.md`** — autoría: cómo crear track, cómo dividir long-form en short articles, naming conventions
23. **Update `docs/components.md`** con nuevos 6 components

#### Monetización publicidad (coordina con `design-uplift-adsense` Phase 7)

24. **Acelera implementación de `<EthicalAdSlot>` y `<CarbonAdSlot>`** ya proposed (mover de roadmap futuro a parte de este change)
25. **Slot placement nuevo en tracks UX**:
    - `/tracks/[slug]` overview: 1 EthicalAd slot debajo de hero, antes del outline
    - `/tracks/[slug]/[article]`: 1 EthicalAd slot mid-article (after first H2) — same as PostLayout regular
    - `/tracks` index: 1 CarbonAd slot debajo de hero (sidebar-like dimensions 130×100)
    - **MAX 1 slot per page** (UX guardrail per ADR-106)
26. **Disclosure existing** `/disclosure` page actualizar mencionando ad networks usados
27. **`PUBLIC_ETHICAL_PUBLISHER_ID` + `PUBLIC_CARBON_SERIAL` env vars**: agregar a CF Pages secrets cuando aplicación networks aprobada
28. **Apply EthicalAds**: requirement publishar 5+ tracks (~25 articles) primero (mejor approval rate). Track inicial cuenta
29. **Apply Carbon Ads**: requirement 10k unique/mo — defer hasta tener tráfico
30. **Métricas básicas baseline**: medir CTR, RPM, fill rate por slot via CF Web Analytics (ya wired en `supabase-cf-integration` change)

### OUT of scope (defer)

- **Google AdSense** explícitamente rechazado (rationale en `design-uplift-adsense` exploration §B): RPM dev sites $0.50-2 vs Carbon $3-10; >70% adblock dev audience; rompe cookie-free promise; build perf regression; approval rejection probable site sin contenido suficiente
- **Cookie consent banner** (no necesario con EthicalAds + Carbon Ads — networks privacy-first sin cookies)
- **Newsletter sponsorships** (Capa 3 original, defer hasta tener subs)
- **Paid subscription / paywall** (Capa 4 original, defer indefinido — modelo free + ads contradice)
- **User accounts / auth** — todo state via localStorage MVP
- **Server-side progress tracking** (futuro Fase 2 si demanda)
- **Quizzes / assessments**
- **Code exercises con autograde**
- **Certificates PDF**
- **Comments / discussion** (defer Giscus integration)
- **Mentorship / live workshops**
- **Subscriptions / payments dedicated** (mantiene Capa 1 affiliate)
- **Search global** (defer Pagefind)
- **Streaks / gamification / XP**
- **Mobile app**
- **Visual roadmap interactivo SVG** (defer; static cover image MVP)
- **Multi-author** (Felipe solo)
- **i18n EN translation** (Spanish-only MVP)

## Approach

### Sprint plan

| Sub | Goal | Días |
|-----|------|------|
| **S6a — Schema migrations** | tracks + track_articles + reading_minutes trigger | 0.5 |
| **S6b — Component primitives** | TrackCard, LevelBadge, ReadCheckbox, TrackProgress | 1 |
| **S6c — /tracks index + /tracks/[slug] overview** | Astro routes + getCollection extension | 1 |
| **S6d — Article-in-track view** | /tracks/[slug]/[article] reuse PostLayout + breadcrumb + ArticleNavBar | 1 |
| **S6e — TrackOutline + RelatedPosts extension** | sidebar w/ chapter groups; same-track priority in related lib | 0.75 |
| **S6f — CLI scripts** | new-track, reorder-track, new-post --track flag | 0.75 |
| **S6g — Content split** | dividir pillar posts existentes en 20-25 short articles + crear 5 tracks | 5-7 (manual writing) |
| **S6h — Ad slots integration** | EthicalAd slot in /tracks landing + track overview + article-in-track; CarbonAd slot Sidebar; disclosure update | 0.5 |
| **S6i — Docs + verify** | docs/tracks.md + docs/components update + LH gate | 0.5 |

Total: ~6 días dev + 5-7 días content writing (paralelo).

### Architectural decisions

1. **SSG mantenido 100%** (ADR-003 inject-articles intacto). Cero auth runtime
2. **Read state vía localStorage** key `hidx:read:{trackSlug}:{articleSlug}` boolean. NO sync server-side. NO multi-device. NO histórico
3. **Track como first-class entity** en Supabase (no tag-overlap inferred): editorialmente curado vía CLI/Studio
4. **Position-based ordering** en track_articles (vs published_at): permite resequence sin renombrar slugs
5. **Article reusable cross-track**: una article puede pertenecer a múltiples tracks (join table N:N)
6. **5-min target reading time** por article: enforced soft via `reading_minutes` denormalized — articles > 7min generan warning en CLI publish
7. **Chapter optional**: agrupa articles dentro de track sin nivel jerárquico extra (vs courses/modules separate table — YAGNI)
8. **Level enum 3 valores** (beginner/intermediate/advanced) — vs 5+ (FCC) — simplicidad
9. **Visual roadmap defer**: static cover image MVP; Satori SVG endpoint Fase 2
10. **Spanish-first**: copy UI + content en español; EN i18n defer Fase 3

### URL structure

```
/                                    landing (no change)
/posts                                all articles (chronological — no change)
/posts/[slug]                         single article standalone (no change)
/tracks                               NEW: tracks index
/tracks/[slug]                        NEW: track overview
/tracks/[slug]/[article]              NEW: article in track context
/tags/[tag]                           tags filter (no change)
/about /now /privacy /disclosure      no change
```

Articles tienen DOS URLs equivalentes: `/posts/[slug]` (standalone) + `/tracks/[track]/[article]` (in-context). Canonical apunta a track-context si pertenece a track principal del article.

## Success Criteria

### Technical gates

- [ ] Schema migrations apply clean (local + Cloud)
- [ ] `/tracks` HTTP 200 lista 5 tracks initial con metadata
- [ ] `/tracks/[slug]` muestra outline articles ordenados + chapter groups
- [ ] `/tracks/[slug]/[article]` renderiza article con breadcrumb + nav bar + progress bar
- [ ] localStorage `hidx:read:*` persiste entre reloads
- [ ] Lighthouse Mobile mantiene ≥95 perf en /tracks index + /tracks/[slug] + article-in-track
- [ ] Build time < 3min con 25 articles + 5 tracks
- [ ] Zero JS por default salvo ReadCheckbox (~300B vanilla)
- [ ] Canonical URLs no se duplican (article tiene 1 canonical único)

### Content gates

- [ ] 5 tracks publicados con metadata completa
- [ ] 20-25 short articles (5-min cada) split de pillar posts existentes
- [ ] Cada article < 7 min reading time (warning soft si excede)
- [ ] CLI `pnpm new:post --track=astro-prod` testeado funciona
- [ ] Track outline navegable mobile + desktop

### UX gates

- [ ] Breadcrumb claro en article-in-track (no se siente "perdido")
- [ ] Read checkbox toggleable con feedback visual
- [ ] Progress bar arriba muestra posición correcta
- [ ] ArticleNavBar sticky bottom funcional
- [ ] /tracks landing carga cards visuales atractivas

## Open Questions (resolver durante design)

- [ ] **Track cover images**: stock Unsplash, custom Figma, o gradient mesh CSS-only? Sugiero CSS-only MVP (matchea theme)
- [ ] **Read state UI ubicación**: checkbox al final del article, o sticky con nav bar bottom? Sugiero ambos (final = explicit, nav bar = quick toggle)
- [ ] **Chapter naming convention**: opcional vs requerido? Sugiero opcional (track sin chapters = lista flat)
- [ ] **Articles dual URL canonical**: ¿`/posts/[slug]` o `/tracks/[track]/[article]` como canonical? Sugiero in-track si tiene `primary_track` field, sino /posts
- [ ] **/tracks vs /learn route**: ¿`/tracks` (más SEO en Spanish) o `/learn`? Sugiero `/tracks` (matchea roadmap.sh patrón)
- [ ] **Reading time warning umbral**: 5min target, 7min hard warning? Sugiero soft warn >7min, no block

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Splitting pillar posts en short articles fragmenta narrativa | High | Medium | Cada article = 1 concepto atómico autocontenido; track outline da contexto |
| 25 articles to write en 5-7 días = ritmo fuerte | High | High | Aceptar 10-15 articles initial launch; expandir post-launch |
| localStorage read state se pierde si user limpia cookies | Medium | Low | Trade aceptable MVP; documentar en footer |
| Articles sin track parent (huérfanos) confuso | Medium | Low | CLI new-post obligatorio --track o explicitamente `--standalone` |
| SEO duplicate content (article en /posts + /tracks) | Medium | High | Canonical estricto; sitemap excluye `/tracks/*/[article]` (solo /posts/[slug] indexable) |
| Visual roadmap defer = tracks landing se ve plain | Medium | Medium | Cover image + level badge + tag chips dan visual richness MVP |
| Pivot mid-flight rich-articles Phase 8 + inject-articles Phase 2 incompletas | High | Medium | Completar inject-articles Phase 2 (Supabase loader) PRIMERO; tracks se monta encima del loader |
| Content velocity bottleneck | High | High | Lanzar con 1 track + 5 articles si necesario; otros tracks "coming soon" |
| EthicalAds rejection sin contenido suficiente | Medium | Medium | Aplicar después de 5 tracks/25 articles publicados; mientras tanto slots vacíos (env-gated) |
| Carbon Ads requiere 10k visits/mo | High (early) | Low | Slot env-gated; renderiza vacío hasta serial set |
| Ads degradan UX learning context | Medium | High | Max 1 slot per page; lazy loaded; no interstitials; placement post-content no antes |
| Article reading flow interrumpido por slot mid-article | Medium | Medium | Slot solo después first H2 (lector ya engaged); A/B test después de tracking analytics ready |
| Ads ROI bajo en sitio nuevo | Very High | Medium | Aceptado; ads = side-income, no business core MVP. Affiliate + content authority = revenue path real largo plazo |

## Architectural Decisions Record (ADR seeds)

- **ADR-501**: A5 SSG-preserved (no auth, no LMS) — pivot incremental
- **ADR-502**: 5-min target article length (~1100w); soft warn >7min
- **ADR-503**: Read state localStorage only (no server sync)
- **ADR-504**: Tracks first-class entity (curated, not tag-inferred)
- **ADR-505**: track_articles join table N:N + position ordering
- **ADR-506**: Optional chapter grouping (no separate courses/modules table)
- **ADR-507**: Level enum 3 valores (beginner/intermediate/advanced)
- **ADR-508**: Spanish-first; EN i18n defer
- **ADR-509**: Articles dual URL (/posts standalone + /tracks/[t]/[a] in-track); canonical via primary_track field
- **ADR-510**: Visual roadmap SVG defer; static cover MVP
- **ADR-511**: Monetización P0 = publicidad EthicalAds + Carbon Ads (NO AdSense — supersedes Capa 1 affiliate priority)
- **ADR-512**: Max 1 ad slot per page (UX guardrail; consistent con `design-uplift-adsense` ADR-106)
- **ADR-513**: NO cookie consent banner needed (privacy-first networks; preserva `/privacy` zero-cookie promise)

## Next Phase

→ `/sdd-design learning-platform` — finalize schema details, route structure, component interfaces, content migration plan.

→ DEPENDENCIA: `inject-articles` Phase 2 (Supabase loader Astro) **MUST complete before** S6c (tracks routes need loader to fetch articles + tracks de Supabase).
