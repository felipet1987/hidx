# Tasks: Rich Articles (Magazine Grade)

> TDD on lib code (related, mermaid cache, github cache). Components verified via integration build + Playwright.

## Phase 1: Visual (S4a)

- [x] 1.1 `pnpm add @octokit/request remark-gfm` (sharp ya está)
- [x] 1.2 Wire `remark-gfm` in `astro.config.mjs` markdown.remarkPlugins
- [x] 1.3 `src/components/mdx/Image.astro` — wraps Astro `<Image>`, props: src, alt REQUIRED, caption, fullBleed, width, height, loading; remote src uses native `<img>`, local uses Astro Image with WebP
- [x] 1.4 `src/components/mdx/Video.astro` — `<video>` poster + sources MP4/WebM + caption slot
- [x] 1.5 `src/components/mdx/YouTubeEmbed.astro` — thumbnail button → click swaps to `youtube-nocookie.com` iframe; noscript fallback link
- [x] 1.6 `src/components/mdx/Gallery.astro` — CSS grid + `<dialog>` lightbox, Esc + backdrop close, ←/→ keyboard nav
- [x] 1.7 `src/components/mdx/Figure.astro` — semantic figure + caption + optional source attribution
- [x] 1.8 Update `hello.mdx` exercise: Image + Video (omitted — needs asset URL) + YouTubeEmbed + Gallery + Figure
- [x] 1.9 `scripts/lint-images.ts` — walks src/+public/, warns >200KB; `--strict` flag exits 1

## Phase 2: Code (S4b)

- [x] 2.1 `src/components/mdx/CodeTabs.astro` — Shiki per tab; `<code-tabs>` Web Component switch with arrow-key keyboard nav; scroll-snap ≥640px / `<details>` accordion <640px
- [x] 2.2 `src/components/mdx/CodeDiff.astro` — Shiki lang `diff`, +/- bg overrides via theme color-mix
- [x] 2.3 `src/components/mdx/Terminal.astro` — prompt `$`, line types: cmd/out/err/comment with semantic classes
- [x] 2.4 Update `hello.mdx` exercise CodeTabs (3 files: package.json + astro.config + index.astro) + CodeDiff + Terminal session

## Phase 3: Mermaid (S4c)

> **DEVIATION from ADR-302**: client-side lazy render adopted instead of build-time SVG.
> Reason: `@mermaid-js/mermaid-cli` requires chromium ~300MB, fragile in CI/Docker; ROI does not justify.
> Trade-off: ~200KB JS on demand (only when post contains mermaid block, IntersectionObserver lazy).
> Future: revisit build-time SVG when CI/asset pipeline is more mature.

- [x] 3.1 ~~`@mermaid-js/mermaid-cli`~~ → installed `mermaid` (client lib) instead
- [ ] 3.2 ~~RED cache test~~ DEFERRED (no cache lib needed; mermaid lib renders on view)
- [ ] 3.3 ~~GREEN cache lib~~ DEFERRED
- [x] 3.4 Mermaid via `<mermaid-block>` Web Component instead of Astro integration; IntersectionObserver loads `mermaid` ESM on first view (200px rootMargin); applies hidx theme variables (light/dark aware)
- [x] 3.5 `src/components/mdx/Mermaid.astro` — Web Component renders SVG client-side, skeleton fallback while loading, error fallback if syntax bad
- [ ] 3.6 GH Actions cache `.cache/mermaid/` DEFERRED (no build-time render)
- [x] 3.7 `hello.mdx` flowchart Mermaid block (build pipeline diagram)

## Phase 4: Layout + typography (S4d)

- [x] 4.1 `Quote.astro` — pull-quote, gradient border-left, italic body, optional cite + source + sourceUrl
- [x] 4.2 `Aside.astro` — float right ≥1024px (margin-right -10rem to break gutter) / inline blockquote-like <1024px
- [x] 4.3 `FullBleed.astro` — `100vw` wrapper with `overflow-x: clip` parent guard in body
- [x] 4.4 `Spoiler.astro` — `<details>` styled with rotating chevron, focus-visible outline
- [x] 4.5 `Footnotes.astro` — manual override component + global styles cover remark-gfm auto-rendered `section[data-footnotes]`
- [x] 4.6 `KeyboardKey.astro` — single `<kbd>` or combo (`Cmd + T` splits on `+`); border-bottom-width 2px shadow
- [x] 4.7 `Highlight.astro` — 5 variants (yellow/cyan/violet/green/red) using `color-mix(oklch)`
- [x] 4.8 `global.css` — drop cap on first `<p>` first-letter (gradient text via `background-clip`); body `overflow-x: clip` parent guard

