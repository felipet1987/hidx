# Exploration: Inyectar Artículos

**Project**: `hidx` · **Date**: 2026-04-29 · **Phase**: sdd-explore · **Change**: `inject-articles`

## Current State

- Posts viven en `src/content/posts/*.mdx`
- `src/content.config.ts` carga vía `glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' })`
- Frontmatter validado por Zod (`src/content/schemas.ts`): `title` (≤80), `description` (≤160), `publishedAt`, `tags` (1–6), opcional `cover`/`draft`/`series`/`seriesOrder`/`canonical`/`updatedAt`
- Build SSG: cada `.mdx` → ruta estática `/posts/{slug}` vía `getStaticPaths` en `src/pages/posts/[...slug].astro`
- Solo existe `hello.mdx`. Cero infra de autoría — manual git add + commit + push
- Sin migración previa, sin CMS, sin scripts de scaffold

**Question del usuario es ambigua** — "inyectar artículos" puede significar ≥4 cosas distintas. Cubro las 4 abajo.

## Affected Areas

Depende del approach. Common a todos:
- `src/content/posts/` — destino físico (o virtual con loader custom)
- `src/content.config.ts` — loader (puede cambiar de `glob` a custom)
- `src/content/schemas.ts` — schema Zod (puede extenderse)
- `package.json` — scripts npm (`new:post`, `import:medium`, etc)

Por approach:
- **Scaffold CLI**: `scripts/new-post.ts` nuevo
- **Headless CMS**: `src/content.config.ts` reemplaza loader, `astro.config.mjs` env, dependencias nuevas
- **Git-based CMS** (Decap): `public/admin/` carpeta, OAuth proxy worker, `public/admin/config.yml`
- **Bulk import**: `scripts/import-{medium,notion,hugo}.ts`, mappers de frontmatter
- **AI-assisted**: prompt templates en `docs/prompts/`, opcional `scripts/ai-draft.ts`

## Approaches

| # | Approach | Quién escribe | Almacenamiento | Build-time data | Web UI |
|---|----------|---------------|----------------|-----------------|--------|
| 1 | **Manual MDX** (status quo) | Tú en editor | Repo `src/content/posts/` | Glob loader | No |
| 2 | **CLI scaffold** | Tú en editor + `pnpm new:post` | Repo | Glob loader | No |
| 3 | **AI-assisted scaffold** | Tú + LLM (Claude/GPT) | Repo | Glob loader | No |
| 4 | **Bulk import** (one-shot) | Script convierte fuente externa | Repo | Glob loader | No |
| 5 | **Headless CMS** (Sanity/Contentful/Strapi/Hygraph) | Cualquiera (login web) | API externa | Custom loader fetches API | Sí (CMS) |
| 6 | **Git-based CMS** (Decap/TinaCMS/Sveltia) | Cualquiera con login | Repo (commits MDX) | Glob loader | Sí (admin embebido) |
| 7 | **Notion as backend** | Tú en Notion | Notion DB | Custom loader fetches API | Sí (Notion) |

### Detalle pros/cons

**1. Manual MDX** — actual
- Pros: cero infra, full git history, branch/PR review, offline OK
- Cons: solo dev autor cómodo con MDX/git
- Effort: 0 (ya hecho)

**2. CLI scaffold** (`scripts/new-post.ts`)
- Pros: 1 comando crea skeleton con frontmatter válido, autor empieza desde 80%
- Cons: requiere correr local (no remoto)
- Effort: Low (~1h)

**3. AI-assisted scaffold** (prompt template + opcional CLI con Claude API)
- Pros: outline + draft 60% en minutos, formateo MDX correcto, schema-aware, ideal pillar posts long-form
- Cons: necesita revisión/edit obligatoria, costo API si automatizado
- Effort: Low-Medium (template gratis; CLI ~2h)

**4. Bulk import** (Medium/Notion/Hugo export → MDX)
- Pros: migrá contenido existente sin tipear de nuevo
- Cons: solo útil si tenés contenido fuera; mappers frágiles (assets, links rotos)
- Effort: Medium (~3-6h por fuente)

