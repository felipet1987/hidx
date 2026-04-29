# Docker

Run hidx without installing Node or pnpm locally.

## Requirements

- Docker 24+ with Compose v2
- 2 GB RAM allocated to Docker

## Commands

| Command | What |
|---------|------|
| `docker compose up dev` | Astro dev server with hot reload at <http://localhost:4321> |
| `docker compose --profile preview up preview` | Build + serve production output at <http://localhost:4322> |
| `docker compose --profile edge up wrangler` | Emulate Cloudflare Pages locally at <http://localhost:8788> |
| `docker compose --profile test run --rm test` | Run Vitest suite once |
| `docker compose down -v` | Stop and clear cached `node_modules` + `.astro` volumes |

## How it works

- One image (`Dockerfile`) is reused by every service to avoid rebuilds.
- `node_modules`, `.astro`, and `.wrangler` are kept in named volumes so they survive container restarts and don't pollute your host.
- Source code is bind-mounted as `.:/app` so edits on the host hot-reload inside the container.

## Secrets

Local emulation (wrangler service) reads secrets from `.dev.vars` at the repo root:

```
BEEHIIV_API_KEY=...
BEEHIIV_PUBLICATION_ID=...
```

The file is in `.gitignore` and `.dockerignore` — never commit it.

## Troubleshooting

- **Port already in use**: change the host port in `docker-compose.yml` (`"4321:4321"` → `"4421:4321"`).
- **Permission errors on bind mount (Linux)**: run with `--user $(id -u):$(id -g)` or set `user: "${UID}:${GID}"` in compose.
- **Stale `node_modules` after deps change**: `docker compose down -v` then `docker compose up dev --build`.
