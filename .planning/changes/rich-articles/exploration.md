# Exploration: Artículos Atractivos (Imágenes, Video, Código, Diagramas)

**Project**: `hidx` · **Date**: 2026-04-29 · **Phase**: sdd-explore · **Change**: `rich-articles`

## Current State

### MDX components actuales (5)
- `Callout` — info/warn/tip/danger
- `Steps` — counter numerado
- `CodeDemo` — Shiki dual-theme single block
- `AffiliateLink` — disclosure FTC
- `TipJar` — Ko-fi/BMC link

### PostLayout tiene
- TOC sidebar ≥1024px
- Reading bar (sticky)
- Copy button por `<pre>`
- Gradient `<hr>` divider
- Affiliate disclosure footer
- Prose tuned (line-height 1.75, max-w 70ch)

### Lo que **falta** para long-form atractivo
- **Imagen optimizada** (Astro `<Image>`, srcset AVIF/WebP, lazy, lightbox, caption)
- **Video** (MP4 self-host + YouTube privacy-first embed)
- **Código rich**: tabs multi-archivo, diff view, terminal output, sandbox interactivo
- **Diagramas**: Mermaid (build-time → SVG), Excalidraw embeds
- **Embeds**: tweets estáticos, GitHub gists, repo cards, Stack Overflow links
- **Layout flow**: pull-quotes, asides, footnotes, drop caps, full-bleed images, galleries
- **Datos**: tablas comparativas, charts simples (SVG vanilla)
- **Interactivo**: spoilers, timelines, code playgrounds (Sandpack/StackBlitz)
- **Meta**: author bio, related posts, share buttons, last-updated banner
- **Componentes typográficos**: `<kbd>`, `<Highlight>`, `<Footnote>`, `<Quote>`, `<Aside>`

### Bucket Supabase Storage `article-assets` ya existe — útil para imágenes/video/PDF assets

## Affected Areas

```
src/components/mdx/
├── *.astro                      # 15-20 nuevos components (selectivos según approach)
├── index.ts                     # Export + MDX_COMPONENT_WHITELIST
src/layouts/PostLayout.astro     # Drop caps, full-bleed wrapper, related posts, share buttons
src/styles/global.css            # Pull-quote, aside, footnote, kbd, drop-cap styles
src/lib/
├── images.ts                    # Helper Astro Image + srcset + Supabase Storage URL
├── mermaid.ts                   # Build-time render Mermaid → SVG
src/integrations/
├── astro-mermaid/               # Custom Astro integration (or use existing pkg)
package.json                     # Mermaid, Sandpack opt, satori (already), sharp (already)
public/_headers                  # CSP allow YouTube embed if used
docs/authoring.md                # Document new components for CLI scaffold
```

## Approaches

### Approach 1: **Esenciales** (minimum viable rich)
**Components**: `Image`, `Video`, `YouTubeEmbed`, `CodeTabs`, `Mermaid`, `Quote`, `Footnote`
- Pros: cubre 80% casos long-form; sin JS heavy; SSG completo
- Cons: sin sandbox interactivo
- Effort: Medium (~3 días)

### Approach 2: **Magazine grade** (RECOMENDADO)
**Approach 1 +** `Aside`, `Compare`, `KeyboardKey`, `Highlight`, `Spoiler`, `Gallery`, `Figure`, `RepoCard`, `TweetStatic`, `Timeline`, drop caps, full-bleed wrapper, related-posts, share buttons
- Pros: experiencia editorial pro tipo Stripe Press / Smashing Magazine; cero deps runtime; SSG
- Cons: más componentes para mantener (~18-20 total)
- Effort: Medium-High (~5 días)

### Approach 3: **Interactive heavy**
**Approach 2 +** `Sandbox` (Sandpack — ~300KB), `Excalidraw` embed, `Chart` (vanilla SVG simple), `LivePreview` (iframe)
- Pros: posts educacionales code-along; demo en página
- Cons: Sandpack bundle 300KB+ por uso; Lighthouse perf cae si no se lazy-loadea bien
- Effort: High (~7 días)

### Approach 4: **All-in**
Approach 3 + Astro integration custom para Mermaid + Excalidraw build-time + analytics events para tracking engagement por componente
- Pros: ecosistema completo
- Cons: over-engineering para 1 autor + 5 pillar posts iniciales
- Effort: Very High (~10+ días)

## Recommendation

**Approach 2 — Magazine grade.** Razones:

1. **Sin penalty Lighthouse**: zero JS runtime para todos los components excepto YouTube embed (lazy on click) y Mermaid (build-time SVG)
2. **Diferenciación**: dev audience reconoce craft visual (drop caps, asides, full-bleed) — lo asocia a Stripe Press / Smashing / The Verge
3. **Pillar posts (5 iniciales) lo aprovechan al toque** — Image + Video + CodeTabs + Mermaid + Quote ya cubren típico walkthrough técnico
4. **Sandpack (Approach 3) defer**: solo lo usás en posts genuinamente interactivos (1 de 5 quizá), agregar después como sub-change si demanda lo justifica
5. **Component whitelist** (ya hecho en inject-articles change) crece controlado; incluir docs por component

### Catálogo concreto (Approach 2 — 18 components)

