# Proposal: YachayTree — STEAM LatAm Mini-MVP (S1)

**Project**: `hidx` → renombrar a `YachayTree` · **Date**: 2026-04-29 · **Phase**: sdd-propose (REWRITE) · **Change**: `learning-platform` · **Status**: Draft v1

> **PIVOT TOTAL**. hidx dev pub → YachayTree plataforma STEAM LatAm para kids 8-12. Engineering + Arte hands-on con materiales económicos. NO compite Khan head-on; complementa LatAm hands-on gap.

## Intent

Lanzar **YachayTree** — micro-MVP STEAM enfocado: **10 actividades hands-on E+A (Engineering + Arte) para niños 8-12 años, en español rioplatense/neutro, materiales <$5 USD por proyecto**. Validación tracción 3 meses antes escalar a S+T+M y otras audiencias. Mantiene infra técnica de hidx (Astro 6 + Supabase + CF Pages); reescribe contenido + design system + monetización + branding.

## Scope

### IN scope (Sprint S6 — 3 meses MVP)

#### Rebrand

1. **Renombrar repo**: `hidx` → `yachaytree` (GitHub → repo settings → rename); push origin
2. **NO comprar dominio MVP** — usar `yachaytree.pages.dev` (CF Pages free subdomain). Custom domain defer hasta validación tracción.
3. **CF Pages project rename**: dashboard → Pages → hidx → Settings → rename a `yachaytree` (URL pasa de `hidx.pages.dev` → `yachaytree.pages.dev`)
4. **README + meta tags + OG + manifest** reescribir
5. **Logo nuevo**: SVG monogram "Y" + ícono árbol mini, paleta STEAM gradient — CSS-only
6. **Favicon nuevo** + apple-touch-icon
7. **Site copy reescribir**: header/footer/about/now/privacy/disclosure todos

#### Schema Supabase (re-design)

8. **Migration `lessons` table** (deprecates `articles` for STEAM context):
   - id uuid PK
   - slug text unique
   - title text (1-80)
   - description text (1-280)
   - body_mdx text (lección body)
   - cover text optional
   - age_min int (8 default), age_max int (12 default)
   - difficulty int 1-5 estrellas
   - duration_minutes int (15-60 típico hands-on)
   - steam_categories text[] (subset de S/T/E/A/M; min 1)
   - materials jsonb (lista `[{name, qty, optional, source_url}]`)
   - safety_notes text[] (warnings cortantes/calor/químicos/adulto-supervisión)
   - parent_tip text (guía pedagógica)
   - video_url text optional (YouTube ID)
   - printable_pdf text optional (URL R2 PDF)
   - draft, published_at, updated_at, created_at, author_id (igual que articles)

9. **Migration `routes` table** (deprecates `tracks`):
   - id, slug, title, description, cover, age_range, draft, published_at
   - "ruta" = path curado (ej "Inventos con cartón", "Arte con luz")

10. **Migration `route_lessons` join table**: route_id + lesson_id + position + chapter

11. **Migration data**: backup current `articles` table; truncate + drop NOT needed (reusar `articles` table extendida con nuevas columnas en vez de duplicar)
    - **Decisión simpler**: mantener tabla `articles`, agregar columnas `age_min`, `age_max`, `difficulty`, `duration_minutes`, `steam_categories`, `materials`, `safety_notes`, `parent_tip`, `video_url`, `printable_pdf` opcionales con defaults seguros

12. **Decisión consolidación**: `tracks` ya planeado en learning-platform anterior — renombrarlo a `routes` o mantener `tracks`. Sugiero **mantener `tracks`** (genérico, futureproof) y `articles` (no `lessons` — evita migration nombre)

#### Astro routes (reescribir)

13. **`/`** landing kids-friendly:
    - Hero ilustración (undraw.co) + tagline "Experimentos STEAM en casa con cosas que ya tenés"
    - 3 CTA: "Explorar" + "Para padres" + "Para escuelas (próx)"
    - Featured ruta + 3 lessons recientes
    - Newsletter sign-up "Recibí 1 experimento por semana"

14. **`/explorar`**: catálogo lessons filtrable por edad/categoría STEAM/dificultad/duración

15. **`/rutas`**: index rutas curadas (Engineering hands-on, Arte luz, etc)

16. **`/rutas/[slug]`**: ruta overview con outline lessons

