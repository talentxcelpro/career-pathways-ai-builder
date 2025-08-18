-- Create public 'reels' storage bucket if not exists
insert into storage.buckets (id, name, public)
values ('reels','reels', true)
on conflict (id) do nothing;

-- Policies for reels bucket
-- Public can read files in reels
create policy if not exists "Public read access for reels"
  on storage.objects for select
  using ( bucket_id = 'reels' );

-- Authenticated users can upload to their own folder in reels
create policy if not exists "Users can upload to their reels folder"
  on storage.objects for insert
  with check (
    bucket_id = 'reels' and
    auth.role() = 'authenticated' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update files in their own folder
create policy if not exists "Users can update their reels files"
  on storage.objects for update
  using (
    bucket_id = 'reels' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete files in their own folder
create policy if not exists "Users can delete their reels files"
  on storage.objects for delete
  using (
    bucket_id = 'reels' and
    auth.uid()::text = (storage.foldername(name))[1]
  );