## Phase 5: Embeds + Compare (S4e)

- [x] 5.1 RED Vitest: 7 cases — cold fetch / TTL hit / TTL expiry / fetch error null / stale fallback after expiry / corrupt cache refetch / cache key path-traversal-safe
- [x] 5.2 GREEN: `src/lib/github-cache.ts` — TTL 24h, JSON file cache `.cache/github/{slug}.json`, stale fallback on network fail
- [x] 5.3 `RepoCard.astro` — `@octokit/request` build-time fetch via cache lib; renders avatar+name+desc+lang dot+stars; fallback link if data null; uses `GITHUB_TOKEN` env if set
- [x] 5.4 `TweetStatic.astro` — JSON props (author/handle/avatar/body/date/link); avatar fallback to initials gradient; `<blockquote>` semantic; opens link new tab
- [x] 5.5 `Compare.astro` — table with row headers (`<th scope="row">`), header columns, cell `emphasis` flag for accent color, scrollable on overflow
- [x] 5.6 hello.mdx: RepoCard `withastro/astro`, TweetStatic sample, Compare table (3 ad networks comparison)

## Phase 6: Meta UX (S4f)

> **DEVIATION**: related uses Astro `getCollection()` (glob loader) Phase 1; swap to Supabase `tags && current.tags` query when inject-articles loader migrates. `rankByTagOverlap` is pure → reusable across both sources.

- [x] 6.1 `src/lib/authors.ts` — `felipe` hardcoded with monogram inline SVG (F initial), bio, github
- [x] 6.2 `AuthorBio.astro` — reads `authors.ts` via `getAuthor()`, renders avatar+name+bio+links footer card
- [x] 6.3 RED 7 Vitest cases — exclude self, order DESC, omit zero overlap, honor limit, empty no tags, no-tag candidates, attach overlap count
- [x] 6.4 GREEN `src/lib/related.ts` — pure `rankByTagOverlap()` (deviates from SQL: in-memory ranking until loader swap)
- [x] 6.5 `RelatedPosts.astro` — `getCollection('posts')` + ranks via lib; 3 cards with cover; gracefully hides if zero
- [x] 6.6 `ShareButtons.astro` — 4 anchors (X / LinkedIn / Bluesky / Mastodon) + Copy URL button (vanilla clipboard, "Copiado ✓" feedback)
- [x] 6.7 `PostLayout.astro` footer — `<ShareButtons>` + `<RelatedPosts>` + `<AuthorBio>` + disclosure paragraph

## Phase 7: CLI + Whitelist + Docs (S4g)

- [x] 7.1 `src/components/mdx/index.ts` — 24 components in WHITELIST (incremental across phases)
- [x] 7.2 `scripts/upload-asset.ts` — Supabase Storage upload + `<Image>`/`<Video>` snippet + macOS clipboard; 50MB free-tier guard; mime auto-detect
- [ ] 7.3 ~~mermaid syntax pre-commit~~ SKIPPED per Phase 3 deviation (client-side renders error fallback inline)
- [x] 7.4 `docs/components.md` — 24 component catalog with signature + MDX example + extension instructions
- [x] 7.5 `docs/diagrams.md` — 5 Mermaid examples + theme variables table + perf + a11y notes

## Phase 8: Verification

- [ ] 8.1 Playwright E2E: YouTube placeholder → click → iframe loads
- [ ] 8.2 Playwright E2E: CodeTabs switch + Gallery lightbox + Spoiler toggle + Share Copy
- [ ] 8.3 Lighthouse CI: post with all 18 components ≥95 mobile perf, JS bundle < 60KB
- [ ] 8.4 Build benchmark: cold cache < 3min, warm cache < 1min
- [ ] 8.5 Validator (inject-articles) accepts hello.mdx with all components
