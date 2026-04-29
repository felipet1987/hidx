# Proposal: Rich Articles (Approach 2 — Magazine Grade)

**Project**: `hidx` · **Date**: 2026-04-29 · **Phase**: sdd-propose · **Change**: `rich-articles` · **Status**: Draft v1

## Intent

Elevar artículos a calidad editorial profesional (Stripe Press / Smashing Magazine) con 18 nuevos MDX components + meta UX (related posts, share, drop cap, author bio). Mantener cero JS runtime salvo lazy YouTube embed. Mermaid render build-time. Coordinar con `inject-articles` (whitelist + CLI scaffold + Supabase Storage assets).

## Scope

### IN scope (Sprint S4 — paralelo a S3 inject-articles)

#### Visual (5)
1. **`Image`** — wrapper Astro `<Image>` con AVIF/WebP srcset, lazy, `aspect-ratio` placeholder, optional `caption`, optional `fullBleed` prop
2. **`Video`** — `<video>` MP4/WebM self-host, poster, lazy, captions track opcional
3. **`YouTubeEmbed`** — privacy-first thumbnail + click-to-load iframe (cookies hasta interaction); fallback `<a>` si JS off
4. **`Gallery`** — grid CSS imgs + tiny vanilla lightbox (`<dialog>` API), keyboard nav
5. **`Figure`** — semantic `<figure>` + `<figcaption>` (caption styling consistente)

#### Code (3)
6. **`CodeTabs`** — multi-archivo tabs Shiki, Web Component switch (~500B), horizontal scroll-snap ≥640px / accordion `<details>` <640px
7. **`CodeDiff`** — Shiki language `diff` con +/- coloreado consistente con tema
8. **`Terminal`** — shell prompt `$` + colored output (ANSI-like via inline classes)

#### Diagrams (1)
9. **`Mermaid`** — `<pre class="mermaid">{src}</pre>` procesado en build via `@mermaid-js/mermaid-cli` headless, output SVG inline, cached por hash en `.cache/mermaid/`

#### Embeds (2)
10. **`RepoCard`** — `<RepoCard repo="owner/name">` build-time fetch GitHub API (cache 24h via `.cache/github/`), render card (avatar + descr + stars + lang)
11. **`TweetStatic`** — render desde JSON manual `{ author, handle, body, date }`; sin API runtime

#### Layout (4)
12. **`Quote`** — pull-quote estilizado, gradient border-left, attribution
13. **`Aside`** — margin note (sticky en col derecha ≥1024px, inline blockquote-like <1024px)
14. **`FullBleed`** — wrapper que rompe prose container (negative margin + viewport-width)
15. **`Spoiler`** — `<details>` styled (collapsed por default, click expand)

#### Typography (3)
16. **`Footnote`** + **`Footnotes`** — `<Footnote id="1">text</Footnote>` inline numbered ref + `<Footnotes />` componente al final del post lista todas las refs auto-collected
17. **`KeyboardKey`** — `<kbd>` styled (border + bg + mono font + shadow)
18. **`Highlight`** — colored text bg (yellow/cyan/violet variants)

#### Comparison (1)
19. **`Compare`** — side-by-side table component con header columns + cells

#### Meta (PostLayout enhancements)
20. **Related posts**: footer PostLayout query Supabase para top 3 posts con tag overlap descendiente (current excluido), card mini
21. **Share buttons**: X / LinkedIn / Mastodon (server input por usuario) / Bluesky / Copy URL — anchor links + `<button>` clipboard (~200B vanilla)
22. **Drop cap**: CSS `first-letter` styling auto en primer `<p>` de cada post (typography ornament)
23. **Author bio**: hardcode "Felipe Talavera" en `src/lib/authors.ts`, render footer PostLayout (avatar inline SVG + bio + GitHub link). `authors` table Supabase defer Fase 2

#### CLI integration (coord con inject-articles)
24. **`pnpm media:upload <file> [--slug=]`** — sube a Supabase Storage `article-assets/{slug}/{filename}`, output snippet MDX `<Image src="..." caption="..." />` listo para clipboard
25. **Validator MDX** (en inject-articles validate-mdx.ts) actualiza WHITELIST con los 18 nuevos components

#### Docs
26. **`docs/components.md`** — catálogo cada component: signature, ejemplo MDX, snapshot rendered
27. **`docs/diagrams.md`** — Mermaid quick-start con 5 ejemplos copy-paste (flowchart, sequence, gantt, ER, state)

### OUT of scope (defer Fase 2)

