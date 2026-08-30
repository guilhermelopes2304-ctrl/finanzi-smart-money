alter table public.profiles add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "Users can view own profile avatars" on storage.objects;
create policy "Users can view own profile avatars"
on storage.objects for select
to authenticated
using (bucket_id = 'profile-avatars' and owner_id = auth.uid());

drop policy if exists "Users can upload own profile avatars" on storage.objects;
create policy "Users can upload own profile avatars"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'profile-avatars'
  and owner_id = auth.uid()
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update own profile avatars" on storage.objects;
create policy "Users can update own profile avatars"
on storage.objects for update
to authenticated
using (bucket_id = 'profile-avatars' and owner_id = auth.uid())
with check (
  bucket_id = 'profile-avatars'
  and owner_id = auth.uid()
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete own profile avatars" on storage.objects;
create policy "Users can delete own profile avatars"
on storage.objects for delete
to authenticated
using (bucket_id = 'profile-avatars' and owner_id = auth.uid());
