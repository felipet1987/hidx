# Design: Rich Articles (Magazine Grade)

## Technical Approach

18 nuevos MDX components + meta UX layer (related, share, drop cap, author bio). Cero JS por default — cuatro excepciones lazy/click-only: YouTube embed, CodeTabs switcher, Gallery lightbox, Copy URL button. Mermaid corre en build via `@mermaid-js/mermaid-cli`, output SVG cacheado por SHA256. RepoCard fetch GitHub API build-time, cache 24h. Related posts via SQL contra `articles.tags && current.tags` ejecutado en loader extension. Component whitelist single-source en `src/components/mdx/index.ts` consumido por validator de `inject-articles`.

## Architecture Decisions

| ADR | Choice | Alternatives | Rationale |
|-----|--------|--------------|-----------|
| 301 | Approach 2 magazine grade (18 components) | A1 minimal / A3 sandpack | Cubre 90% long-form sin penalty perf |
| 302 | Mermaid build-time SVG | Client-side runtime | 0 JS, accesible, cacheable |
| 303 | YouTube thumbnail-then-iframe | Direct iframe | Privacy: no cookies hasta interaction |
| 304 | RepoCard build-time + 24h cache | Runtime fetch | 0 latency lectura, sin API key |
| 305 | TweetStatic JSON manual | Twitter API | Sin auth/cost; control total |
| 306 | Footnote via `remark-gfm` | Custom slot collector | Estándar markdown `[^1]`, menos código |
| 307 | Related posts SQL tag-overlap | TF-IDF | Simple, suficiente MVP |
| 308 | Drop cap CSS `:first-letter` auto | Opt-in prop | Zero overhead autor |
| 309 | Author hardcode `src/lib/authors.ts` | Tabla `authors` Supabase | YAGNI Fase 1 (1 autor) |
| 310 | Whitelist single-source `src/components/mdx/index.ts` | Duplicar en validator | Sync sin drift |
| 311 | Cache `.cache/{mermaid,github}/` shared CI | Per-build | Build < 1min con cache warm |
| 312 | Mermaid theme dual via `--themeVariables` | Single theme | Match light/dark hidx tokens |
| 313 | Image `alt` prop required (TS) | Optional | Accesibilidad enforced compile-time |

## Data Flow

```
Author MDX (Supabase body_mdx)
   │
   ▼
Astro build pipeline:
   │
   ├─► remark-gfm           → Footnote refs auto-collect
   ├─► remark-mermaid       → ```mermaid``` blocks → @mermaid-js/mermaid-cli (headless)
   │                          ──► .cache/mermaid/{sha256}.svg (cached)
   │                          ──► inline <svg> in HTML
   ├─► Astro components     → Image (sharp pipeline), Video, YouTubeEmbed (placeholder),
   │                          CodeTabs (Shiki + Web Component), CodeDiff/Terminal (Shiki),
   │                          Gallery, Figure, Quote, Aside, FullBleed, Spoiler,
   │                          Kbd, Highlight, Compare, RepoCard, TweetStatic
   ├─► RepoCard build       → fetch api.github.com/repos/{owner/name}
   │                          ──► .cache/github/{owner-name}.json (TTL 24h)
   │                          ──► render card
   ▼
PostLayout footer:
   │
   ├─► relatedPosts(slug, tags) → Supabase query → top 3 cards
   ├─► <ShareButtons url title /> → 5 anchor links + Copy button
   ├─► <AuthorBio author='felipe' /> → from src/lib/authors.ts
   ▼
Static HTML + SVG inlined → CF Pages
   │
   ▼
Reader: zero JS for default; on demand:
   ├─ YouTube thumbnail click → swap to iframe (youtube-nocookie)
   ├─ CodeTabs click → swap visible panel (Web Component ~500B)
   ├─ Gallery img click → <dialog> lightbox open
   ├─ Share Copy click → navigator.clipboard.writeText(url)
   ├─ Spoiler → native <details> (no JS)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | + `@mermaid-js/mermaid-cli`, `remark-gfm`, `sharp` (already), `@octokit/request` |
| `astro.config.mjs` | Modify | Wire `remark-gfm` + custom `remarkMermaid` plugin |
| `src/integrations/mermaid.ts` | Create | Astro integration: hook `astro:build:start`, render mermaid blocks via CLI, cache by SHA256 |
| `src/components/mdx/Image.astro` | Create | Wrap Astro `<Image>`, props: src, alt (required), caption, fullBleed |
| `src/components/mdx/Video.astro` | Create | `<video>` poster + sources MP4/WebM + tracks |
| `src/components/mdx/YouTubeEmbed.astro` | Create | Thumbnail btn + click swap iframe (vanilla JS ~200B) |
| `src/components/mdx/Gallery.astro` | Create | CSS grid + `<dialog>` lightbox (Web Component) |
| `src/components/mdx/Figure.astro` | Create | Semantic `<figure>` + `<figcaption>` |
| `src/components/mdx/CodeTabs.astro` | Create | Shiki per tab + `<code-tabs>` Web Component switch |
| `src/components/mdx/CodeDiff.astro` | Create | Shiki lang `diff` + theme bg overrides |
| `src/components/mdx/Terminal.astro` | Create | Shell prompt + colored output |
| `src/components/mdx/Mermaid.astro` | Create | Inline SVG slot consumed by remark plugin |
| `src/components/mdx/RepoCard.astro` | Create | Build-time fetch GitHub + render card |
| `src/components/mdx/TweetStatic.astro` | Create | Render JSON props as blockquote |
| `src/components/mdx/Quote.astro` | Create | Pull-quote + attribution |
| `src/components/mdx/Aside.astro` | Create | Margin note ≥1024px / inline <1024px |
| `src/components/mdx/FullBleed.astro` | Create | `viewport-width` wrapper rompe prose |
| `src/components/mdx/Spoiler.astro` | Create | `<details>` styled |
| `src/components/mdx/Footnotes.astro` | Create | Renders auto-collected refs (remark-gfm) |
| `src/components/mdx/KeyboardKey.astro` | Create | Styled `<kbd>` |
| `src/components/mdx/Highlight.astro` | Create | Colored span |
| `src/components/mdx/Compare.astro` | Create | Comparison table |
| `src/components/mdx/index.ts` | Modify | Export 18 + extend `MDX_COMPONENT_WHITELIST` |
| `src/components/RelatedPosts.astro` | Create | Query Supabase, render 3 cards |
| `src/components/ShareButtons.astro` | Create | 5 anchors + Copy button |
| `src/components/AuthorBio.astro` | Create | Reads `authors.ts`, render footer |
| `src/lib/authors.ts` | Create | `{ felipe: { name, bio, avatar, github } }` |
| `src/lib/github-cache.ts` | Create | TTL 24h fetch helper |
| `src/lib/related.ts` | Create | Supabase tag-overlap query |
| `src/layouts/PostLayout.astro` | Modify | Mount Related + Share + AuthorBio in footer |
| `src/styles/global.css` | Modify | Drop cap rule, kbd, highlight, footnote markers, aside positioning |
| `scripts/upload-asset.ts` | Modify | Output `<Image src caption alt />` snippet to clipboard |
| `scripts/lint-images.ts` | Create | Pre-commit warn images > 200KB original |
| `tests/unit/related.test.ts` | Create | Mock supabase, assert top-3 ordering |
| `tests/unit/mermaid-cache.test.ts` | Create | SHA256 hash + cache hit |
| `docs/components.md` | Create | 18 component catalog |
| `docs/diagrams.md` | Create | 5 Mermaid examples |

## Interfaces

```ts
// src/components/mdx/Image.astro Props (TS strict)
export interface ImageProps {
  src: string;                  // absolute URL or /public/* or Supabase Storage URL
  alt: string;                  // REQUIRED — accessibility
  caption?: string;
  width?: number;
  height?: number;
  fullBleed?: boolean;          // breaks prose container
  loading?: 'lazy' | 'eager';   // default 'lazy'
}