- **Sandpack/StackBlitz** live code playgrounds (~300KB; agregar como `rich-articles-v2` cuando demanda lo justifique)
- **Excalidraw** embeds build-time
- **Charts** vanilla SVG (`Chart` component)
- **`authors` table Supabase** (multi-author RLS) — solo cuando invitemos editores
- **Comments** (Giscus, Cusdis)
- **Analytics events por component** (engagement tracking)
- **Mermaid client-side fallback** (build-time only Fase 1)
- **Image lightbox accesible compleja** (basic `<dialog>` Fase 1)
- **TweetStatic auto-fetch** desde Twitter API (manual JSON)
- **RSS feed images** mejoradas (RSS plain Fase 1)

## Approach

### Sprint plan

| Sub | Goal | Deliverable | Días |
|-----|------|-------------|------|
| **S4a — Visual** | Image, Video, YouTubeEmbed, Gallery, Figure | Hello.mdx renderiza imagen optimizada + video + YT lazy | 1 |
| **S4b — Code** | CodeTabs, CodeDiff, Terminal | Hello.mdx muestra tabs multi-archivo + diff + terminal output | 1 |
| **S4c — Mermaid build-time** | Mermaid CLI integration con cache | Diagrama flowchart en hello.mdx renderiza SVG inline | 1 |
| **S4d — Layout + typography** | Quote, Aside, FullBleed, Spoiler, Footnote, Kbd, Highlight, Drop cap | PostLayout enriquecido visualmente | 1 |
| **S4e — Embeds + Compare** | RepoCard, TweetStatic, Compare | Hello.mdx incluye repo card + tweet + comparison table | 0.5 |
| **S4f — Meta UX** | Related posts query, share buttons, author bio | Footer post enriquecido | 0.5 |
| **S4g — CLI media upload + docs** | `pnpm media:upload` + docs/components.md + docs/diagrams.md | Workflow autoría documentado end-to-end | 0.5 |

Total: ~5.5 días dev.

### Architectural decisions