17. **`/rutas/[slug]/[lesson]`**: actividad page (replaces /tracks/[t]/[a] previo):
    - Hero: cover + title + age badge + STEAM badges + difficulty stars + duration
    - **Materiales** section (checklist visual con MaterialsList component)
    - **Seguridad** section (SafetyNote callouts)
    - **Pasos** (Steps component reused; iconos kids-friendly)
    - **Foto/Video proceso** (Image + VideoPlayer privacy-first)
    - **Tip para padres** (ParentTip callout collapsible)
    - **PDF descargable** botón
    - Sticky bottom: "Marcar completado" + Anterior/Siguiente
    - Comments defer

18. **`/padres`**: guía pedagógica para padres (cómo usar la plataforma con sus hijos)

19. **`/escuelas`** (placeholder MVP): "próximamente; cómo adoptamos contenido en aulas"

20. **`/labs`** (defer Phase 2): standalone interactive simulations PhET-style

#### Components nuevos (reemplazar dev components)

21. **`<MaterialsList>`** — checklist visual materiales con qty, opcional, source link
22. **`<SafetyNote>`** — callout con icono per type (cortante/calor/químico/supervisión)
23. **`<AgeBadge>`** — pill colorada (kids 8-12 verde / teens 13-17 azul / adultos púrpura)
24. **`<STEAMBadge>`** — 5 iconos cuadrados (S verde / T azul / E naranja / A rosa / M púrpura)
25. **`<DifficultyStars>`** — 1-5 estrellas
26. **`<DurationBadge>`** — clock icon + minutes
27. **`<ParentTip>`** — collapsible callout estilo Aside pero target padres
28. **`<ExperimentSteps>`** — extension de Steps con foto/video por paso
29. **`<PrintablePDFButton>`** — descarga PDF lección
30. **`<MakerProject>`** — multi-session project con checkpoints
31. **`<DragDropQuiz>`** — quiz visual kids friendly (defer Fase 2)
32. **`<MultipleChoice>`** — quiz feedback inmediato (defer Fase 2)

#### Components mantener (relevantes)

- `Image`, `Video`, `YouTubeEmbed`, `Gallery`, `Figure` — reused
- `Callout`, `Steps`, `Spoiler`, `Highlight`, `KeyboardKey` — reused
- `Quote`, `Aside`, `FullBleed` — reused
- `RelatedPosts`, `ShareButtons`, `AuthorBio` — reused

#### Components eliminar (descartar dev)

- `CodeTabs`, `CodeDiff`, `Terminal`, `Mermaid` (defer hasta tema "código para chicos")
- `RepoCard`, `TweetStatic`, `Compare` (defer)
- `AffiliateLink` (re-implementar como link Amazon STEAM kits)
- `TipJar` (re-target padres support)
- `CodeDemo` (defer)

#### Design system reescribir

33. **Paleta colores** STEAM-themed:
    - Science: verde `oklch(0.7 0.18 145)`
    - Tech: azul `oklch(0.65 0.18 240)`
    - Engineering: naranja `oklch(0.72 0.18 50)`
    - Arts: rosa `oklch(0.72 0.18 350)`
    - Math: púrpura `oklch(0.65 0.18 295)`
    - Background light bone `oklch(0.98 0.01 80)` (default)
    - Background dark midnight `oklch(0.18 0.02 240)` (opcional kids menos vibrante)
    - Accent kid-friendly amarillo `oklch(0.85 0.16 95)`

34. **Typography swap**: Inter → **Quicksand Variable** (más friendly kids/family) + JetBrains Mono solo para code rare

35. **Iconografía**: Heroicons → **Tabler Icons** (más educational variety)

36. **Ilustraciones inline**: undraw.co (free) + open-peeps + blush.design — categorías kids/lab/school

37. **Animaciones**: Lottie embeds para feedback (correct answer ✓, loading, etc)

38. **WCAG AAA**: contraste alto, font ≥18px body, focus rings visibles, alt text estricto

#### Monetización STEAM

39. **Ads networks COPPA-compliant** (kids <13):
    - **Mediavine Family** (preferido) — requirement 50k visits/mo (long road)
    - **Ezoic Edu** (alt) — lower threshold
    - **SuperAwesome KidsTech** (premium kids ads)
    - **AdSense for Kids** (last resort)
    - MVP: lanzar SIN ads hasta 10k visits/mo; aplicar Mediavine después

