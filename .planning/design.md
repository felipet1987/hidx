# Design: monetizable-howto-platform

## Technical Approach

Astro 5 SSG monorepo. Content Collections (Zod) drive type-safe MDX → static HTML at build. Cloudflare Pages serves edge-cached HTML + Workers handle dynamic endpoints (newsletter webhook, OG image generation). Zero-JS by default; islands hydrate only for interactive components (newsletter form, future paywall). Monetization Capa 1 (affiliate + tip jar) via MDX components with auto-injected FTC disclosure.

## Architecture Decisions

| ID | Decision | Choice | Alternatives | Rationale |
|----|----------|--------|--------------|-----------|
| ADR-001 | Framework | Astro 5 | Next.js 15, Hugo | SSG default, Islands, MDX native, lowest JS payload |
| ADR-002 | Hosting | Cloudflare Pages | Vercel, Netlify | Free unlimited bandwidth, Workers + R2 + D1 integration, no egress fees |
| ADR-003 | Render mode | `output: 'static'` MVP | `'hybrid'`, `'server'` | SSG = perfect cache, simpler ops; migrate to hybrid only when paywall (Capa 4) |
| ADR-004 | Styling | Tailwind v4 + Typography plugin | Panda, CSS Modules | Prose styling MDX out-of-box, JIT, smallest CSS |
| ADR-005 | Content layer | Content Collections + Zod | Raw frontmatter, contentlayer | Build-time validation, type-safe imports, Astro 5 first-class |
| ADR-006 | Newsletter | Beehiiv | Buttondown, ConvertKit, Resend | Free tier 2.5k subs + sponsorship marketplace |
| ADR-007 | Tooling | pnpm + Biome | npm/yarn + ESLint+Prettier | Speed, single config, no plugin sprawl |
| ADR-008 | Syntax highlight | Shiki build-time | Prism client, highlight.js | Zero JS, dual theme, accurate VSCode grammars |
| ADR-009 | OG images | Satori in Pages Function `/og/[slug].png` | Pre-rendered Figma, third-party | Per-post dynamic, edge-cached infinite, free |
| ADR-010 | Affiliate disclosure | Component-injected `<small>` below link | Footer-only notice | FTC requires "clear and conspicuous" near claim |

## Data Flow

```
Author          Build (CI)              Edge (CF)            Visitor
───────────────────────────────────────────────────────────────────
.mdx ─────► Astro+Zod validate ───► HTML/CSS in CF Pages ──► Browser
            │ build OG endpoint                              (zero JS)
            └─► /og/[slug].png ◄──── Satori (on demand) ──── crawler
                                              │
Form submit ─────────────────────► Pages Function ──► Beehiiv API
                                   /api/newsletter      │
                                                        └─► confirm email
Tip click ────────────────────► external Ko-fi (no backend)
```

## File Changes (greenfield, all Create)

| File | Description |
|------|-------------|
| `package.json`, `pnpm-lock.yaml`, `.nvmrc` | Astro 5, MDX 4, Tailwind 4, @astrojs/cloudflare 11, Beehiiv API, Satori |
| `astro.config.mjs` | Integrations (mdx, sitemap, tailwind), output static, adapter cloudflare, i18n EN |
| `tsconfig.json`, `biome.json` | Strict TS, Biome lint+format |
| `wrangler.toml` | Pages config, env bindings (BEEHIIV_API_KEY) |
| `src/content/config.ts` | Zod schemas: posts, series |
| `src/content/posts/*.mdx` | 5 pillar posts (S5) |
| `src/components/mdx/{Callout,Steps,CodeDemo,AffiliateLink,TipJar}.astro` | Auto-imported via `mdx-components.ts` |
| `src/layouts/{Base,Post,Landing}Layout.astro` | Head, header, footer, TOC, share |
| `src/pages/index.astro` | Landing |
| `src/pages/posts/[...slug].astro` | Dynamic post route |
| `src/pages/tags/[tag].astro` | Tag filter |
| `src/pages/{about,now,privacy,disclosure}.astro` | Static pages |
| `src/pages/rss.xml.ts` | RSS feed |
| `src/pages/og/[slug].png.ts` | Satori OG endpoint |
| `src/pages/api/newsletter.ts` | Beehiiv subscribe Worker |
| `src/lib/{seo,analytics,affiliate}.ts` | JSON-LD builder, CF Analytics wrapper, disclosure injector |
| `public/{robots.txt,llms.txt,_headers}` | Crawl + cache directives |
| `.github/workflows/{ci,deploy}.yml` | Lint+typecheck+build+Lighthouse CI; deploy on main |
| `LICENSE-CONTENT`, `LICENSE-CODE` | CC-BY-NC 4.0, MIT |
| `tests/{unit,e2e}` | Vitest + Playwright |

## Interfaces

```ts
// src/content/config.ts
const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(80),
    description: z.string().max(160),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).min(1).max(6),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    canonical: z.string().url().optional(),
  }),
});
```

```ts
// src/pages/api/newsletter.ts
export const POST: APIRoute = async ({ request, env }) => {
  const { email } = await request.json();
  const r = await fetch('https://api.beehiiv.com/v2/publications/<id>/subscriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.BEEHIIV_API_KEY}` },
    body: JSON.stringify({ email, reactivate_existing: false, send_welcome_email: true }),
  });
  return new Response(null, { status: r.ok ? 202 : 502 });
};
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Zod schema, SEO/JSON-LD builder, affiliate disclosure injector | Vitest |
| Integration | Newsletter Worker → mock Beehiiv | Vitest + msw |
| E2E | Landing renders, post renders with TOC + Callout, RSS valid, OG endpoint returns PNG | Playwright |
| Perf | Lighthouse CI budget (perf≥95, a11y≥95, SEO=100) | `@lhci/cli` in GitHub Actions |
| Schema | Rich Results Test (Article + HowTo) | Manual gate before launch |

## Migration / Rollout

No migration (greenfield). Rollout: deploy to `*.pages.dev` preview per PR; promote to `hidx.dev` once Lighthouse + Rich Results gates pass. No feature flags MVP.

## Open Questions

- [ ] Confirm `hidx.dev` available for purchase
- [ ] Beehiiv publication ID (created when account ready)
- [ ] Cover image source per pillar post (custom Figma vs Unsplash)
- [ ] Branch protection rules: required reviewers count
