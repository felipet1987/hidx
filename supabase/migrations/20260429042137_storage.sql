-- Storage bucket for article assets (covers, inline images, etc).

insert into storage.buckets (id, name, public)
values ('article-assets', 'article-assets', true)
on conflict (id) do nothing;

-- Public read for any object in bucket.
create policy "public read article-assets"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'article-assets');

-- Authenticated users can write/update/delete in the bucket.
create policy "auth write article-assets"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'article-assets');

create policy "auth update article-assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'article-assets');

create policy "auth delete article-assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'article-assets');
