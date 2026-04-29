# Exploration: Supabase Cloud ↔ Cloudflare Integration

**Project**: `hidx` · **Date**: 2026-04-29 · **Phase**: sdd-explore · **Change**: `supabase-cf-integration`

## Current State

### Supabase (Cloud + Local)
- Cloud project `hidx` (ref `jztvajdsuixxgfdluvqt`, region us-east-1)
- Local Supabase running (54321/54322/54323)
- Migrations applied a ambos: `articles` table + RLS + `article-assets` storage bucket
- RLS smoke 6/6 pass en Cloud + Local
- Token CLI logged in (felipet1987's Org)

### Cloudflare
- ❌ CF Pages project **NO creado** todavía
- ❌ CF Deploy Hook URL **NO generado**
- ❌ CF R2 bucket **NO creado**
- ❌ CF Web Analytics token **NO seteado** (BaseLayout tiene `TOKEN_PLACEHOLDER`)
- ✅ Wrangler 4.86 instalado como devDep
- ✅ `.github/workflows/deploy.yml` listo (espera `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` GH secrets)
- ✅ `wrangler.toml` esqueleto
- ✅ `_headers` con security + cache rules

### GitHub Secrets actuales (en repo)
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `USE_SUPABASE_LOADER=true`
- ❌ `CLOUDFLARE_API_TOKEN` (deploy bloqueado)
- ❌ `CLOUDFLARE_ACCOUNT_ID`

### Pipeline esperado (no funcional aún)
```
push main → GH Actions CI ✅ → Deploy.yml fail (no CF secrets) ❌
                                      ▼
                              CF Pages (NO existe)
                                      ▼
                              hidx.dev (NO apuntado)
```

## Affected Areas

```
Cloudflare side (todo nuevo):
├── CF Pages project "hidx" (dashboard create + Git connect)
├── CF Pages env vars (production):
│   ├── SUPABASE_URL                   (ya en GH; CF necesita propio)
│   ├── SUPABASE_ANON_KEY              (idem)
│   ├── USE_SUPABASE_LOADER=true
│   ├── BEEHIIV_API_KEY                (futuro Phase 4 inject-articles)
│   ├── PUBLIC_CF_ANALYTICS_TOKEN      (BaseLayout reemplaza TOKEN_PLACEHOLDER)
├── CF Deploy Hook URL (dashboard generate)
├── CF API Token (Pages:Edit + Workers:Edit + R2:Edit scopes)
├── CF Account ID
├── CF R2 bucket "hidx-backups" (para pg_dump nightly)
├── Custom domain hidx.dev (DNS A/CNAME → pages.dev)

Supabase side:
├── Edge Function "articles-webhook" (recibe trigger row, llama CF Deploy Hook)
├── Migration "webhook_trigger" (after insert/update articles → pg_net.http_post)
├── Edge Function secret CF_DEPLOY_HOOK_URL
├── Cloud env vars Supabase Studio: BEEHIIV_*, etc

GH side:
├── Secret CLOUDFLARE_API_TOKEN
├── Secret CLOUDFLARE_ACCOUNT_ID
├── Secret PUBLIC_CF_ANALYTICS_TOKEN (build-time inject en BaseLayout)
├── Workflow backup.yml: cron pg_dump → R2

Astro side:
├── BaseLayout: usar import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN
├── astro.config.mjs: declare PUBLIC_* env schema
```

## Approaches

### A1 — **Mínimo viable**: deploy a CF Pages, sin webhook, sin backup
- Setup CF Pages project + connect repo + secrets + deploy hook
- Build estático Astro fetched Supabase Cloud build-time (cuando inject-articles Phase 2 listo)
- Deploy via `cloudflare/wrangler-action@v3` ya en deploy.yml
- Custom domain hidx.dev DNS apuntado
- **Pros**: ship en horas; deploy funcional; cero infra ops
- **Cons**: re-build manual via `gh workflow run` o push; sin backup; sin auto-publish desde Supabase
- **Effort**: Low (~2-3h)

### A2 — **Deploy + Webhook auto-publish** (recomendado MVP)
- A1 +
- Generate CF Pages Deploy Hook URL → guarda como Supabase Edge Function secret
- Deploy Supabase Edge Function `articles-webhook` (recibe payload row, POST CF hook URL, debounce 30s)
- Migration `webhook_trigger` con `pg_net.http_post` after insert/update
- **Pros**: publish-from-DB → live <2min sin CLI
- **Cons**: añade ~1h setup; debug webhook puede ser frágil
- **Effort**: Medium (~4-5h)

### A3 — **A2 + Backup pipeline**
- A2 +
- CF R2 bucket `hidx-backups`
- GH Actions cron daily `pg_dump` (Supabase Cloud) → gzip → upload R2 (S3 API)
- Lifecycle rule R2: delete > 30d
- Weekly restore smoke test
- **Pros**: data resilience offsite
- **Cons**: +1.5h; R2 free tier (10GB storage, 10M reads/mo) — fácil sobra
- **Effort**: Medium-High (~6h total)

### A4 — **A3 + monitoring + alerts**
- A3 +
- Discord/email webhook si build/deploy/backup falla
- CF Web Analytics dashboard
- Supabase project quota alerts
- **Pros**: producción profesional
- **Cons**: +2h; over-engineering MVP solo
- **Effort**: High (~8h)

## Recommendation

**A2 (Deploy + Webhook auto-publish)** ahora. **A3 (backup)** seguir inmediato (mismo día — barato relative). **A4 defer** hasta primer downtime.

### Razones A2 first
1. **Deploy core** desbloquea el MVP visible (hidx.dev live)
2. **Webhook auto-publish** elimina el último paso manual (publish UX)
3. Backup A3 es defensivo — necesario antes de publicar contenido pero no antes deploy técnico funcione
4. Total A2+A3 = ~6h, ROI alto vs A4 que solo aplica al post-launch

### Plan concreto (A2 → A3 secuencial)

**Fase 1 — CF Pages project (A2)**:
1. Tu acción: CF dashboard → My Profile → API Tokens → Create token "Edit Cloudflare Pages" + R2:Edit + (luego Workers:Edit si vamos a Edge)
2. Tu acción: copiar Account ID (sidebar)
3. `gh secret set CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`
4. Trigger deploy.yml — CF Pages auto-creates project on first deploy con `wrangler pages deploy`
5. Verify `https://hidx.pages.dev` serves
6. CF dashboard → Pages → hidx → Settings → env vars: copia los Supabase URL/ANON/USE_SUPABASE_LOADER que tenés en GH
7. CF dashboard → custom domain `hidx.dev` (cuando compres)

**Fase 2 — Auto-publish webhook (A2)**:
8. CF dashboard → Pages → hidx → Settings → Build hooks → Create → name `supabase-publish` → branch `main` → copy URL
9. `supabase secrets set CF_DEPLOY_HOOK_URL=https://api.cloudflare.com/...`
10. `supabase functions new articles-webhook`
11. Implement debounce 30s (use `Deno.env.get` + per-invocation lock — actually need Supabase KV or upstash for proper debounce; alternative: trigger throttle on DB side)
12. `supabase functions deploy articles-webhook`
13. New migration `webhook_trigger.sql` con `pg_net.http_post('http://supabase-functions...')`
14. `supabase db push`
15. Test: insert + update article → check CF dashboard nueva build

**Fase 3 — Backup A3**:
16. CF dashboard → R2 → Create bucket `hidx-backups`
17. R2 API token (S3-compat creds): Access Key + Secret
18. `gh secret set R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY` + `R2_ACCOUNT_ID`
19. `.github/workflows/backup.yml` daily cron
20. Smoke test: corre manual una vez, verify gzipped sql en R2
21. Lifecycle rule: delete > 30d en R2 dashboard

### CF Pages env vars

| Var | Valor | Source |
|-----|-------|--------|
| `SUPABASE_URL` | `https://jztvajdsuixxgfdluvqt.supabase.co` | Mismo que GH secret |
| `SUPABASE_ANON_KEY` | `eyJhbGc...` (legacy JWT) | Mismo |
| `USE_SUPABASE_LOADER` | `true` | flag |
| `PUBLIC_CF_ANALYTICS_TOKEN` | (CF dashboard → Web Analytics → site token) | Inject build-time en BaseLayout |
| `BEEHIIV_API_KEY` | (futuro) | Phase 4 inject-articles |
| `BEEHIIV_PUBLICATION_ID` | (futuro) | Phase 4 inject-articles |

NO seteás `SUPABASE_SERVICE_ROLE` en CF (ADR-204).

## Risks

- **CF Pages Build limit**: free tier 500 builds/mes. Webhook debounce 30s → si publicás 1 post/día, ~30 builds/mes. Sobra 16x. ✅
- **Supabase Edge Function cold start**: ~500ms. Aceptable para webhook async
- **CF API Token scope leak**: si token tiene scope-all, leak = pwn cuenta. **Mitigar**: scope solo `Pages:Edit + R2:Edit + (later) Workers:Edit`. Nunca `Account:Read All`
- **Custom domain DNS**: si usás CF DNS, automático. Si externo (Namecheap etc), CNAME `hidx.dev` → `hidx.pages.dev` + verify
- **Build env vars stale**: si cambiás `SUPABASE_URL` en GH pero olvidás CF Pages dashboard → deploys siguen apuntando a la url vieja. **Mitigar**: documentar en `docs/secrets.md` lugares dual
- **pg_net extension**: Cloud lo trae built-in; verify habilitado vía `select * from pg_extension where extname='pg_net'`
- **Backup pipeline credential leak**: R2 access key con write scope → mal uso = subir basura. **Mitigar**: scope solo `Object Write` en bucket `hidx-backups`, no Account
- **Webhook payload validation**: CF Deploy Hook URL es público sin auth. Anyone con URL = trigger build. **Mitigar**: rotar URL si leakea; webhook URL no es secret crítico (solo causa rebuild, no exfil data)
- **Free tier 2 active Supabase projects** — ya tenés 4 (incluyendo hidx). Supabase pausa automático >7d inactivos. hidx queda activo por uso

## Ready for Proposal

**Yes** con bifurcación.

### Decisiones bloqueantes antes `/sdd-propose`

1. **Approach scope**:
   - A1 (deploy básico) ✓
   - **A2 (deploy + webhook auto-publish)** ⭐ recomendado
   - A3 (A2 + backup) ⭐⭐ recomendado mismo PR
   - A4 (A3 + monitoring) defer

2. **Custom domain**: ¿comprado `hidx.dev` o usás `*.pages.dev` mientras tanto? (sugiero pages.dev MVP, comprar dominio antes contenido público)

3. **CF API Token scope**:
   - Mínimo: Pages:Edit
   - + R2:Edit (si A3)
   - + Workers:Edit (si futuro Capa 4 paywall)
   - Sugiero: crear con todos hoy para evitar rotar

4. **CF Web Analytics**: ¿setear hoy (gratis, GDPR-clean) o defer? (sugiero hoy — un secret más en el batch, cero contra)

5. **Backup R2**: ¿24h cron o 12h o weekly? (sugiero 24h)

### Acción tuya antes de procede

1. CF dashboard → My Profile → API Tokens → Create Custom Token:
   - Permissions: `Account → Cloudflare Pages → Edit`, `Account → Cloudflare R2 → Edit`, `Account → Workers Scripts → Edit` (opcional)
   - Account Resources: solo tu account
2. Copiar Account ID (sidebar derecha en CF dashboard)
3. (Opcional) CF dashboard → Web Analytics → Add a site → `*.pages.dev` placeholder → copiar token
4. Pegámelos aca (o en privado), procedo
