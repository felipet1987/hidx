# Tasks: Inyectar Artículos vía Supabase (Stack 8a)

> TDD donde aplique (loader, validator). Migration/CLI smoke via integration tests.

## Phase 1: Schema + RLS (S3a)

- [x] 1.1 Run `supabase init` in repo root → commit `supabase/config.toml`
- [x] 1.2 `supabase migration new articles` → table SQL with cols + checks + RLS policies + trigger updated_at + indexes
- [x] 1.3 `supabase migration new storage` → bucket `article-assets` + public-read/auth-write policies
- [x] 1.4 `supabase start` local → migrations apply clean (verified ports 54321/54322/54323)
- [x] 1.5 Cloud project `hidx` (ref `jztvajdsuixxgfdluvqt`, region us-east-1, org `xoyyqhadzmaznlcibvhw`), linked, migrations pushed; Cloud RLS smoke 6/6 pass; GitHub Secrets set (URL + ANON only — SERVICE_ROLE excluded per ADR-204)
- [x] 1.6 RED Vitest: anon client INSERT fails, anon SELECT only published returns (covered by `scripts/rls-smoke.ts`)
- [x] 1.7 GREEN: `scripts/rls-smoke.ts` runnable standalone — all 6 assertions pass

## Phase 2: Loader + MDX compile (S3b)

- [ ] 2.1 Add deps: `@supabase/supabase-js`, `tsx`, `@mdx-js/mdx`
- [ ] 2.2 Create `src/lib/supabase.ts` — `createAnonClient()` + `createServiceClient()` factories from env
- [ ] 2.3 Add `.env.example` listing `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE`, `CF_DEPLOY_HOOK_URL`
- [ ] 2.4 RED Vitest: `tests/unit/article-loader.test.ts` — mock supabase, assert row → entry mapping (snake_case → camelCase, Date coercion)
- [ ] 2.5 GREEN: implement `src/lib/article-loader.ts` per design interface (Loader contract)
- [ ] 2.6 Modify `src/content.config.ts` — replace glob loader with `supabaseArticles()`; gate behind env `USE_SUPABASE_LOADER` (fallback glob)
- [ ] 2.7 Verify `pnpm dev` boots + post renders from DB (after migration script Phase 4)
- [ ] 2.8 Verify MDX components (Callout/Steps/CodeDemo/Affiliate/TipJar) render in DB-loaded post
- [ ] 2.9 Add `MDX_COMPONENT_WHITELIST` const exported from `src/components/mdx/index.ts`

## Phase 3: CLI Scripts (S3c)

- [ ] 3.1 Add scripts to `package.json`: `new:post`, `publish:post`, `posts`, `upload`, `db:reset`, `db:diff`, `db:push`, `db:migrate`
- [ ] 3.2 RED: `tests/unit/validate-mdx.test.ts` — Whitelist enforcement (accept `<Callout>`, reject `<Random>`)
- [ ] 3.3 GREEN: `scripts/validate-mdx.ts` — parses body via mdxjs, asserts JSX components in whitelist
- [ ] 3.4 `scripts/new-post.ts` — slug generation, Zod validation, INSERT row, prints Studio edit URL; hybrid args (flag or prompt)
- [ ] 3.5 `scripts/publish-post.ts` — runs `validate-mdx`, UPDATE draft=false + published_at, fetches CF Deploy Hook URL trigger
- [ ] 3.6 `scripts/list-posts.ts` — CLI table with slug | draft | published_at | tags
- [ ] 3.7 `scripts/upload-asset.ts` — uploads to bucket `article-assets/{slug}/{filename}`, copies URL to clipboard
- [ ] 3.8 Integration test: `pnpm new:post --title "Test"` against local Supabase verifies row exists

## Phase 4: Migration MDX → Supabase (S3d)

- [ ] 4.1 `scripts/migrate-mdx-to-supabase.ts` — globs `src/content/posts/*.mdx`, parses frontmatter, INSERT rows, validates count
- [ ] 4.2 Run script local → verify hello row in Studio + dev render works
- [ ] 4.3 Run against Cloud → verify
- [ ] 4.4 Delete `src/content/posts/hello.mdx`, add `src/content/posts/.gitkeep`
- [ ] 4.5 Set `USE_SUPABASE_LOADER=true` in CI env + CF Pages env vars

## Phase 5: Webhook + Deploy Hook (S3e)

- [ ] 5.1 Generate CF Pages Deploy Hook URL in dashboard, save as Supabase secret `CF_DEPLOY_HOOK_URL`
- [ ] 5.2 `supabase functions new articles-webhook` — receives row payload, debounces 30s (use Supabase KV or in-memory lock), POSTs CF hook URL
- [ ] 5.3 `supabase migration new webhook_trigger` — `after insert/update on articles` calls `net.http_post` to edge function (use `pg_net` extension)
- [ ] 5.4 Deploy edge function: `supabase functions deploy articles-webhook`
- [ ] 5.5 E2E test: `pnpm publish:post hello` triggers webhook → CF Pages dashboard shows new build
- [ ] 5.6 Add Discord/email alert on webhook fail (optional)

## Phase 6: Backup + Docs (S3f)

- [ ] 6.1 Create R2 bucket `hidx-backups` (CF dashboard) + API token with write scope
- [ ] 6.2 `.github/workflows/backup.yml` — daily cron `pg_dump --no-owner --no-acl` → gzip → `aws s3 cp` to R2 (use S3 API endpoint), retention 30d via lifecycle rule
- [ ] 6.3 Smoke restore test: weekly cron creates ephemeral PG container, `pg_restore` latest backup, runs `select count(*) from articles`
- [ ] 6.4 `docs/authoring.md` — CLI commands + Studio link + asset upload + publish flow
- [ ] 6.5 `docs/db-migrations.md` — `migration new` / `db reset` / `db push` workflow
- [ ] 6.6 `docs/secrets.md` — list all envs, where stored (`.env.local`, GitHub Secrets, CF Pages, Supabase), rotation steps
- [ ] 6.7 Add `.env.local` + `supabase/.temp` + `supabase/.branches` to `.gitignore`
- [ ] 6.8 Add git-secrets pre-commit hook to block accidental SERVICE_ROLE commit

## Phase 7: Verification

- [ ] 7.1 Full E2E: `pnpm new:post` → edit Studio → `pnpm publish:post` → live in <2min
- [ ] 7.2 Build time benchmark: `time pnpm build` with 50 fixture articles < 2min
- [ ] 7.3 Lighthouse SEO=100 maintained on landing + post (regression gate)
- [ ] 7.4 CI passes without SERVICE_ROLE key (anon only)
- [ ] 7.5 Update `.planning/changes/inject-articles/tasks.md` marks complete
