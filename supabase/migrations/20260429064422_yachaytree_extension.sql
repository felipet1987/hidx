-- YachayTree extension to articles table
-- Adds STEAM lesson metadata: age range, difficulty, materials, safety, parent tip, etc.
-- All columns nullable with sensible defaults so existing rows remain valid.

alter table public.articles
  add column if not exists age_min          int  default 8   check (age_min  is null or (age_min  between 0 and 99)),
  add column if not exists age_max          int  default 12  check (age_max  is null or (age_max  between 0 and 99)),
  add column if not exists difficulty       int  default 2   check (difficulty is null or (difficulty between 1 and 5)),
  add column if not exists duration_minutes int  default 30  check (duration_minutes is null or (duration_minutes between 1 and 600)),
  add column if not exists steam_categories text[] default array[]::text[]
    check (steam_categories is null or (
      array_length(steam_categories, 1) is null or
      (array_length(steam_categories, 1) between 1 and 5
        and steam_categories <@ array['S','T','E','A','M']::text[])
    )),
  add column if not exists materials        jsonb default '[]'::jsonb,
  add column if not exists safety_notes     jsonb default '[]'::jsonb,
  add column if not exists parent_tip       text,
  add column if not exists video_url        text,
  add column if not exists printable_pdf    text;

comment on column public.articles.age_min          is 'Minimum recommended age (default 8 for kids cohort).';
comment on column public.articles.age_max          is 'Maximum recommended age (default 12).';
comment on column public.articles.difficulty       is '1-5 stars; 2 default for kids 8-12.';
comment on column public.articles.duration_minutes is 'Estimated activity time in minutes (default 30).';
comment on column public.articles.steam_categories is 'Subset of {S,T,E,A,M}; multi-select per lesson.';
comment on column public.articles.materials        is 'JSON array [{name, qty, optional?, sourceUrl?}].';
comment on column public.articles.safety_notes     is 'JSON array [{type, text}]. Types: cortante|calor|quimico|electrico|supervision.';
comment on column public.articles.parent_tip       is 'Pedagogical guidance for parent/teacher (2-3 paragraphs).';
comment on column public.articles.video_url        is 'YouTube ID (no full URL) for process screencast.';
comment on column public.articles.printable_pdf    is 'R2 storage URL of printable PDF version.';
