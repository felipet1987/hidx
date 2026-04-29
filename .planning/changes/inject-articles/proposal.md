# Proposal: Inyectar Artículos vía Supabase (Stack 8a)

**Project**: `hidx` · **Date**: 2026-04-29 · **Phase**: sdd-propose · **Change**: `inject-articles` · **Status**: Draft v1

## Intent

Migrar autoría de artículos desde MDX-en-repo a backend Supabase **manteniendo SSG** (proposal original ADR-003). Habilitar CLI scaffold + webhook auto-rebuild. Asset storage en Supabase Storage. UI editorial fase 1 = Supabase Studio + CLI; UI custom defer a fase 2.

## Scope

### IN scope (Sprint S3 — paralelo a S5 content)

#### Database

1. **Migration `supabase/migrations/20260429000001_articles.sql`** crea tabla `public.articles` con schema completo (cols + checks + índices + RLS policies + trigger updated_at)
2. **Bucket `article-assets`** en Supabase Storage con policy "public read, author write"
3. **Seed script** `supabase/seed.sql` — opcional, para dev fixture data
4. **Migrations versionadas** vía `supabase migration new` (NO Studio direct schema edits)

#### Loader Astro

5. **Reemplazar `src/content.config.ts`** glob-loader por **custom loader** que llama Supabase REST con anon key (read-only, public articles)
6. **Schema mapping**: convertir snake_case columns → camelCase + Date coercion (mantener Zod validation)
7. **MDX compilation desde DB**: usar `@astrojs/mdx`'s programmatic API en loader, escribir `tmp/posts/{slug}.mdx` durante build, `glob` los compila — mantiene component imports
8. **Fallback graceful**: si Supabase no responde durante build → falla loud (no silent empty deploy)

#### CLI Scaffold

9. **`scripts/new-post.ts`** (`pnpm new:post "Mi Título"`):
   - Genera slug desde título
   - Validates contra Zod schema antes insert
   - INSERT row Supabase con `draft = true`, `published_at = null`
   - Output: `https://hidx.dev/admin/edit/{id}` (placeholder URL hasta Fase 2)
   - Si flag `--open`: abre Studio en browser

10. **`scripts/publish-post.ts`** (`pnpm publish:post <slug>`):
    - Sets `draft = false`, `published_at = now()`
    - Trigger Cloudflare Pages Deploy Hook
    - Output preview URL CF Pages

11. **`scripts/list-posts.ts`** (`pnpm posts`): tabla CLI con slug + draft status + published_at

#### Migración

12. **One-shot `scripts/migrate-mdx-to-supabase.ts`** importa `src/content/posts/*.mdx` existentes a Supabase, valida schema, INSERT
13. **Borrar `src/content/posts/`** del repo después de migration verified
14. **Mantener `src/content/posts/.gitkeep`** para tmp loader output durante dev

#### Webhook + Deploy

15. **Cloudflare Pages Deploy Hook** generated en CF dashboard, URL guardada como Supabase secret `CF_DEPLOY_HOOK_URL`
16. **Supabase Edge Function `articles-webhook`**: recibe row insert/update on articles, llama POST CF Deploy Hook URL, debounced 30s para evitar storm
17. **Database trigger** `after insert/update on public.articles` → invoca edge function (no en draft → published, sí en published edits)

#### Auth (mínimo)

18. **Single user setup**: vos como `auth.users` row vía Supabase Studio, password manual
19. **`.env.local` + GitHub Secrets**: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (read-only build), `SUPABASE_SERVICE_ROLE` (CLI scripts only — never CI build)
20. **No multi-author UI** — solo auth.users entry para RLS author_id

#### Assets (Supabase Storage)

21. **Bucket `article-assets`** con folder por slug `{slug}/{filename}.{ext}`
22. **Helper `scripts/upload-asset.ts`** (`pnpm upload <slug> <file>`): sube a bucket, output URL pública, copia a clipboard
23. **MDX `<Image>`** wrapper component que acepta Supabase Storage URLs

#### Config + Docs