40. **Affiliate Amazon kits STEAM** (high relevancia):
    - Kits robotics kids (Makeblock, Sphero, Lego Mindstorms)
    - Materiales lab (popotes, cartón, gomas, baterías, motores DC)
    - Libros STEAM kids español
    - Componente `<AmazonProduct>` con disclosure auto

41. **Sponsorships brands STEAM** (long-term):
    - Lego Education
    - Makey Makey
    - MakeBlock
    - National Geographic Kids ES
    - Tinkercad Autodesk

42. **Tip jar padres** Ko-fi mantener (re-target audience adulta)

43. **Subscription familiar** (Fase 2): $3-5 USD/mes acceso PDFs printable + early access lessons + comunidad privada

44. **Venta paquetes escuelas LatAm** (Fase 3): currículum STEAM trimestral $50-100 USD per aula

45. **NO Google AdSense general** — sigue rejected por:
    - Approval blocker sitio nuevo
    - UX hostil para kids
    - Cookie consent obligatorio (rompe COPPA strict mode)

#### Content strategy MVP

46. **10 lessons E+A para kids 8-12**:
    - Catapulta de palitos de helado (E)
    - Circuito de limón con LED (E+S)
    - Caleidoscopio con CD viejo (A+S)
    - Brújula casera con aguja imantada (S+E)
    - Mosaico con papel reciclado (A)
    - Auto que rueda con globo (E)
    - Pintura con sal y acuarelas (A+S)
    - Hilado con bobina y motor (E)
    - Dibujo simétrico con espejos (A+M)
    - Reloj de sol portátil (S+E+M)

47. **3 rutas curadas**:
    - "Inventos con cartón" (4 lessons E)
    - "Arte y ciencia con luz" (3 lessons A+S)
    - "Mecánica para chicos" (3 lessons E+M)

48. **Producción por lesson** (~4-6h c/u):
    - Investigación / testeo físico
    - Foto/video del proceso (smartphone OK)
    - Redacción MDX
    - Materiales list precisión
    - Safety notes
    - Parent tip pedagógico

#### CLI updates

49. **`scripts/new-lesson.ts`** (replaces new-post): scaffold con todos campos STEAM
50. **`scripts/upload-lesson-media.ts`** (extends upload-asset): subir foto/video/PDF a Supabase Storage por slug

#### Docs

51. **`docs/authoring-stem.md`**: cómo escribir lección STEAM, foto/video tips smartphone, safety guidelines
52. **`docs/voice.md`**: tono LatAm rioplatense kids-friendly examples
53. **`docs/parent-tips.md`**: pedagogía padres-niños lab home

### OUT of scope (defer Fase 2/3)

- **S+T+M categorías** (solo E+A MVP)
- **Audiencia teens 13-17** (defer)
- **Audiencia adultos no-STEM** (defer)
- **3 sub-sites** (S4 approach defer)
- **Visual roadmap interactivo SVG** (Satori OG defer)
- **Quizzes interactivos** (DragDrop, MultipleChoice defer)
- **Comments / discussion** (Giscus defer)
- **User accounts / auth** (todo state localStorage MVP)
- **Server-side progress tracking** (defer)
- **Live workshops / mentorship**
- **Subscription paywall** (defer Fase 2)
- **Curso pago bootcamp** (defer)
- **i18n EN, PT-BR** (defer)
- **/labs interactive simulations** (defer)
- **/escuelas full B2B program** (placeholder MVP)
- **Video original production studio-grade** (smartphone OK MVP)
- **Mobile app** (web responsive MVP)
- **Mediavine apply** (necesita 50k mo — defer hasta tracción real)
- **AdSense general** (rejected per ADR-105 + this ADR-511)
- **Khan Academy partnership exploration** (interesting pero defer hasta producto launched)

## Approach

### Sprint plan (3 meses MVP)

| Mes | Focus | Días dev | Días content |
|-----|-------|----------|--------------|
| **M1 — Rebrand + infra** | rename hidx→yachaytree, dominio, schema migrations, design system swap, components base | 10 | 0 |
| **M2 — Content production** | 10 lessons + 3 rutas writing + foto/video shots + PDFs printable | 5 | 25 |
| **M3 — Polish + launch** | Lighthouse + a11y WCAG AAA + mobile pass + analytics + soft launch | 8 | 5 |

Total: ~23 días dev + 30 días content production.

### Architectural decisions