**5. Headless CMS** (Sanity/Contentful/Strapi)
- Pros: editor web rico, multi-autor, programación de publicación, asset CDN integrado
- Cons: dependencia externa, costo plan pagado a escala, build-time data fetch (ISR no aplicable SSG puro), separa contenido del repo (sin PR review)
- Effort: High (~1-2 días setup + cleanup loader)
- Costo: Sanity free 3 users + 100GB; Contentful free 5 users + 25k records; Strapi self-host

**6. Git-based CMS** (Decap CMS — fork de Netlify CMS — o TinaCMS, o Sveltia)
- Pros: editor web → commits a repo (MDX), preserva git history + PR review, asset upload a `public/`
- Cons: requiere OAuth provider (GitHub OAuth app + proxy worker), Decap unmaintained-ish (Sveltia es fork modern), TinaCMS necesita backend pago para edición remota
- Effort: Medium (Sveltia ~3h; TinaCMS Cloud ~1h pero pago)

**7. Notion as backend** (`@notionhq/client` loader)
- Pros: redacción cómoda en Notion (mejor UX que MDX), assets gestionados, sync automático
- Cons: Notion blocks → MDX conversion lossy (callouts, columnas, embeds), build-time fetch latencia, lock-in Notion
- Effort: Medium-High (~6h con converter); libs: `notion-client`, `notion-to-md`

## Recommendation

**Stack 2 + 3** (CLI scaffold + AI-assisted prompt template) **AHORA**. **Stack 6 (Sveltia)** opcional si querés web UI más adelante.

