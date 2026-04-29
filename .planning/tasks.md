# Tasks: monetizable-howto-platform

> TDD mode active where unit-testable. Infra/config tasks skip RED.

## Phase 1: Foundation (S0)

- [ ] 1.1 `git init` in `hidx/`, add `.gitignore` (node, .env, dist, .wrangler, .DS_Store), create GitHub repo `felipet1987/hidx` (public), push `main`
- [ ] 1.2 `pnpm create astro@latest` minimal template, pick TS strict, write `.nvmrc` (22)
- [ ] 1.3 Add deps: `@astrojs/mdx@^4`, `@astrojs/sitemap`, `@astrojs/cloudflare@^11`, `tailwindcss@^4`, `@tailwindcss/typography`, `@tailwindcss/vite`, `astro-icon`, `satori`, `@resvg/resvg-js`, `shiki`
- [ ] 1.4 Configure `astro.config.mjs`: integrations (mdx, sitemap, icon), `output: 'static'`, `adapter: cloudflare()`, `i18n: { defaultLocale: 'en', locales: ['en'] }`, `site: 'https://hidx.dev'`
- [ ] 1.5 Configure Tailwind v4 via `@tailwindcss/vite`, add `src/styles/global.css` with `@import 'tailwindcss'` + typography plugin
- [ ] 1.6 Add `biome.json` (lint+format), `tsconfig.json` strict, scripts `dev/build/preview/check/lint/format/test`
- [ ] 1.7 Write `wrangler.toml` (Pages config), document env `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`
- [ ] 1.8 Create `.github/workflows/ci.yml` (pnpm install, biome check, astro check, build) and `deploy.yml` (CF Pages action on `main`)
- [ ] 1.9 Add `LICENSE-CODE` (MIT), `LICENSE-CONTENT` (CC-BY-NC-4.0), `README.md` (project intro)
- [ ] 1.10 Hello-world deploy: trivial `src/pages/index.astro`, push, verify `*.pages.dev` URL serves

## Phase 2: Content + Layouts (S1)

- [ ] 2.1 RED: Vitest test for `src/content/config.ts` posts schema (valid + invalid frontmatter cases)
- [ ] 2.2 GREEN: Implement `src/content/config.ts` with Zod (posts + series) per design.md
- [ ] 2.3 Build `src/layouts/BaseLayout.astro` (head, header, footer, analytics slot)
- [ ] 2.4 Build `src/layouts/PostLayout.astro` (TOC from headings, reading time, share, affiliate disclosure footer)
- [ ] 2.5 Build `src/layouts/LandingLayout.astro` (hero, featured posts grid, newsletter CTA)
- [ ] 2.6 Build MDX components: `Callout`, `Steps`, `CodeDemo` (Shiki dual theme)
- [ ] 2.7 Wire `src/components/mdx/index.ts` for auto-import in MDX
- [ ] 2.8 Create `src/pages/posts/[...slug].astro` (getStaticPaths from collection)
- [ ] 2.9 Create `src/pages/tags/[tag].astro` (filter posts by tag)
- [ ] 2.10 Create static pages: `about`, `now`, `privacy`, `disclosure`
- [ ] 2.11 Author 1 dummy post `src/content/posts/hello.mdx` to validate render

## Phase 3: SEO + RSS + OG (S2)

- [ ] 3.1 RED: Vitest for `src/lib/seo.ts` JSON-LD builder (Article + HowTo)
- [ ] 3.2 GREEN: Implement `seo.ts`, inject `<script type="application/ld+json">` in PostLayout
- [ ] 3.3 Implement `src/pages/rss.xml.ts` via `@astrojs/rss`
- [ ] 3.4 Configure `@astrojs/sitemap` with i18n + filter drafts
- [ ] 3.5 Implement `src/pages/og/[slug].png.ts` Satori endpoint, cache headers immutable
- [ ] 3.6 Add `public/robots.txt`, `public/llms.txt`, `public/_headers` (cache rules)

## Phase 4: Monetization Capa 1 (S3)

- [ ] 4.1 RED: Vitest for `src/lib/affiliate.ts` disclosure injector
- [ ] 4.2 GREEN: Implement `<AffiliateLink href>` auto-injecting `<small>` FTC disclosure
- [ ] 4.3 Implement `<TipJar provider handle>` (Ko-fi link, no JS)
- [ ] 4.4 Write `/disclosure` page copy (FTC + EU)

## Phase 5: Newsletter + Analytics (S4)

- [ ] 5.1 RED: Vitest+msw for `src/pages/api/newsletter.ts` (success 202, beehiiv error 502)
- [ ] 5.2 GREEN: Implement Beehiiv subscribe Worker per design interface
- [ ] 5.3 Build `<NewsletterForm>` island (React or Preact, hydrate `client:visible`)
- [ ] 5.4 Inject CF Web Analytics beacon in BaseLayout

## Phase 6: Pillar Content (S5)

- [ ] 6.1 Brainstorm + lock 5 "How I do X" topics
- [ ] 6.2-6.6 Author 5 MDX pillar posts (1500+ words each, ≥3 affiliate/tool mentions, cover image)

## Phase 7: Verification + Launch (S6)

- [ ] 7.1 Playwright E2E: landing renders, post renders TOC+Callout, RSS valid, OG returns PNG
- [ ] 7.2 Lighthouse CI in workflow with budget perf≥95, a11y≥95, SEO=100
- [ ] 7.3 Manual: Rich Results Test passes Article+HowTo, Twitter card validator green
- [ ] 7.4 DNS: point `hidx.dev` to CF Pages, verify HTTPS + canonical
- [ ] 7.5 Submit sitemap to Google Search Console, verify indexing