1. **Reuse infra hidx 100%** (Astro 6 + Supabase + CF Pages + MDX + 80% components)
2. **Rebrand sí, replatform no** — gana 2-3 semanas vs from-scratch
3. **Schema extension vs replacement** — agregar columnas a `articles` (no nueva tabla `lessons`); mantiene loader + CLI + RLS
4. **Mantener `tracks` table name** (genérico) en vez de renombrar `routes` — evita migration extra
5. **localStorage progress** (no auth MVP) — completar lección flag local
6. **Spanish-only LatAm voice** — no neutral España, no EN
7. **WCAG AAA enforced** — kids friendly + accesibilidad real
8. **Sin ads hasta 10k visits/mo** — apply Mediavine después; UX limpia mientras tanto
9. **Stack reusable Fase 2/3** — schema cubre teens + adultos sin nueva migration
10. **Khan complementary positioning** — copy + about explicit "complementamos Khan en LatAm hands-on"

### Project rename plan

```bash
# Local (rename mostly cosmetic — git history preserved)
gh repo rename yachaytree --repo felipet1987/hidx
git remote set-url origin git@github.com:felipet1987/yachaytree.git
mv hidx yachaytree
# package.json name: hidx -> yachaytree
# README + manifest + meta tags update
# CF Pages: dashboard rename project hidx -> yachaytree (URL yachaytree.pages.dev)
# Supabase: project name "hidx" -> "yachaytree" (cosmetic; ref ID stays jztvajdsuixxgfdluvqt)
```

## Success Criteria

### Technical gates

- [ ] Repo renombrado a `yachaytree`, push exitoso
- [ ] Dominio `yachaytree.lat` (o alt) apunta a CF Pages
- [ ] Schema migration aplica clean local + Cloud (extiende articles + tracks)
- [ ] 10 lessons publicadas con materials/safety/parent_tip completos
- [ ] 3 rutas curadas con outline ordenado
- [ ] Lighthouse Mobile: perf ≥95, a11y ≥98 (WCAG AAA), SEO =100
- [ ] WCAG AAA contraste verificado per page
- [ ] PDF descargables funcionan (R2 storage)
- [ ] localStorage progress persiste
- [ ] Build time < 3min con 10 lessons
- [ ] CSP headers incluyen Mediavine domains (preparar para futuro)

### Content gates

- [ ] 10 lessons E+A producidas con foto/video proceso
- [ ] Materiales todos < $5 USD verificable mercado LatAm
- [ ] Safety notes per lesson (cortante / calor / químico / supervisión)
- [ ] Parent tip per lesson (pedagogía 2-3 párrafos)
- [ ] Voice rioplatense neutral consistente (revisión Editorial)

### UX gates

- [ ] Niño 8-12 puede navegar landing → lección sin ayuda (test 1 niño real)
- [ ] Padre puede entender lección + safety en <2min
- [ ] Mobile responsive 320 → 1920 sin overflow
- [ ] Print stylesheet PDF lección legible blanco/negro
- [ ] Touch targets ≥44px (kids hands)

## Open Questions

