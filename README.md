# hidx — How I Do X

Long-form, opinionated walkthroughs of how I solve real problems with code, infrastructure, and tools.

## Stack

Astro + MDX + Tailwind v4 + Cloudflare Pages.

## Develop

```sh
pnpm install
pnpm dev      # http://localhost:4321
pnpm build    # static + worker output to dist/
pnpm preview  # serve built output
pnpm lint     # Biome check
pnpm check    # astro check (TS)
pnpm test     # Vitest
```

## Deploy

CI/CD via GitHub Actions deploys `main` to Cloudflare Pages on push.

Required GitHub secrets:
- `CLOUDFLARE_API_TOKEN` — Pages:Edit + Workers:Edit scope
- `CLOUDFLARE_ACCOUNT_ID`

## Licenses

- Code: [MIT](./LICENSE-CODE)
- Content (articles, media): [CC BY-NC 4.0](./LICENSE-CONTENT)

## Planning artifacts

SDD docs in [.planning/](./.planning/).