Razones:
1. **Solo autor + dev audience** — git-flow es el "CMS" más rápido para vos, sin overhead
2. **Pillar posts long-form** se benefician de AI scaffold (outline → expandir secciones)
3. **MDX components custom** (Callout, Steps, CodeDemo, AffiliateLink, TipJar) NO renderizan bien en CMS visual — quedás encadenado a markdown plano si elegís 5
4. **PR review preserved** — git-based mantiene workflow profesional
5. **Cero costo + cero lock-in**
6. **Sveltia (#6)** es upgrade path opcional cuando quieras invitar editores externos sin enseñarles git

### Plan concreto stack 2+3

1. `scripts/new-post.ts` — `pnpm new:post "Mi Título"` genera `src/content/posts/mi-titulo.mdx` con frontmatter válido (Zod-checked) y skeleton (intro + 3 H2 + cierre)
2. `docs/prompts/pillar-post-outline.md` — prompt template para Claude/GPT que produce outline MDX siguiendo patrón hidx (front-matter + structure + recommend Callout/Steps usage)
3. `docs/prompts/pillar-post-expand.md` — prompt para expandir cada H2 con código real + analogías
4. `scripts/validate-frontmatter.ts` — pre-commit hook valida todos los `.mdx` contra schema (catch errores antes de push)
5. Opcional: `scripts/import-medium.ts` y `scripts/import-notion.ts` solo si tenés contenido legacy
6. Documentar en `docs/authoring.md`

## Risks

- **Schema drift**: si actualizás `schemas.ts` sin migrar posts existentes → build rompe. Mitigar: pre-commit hook valida todo el directorio
- **AI hallucinations en código**: drafts AI pueden inventar APIs. Mitigar: prompt incluye "no inventes APIs, deja TODO si dudás"
- **Slug collisions**: dos posts con mismo título → mismo slug → conflict. Mitigar: scaffold detecta + sufija `-2`
- **Asset management**: sin CDN, imágenes en `public/posts/` crece. Mitigar: regla R2 bucket cuando supere 50MB
- **Stack 5/7 vendor lock-in**: si elegís CMS, migrar fuera = laburo. Mitigar: usar markdown export estándar como fallback
- **Sveltia OAuth**: requiere GitHub OAuth app + proxy en CF Worker. Mitigar: solo si genuinamente necesitás web UI

## Ready for Proposal

**Yes con bifurcación**:

1. **Si confirmás Stack 2+3 (recomendado)** → ready propose:
   - `pnpm new:post` CLI
   - 2 prompt templates AI
   - pre-commit validator
   - `docs/authoring.md`

2. **Si querés Stack 6 (Sveltia web UI)** → ready propose pero +1 día para OAuth proxy

3. **Si tenés contenido a migrar** (Medium/Notion/Hugo/blog viejo) → confirmar fuente y agrego Stack 4 al scope

**Decime antes de `/sdd-propose`**:
1. Stack: 2+3 (CLI+AI), o 2+3+6 (+ web UI), o algo más?
2. ¿Hay contenido legacy a importar? (¿Medium? ¿Notion? ¿Hugo? ¿Otro blog?)
3. ¿AI scaffold solo prompt templates (gratis), o también CLI con Claude API ($)?

---

## Addendum: Stack 8 — Supabase como backend

**Decisión usuario (2026-04-29)**: guardar artículos en Supabase. Supabase local stack ya corriendo (`supabase-db`, `supabase-rest`, `supabase-auth`, `supabase-storage`, `supabase-studio`).

### Cómo encaja con SSG

hidx es **SSG-only MVP** per proposal original (`output: 'static'`). Hybrid/SSR solo en Capa 4 paywall. Tres variantes Supabase respetan o quiebran esto:

| Variante | Render | Latency | New post deploy | Build-time |
|----------|--------|---------|-----------------|------------|
| **8a** SSG + custom loader (build-time fetch) | Static HTML | 0ms (CDN) | Webhook trigger CF Pages rebuild (~30s-2min) | Pulls all rows |
| **8b** Hybrid: SSG archive + SSR new | Mixed | 0ms archived / ~50-200ms new | Instantaneous | Solo build inicial |
| **8c** Full SSR | All dynamic | ~50-200ms | Instantaneous | Cero |

**8a respeta proposal SSG original. 8b/8c rompen.**

### Schema Supabase propuesto

```sql
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9-]+$'),
  title text not null check (char_length(title) between 1 and 80),
  description text not null check (char_length(description) between 1 and 160),
  body_mdx text not null,                  -- raw MDX content
  cover text,
  tags text[] not null check (array_length(tags, 1) between 1 and 6),
  series text,
  series_order int,
  canonical text,
  draft boolean not null default true,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  author_id uuid references auth.users(id)
);

create index articles_slug_idx on public.articles(slug);
create index articles_published_idx on public.articles(published_at desc) where draft = false;

-- RLS
alter table public.articles enable row level security;
create policy "public read published" on public.articles
  for select using (draft = false and published_at <= now());
create policy "author edit own" on public.articles
  for all using (auth.uid() = author_id);

-- Auto-update updated_at trigger
create function public.tg_articles_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger articles_updated_at before update on public.articles
  for each row execute procedure public.tg_articles_updated_at();
```

### Authoring UI options

| Opción | Pros | Cons |
|--------|------|------|
| **Supabase Studio direct** | Cero código UI, MDX edit en text area | UX rígida, sin preview MDX |
| **Custom `/admin` Astro page** + Supabase Auth | UX a tu gusto, MDX preview live, drag-drop assets | ~1-2 días dev |
| **Sveltia/Decap apuntando a Supabase via REST adapter** | UI rica probada | Sveltia espera repo git no DB → requiere fork/adapter custom (no vale la pena) |
| **CLI `pnpm new:post`** (escribe directo a Supabase via supabase-js) | Mismo flow que Stack 2 pero target DB | Requiere supabase-js + service role key local |

### Asset management

- **Supabase Storage** bucket `article-assets`: integrado, RLS-aware, CDN propio
- **CF R2** + Supabase rows refieren URLs: mejor performance edge, separado de Supabase
- **Inline base64** para imágenes pequeñas: cero infra, hincha DB

Recomiendo **Supabase Storage** para empezar (ya está corriendo); migrar a R2 si crece.

### Custom Astro loader (variant 8a)

```ts
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { createClient } from '@supabase/supabase-js';
import { postSchema } from './content/schemas';

const sb = createClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_SERVICE_ROLE);

const posts = defineCollection({
  loader: async () => {
    const { data, error } = await sb
      .from('articles')
      .select('*')
      .eq('draft', false)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false });
    if (error) throw error;
    return data.map((row) => ({
      id: row.slug,
      slug: row.slug,
      body: row.body_mdx,                  // raw MDX text
      data: { /* map to schema fields */ },
    }));
  },
  schema: postSchema,
});
```

**MDX rendering desde DB**: Astro 6 content layer permite `body` raw. Para procesar MDX components dynamic en build, hay que usar `compile()` de `@mdx-js/mdx` en el loader o Astro custom integration. Más fricción que `glob` puro.

### Webhook rebuild (variant 8a)

- Supabase trigger `after insert/update on articles` → invoca Edge Function → llama Cloudflare Pages Deploy Hook URL
- CF Pages rebuilds desde `main` branch (build no necesita repo change — vuelve a fetchear Supabase)
- ~30s-2min latencia desde publish → live

### Variant 8a: Pros / Cons recap

**Pros**:
- DB centralizada, multi-autor con auth nativo
- RLS nativo
- Search SQL nativo (futuro: full-text con tsvector)
- Asset upload UI gratis si elegís Supabase Storage
- Mantiene SSG (Lighthouse 100, 0ms latency)

**Cons**:
- Repo deja de ser source of truth para contenido — pierde git history + PR review
- Build-time fetch hace deploy más lento (cada rebuild pega Supabase prod)
- Local dev requiere Supabase local corriendo siempre
- MDX text en Postgres column = harder DX vs editor file (sin sintaxis highlight nativa en Studio)
- Component imports en MDX rompen si dependencias no están en build context — solo MDX components que existen en repo se pueden usar
- Backup strategy: pg_dump regular + asset bucket export
- Vendor lock-in moderado (Postgres = portable, pero Auth/Storage/Edge Fns son Supabase-specific)

### Recommendation revisada

**Stack 8a (SSG + custom loader + webhook rebuild)** + **CLI scaffold (#2)** que escribe directo a Supabase + opcional **AI prompt templates (#3)**.

Razones:
1. Respeta SSG original (proposal ADR-003 sigue válido)
2. DB centralizada como pediste
3. CLI scaffold reemplaza file-system-touching por Supabase insert — mismo UX
4. Webhook rebuild auto-publica
5. Multi-autor + auth nativo si crece
6. **Custom `/admin` page Astro + Supabase Auth** como UI pulida (FASE 2 — primero scaffold CLI funciona)

**NO recomiendo 8b/8c** — rompen ADR-003 SSG-only, agregan latency, infra worker, costo runtime.

### Open questions Supabase

1. **Supabase target**: ¿usar Supabase local (Docker actual) como dev + Supabase Cloud free como prod, o solo local self-host (vps)?
2. **Auth**: ¿solo vos como autor inicial, o multi-author desde día 1?
3. **Authoring UI fase 1**: Supabase Studio direct, CLI scaffold, o ambos?
4. **Authoring UI fase 2**: custom `/admin` Astro page con Supabase Auth — ¿lo hacemos en este change o defer?
5. **Webhook**: ¿setup CF Pages Deploy Hook ahora, o publicación manual via `gh workflow run` por ahora?
6. **Asset storage**: Supabase Storage (lo más simple), o R2 desde día 1?
7. **Migración hello.mdx**: ¿script one-shot que insert el post existente en Supabase y borra del repo, o dejar repo posts paralelo (loader merge)?
8. **MDX components**: ¿restringimos a components ya en repo, o permitimos definir dynamics desde DB? (Sugiero restringir — security + simpler)

### Risks Supabase

- **Build flakiness**: si Supabase Cloud cae mid-build → CF Pages deploy falla. Mitigar: build cache + retry policy + status page check
- **Service role key leakage**: build runner needs SERVICE_ROLE key (full DB access). Mitigar: GitHub secret + scope-limited Postgres role para build (read-only public.articles)
- **Cold start Edge Function**: webhook puede tener cold start ~500ms. Mitigar: keep-warm cron
- **Local dev divergence**: schema en local Supabase puede driftear de prod. Mitigar: `supabase db diff` + migrations en repo
- **Backup**: si DB se corrompe sin backup → contenido perdido. Mitigar: cron `pg_dump` a R2 nightly
- **Editor UX en Studio**: MDX en text area sin syntax highlight = dolor. Mitigar: priorizar `/admin` page custom o CLI scaffold
- **MDX compilation**: Astro 6 expects `.mdx` files at build for full component support. DB-loaded MDX requires manual compile. Mitigar: usar `@astrojs/mdx`'s programmatic API o write file tmp at build then load

### Ready for Proposal (Stack 8a)

**Yes** — pero respondé Open Questions arriba (al menos 1, 2, 3, 6) antes de `/sdd-propose`. Recomiendo:
- (1) Local + Cloud free
- (2) Solo vos día 1
- (3) CLI scaffold + Studio fallback
- (6) Supabase Storage

Si confirmás defaults → propose ya con scope: schema + loader + CLI + webhook stub + docs migration.
