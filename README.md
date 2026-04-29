# YachayTree

> **Yachay** (Quechua: saber, aprender) + **Tree** — plataforma STEAM hands-on para chicos LatAm 8-12 años. Experimentos con materiales caseros (<$5 USD), guías para padres, contenido en español rioplatense neutro.

## Misión

Llenar el gap LatAm de Khan Academy en STEAM hands-on: materiales económicos, voz local, multinivel pedagógico (chicos + padres + maestros). NO competimos head-on con Khan; complementamos lo que ellos no cubren.

## Stack

Astro 6 SSG · MDX · Tailwind v4 · Supabase (Postgres + Storage) · Cloudflare Pages.

## Develop

Native (Node 22 + pnpm 10):

```sh
pnpm install
pnpm dev      # http://localhost:4321
pnpm build    # static output dist/
pnpm preview  # serve built output
pnpm lint     # Biome check
pnpm check    # astro check (TS)
pnpm test     # Vitest
```

Docker (no local Node required):

```sh
docker compose up dev                                  # http://localhost:4321
docker compose --profile preview up preview            # http://localhost:4322
docker compose --profile edge up wrangler              # http://localhost:8788 (CF Pages emulator)
docker compose --profile test run --rm test           # one-shot Vitest
```

## CLI

```sh
pnpm new:lesson "Catapulta cartón"   # scaffold lección STEAM
pnpm upload <file> --slug=<slug>     # subir asset a Supabase Storage
pnpm rls:smoke                       # test Supabase RLS policies
pnpm lint:images                     # warn imágenes >200KB
```

## Deploy

Manual via wrangler (preferido MVP):

```sh
CLOUDFLARE_ACCOUNT_ID=05375e57742c47414a45782d98e201d5 \
  pnpm wrangler pages deploy dist --project-name=hidx --branch=main --commit-dirty=true
```

> Nota: CF Pages project sigue llamándose `hidx` por ahora; URL `https://hidx.pages.dev`. Rename a `yachaytree.pages.dev` defer (manual dashboard).

## Licencias

- Código: [MIT](./LICENSE-CODE)
- Contenido (lecciones, ilustraciones, fotos, video): [CC BY-NC 4.0](./LICENSE-CONTENT)

## Planning artifacts

SDD docs en [.planning/](./.planning/).