24. **`docs/authoring.md`** workflow end-to-end (CLI commands, Supabase Studio link, asset upload)
25. **`docs/db-migrations.md`** how-to crear migrations + apply prod
26. **`supabase/.gitignore`** excluye `.branches/`, `.temp/`
27. **GitHub Actions secret rotation** doc en `docs/secrets.md`

### OUT of scope (defer Fase 2)

- Custom `/admin` Astro page con Supabase Auth (UX rica con MDX preview live)
- Multi-author + invite flow
- Drafts preview environment (CF Pages preview branches)
- Full-text search via tsvector
- Article scheduling UI (publish_at en futuro)
- Supabase Storage CDN swap to R2
- Comments system
- Bulk import desde Medium/Notion (no hay contenido legacy)
- AI prompt templates (Stack 3 — separate change)

## Approach

### Sprint plan

| Sprint | Goal | Deliverable | Días |
|--------|------|-------------|------|
| **S3a — Schema + RLS** | Migration applied local + Cloud, RLS tested | `articles` table query-able con anon read | 0.5 |
| **S3b — Loader + MDX compile** | Astro build fetches Supabase + renders posts | `pnpm dev` muestra hello.mdx desde DB | 1.5 |
| **S3c — CLI scripts** | `new:post`, `publish:post`, `list:post`, `upload` funcionan | Workflow end-to-end vía CLI sin tocar repo | 1 |
| **S3d — Migration script** | Existing `hello.mdx` en Supabase, repo posts dir vacío | Posts only en DB | 0.5 |
| **S3e — Webhook + Deploy Hook** | Publicar dispara rebuild CF Pages auto | `pnpm publish:post hello` → live en ~2min | 0.5 |
| **S3f — Docs + secrets** | `docs/authoring.md` + `db-migrations.md` + `secrets.md` | Workflow documentado | 0.5 |

Total: ~4.5 días dev.

### Architectural decisions

1. **Single source of truth = Supabase**. Repo no contiene posts. Beneficio: multi-device authoring sin push/pull. Costo: pierde git history en contenido (mitigado por `pg_dump` nightly a R2)
2. **Migration-first DB**: TODA cambio schema vía `supabase migration new` + commit a repo `supabase/migrations/`. Nunca Studio direct
3. **Anon key en build**: read-only public articles — seguro de exponer al runner
4. **Service role solo en CLI scripts** (no CI). CLI corre local con `.env.local`
5. **MDX text raw en column `body_mdx`**: NO blocks JSON. Trade-off: editor en text area pierde syntax highlight (Studio limitation), pero conserva 100% poder MDX components
6. **Component whitelist**: solo MDX components que existen en `src/components/mdx/index.ts` se pueden usar. Validator script chequea body durante CLI publish
7. **Build trigger**: Cloudflare Pages Deploy Hook URL como Supabase Edge Function secret. Trigger en INSERT (always) y UPDATE (solo si `draft = false`). 30s debounce
8. **Backup**: GitHub Action cron diario `pg_dump` → CF R2 bucket `hidx-backups/articles-{date}.sql.gz`. Retención 30 días
9. **Local dev = local Supabase**: `supabase start` + `supabase db reset` para fresh state. `.env.local` apunta a `http://localhost:54321`
10. **Prod = Supabase Cloud free tier**: 500MB DB + 1GB Storage. Suficiente para hidx por años

### Stack Supabase Cloud free tier

| Resource | Free | hidx fit |
|----------|------|----------|
| Database | 500 MB | ~1MB / 100 articles MDX text |
| Storage | 1 GB | ~5MB cover images / 100 articles |
| Edge Functions | 500k invocations/mo | Webhook ~10/mo |
| Auth users | 50k MAU | 1 user (vos) |
| Bandwidth | 5 GB/mo | Build pull only, low |

Holds out fácil hasta 1000+ articles.

## Success Criteria

### Technical gates

