-- Storage bucket for article assets (covers, inline images, etc).
-- Wrapped in DO block to skip gracefully when storage schema not yet initialized
-- (local supabase start runs user migrations BEFORE storage init in some flows).

do $$
begin
  if not exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'buckets') then
    raise notice 'storage.buckets does not exist yet — skipping storage bucket setup. Re-run after first supabase start completes.';
    return;
  end if;

  insert into storage.buckets (id, name, public)
  values ('article-assets', 'article-assets', true)
  on conflict (id) do nothing;

  -- Public read for any object in bucket.
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'public read article-assets') then
    create policy "public read article-assets"
      on storage.objects for select
      to anon, authenticated
      using (bucket_id = 'article-assets');
  end if;

  -- Authenticated users can write/update/delete in the bucket.
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'auth write article-assets') then
    create policy "auth write article-assets"
      on storage.objects for insert
      to authenticated
      with check (bucket_id = 'article-assets');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'auth update article-assets') then
    create policy "auth update article-assets"
      on storage.objects for update
      to authenticated
      using (bucket_id = 'article-assets');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'auth delete article-assets') then
    create policy "auth delete article-assets"
      on storage.objects for delete
      to authenticated
      using (bucket_id = 'article-assets');
  end if;
end $$;