| Categoría | Component | Tipo render | JS bundle |
|-----------|-----------|-------------|-----------|
| Visual | `Image` (wraps Astro Image) | SSG, srcset AVIF/WebP | 0 |
| Visual | `Video` (MP4/WebM self-host + poster) | SSG, native `<video>` | 0 |
| Visual | `YouTubeEmbed` (privacy-first thumbnail-then-iframe) | SSG fallback + click-to-load | ~200B vanilla |
| Visual | `Gallery` (grid + lightbox) | SSG + tiny vanilla lightbox | ~500B |
| Visual | `Figure` (semantic figure + figcaption) | SSG | 0 |
| Code | `CodeTabs` (multi-file tabs, Shiki) | SSG, Web Component for tab switch | ~500B |
| Code | `CodeDiff` (git diff styled) | SSG via Shiki diff lang | 0 |
| Code | `Terminal` (shell prompt + colored output) | SSG | 0 |
| Diagrams | `Mermaid` (build-time → SVG) | SSG via mermaid CLI in build | 0 |
| Embeds | `RepoCard` (GitHub repo SSG fetch + render) | SSG + cache | 0 |
| Embeds | `TweetStatic` (rendered card from JSON) | SSG | 0 |
| Layout | `Quote` (pull-quote with attribution) | SSG | 0 |
| Layout | `Aside` (margin note ≥1024px, inline below) | SSG | 0 |
| Layout | `FullBleed` (breaks prose container) | SSG | 0 |
| Layout | `Spoiler` (collapse/expand) | SSG `<details>` | 0 |
| Typography | `Footnote` + `Footnotes` (numbered refs) | SSG | 0 |
| Typography | `KeyboardKey` (`<kbd>` styled) | SSG | 0 |
| Typography | `Highlight` (colored text bg) | SSG | 0 |
| Layout meta | `Compare` (side-by-side table) | SSG | 0 |
| Meta | Related posts (in PostLayout footer) | SSG via Supabase tags match | 0 |
| Meta | Share buttons (X / LinkedIn / copy URL) | SSG anchor links | ~100B clipboard |
| Meta | Drop cap (CSS first-letter on first `<p>`) | CSS | 0 |
| Meta | Author bio (in PostLayout footer) | SSG | 0 |

### Trade-off honesto

- **+18 components** = más mantenimiento; mitigar con docs `docs/components.md` y golden snippets
- **Mermaid build-time** requiere Node + headless browser (puppeteer ~300MB) o usar `@mermaid-js/mermaid-cli` en CI build — agrega ~2min build time. Alternative: client-side Mermaid lazy on view (peor)
- **Image storage**: Supabase Storage bucket ya existe; helper convierte URL → Astro `<Image>` srcset
- **Video**: archivos pesados → idealmente CDN (R2 más adelante); por ahora Supabase Storage acepta hasta 50MB/file en free tier

## Risks

- **Mermaid build time**: agrega 30-60s a build con headless chromium. Mitigar: cache SVGs en `dist/.mermaid-cache/` por hash del fuente; CI restora cache
- **YouTube embed privacy**: official iframe set cookies sin consent. Mitigar: thumbnail-only inicial, iframe carga sólo on click + show tooltip "esto va a cargar youtube.com (cookies)"
- **Image weight blow-up**: covers + inline → fácil 5MB/post. Mitigar: Astro Image pipeline auto-comprime + responsive srcset; lint script avisa si imagen > 200KB original
- **Component whitelist drift**: nuevos components requieren añadir a `MDX_COMPONENT_WHITELIST` y al validator script (ambos en inject-articles change)
- **Twitter API costo**: TweetStatic no usa API runtime — render de JSON propio (manual copy desde Twitter UI o scrape one-shot durante autoría)
- **Mermaid sintaxis aprendizaje**: requiere docs autoría; mitigar con `docs/diagrams.md` con 5 ejemplos copy-paste
- **CodeTabs UX en mobile**: tabs horizontales no scrolean bien <640px. Mitigar: scroll-snap horizontal o stack vertical con accordion <640px
- **Sandpack defer (Approach 3)**: usuarios pueden pedirlo. Mitigar: documentar como "Phase 2" en propuesta
- **Author bio + share buttons** dependen de meta autor (no existe author table aún) — agregar `authors` table simple a Supabase o hardcode `Felipe` Fase 1

## Ready for Proposal

**Yes** — pero clarificar antes de `/sdd-propose`:

### Open questions

1. **Approach lock**: ¿confirmás Approach 2 (Magazine), o querés agregar Sandpack desde día 1 (Approach 3)?
2. **Mermaid render strategy**: build-time CLI con headless chromium (mejor perf, +CI time), o client-side lazy (peor perf, simpler)?
3. **Author info**: hardcode "Felipe Talavera" + bio inline en `BaseLayout` consts, o crear `authors` table Supabase para multi-author readiness?
4. **Image asset workflow**: el CLI scaffold (`pnpm new:post`) ¿debería tener subcommand `pnpm media:upload <file>` que sube + emite snippet `<Image>` MDX listo para pegar? (sugiero sí)
5. **Share buttons**: ¿Twitter/X + LinkedIn + Copy URL, o agregar Mastodon + Bluesky? (sugiero los 5)
6. **Related posts algoritmo**: tag overlap simple (mismo tag = más relacionado) o algo más sofisticado tipo TF-IDF sobre body? (sugiero tag overlap MVP)
7. **CodeTabs**: ¿layout horizontal con scroll, vertical con accordion, o híbrido auto?
8. **Drop cap**: ¿solo first-letter del primer `<p>`, o también opt-in via prop `dropcap`? (sugiero auto first paragraph)

Respondé al menos 1, 2, 4 antes de `/sdd-propose`. Resto puede quedar en propose con defaults.
