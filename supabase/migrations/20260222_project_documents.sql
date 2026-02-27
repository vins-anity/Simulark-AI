-- Project document ingestion for PDF context uploads.
-- Stores extracted text for use in architecture generation/chat prompts.

create table if not exists public.project_documents (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.users(user_id) on delete cascade not null,
  file_name text not null,
  mime_type text not null,
  size_bytes integer not null check (size_bytes > 0),
  storage_path text not null,
  extracted_text text default ''::text,
  extraction_status text not null default 'completed' check (
    extraction_status in ('pending', 'completed', 'failed')
  ),
  extraction_error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_project_documents_project_created
on public.project_documents(project_id, created_at desc);

create index if not exists idx_project_documents_user_created
on public.project_documents(user_id, created_at desc);

alter table public.project_documents enable row level security;

drop policy if exists "Users can view own project documents" on public.project_documents;
create policy "Users can view own project documents" on public.project_documents
  for select using (
    auth.uid() = user_id
    and exists (
      select 1 from public.projects p
      where p.id = project_documents.project_id
      and p.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own project documents" on public.project_documents;
create policy "Users can insert own project documents" on public.project_documents
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.projects p
      where p.id = project_documents.project_id
      and p.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete own project documents" on public.project_documents;
create policy "Users can delete own project documents" on public.project_documents
  for delete using (auth.uid() = user_id);

drop trigger if exists handle_project_documents_updated_at on public.project_documents;
create trigger handle_project_documents_updated_at
  before update on public.project_documents
  for each row execute procedure public.handle_updated_at();

-- Private bucket for uploaded PDFs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-documents',
  'project-documents',
  false,
  10485760,
  array['application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Project docs upload own folder" on storage.objects;
create policy "Project docs upload own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'project-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Project docs read own folder" on storage.objects;
create policy "Project docs read own folder" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'project-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Project docs delete own folder" on storage.objects;
create policy "Project docs delete own folder" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'project-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