// src/lib/related.ts
export async function getRelatedPosts(
  currentSlug: string,
  currentTags: string[],
  limit = 3,
): Promise<Array<{ slug: string; title: string; description: string; overlap: number }>>;

// src/lib/authors.ts
export interface Author {
  id: string;
  name: string;
  bio: string;
  avatarSvg?: string;          // inline SVG monogram or photo URL
  github?: string;
  mastodon?: string;
}
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `getRelatedPosts` ordering by overlap desc | Vitest mock Supabase |
| Unit | Mermaid cache: same source → cache hit; diff source → recompute | Vitest fs mock |
| Unit | GitHub cache: TTL 24h respected, returns cached | Vitest + `vi.useFakeTimers` |
| Unit | Image alt missing → TS compile error | `tsc --noEmit` test fixture |
| Integration | Astro build with `hello.mdx` containing all 18 components → no errors | CI step |
| Integration | Mermaid CLI runs in CI Docker (chromium installed) | GH Actions |
| E2E | YouTube placeholder click → iframe loads (Playwright) | Playwright |
| E2E | CodeTabs switch + Gallery lightbox + Spoiler toggle | Playwright |
| E2E | Share Copy button writes URL to clipboard | Playwright `page.evaluate` |
| Perf | LH Mobile ≥95 + JS post < 60KB | LH CI budget |

## Migration / Rollout

No data migration. Additive components. Order:
1. S4a Visual (Image first — needed by all media)
2. S4b Code
3. S4c Mermaid integration (separate, isolatable)
4. S4d Layout + typography
5. S4e Embeds + Compare
6. S4f Meta UX (PostLayout footer)
7. S4g CLI + docs

Each step ships standalone PR. `hello.mdx` updated incrementally to exercise new components. CI gate: build green + LH budget.

## Open Questions

- [ ] Mermaid CLI Docker image base — `node:22-slim` + apt chromium, o `mermaidjs/mermaid-cli:latest` upstream? Sugiero upstream
- [ ] Astro Image vs `unpic` (works on Cloudflare Workers) — Astro Image needs sharp ($ build time), unpic CDN-based. Sugiero Astro Image (free + control)
- [ ] Footnote markers style: superscript `[1]` o emoji asterisk? Sugiero `[1]` superscript
- [ ] Related posts: incluir cover thumbnail si existe? Sugiero sí (visual richer)
