FROM node:22-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# Install deps separately for cache reuse
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 4321 4322 8788

CMD ["pnpm", "dev", "--host", "0.0.0.0"]
