# Design: Supabase Cloud ↔ Cloudflare Integration (A2+A3)

## Technical Approach

CF Pages deploy via existing `deploy.yml` (only blocked on 2 GH secrets). CF env vars set via `wrangler pages secret put` post-create. Auto-publish: Supabase DB trigger `pg_net.http_post` → Edge Function `articles-webhook` (Deno) → CF Pages Deploy Hook URL. Throttle 30s in-memory inside Edge Function (acceptable best-effort given isolate restarts). Backup: GH Actions cron 12h `pg_dump` (pinned PG17 client) → gzip → R2 via `aws s3 cp` with R2 S3-compat creds. Lifecycle rule R2 30d. Weekly Monday 4am UTC restore-test workflow loads latest dump into ephemeral postgres docker, asserts `count(*) > 0` AND tag overlap.

## Architecture Decisions

| ADR | Choice | Alternatives | Rationale |
|-----|--------|--------------|-----------|
| 401 | `*.pages.dev` MVP, custom domain defer | hidx.dev day 1 | DNS setup not blocking deploy |
| 402 | CF API Token Pages:Edit only; R2 separate S3 creds | One token all scopes | Blast radius minimization |
| 403 | DB trigger + Edge Function webhook | Polling cron / GH webhook | Push-based, near-real-time |
| 404 | Async fire-and-forget 202 from Edge Function | Sync await + retry | Faster trigger return, CF dedupe handles dupes |
| 405 | In-memory 30s throttle (Edge Fn) | KV/upstash backed | YAGNI — peor caso double-build tolerable |
| 406 | `pg_dump --clean --no-owner --no-acl` + gzip-9 | Custom binary format | Restorable to any PG17 instance, plain text auditable |
| 407 | R2 lifecycle 30d (~60 backups @ 12h cadence) | Manual prune / 90d / 7d | Free tier safe, 30d sufficient RPO |
| 408 | Backup cadence 12h | 24h / 6h / hourly | RPO 12h acceptable for low-write blog |
| 409 | Weekly Monday 4am UTC restore test (count + tag check) | Daily / on-demand | Catches silent corruption without GH minutes burn |
| 410 | CF Web Analytics free | Plausible / PostHog self-host | Cookie-free, zero infra, CF-integrated |

## Data Flow

```
Author flow:
  CLI publish ── Supabase Cloud (UPDATE articles SET draft=false)
                         │
                         ▼
                  TRIGGER articles_webhook (AFTER UPDATE/INSERT)
                         │ skip if draft→draft no-op
                         ▼
                  pg_net.http_post  ────► Supabase Edge Fn `articles-webhook`
                         │                       │ throttle 30s in-mem
                         │                       │ POST CF Deploy Hook URL
                         │                       └─► return 202
                         │
                         ▼
                  CF Pages build (~30-90s)
                         │ pnpm install + build
                         │ Astro loader fetches Supabase Cloud (anon key)
                         ▼
                  hidx.pages.dev served (edge cached)

Backup flow:
  GH cron 12h ─► postgresql-client-17 pg_dump → gzip-9
                         │
                         └─► aws s3 cp --endpoint=R2 → r2://hidx-backups/
                                  │
                                  └─► lifecycle rule deletes > 30d

Restore test (Monday 4am UTC):
  GH cron weekly ─► aws s3 cp latest dump from R2
                         │
                         └─► docker run postgres:17 + psql < dump.sql.gz
                                  │
                                  └─► assert count(*) > 0 AND tag exists
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/articles-webhook/index.ts` | Create | Deno function: receive payload, throttle 30s, POST CF hook URL, return 202 |
| `supabase/functions/articles-webhook/deno.json` | Create | imports + lint config |
| `supabase/migrations/<ts>_webhook_trigger.sql` | Create | enable pg_net + AFTER INSERT/UPDATE trigger calling Edge Fn URL with payload |
| `.github/workflows/backup.yml` | Create | cron `0 */12 * * *`, pg_dump → gzip → R2 |
| `.github/workflows/backup-restore-test.yml` | Create | cron `0 4 * * 1`, restore latest, assert count + tag |
| `src/env.d.ts` | Modify | Add `PUBLIC_CF_ANALYTICS_TOKEN: string` typing |
| `src/layouts/BaseLayout.astro` | Modify | Replace `TOKEN_PLACEHOLDER` with `import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN` |
| `wrangler.toml` | Modify | Add comments documenting CF Pages env vars |
| `docs/secrets.md` | Create | All 8 secrets table: name / location / rotation / scope |
| `docs/cloudflare.md` | Create | CF Pages config, Deploy Hook setup, R2 bucket setup |
| `docs/backup-restore.md` | Create | Manual restore procedure + automated test schedule |
| `README.md` | Modify | Update with `*.pages.dev` URL once live |

