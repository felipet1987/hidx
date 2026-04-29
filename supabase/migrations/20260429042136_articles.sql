-- Articles table for hidx content backend
-- Source of truth for posts; loaded by Astro custom loader at build time.

create extension if not exists "pgcrypto";

create table public.articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null
    check (slug ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  title         text not null
    check (char_length(title) between 1 and 80),
  description   text not null
    check (char_length(description) between 1 and 160),
  body_mdx      text not null,
  cover         text,
  tags          text[] not null
    check (array_length(tags, 1) between 1 and 6),
  series        text,
  series_order  int check (series_order is null or series_order >= 0),
  canonical     text check (canonical is null or canonical ~ '^https?://'),
  draft         boolean not null default true,
  published_at  timestamptz,
  updated_at    timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  author_id     uuid references auth.users(id) on delete set null
);

create index articles_published_idx
  on public.articles (published_at desc)
  where draft = false;

create index articles_tags_idx
  on public.articles using gin (tags);

-- Auto-update updated_at on every UPDATE.
create or replace function public.tg_articles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

create trigger articles_updated_at
  before update on public.articles
  for each row execute procedure public.tg_articles_updated_at();

-- Row Level Security
alter table public.articles enable row level security;

-- Public read: only published, non-draft, with published_at in past
create policy "public read published"
  on public.articles for select
  to anon, authenticated
  using (draft = false and published_at is not null and published_at <= now());

-- Author full access to their own rows (and rows with no author)
create policy "author full access"
  on public.articles for all
  to authenticated
  using (auth.uid() = author_id or author_id is null)
  with check (auth.uid() = author_id or author_id is null);

-- Service role bypasses RLS (no policy needed; built-in).
