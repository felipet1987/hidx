# Design: Inyectar Artículos vía Supabase (Stack 8a)

## Technical Approach

Reemplazar Astro `glob` content loader con loader custom que consulta Supabase Postgres en build-time. Cada `articles` row no-draft se materializa como entry de la `posts` collection. MDX `body_mdx` text se pasa por `@astrojs/mdx`'s programmatic compiler para renderizar con los components ya whitelisted. Asset upload a Supabase Storage. Edge Function dispara CF Pages Deploy Hook al publicar. Tooling autoría = CLI scripts TypeScript invocados via `pnpm <cmd>`. Auth Fase 1 single-user via Supabase Auth, RLS impide writes anónimos. Backup `pg_dump` nightly a R2.

## Architecture Decisions

| ADR | Choice | Alternatives | Rationale |
|-----|--------|--------------|-----------|
| 201 | Articles en Postgres (NO repo) | MDX-en-repo, headless CMS | Centralización + multi-device + auth nativo |
| 202 | SSG mantenido (custom loader build-time) | SSR/Hybrid | Respeta ADR-003 original; Lighthouse 100, 0ms latency |
| 203 | Migration-first schema | Studio direct | Versionable, peer-reviewable, rollback-able |
| 204 | ANON key build / SERVICE_ROLE solo CLI local | SERVICE_ROLE en CI | Limita blast radius si key se filtra |
| 205 | MDX raw text column | Blocks JSON (Notion-like) | 100% MDX components power, sin lossy converter |
| 206 | Component whitelist en CLI publish | Free-form | Bloquea injection imports inválidos build break |
| 207 | Edge Function → CF Deploy Hook (debounce 30s) | Manual rebuild | Auto-publish, sin storm |
| 208 | `pg_dump` nightly → R2 30d | Solo Supabase backups | Off-provider, restorable independiente |
| 209 | Supabase Storage assets (Fase 1) | R2 directo | Cero infra extra; migrar si crece |
| 210 | Single-user Auth Fase 1 | Multi-author day 1 | YAGNI; RLS ya soporta scale |

## Data Flow

```
Author CLI                 Supabase                    CF Pages
─────────────────────────────────────────────────────────────────────
pnpm new:post ──► INSERT articles (draft=true) ──► Studio editable
                                                       │
pnpm publish:post ──► UPDATE draft=false +
                       published_at=now()
                              │
                              └─► trigger ──► Edge Function (debounce 30s)
                                                ──► POST CF Deploy Hook
                                                       │
                                                       ▼
                                                  CF Pages build:
                                                    pnpm build
                                                       │
                                                       ▼
                                                  loader fetches Supabase
                                                  ──► writes tmp/posts/*.mdx
                                                  ──► glob compiles MDX
                                                  ──► static HTML to dist/
                                                       │
                                                       ▼
                                                  edge cache live (~30s-2min)

Backup cron (GH Actions nightly)
─────────────────────────────────
pg_dump ──► gzip ──► R2 hidx-backups/articles-YYYYMMDD.sql.gz (30d retention)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | + `@supabase/supabase-js`, `tsx`, `@mdx-js/mdx`, scripts: `new:post`, `publish:post`, `posts`, `upload`, `db:reset`, `db:diff`, `db:push` |
| `supabase/config.toml` | Create | `supabase init` output, project name `hidx` |
| `supabase/migrations/20260429000001_articles.sql` | Create | Tabla + checks + indexes + RLS + trigger |
| `supabase/migrations/20260429000002_storage.sql` | Create | Bucket `article-assets` + policies |
| `supabase/seed.sql` | Create | (opt) dev fixture |
| `supabase/.gitignore` | Create | `.branches`, `.temp` |
| `src/content.config.ts` | Modify | Custom loader Supabase replace glob |
| `src/lib/supabase.ts` | Create | Client factory (anon read, service-role admin) |
| `src/lib/article-loader.ts` | Create | Fetches + maps row → Astro entry; writes tmp MDX |
| `src/content/posts/.gitkeep` | Create | Keeps dir for tmp build output |
| `src/content/posts/hello.mdx` | Delete | Migrated to DB; repo posts dir vacío |
| `src/components/mdx/index.ts` | Modify | Export `MDX_COMPONENT_WHITELIST` const for validator |
| `scripts/new-post.ts` | Create | INSERT row, prints edit URL |
| `scripts/publish-post.ts` | Create | UPDATE published_at, triggers webhook |
| `scripts/list-posts.ts` | Create | CLI table |
| `scripts/upload-asset.ts` | Create | Supabase Storage upload |
| `scripts/migrate-mdx-to-supabase.ts` | Create | One-shot importer |
| `scripts/validate-mdx.ts` | Create | Parses body, asserts components in whitelist |
| `scripts/rls-smoke.ts` | Create | Asserts anon cannot write |
| `supabase/functions/articles-webhook/index.ts` | Create | Edge Function: receive trigger, debounce, POST CF Deploy Hook |
| `.github/workflows/backup.yml` | Create | Cron daily `pg_dump` → R2 |
| `.env.example` | Create | Template envs |
| `.env.local` | Create (gitignored) | Local dev secrets |
| `docs/authoring.md` | Create | End-to-end workflow |
| `docs/db-migrations.md` | Create | Create/apply/rollback |
| `docs/secrets.md` | Create | Env list + rotation |
| `tests/unit/article-loader.test.ts` | Create | Mock supabase, assert mapping |
| `tests/unit/validate-mdx.test.ts` | Create | Whitelist enforcement |

## Interfaces

```ts
// src/lib/article-loader.ts
import type { Loader } from 'astro/loaders';
import { createServiceClient } from './supabase';