- [ ] **Domain final**: `yachaytree.lat` / `.com` / `.com.ar` / `.org` — sugiero `.lat` (LatAm specific TLD)
- [ ] **Logo design**: CSS monogram "C" o Figma profi (~$200 fiverr)? Sugiero CSS-only MVP
- [ ] **Voice rioplatense vs neutral LatAm**: rioplatense (vos/tenés) o neutral (tú/tienes) para no excluir audience MX/CO/PE? Sugiero **neutral con guiños rioplatenses** (ej "che" raro, "tu" base)
- [ ] **Foto/video tools**: smartphone + iMovie/CapCut OK MVP, o invertir Sony ZV-1 ($600)? Sugiero smartphone MVP
- [ ] **PDF generation**: build-time (Astro endpoint) o tool externo (Canva)? Sugiero **build-time** via `pdfkit` o `puppeteer` worker
- [ ] **Newsletter para padres**: Beehiiv same que hidx plan, o tool kids-friendly (ConvertKit)? Sugiero Beehiiv (gratis 2.5k subs)
- [ ] **Analytics kids COPPA**: CF Web Analytics (sin cookies) cumple, mantener; agregar Plausible (también COPPA-safe) self-host? Sugiero CF Web Analytics solo MVP
- [ ] **Materials sourcing list**: link Amazon affiliates o Mercado Libre LatAm primary? Sugiero **Mercado Libre primary** (LatAm) + Amazon backup

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Content velocity 30 días content = quemador solo | Very High | Critical | Aceptar lanzar con 5 lessons en mes 2; otros "próximamente"; reclutar voluntarios LatAm padres educadores |
| Foto/video producción amateur baja calidad percibida | High | Medium | Ring light $20 + smartphone moderno + iMovie/CapCut suficiente MVP; iterar quality post-launch |
| Niños 8-12 no son audience self-driven (padres seleccionan) | Very High | High | Diseñar para padre primero (descubre + comparte); kid usa después |
| Khan Academy lanza producto similar LatAm | Low (no historial) | High | Diferenciación hands-on materiales reciclados Khan no replica fácil |
| Sin ads hasta 10k mo = revenue $0 mes 1-12 | Very High | Medium | Affiliate Amazon kits + Ko-fi + sponsorship outreach desde día 1; aceptar runway largo |
| Compete en niche LatAm = mercado chico revenue | High | High | Aceptar; alternativa = expand audience EN PT-BR Fase 3 |
| WCAG AAA difícil con paleta vibrante | Medium | High | Pair colors high contrast (verde-blanco, púrpura-blanco); test contrast WAVE/axe |
| Materials LatAm precio varia país | Medium | Medium | Lista en lección dice "aprox $5 USD"; alternativas sugeridas (cartón = papel reciclado) |
| Safety LatAm: kids supervisión variable | Medium | High | SafetyNote estricto; "actividad para realizar con un adulto" obligatorio cualquier lección con cortes/calor/electricidad |
| Diseño "kid-friendly" repele adult viewers | High | Medium | Aceptado para S1 (kids primary); navigation `/padres` dedicada con tono adulto |
| Rebrand SEO authority cero | Certain | Low | hidx tampoco tenía; greenfield SEO con keyword "STEAM kids español LatAm" |

## Architectural Decisions Record (ADR seeds)

- **ADR-501**: Pivot total hidx dev → YachayTree STEAM LatAm (supersedes prior hidx ADRs)
- **ADR-502**: S1 mini-MVP scope (1 audience kids 8-12, E+A categorías) — defer S+T+M y otras audiences
- **ADR-503**: Reuse infra hidx 100%; rename project, no replatform
- **ADR-504**: Schema extension `articles` table (no `lessons` separate) + opt columns STEAM
- **ADR-505**: localStorage progress only (no auth MVP)
- **ADR-506**: Spanish neutral LatAm con guiños rioplatenses (no España, no Mexico-only)
- **ADR-507**: WCAG AAA enforced (kids accesibilidad strict)
- **ADR-508**: Sin ads hasta 10k visits/mo (apply Mediavine Family después)
- **ADR-509**: Affiliate Mercado Libre primary + Amazon backup (LatAm market fit)
- **ADR-510**: Voz Khan-complementary, no Khan-competitive
- **ADR-511**: COPPA strict mode (kids <13) — sin PII collection sin consent verificable padres
- **ADR-512**: Foto/video smartphone MVP (no studio production)
- **ADR-513**: PDF build-time (defer tool decision: pdfkit/puppeteer/satori-pdf)
- **ADR-514**: NO custom domain MVP — `yachaytree.pages.dev` CF Pages free subdomain hasta validación tracción
- **ADR-515**: Logo CSS monogram "Y" + tree icon MVP, no profi design

## Next Phase

→ `/sdd-design learning-platform` — finalize: project rename steps, schema migration SQL, components per-design, content template MDX skeleton, design tokens shift, monetización setup detail.

→ Coordinación crítica:
- **Antes design**: confirmar nombre final `YachayTree` + dominio
- **Después design**: pausa rich-articles + supabase-cf-integration changes para reusar trabajo (rename CF project, etc)

→ Otros changes en curso (impacto):
- `inject-articles` Phase 2 (loader Supabase) — sigue válido (compartido)
- `supabase-cf-integration` Phase 1-3 — sigue válido (rename CF project hidx→yachaytree solo cambio dashboard)
- `rich-articles` Phase 8 — descartar (tests E2E para components dev borrar)
- `design-uplift-adsense` — replanificar Capa 1+2 con Mediavine Family + Mercado Libre affiliate

¿Confirmás `YachayTree` + `.lat` domain + arrancamos design phase?
