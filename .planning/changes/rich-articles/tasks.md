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

- [ ] 2.1 `src/components/mdx/CodeTabs.astro` — Shiki render per tab; `<code-tabs>` Web Component switch ~500B; horizontal scroll-snap ≥640px / `<details>` accordion <640px
- [ ] 2.2 `src/components/mdx/CodeDiff.astro` — Shiki lang `diff`, +/- bg overrides match theme tokens
- [ ] 2.3 `src/components/mdx/Terminal.astro` — shell prompt `$` + ANSI-style colored output via inline classes
- [ ] 2.4 Update `hello.mdx` exercise CodeTabs + CodeDiff + Terminal

## Phase 3: Mermaid build-time (S4c)

- [ ] 3.1 `pnpm add -D @mermaid-js/mermaid-cli`
- [ ] 3.2 RED Vitest: `tests/unit/mermaid-cache.test.ts` — same source SHA → cache hit; diff source → recompute; corrupt cache → recompute
- [ ] 3.3 GREEN: `src/lib/mermaid-cache.ts` — read/write `.cache/mermaid/{sha256}.svg`
- [ ] 3.4 `src/integrations/mermaid.ts` — Astro integration hooks `astro:build:start`; remark plugin walks ` ```mermaid` code blocks; calls `mmdc` headless with theme variables matching hidx; injects SVG inline; cache-aware
- [ ] 3.5 `src/components/mdx/Mermaid.astro` — placeholder consumed by remark plugin (or zero-render if remark replaces)
- [ ] 3.6 Configure GH Actions cache `.cache/mermaid/` between runs
- [ ] 3.7 Update `hello.mdx` with one flowchart Mermaid block; verify build SVG in HTML

## Phase 4: Layout + typography (S4d)

- [ ] 4.1 `src/components/mdx/Quote.astro` — pull-quote with `<cite>` attribution, gradient border-left
- [ ] 4.2 `src/components/mdx/Aside.astro` — margin note CSS grid: ≥1024px sticky right col / <1024px inline blockquote
- [ ] 4.3 `src/components/mdx/FullBleed.astro` — `viewport-width` wrapper with `overflow-x: clip` parent guard
- [ ] 4.4 `src/components/mdx/Spoiler.astro` — `<details>` + `<summary>` styled
- [ ] 4.5 `src/components/mdx/Footnotes.astro` — render auto-collected refs from remark-gfm output (placement at end of post)
- [ ] 4.6 `src/components/mdx/KeyboardKey.astro` — styled `<kbd>` (border + bg + mono + shadow)
- [ ] 4.7 `src/components/mdx/Highlight.astro` — colored span variants (yellow/cyan/violet)
- [ ] 4.8 `global.css` — drop cap rule `:where(.prose > p:first-of-type:lang(es), .prose > p:first-of-type:lang(en))::first-letter` + kbd + highlight + footnote markers

## Phase 5: Embeds + Compare (S4e)

- [ ] 5.1 RED Vitest: `tests/unit/github-cache.test.ts` — fetch caches 24h, returns cached if within TTL, refetches after expiry
- [ ] 5.2 GREEN: `src/lib/github-cache.ts` using `@octokit/request` + filesystem `.cache/github/{owner-name}.json`
- [ ] 5.3 `src/components/mdx/RepoCard.astro` — build-time fetch via cache lib, render avatar + descr + stars + lang; fallback graceful on 403/404
- [ ] 5.4 `src/components/mdx/TweetStatic.astro` — render JSON props as `<blockquote>` (author/handle/avatar/body/date/link)
- [ ] 5.5 `src/components/mdx/Compare.astro` — comparison table component with header columns + cells slot
- [ ] 5.6 Update `hello.mdx` with RepoCard `astrojs/astro` + TweetStatic sample + Compare 2-col

## Phase 6: Meta UX (S4f)

- [ ] 6.1 `src/lib/authors.ts` — `{ felipe: { id, name, bio, avatarSvg, github, mastodon } }`
- [ ] 6.2 `src/components/AuthorBio.astro` — reads `authors.ts`, renders footer card
- [ ] 6.3 RED Vitest: `tests/unit/related.test.ts` — mock supabase, assert top-3 by tag overlap descending, current excluded, limit honored
- [ ] 6.4 GREEN: `src/lib/related.ts` — Supabase query `tags && current.tags`, ORDER BY overlap DESC LIMIT 3
- [ ] 6.5 `src/components/RelatedPosts.astro` — calls `getRelatedPosts`, renders 3 cards with cover thumb if exists
- [ ] 6.6 `src/components/ShareButtons.astro` — 5 anchors (X, LinkedIn, Mastodon prompt, Bluesky, Copy URL); Copy uses `navigator.clipboard.writeText`
- [ ] 6.7 Modify `PostLayout.astro` footer — mount `<RelatedPosts>` + `<ShareButtons>` + `<AuthorBio>`

## Phase 7: CLI + Whitelist + Docs (S4g)

- [ ] 7.1 Modify `src/components/mdx/index.ts` — export 18 new + extend `MDX_COMPONENT_WHITELIST` array
- [ ] 7.2 Modify `scripts/upload-asset.ts` (from inject-articles) — emit `<Image src="..." alt="..." caption="..." />` snippet to clipboard
- [ ] 7.3 Add `scripts/check-mermaid-syntax.ts` pre-commit hook — runs `mmdc --quiet` on each `.mdx` with mermaid block
- [ ] 7.4 `docs/components.md` — 18 component catalog with signature + MDX example each
- [ ] 7.5 `docs/diagrams.md` — 5 Mermaid copy-paste examples (flowchart, sequence, gantt, ER, state)

## Phase 8: Verification

- [ ] 8.1 Playwright E2E: YouTube placeholder → click → iframe loads
- [ ] 8.2 Playwright E2E: CodeTabs switch + Gallery lightbox + Spoiler toggle + Share Copy
- [ ] 8.3 Lighthouse CI: post with all 18 components ≥95 mobile perf, JS bundle < 60KB
- [ ] 8.4 Build benchmark: cold cache < 3min, warm cache < 1min
- [ ] 8.5 Validator (inject-articles) accepts hello.mdx with all components