export const supabaseArticles = (): Loader => ({
  name: 'supabase-articles',
  load: async ({ store, parseData, generateDigest }) => {
    const sb = createServiceClient();
    const { data, error } = await sb
      .from('articles')
      .select('*')
      .eq('draft', false)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false });
    if (error) throw new Error(`Supabase load failed: ${error.message}`);

    for (const row of data ?? []) {
      const entry = await parseData({
        id: row.slug,
        data: {
          title: row.title,
          description: row.description,
          publishedAt: row.published_at,
          updatedAt: row.updated_at,
          tags: row.tags,
          cover: row.cover,
          draft: row.draft,
          series: row.series,
          seriesOrder: row.series_order,
          canonical: row.canonical,
        },
      });
      store.set({
        id: row.slug,
        data: entry,
        body: row.body_mdx,
        rendered: { html: '', metadata: { headings: [] } }, // mdx integration renders
        digest: generateDigest(row),
      });
    }
  },
});
```

```ts
// scripts/new-post.ts (signature)
type NewPostArgs = { title: string; tags?: string[]; series?: string; open?: boolean };
async function newPost(args: NewPostArgs): Promise<{ id: string; slug: string; editUrl: string }>;
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `article-loader` mapping | Vitest + mock supabase-js client |
| Unit | `validate-mdx` whitelist | Vitest snapshot of accepted/rejected MDX |
| Integration | Migration applies clean (`supabase db reset`) | `pnpm tsx supabase/integration-test.ts` |
| Integration | RLS — anon cannot write | `scripts/rls-smoke.ts` in CI |
| Integration | CLI new-post → INSERT verifiable | Vitest + local Supabase test container |
| E2E | Full publish loop: new → publish → webhook fires (mock CF) → row read | Playwright + supabase-test-helpers |
| Build | `pnpm build` con DB up genera HTML correcto | CI step |
| Backup | Restore test weekly via cron | GH Action: `pg_restore` to ephemeral DB, smoke query |

## Migration / Rollout

1. **S3a**: aplica migrations local + Cloud, smoke RLS
2. **S3b**: deploy custom loader behind feature env `USE_SUPABASE_LOADER=true` — old glob fallback hasta validation done
3. **S3c**: CLI scripts shippable independiente
4. **S3d**: `pnpm tsx scripts/migrate-mdx-to-supabase.ts` → verify row count → delete `src/content/posts/hello.mdx` → commit
5. **S3e**: deploy edge function, set CF Deploy Hook secret, test publish loop
6. **S3f**: docs commit

**Rollback**: revert env flag → glob loader resumes. Repo MDX restored from git history. Supabase data preserved (no destructive cleanup).

## Open Questions

- [ ] Webhook debounce 30s vs 60s (sugiero 30s)
- [ ] Backup destination R2 bucket name (sugiero `hidx-backups`)
- [ ] Local Supabase Postgres v17 mismatch with Cloud v15 — confirmar Cloud v17 OK o downgrade local
- [ ] CLI prompts (interactive) vs flags only (sugiero hybrid: flags si dadas, prompt si faltan)
