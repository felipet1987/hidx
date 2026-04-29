# Proposal: Supabase Cloud ↔ Cloudflare Integration (A2+A3)

**Project**: `hidx` · **Date**: 2026-04-29 · **Phase**: sdd-propose · **Change**: `supabase-cf-integration` · **Status**: Draft v1

## Intent

Cerrar pipeline DB→build→deploy→reader: CF Pages serve static + Supabase Cloud webhook auto-publish + R2 backup nightly 12h. Sin custom domain (usar `*.pages.dev` MVP). CF token mínimo (solo Pages); R2 separate S3 creds. CF Web Analytics activo (gratis, sin cookies).

## Scope

### IN scope (Sprint S5 — paralelo a inject-articles Phase 5)

#### Fase 1: CF Pages deploy

1. **CF Pages project `hidx`** auto-created on first deploy via `wrangler pages deploy` action
2. **GH secrets**:
   - `CLOUDFLARE_API_TOKEN` (scope `Account → Cloudflare Pages → Edit` only)
   - `CLOUDFLARE_ACCOUNT_ID`
3. **CF Pages environment variables** (production scope, set via `wrangler pages secret put` or dashboard):
   - `SUPABASE_URL=https://jztvajdsuixxgfdluvqt.supabase.co`
   - `SUPABASE_ANON_KEY=<jwt>`
   - `USE_SUPABASE_LOADER=true`
   - `PUBLIC_CF_ANALYTICS_TOKEN=<token>`
4. **deploy.yml** existing workflow used as-is (already wired with wrangler-action)
5. **Verify deploy** at `https://hidx.pages.dev`
6. **CF Web Analytics**: site added in dashboard (placeholder URL `*.pages.dev`), token injected build-time
7. **Astro env types**: declare `PUBLIC_CF_ANALYTICS_TOKEN` in `src/env.d.ts` for type safety

#### Fase 2: Webhook auto-publish

8. **CF Pages Deploy Hook URL** generated in Pages dashboard → Settings → Build hooks
9. **Supabase secret**: `supabase secrets set CF_DEPLOY_HOOK_URL=<url>` for Edge Functions
10. **Supabase Edge Function `articles-webhook`** in `supabase/functions/articles-webhook/index.ts`:
    - Receives DB trigger payload (record + old_record + type)
    - Skips drafts (only publish events trigger build)
    - In-memory throttle (KV-backed in upgrade): if last fire < 30s ago → skip
    - POST to CF Deploy Hook URL with empty body
    - Returns 202 immediately (fire-and-forget)
11. **Migration `webhook_trigger.sql`** with `pg_net.http_post`:
    - Trigger AFTER INSERT OR UPDATE on `articles`
    - Calls Edge Function URL with row payload
    - Skips if `draft = true AND old.draft = true` (no-op for draft edits)
12. **Test publish loop**: insert article → publish → verify CF Pages dashboard new build within 1min

#### Fase 3: R2 backup nightly 12h

13. **R2 bucket `hidx-backups`** created via dashboard (free tier 10GB)
14. **R2 S3-compatible credentials** generated: Access Key + Secret Key + Account ID
15. **GH secrets**: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`
16. **`.github/workflows/backup.yml`** cron `0 */12 * * *` (00:00 + 12:00 UTC):
    - Setup postgresql-client
    - `pg_dump --no-owner --no-acl --clean --if-exists` against Supabase Cloud
    - `gzip -9` output
    - Upload to R2 via `aws s3 cp` with `--endpoint-url=https://<acct>.r2.cloudflarestorage.com`
    - Filename `articles-YYYYMMDD-HHmmss.sql.gz`
17. **R2 lifecycle rule** (dashboard): delete objects > 30 days old (~60 backups retained)
18. **Smoke test**: manual workflow run once, verify file in R2 dashboard
19. **Weekly restore test workflow `backup-restore-test.yml`** cron `0 4 * * 1` (Monday 4am):
    - Pull latest backup from R2
    - Spin up ephemeral postgres docker
    - `pg_restore` (or `psql < dump.sql.gz`)
    - `select count(*) from articles` smoke
    - Fail if count = 0 (data lost)

#### Docs + ops

20. **Update `docs/secrets.md`** — list all secrets per location (GH / CF Pages / Supabase / R2 / .env.local)
21. **Create `docs/cloudflare.md`** — CF Pages config, Deploy Hook, R2 bucket, lifecycle
22. **Create `docs/backup-restore.md`** — manual restore from R2 procedure
23. **Update `wrangler.toml`** comments with all required env vars
24. **Update `README.md`** with deploy URL once live

### OUT of scope (defer)