## Interfaces

```ts
// supabase/functions/articles-webhook/index.ts
// deno-lint-ignore-file no-explicit-any
type Payload = { type: 'INSERT' | 'UPDATE' | 'DELETE'; record?: any; old_record?: any };

let lastFiredAt = 0; // module-level, per-isolate

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const body: Payload = await req.json();
  // Skip draft-to-draft no-ops
  if (body.record?.draft === true && body.old_record?.draft === true) {
    return new Response('skipped: draft-only update', { status: 200 });
  }
  const now = Date.now();
  if (now - lastFiredAt < 30_000) {
    return new Response('throttled', { status: 200 });
  }
  lastFiredAt = now;
  const hookUrl = Deno.env.get('CF_DEPLOY_HOOK_URL');
  if (!hookUrl) return new Response('CF_DEPLOY_HOOK_URL missing', { status: 500 });
  // Fire-and-forget; CF returns 200 quickly
  fetch(hookUrl, { method: 'POST' }).catch(() => {});
  return new Response('queued', { status: 202 });
});
```

```sql
-- supabase/migrations/<ts>_webhook_trigger.sql
create extension if not exists "pg_net" with schema "extensions";

create or replace function public.tg_articles_publish_webhook()
returns trigger language plpgsql security definer as $$
declare
  fn_url text := current_setting('app.webhook_url', true);
begin
  if fn_url is null then return new; end if;
  -- only trigger when not pure draft-to-draft
  if (tg_op = 'UPDATE' and old.draft = true and new.draft = true) then
    return new;
  end if;
  perform extensions.http_post(
    url := fn_url,
    body := jsonb_build_object(
      'type', tg_op,
      'record', row_to_json(new),
      'old_record', case when tg_op = 'UPDATE' then row_to_json(old) else null end
    )::text,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  return new;
end $$;

create trigger articles_publish_webhook
  after insert or update on public.articles
  for each row execute procedure public.tg_articles_publish_webhook();

-- Set the webhook URL via:
--   alter database postgres set app.webhook_url = 'https://<project-ref>.supabase.co/functions/v1/articles-webhook';
```

```yaml
# .github/workflows/backup.yml (key step)
- run: |
    PGPASSWORD="$DB_PASS" pg_dump \
      --no-owner --no-acl --clean --if-exists \
      -h db.jztvajdsuixxgfdluvqt.supabase.co \
      -p 5432 -U postgres -d postgres \
      | gzip -9 > /tmp/articles.sql.gz
- run: |
    aws s3 cp /tmp/articles.sql.gz \
      "s3://hidx-backups/articles-$(date -u +%Y%m%d-%H%M%S).sql.gz" \
      --region auto \
      --endpoint-url "https://${{ secrets.R2_ACCOUNT_ID }}.r2.cloudflarestorage.com"
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Smoke | Edge Fn deploy + invoke returns 202 | `curl` POST to function URL |
| Smoke | DB trigger fires on UPDATE | INSERT then UPDATE; check pg_net.queue.execute_command logs |
| E2E | Publish loop: CLI publish → CF build appears | Manual + screenshot CF dashboard |
| Smoke | Backup workflow `workflow_dispatch` succeeds | `gh workflow run backup.yml` + verify R2 file |
| Auto | Restore test passes weekly | Monday cron emit pass/fail status |
| Smoke | CF Pages env vars correct | `wrangler pages secret list` |
| Manual | Web Analytics beacon visible | DevTools Network on `*.pages.dev` |
| Smoke | Throttle 30s holds | Rapid 3 publishes → 1 build only |

## Migration / Rollout

Sequential:
1. **Pre-req**: confirm `inject-articles` Phase 2 (Supabase loader) ready (else builds will use glob)
2. S5a-c: CF Pages live + env vars
3. S5d-f: webhook stack — DB trigger requires `app.webhook_url` set via `alter database` (manual one-time)
4. S5g-i: backup pipeline + R2 lifecycle
5. S5j: docs

Rollback paths:
- Webhook bad → drop trigger (`drop trigger articles_publish_webhook`)
- Backup workflow bad → disable in GH Actions UI
- CF Pages bad deploy → CF dashboard rollback to previous deployment (built-in)
- All secrets revocable via dashboards

## Open Questions

- [ ] **Edge Function URL setting**: hardcode in trigger SQL vs `current_setting('app.webhook_url')`? Sugiero setting (rotatable without migration)
- [ ] **R2 bucket name confirm**: `hidx-backups` ok?
- [ ] **Backup workflow schedule timezone**: UTC vs local? Sugiero UTC (cron standard)
- [ ] **Deploy Hook URL via `wrangler pages deploy hook create`**: CLI o dashboard? Sugiero dashboard MVP (one-time)