1. **Cero JS por default** — todos los components SSG salvo: YouTube lazy iframe, CodeTabs switcher, Gallery lightbox, share-Copy button, Spoiler `<details>` (native, no JS)
2. **Astro `<Image>` pipeline** maneja srcset/AVIF/WebP automáticamente; nuestro `<Image>` wrapper agrega caption + fullBleed semantic
3. **Mermaid build-time vía Astro integration custom** (`src/integrations/mermaid.ts`) hooks `astro:config:setup` + remark plugin que detecta ` ```mermaid` blocks; renderiza con headless via `@mermaid-js/mermaid-cli`; cache por SHA256 del fuente en `.cache/mermaid/`
4. **YouTube privacy-first**: render `<button>` con thumbnail YouTube `i.ytimg.com/vi/{id}/hqdefault.jpg`; click → reemplaza con `<iframe src="youtube-nocookie.com/embed/{id}?autoplay=1">`
5. **RepoCard build-time fetch**: durante build, llama GitHub REST `/repos/{owner}/{name}`; cache 24h; en CI usa `GITHUB_TOKEN` env (5000 req/h vs 60 anon)
6. **TweetStatic**: NO API. Component recibe props `{ author, handle, avatar, body, date, link }`; render como `<blockquote>` styled. Helper `pnpm tweet:fetch <url>` (defer Fase 2 — Fase 1 manual paste)
7. **Footnote autocollect**: `<Footnote>` registra en context Astro; `<Footnotes />` lee context al final del MDX. Implementación via `astro:transitions:before-swap` no aplica — usar Astro slot system o variable global por render scope
8. **Related posts**: query Supabase `WHERE tags && current.tags AND id != current.id ORDER BY array_length(tags & current.tags) DESC LIMIT 3` ejecutada en build-time loader extension; cache por slug
9. **Drop cap CSS**: `:where(.prose > p:first-of-type::first-letter)` selector — sin JS, gracioso fallback si CSS no aplica
10. **Component whitelist sync**: `MDX_COMPONENT_WHITELIST` en `src/components/mdx/index.ts` agrega 18 nuevos; CLI validator de inject-articles consume

### Cache strategy

| Asset | Path | Invalidation |
|-------|------|--------------|
| Mermaid SVG | `.cache/mermaid/{sha256}.svg` | Source SHA change |
| GitHub repo | `.cache/github/{owner}-{name}.json` | TTL 24h + force flag `pnpm cache:bust` |
| Astro Image | `.astro/_image/...` (built-in) | Astro maneja |
| TweetStatic | en MDX inline JSON | Manual update |

CI: cache `.cache/` entre runs (GitHub Actions cache action).

## Success Criteria

### Technical gates

- [ ] Lighthouse Mobile mantiene ≥95 perf en post con todos los components usados
- [ ] CLS < 0.05 (incluye images + iframes lazy)
- [ ] Bundle JS post < 60KB (era 50KB en proposal anterior; +10KB para CodeTabs+Gallery+Share)
- [ ] Build time < 3min con 5 posts + Mermaid + cache cold; < 1min con cache warm
- [ ] AVIF/WebP sirvieron correcto (verificable Network tab)
- [ ] YouTube no setea cookies hasta click (DevTools Application tab)
- [ ] Mermaid render falla loud si fuente inválido (no silent skip)
- [ ] All 18 components renderizan en `hello.mdx` smoke fixture
- [ ] CLI `pnpm media:upload` sube a bucket + clipboard contiene snippet `<Image>` válido
- [ ] Footnote auto-collect renderiza en orden, links bidireccionales (^/↩)
- [ ] Related posts query devuelve top 3 con tag overlap (smoke test 5 fixtures)

### UX gates

- [ ] Drop cap visible primer `<p>` cada post sin afectar accesibilidad (screen readers leen letra una vez)
- [ ] Share buttons funcionan en Safari + Chrome + Firefox
- [ ] Spoiler `<details>` keyboard accesible (Enter/Space toggle)
- [ ] Gallery lightbox cierra con Esc + click backdrop + tap-outside mobile
- [ ] CodeTabs móvil <640px usa accordion (no scroll horizontal forzado)
- [ ] Aside ≥1024px posiciona en margen derecho, <1024px se vuelve inline blockquote
- [ ] FullBleed funciona sin scroll horizontal en cualquier viewport

### Docs gates

- [ ] `docs/components.md` lista 18 components con signature + ejemplo MDX
- [ ] `docs/diagrams.md` 5 ejemplos Mermaid copy-paste

## Open Questions (resolver en design o S4a)

- [ ] **Mermaid theme**: usar `default` (light) y `dark` matching nuestros tokens? Sugiero sí, mediante `mmdc -t neutral --themeVariables` con paleta hidx
- [ ] **YouTube no-cookie placeholder**: thumbnail directo de `i.ytimg.com` (no cookies) o servir desde Supabase Storage cache-once? Sugiero direct (no setea cookies hasta interaction)
- [ ] **Footnote impl**: Astro slot context, o usar `remark-gfm` footnotes nativo (markdown `[^1]` syntax)? Sugiero `remark-gfm` (estandar, menos custom code)
- [ ] **GitHub token build env**: setup `GITHUB_TOKEN` ahora o usar anon 60req/h? Sugiero anon Fase 1 (5 posts × ~3 RepoCards = 15 req — sobra), upgrade si crece
- [ ] **Image alt text required**: ¿enforced en `<Image>` prop type? Sugiero sí — TS error si falta `alt`

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Mermaid CLI requiere chromium ~300MB en CI | High | Medium | Use `--puppeteerConfigFile` con chromium pre-installed; cache GH Actions |
| Image weight original > 1MB sin warning | High | Medium | `scripts/lint-images.ts` pre-commit hook flag > 200KB |
| GitHub API rate limit cold builds | Low | Low | Cache + fallback gracioso (skip card if 403) |
| `<aside>` posicionado mal en viewports raros | Medium | Low | Snapshot test 6 viewports (de design-uplift change ya existe) |
| Drop cap break con i18n no-Latin | Low | Low | Aplica solo a Latin scripts (CSS `:lang(es), :lang(en)`) |
| FullBleed scroll horizontal en algunas configs | Medium | Medium | `overflow-x: clip` en parent, no `hidden` |
| YouTube embed bloqueado por uBlock | Medium | Low | Fallback `<a>` directo a `youtube.com/watch?v=` |
| Mermaid syntax errors break build | Medium | High | Pre-commit valida `mmdc --quiet` cada `.mdx` con `mermaid` block |
| Footnote refs duplicados (id collision) | Medium | Low | Validator chequea unique ids per post |
| Component whitelist drift con inject-articles | High | Medium | Single source: `src/components/mdx/index.ts` exports `MDX_COMPONENT_WHITELIST` consumido por validator |

## Architectural Decisions Record (ADR seeds)

- **ADR-301**: Approach 2 magazine grade (rejected sandpack day 1)
- **ADR-302**: Mermaid build-time SVG (rejected client-side runtime)
- **ADR-303**: YouTube privacy-first thumbnail-then-iframe
- **ADR-304**: RepoCard build-time fetch + 24h cache
- **ADR-305**: TweetStatic manual JSON (no API)
- **ADR-306**: Footnote via remark-gfm native syntax (no custom collector)
- **ADR-307**: Related posts via tag-overlap SQL query (build-time)
- **ADR-308**: Drop cap CSS `:first-letter` auto (no opt-in prop)
- **ADR-309**: Author hardcode Fase 1, `authors` table defer
- **ADR-310**: Component whitelist single source `src/components/mdx/index.ts`
- **ADR-311**: Cache `.cache/{mermaid,github}/` shared CI between runs

## Next Phase

→ `/sdd-design rich-articles` — finalize per-component interfaces, Mermaid integration internals, related posts query, share button implementations, file map.