- **Custom domain `hidx.dev`** (defer hasta contenido público; setup DNS toma 5min cuando llegue)
- **CF Workers (Capa 4 paywall)** — Workers:Edit token scope no necesario aún
- **A4 monitoring/alerts** (Discord webhook on failure, status page) — defer
- **Backup encryption at rest** (R2 ya encripta server-side; defer client-side cifrado)
- **Multi-region R2** (single region MVP)
- **Pulumi/Terraform IaC** — manual setup MVP, IaC cuando recursos > 5
- **Supabase Cloud project pause/unpause automation**

## Approach

### Sprint plan

| Sub | Goal | Días |
|-----|------|------|
| **S5a — CF Pages deploy** | Token + GH secrets + first deploy → `*.pages.dev` live | 0.25 |
| **S5b — CF env vars** | Pages dashboard env (Supabase + Analytics) + verify build pulls Cloud DB | 0.25 |
| **S5c — Web Analytics wire** | Token in BaseLayout via PUBLIC_ env, build verify | 0.25 |
| **S5d — Edge Function webhook** | articles-webhook deploy + Supabase secret + throttle 30s | 0.5 |
| **S5e — DB trigger migration** | webhook_trigger.sql + pg_net + skip draft-to-draft | 0.5 |
| **S5f — Test publish loop** | INSERT/UPDATE article → CF dashboard nueva build < 1min | 0.25 |
| **S5g — R2 bucket + creds** | Bucket + S3 keys + GH secrets | 0.25 |
| **S5h — Backup workflow** | backup.yml cron 12h + manual test + R2 verify | 0.5 |
| **S5i — Restore test workflow** | backup-restore-test.yml weekly cron | 0.5 |
| **S5j — Docs** | secrets.md + cloudflare.md + backup-restore.md + wrangler comments | 0.5 |

Total: ~3.75 días (5h dev + ~3h waiting CF/Supabase propagation).

### Architectural decisions

1. **No custom domain MVP** — `*.pages.dev` URL stable, CF Pages preview deploy con cada PR + production en main
2. **Token segregation**: CF API Token mínimo (solo Pages:Edit); R2 usa S3-compatible separate creds (no API token); Supabase service-role solo CLI local
3. **Webhook async fire-and-forget**: Edge Function returns 202 antes de POST CF hook; CF build async; idempotente si dispara doble (CF debounce server-side)
4. **DB trigger smart skip**: trigger NO dispara on draft-only edits (only when published_at flips false→non-null OR row reaches `draft=false` state)
5. **Throttle in Edge Function** (in-memory): last-fire timestamp en module-level var. Edge Function isolates may not share state — safe ceiling, peor caso disparas más builds (CF tolera)
6. **Backup format**: `pg_dump --no-owner --no-acl --clean` (importable a Supabase clean instance), gzip max compression
7. **Backup naming**: `articles-YYYYMMDD-HHmmss.sql.gz` (sortable + searchable)
8. **R2 lifecycle 30d**: ~60 backups retained (12h cadence × 30d). 1MB/dump avg → ~60MB total — sobra free tier 10GB
9. **Restore test weekly Monday 4am UTC**: catches silent backup corruption; only loads metadata `count(*)` (fast, ~10s)
10. **CF Web Analytics token via `PUBLIC_*`**: client-readable env (Astro convention); injected at build time, no runtime fetch

### Free tier validation

| Service | Limit | hidx usage | Status |
|---------|-------|------------|--------|
| CF Pages builds | 500/mo | Webhook ~30/mo + manual ~10 | ✅ 12x sobra |
| CF Pages bandwidth | unlimited | unlimited | ✅ |
| CF Pages requests | 100k/day | ~few/k MVP | ✅ |
| CF R2 storage | 10 GB | ~60MB backups | ✅ 167x sobra |
| CF R2 ops | 10M reads + 1M writes/mo | ~60 writes + ~4 reads (weekly test) | ✅ |
| CF Web Analytics | unlimited | ✅ |
| Supabase Edge Functions | 500k invocations/mo | ~30/mo trigger + manual | ✅ massive headroom |
| Supabase pg_net | included | ~30 calls/mo | ✅ |

Cero costo proyectado.

## Success Criteria

### Technical gates

- [ ] `gh secret list` muestra `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`
- [ ] CF Pages deploy successful: `https://hidx.pages.dev` HTTP 200
- [ ] CF Pages env vars set (verified via `wrangler pages secret list`)
- [ ] Build at CF pulls posts desde Supabase Cloud (verify network logs)
- [ ] Web Analytics beacon fires (verify CF Web Analytics dashboard shows pageview)
- [ ] Edge Function `articles-webhook` deployed (`supabase functions list` shows it)
- [ ] DB trigger `webhook_trigger` exists (`select * from pg_trigger where tgname like '%webhook%'`)
- [ ] E2E publish: insert + publish article → CF Pages new build dentro de 90s
- [ ] R2 bucket `hidx-backups` creado y accesible via `aws s3 ls`
- [ ] Backup workflow runs OK manualmente (verify SQL file en R2)
- [ ] Backup file restorable: weekly test workflow passes con `count(*) > 0`
- [ ] Backup lifecycle: rule visible en R2 dashboard, 30d expiry

