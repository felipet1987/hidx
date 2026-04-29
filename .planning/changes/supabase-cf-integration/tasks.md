# Tasks: Supabase Cloud ↔ Cloudflare Integration (A2+A3)

> Most tasks are infra/config (no TDD applicable). Only Edge Fn handler logic gets unit test.

## Phase 1: CF Pages deploy (S5a-c)

> **DEVIATION**: switched from API token + GH Actions auto-deploy to **wrangler OAuth + manual deploy** for first launch. GH auto-deploy still pending (needs `CLOUDFLARE_API_TOKEN` GH secret — user will generate later).

- [x] 1.1 ~~CF API Token via dashboard~~ → `pnpm wrangler login` OAuth (browser flow); Account picked: Ft.redprince (`05375e57742c47414a45782d98e201d5`)
- [ ] 1.2 ~~CLOUDFLARE_API_TOKEN GH secret~~ DEFERRED (auto-deploy via deploy.yml needs it; manual deploy works without)
- [x] 1.3 `gh secret set CLOUDFLARE_ACCOUNT_ID` — set via gh CLI
- [x] 1.4 `wrangler pages project create hidx` + `wrangler pages deploy dist --project-name=hidx --branch=main` — manual first deploy
- [x] 1.5 Verify deploy: HTTP 200 on https://hidx.pages.dev/ + content "hidx — Cómo lo hago" sirviendo
- [x] 1.6 Set CF Pages production secrets via `wrangler pages secret put` — SUPABASE_URL, SUPABASE_ANON_KEY, USE_SUPABASE_LOADER
- [ ] 1.7 BLOCKED USER: CF dashboard → Web Analytics → Add site (URL `*.pages.dev`); copy beacon token
- [ ] 1.8 `gh secret set PUBLIC_CF_ANALYTICS_TOKEN`; also add to CF Pages env vars
- [ ] 1.9 Modify `src/env.d.ts` — declare `PUBLIC_CF_ANALYTICS_TOKEN: string`
- [ ] 1.10 Modify `src/layouts/BaseLayout.astro` — replace `TOKEN_PLACEHOLDER` with `import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN`
- [ ] 1.11 Re-deploy + verify Web Analytics beacon fires (DevTools Network → `cloudflareinsights.com`)

## Phase 2: Webhook auto-publish (S5d-f)

- [ ] 2.1 Verify pg_net enabled on Cloud: `supabase db remote query "select * from pg_extension where extname='pg_net'"`
- [ ] 2.2 BLOCKED USER: CF dashboard → Pages → hidx → Settings → Build hooks → Create hook `supabase-publish` branch `main`; copy URL
- [ ] 2.3 `supabase secrets set CF_DEPLOY_HOOK_URL=<url> --project-ref jztvajdsuixxgfdluvqt`
- [ ] 2.4 Create `supabase/functions/articles-webhook/index.ts` — Deno serve, throttle 30s in-mem, fire-and-forget POST, 202 return
- [ ] 2.5 Create `supabase/functions/articles-webhook/deno.json` — basic imports config
- [ ] 2.6 `supabase functions deploy articles-webhook --project-ref jztvajdsuixxgfdluvqt`
- [ ] 2.7 Smoke: `curl -X POST https://jztvajdsuixxgfdluvqt.supabase.co/functions/v1/articles-webhook -H "Authorization: Bearer <ANON_KEY>" -d '{"type":"INSERT","record":{"draft":false}}'` → 202
- [ ] 2.8 `supabase migration new webhook_trigger` → SQL with `extensions.http_post` AFTER INSERT/UPDATE on articles, skip draft→draft
- [ ] 2.9 `supabase db push`
- [ ] 2.10 One-time: `psql ... -c "alter database postgres set app.webhook_url = 'https://jztvajdsuixxgfdluvqt.supabase.co/functions/v1/articles-webhook'"` against Cloud
- [ ] 2.11 E2E test: insert+publish article via CLI → CF Pages dashboard shows new build < 90s
- [ ] 2.12 Throttle test: rapid 3 publishes → 1 build (verify CF dashboard count)

## Phase 3: R2 backup ~~nightly 12h~~ — DISABLED

> **DISABLED 2026-04-29**. Razones:
> - GitHub Actions removidas (decisión usuario) → no hay runner cron disponible
> - Backup pipeline no es prioridad MVP ChispaLab (sin contenido pago, RPO laxo)
> - Supabase Cloud free tier ya tiene daily backups automáticos (7d retention) — defensa básica gratis
>
> **Alternativas si se reactiva**:
> - Supabase Edge Function cron (pg_dump no disponible Deno; necesita workaround)
> - External cron (cron-job.org → trigger Edge Fn)
> - CF Workers Cron Trigger (free tier limitado)
> - Local script `pnpm backup` manual ad-hoc cuando contenido importante
>
> Defer hasta tener tracción real (>1k visits/mo) que justifique infra extra.

- [~] 3.1 R2 bucket `hidx-backups` — DISABLED
- [~] 3.2 R2 API Token — DISABLED
- [~] 3.3-3.9 — TODO DISABLED

## Phase 4: Docs (S5j)

- [ ] 4.1 Create `docs/secrets.md` — table of 8+ secrets: name / location (GH/CF Pages/Supabase/R2/.env.local) / scope / rotation steps
- [ ] 4.2 Create `docs/cloudflare.md` — CF Pages config, Deploy Hook setup, R2 bucket setup, custom domain (defer pointer)
- [~] 4.3 ~~`docs/backup-restore.md`~~ DISABLED (backup pipeline disabled; default = Supabase Cloud free tier 7d auto-backups)
- [ ] 4.4 Modify `wrangler.toml` — comments documenting all CF Pages env vars
- [ ] 4.5 Modify `README.md` — add `https://hidx.pages.dev` URL once Phase 1 verified

## Phase 5: Verification

- [ ] 5.1 `gh secret list` shows 8+ expected secrets
- [ ] 5.2 `wrangler pages secret list --project-name hidx` shows env vars
- [ ] 5.3 https://hidx.pages.dev returns 200 + content from Cloud DB (after inject-articles Phase 2)
- [ ] 5.4 Web Analytics dashboard shows pageviews
- [ ] 5.5 Edge Function `articles-webhook` listed in `supabase functions list`
- [ ] 5.6 DB trigger exists: `select tgname from pg_trigger where tgname = 'articles_publish_webhook'`
- [ ] 5.7 R2 `hidx-backups` has ≥1 file with `.sql.gz` extension
- [ ] 5.8 R2 lifecycle rule visible in dashboard with 30d expiry
- [ ] 5.9 Restore test workflow last-run = pass (green check in GH Actions)