- [ ] Migration aplica sin errores en local Supabase + Cloud
- [ ] RLS impide writes desde anon (test con `pnpm tsx scripts/rls-smoke.ts`)
- [ ] Build Astro pull articles desde Supabase + render correcto
- [ ] MDX components (Callout, Steps, CodeDemo, AffiliateLink, TipJar) renderizan en posts de DB
- [ ] CLI scripts funcionan offline-first (cuando posible) o fail clean si DB down
- [ ] `pnpm new:post` → INSERT row → confirmable en Studio
- [ ] `pnpm publish:post` → trigger webhook → CF Pages rebuild visible en dashboard
- [ ] Migration script importa `hello.mdx` lossless
- [ ] Backup script genera `*.sql.gz` válido restaurable a Postgres limpio
- [ ] Build time < 2min para 50 articles
- [ ] CI build no requiere SERVICE_ROLE key (solo ANON)
- [ ] Lighthouse 100 SEO mantenido (SSG intacto)

### UX gates

- [ ] CLI workflow end-to-end < 5 min para nuevo post
- [ ] Studio direct edit funciona como fallback (no requiere otro tool)
- [ ] Preview en local: `supabase start` + `pnpm dev` → cambios DB se ven en `pnpm dev` después restart

### Docs gates

- [ ] `docs/authoring.md` cubre CLI + Studio + asset upload + publish
- [ ] `docs/db-migrations.md` cubre create/apply/rollback
- [ ] `docs/secrets.md` lista todas envs + dónde se rotan

## Open Questions (resolver durante S3a)

- [ ] **Supabase Cloud project name**: ¿`hidx-prod` o `hidx`? (sugiero `hidx`)
- [ ] **Postgres version Cloud**: ¿15 o 17? (sugiero 17 — match local)
- [ ] **Author email**: tu correo personal, o creo `editor@hidx.dev`? (sugiero personal, simple)
- [ ] **Webhook debounce window**: 30s vs 60s vs 120s (sugiero 30s para iteration rápida)
- [ ] **Backup retention**: 30 días R2 vs más (sugiero 30 días, free R2 1GB)
- [ ] **Schema sync local→cloud**: manual `supabase db push` cada deploy, o GitHub Action auto? (sugiero manual MVP, automation futura)

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Supabase Cloud down → build falla | Low | High | Build retry policy (3x con backoff); mantener last-known-good cache de articles en R2 para fallback build |
| SERVICE_ROLE key leak | Medium | Critical | Solo en `.env.local` + git-secrets pre-commit hook; jamás en CI |
| Backup falla silently | Medium | Critical | Cron envía discord/email webhook si pg_dump exit != 0; weekly restore test |
| Schema drift local↔cloud | High | Medium | `supabase db diff` pre-deploy; PR check |
| MDX component invalid en body → build break | High | Medium | CLI publish corre validator antes UPDATE; CI check parsea body con MDX compiler |
| Webhook storm (bulk update artículos) | Low | Low | Debounce 30s en edge function |
| Local dev sin Supabase corriendo → confusión | Medium | Low | `pnpm dev` script chequea `supabase status`, sugiere `supabase start` si down |
| Editor en Studio sin MDX syntax highlight | High | Low | Aceptar en Fase 1; resuelve Fase 2 (custom /admin) |
| Asset URL leak (Supabase signed URL expira) | Low | Medium | Public bucket policy → URLs perpetuas; no usar signed URLs para covers públicos |
| `gen_random_uuid` vs slug as PK | Low | Low | UUID PK + slug unique constraint = best of both |

## Architectural Decisions Record (ADR seeds)

- **ADR-201**: Articles en Supabase Postgres (no repo MDX)
- **ADR-202**: SSG mantenido — custom loader fetches build-time
- **ADR-203**: Migration-first schema (no Studio direct)
- **ADR-204**: ANON key build, SERVICE_ROLE solo CLI local
- **ADR-205**: MDX raw text column (no blocks JSON)
- **ADR-206**: Component whitelist enforced en CLI publish
- **ADR-207**: Webhook → CF Deploy Hook (debounced 30s)
- **ADR-208**: Backup nightly `pg_dump` → R2, 30d retention
- **ADR-209**: Supabase Storage para assets (Fase 1), R2 migration deferred
- **ADR-210**: Single-user auth Fase 1, multi-author defer Fase 2

## Next Phase

→ `/sdd-design inject-articles` — finalize ADRs, schema details, loader interface, CLI command UX, webhook flow diagram, migration rollback plan.