### Docs gates

- [ ] `docs/secrets.md` enumera 8+ secrets con location + rotation
- [ ] `docs/cloudflare.md` cubre Pages config, Deploy Hook, R2 setup
- [ ] `docs/backup-restore.md` con manual restore command + smoke verify

### Resilience gates

- [ ] Backup workflow notifica failure (workflow status = failed visible en GH Actions)
- [ ] Restore test workflow Monday smoke = count > 0
- [ ] Webhook respects 30s throttle (test rapid-fire 3 publishes → 1 build)

## Open Questions (resolver durante S5)

- [ ] **Edge Function runtime**: `supabase functions deploy` defaults to Deno; OK para fetch + crypto. ¿Tipos para `Deno.env`? (sugiero `@types/deno` o ignore type)
- [ ] **Backup encryption**: gzip plain o pgp asimétrico? Sugiero plain (R2 server-side encrypt suficiente; pgp adds key-mgmt complexity)
- [ ] **Restore test data validation**: solo `count(*)` o smoke 1 random row? Sugiero count + tag exists check
- [ ] **PUBLIC_CF_ANALYTICS_TOKEN ofuscation**: token expuesto en HTML obvio (tu CF org visible). Sugiero asumir público — no es secreto crítico
- [ ] **Backup workflow notifications**: GH Actions email default si fail; opt-in Discord/Slack si querés alert externo

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| CF Pages first deploy fails (project doesn't exist + race) | Medium | Low | wrangler-action `command: pages deploy --project-name=hidx --branch=main` creates if missing |
| Edge Function debounce stateless (isolate restart) | Medium | Low | Tolerable: peor caso 2 builds back-to-back; CF dedupes |
| pg_net not enabled in Cloud | Low | High | Verify pre-S5e: `select * from pg_extension where extname = 'pg_net'` (Cloud built-in) |
| R2 S3 endpoint requires custom region "auto" | High | Low | Document `--region=auto --endpoint-url=https://{acct}.r2.cloudflarestorage.com` in workflow |
| pg_dump version mismatch (local vs Cloud) | Medium | Medium | Pin to PG 17 client in GH Actions (`apt install postgresql-client-17`) |
| Backup file > 100MB GH artifact upload limit | Low | Low | Backup goes directly to R2, not GH artifacts |
| R2 lifecycle rule misconfig deletes too soon | Low | Critical | Set rule to 30d minimum; manually verify in dashboard before activating |
| Web Analytics beacon blocked by adblock | High | Low | Acceptable; CF Analytics never accurate dev audience |
| Webhook URL leak public | Medium | Low | Only causes rebuild (no data exfil); rotate via CF dashboard if leaked |
| Free tier exhaustion mid-month | Very Low | Medium | Budget validation table above (16x headroom CF builds, 167x R2 storage) |

## Architectural Decisions Record (ADR seeds)

- **ADR-401**: CF Pages with `*.pages.dev` MVP (custom domain defer)
- **ADR-402**: CF API Token mínimo Pages:Edit (R2 separate S3 creds; Workers defer)
- **ADR-403**: Edge Function articles-webhook + DB trigger pg_net (vs polling vs cron)
- **ADR-404**: Webhook async fire-and-forget 202 (vs sync await + retry)
- **ADR-405**: Throttle 30s in-memory Edge Function (vs Redis/KV — defer)
- **ADR-406**: pg_dump backup format (clean SQL gzip vs binary custom)
- **ADR-407**: R2 backup retention 30d via lifecycle rule (~60 backups)
- **ADR-408**: Backup cadence 12h (vs 24h vs hourly) — RPO 12h acceptable for blog
- **ADR-409**: Weekly restore smoke test Monday 4am UTC (vs daily — overkill)
- **ADR-410**: CF Web Analytics free tier (vs PostHog vs Plausible self-host)

## Next Phase

→ `/sdd-design supabase-cf-integration` — finalize Edge Function code structure, DB trigger SQL, backup workflow YAML, restore test YAML, env contract per location.

→ Sequential: complete inject-articles Phase 2 (loader Astro Supabase) BEFORE this change goes live, otherwise CF builds will use legacy glob (no posts visible from Cloud DB).
