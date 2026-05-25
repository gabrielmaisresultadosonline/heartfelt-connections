-- ============================================
-- RODE ISTO NO SUPABASE SQL EDITOR
-- Projeto: nvuwxepoehipkdgwwgwz
-- ============================================

-- Tabela de certificados
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  original_photo_url text,
  enhanced_photo_url text,
  certificate_pdf_url text not null,
  email text,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

alter table public.certificates enable row level security;

-- Qualquer um pode inserir (página pública) e ler o próprio (por id)
create policy "anyone can insert certificate"
  on public.certificates for insert
  to anon, authenticated
  with check (true);

create policy "anyone can read certificate by id"
  on public.certificates for select
  to anon, authenticated
  using (true);

-- Tabela de roles (admin)
do $$ begin
  create type public.app_role as enum ('admin');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users read own role"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

-- Config do template (1 linha só)
create table if not exists public.template_config (
  id int primary key default 1,
  template_url text,
  photo_x int not null default 100,
  photo_y int not null default 100,
  photo_w int not null default 300,
  photo_h int not null default 300,
  name_x int not null default 400,
  name_y int not null default 500,
  name_font_size int not null default 48,
  name_color text not null default '#000000',
  updated_at timestamptz not null default now(),
  constraint singleton check (id = 1)
);

insert into public.template_config (id) values (1) on conflict do nothing;

alter table public.template_config enable row level security;
create policy "anyone read template config" on public.template_config for select to anon, authenticated using (true);
create policy "admins update template config" on public.template_config for update to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- STORAGE BUCKETS (crie pelo painel ou rode abaixo)
-- ============================================
insert into storage.buckets (id, name, public) values
  ('templates', 'templates', true),
  ('photos', 'photos', true),
  ('certificates', 'certificates', true)
on conflict (id) do nothing;

-- Políticas de storage: leitura pública, escrita autenticada/service_role
create policy "public read templates" on storage.objects for select using (bucket_id = 'templates');
create policy "public read photos" on storage.objects for select using (bucket_id = 'photos');
create policy "public read certificates" on storage.objects for select using (bucket_id = 'certificates');

-- ============================================
-- DEPOIS DE RODAR: crie seu usuário admin
-- 1) Vá em Authentication → Users → Add user (email+senha)
-- 2) Copie o user id e rode:
--    insert into public.user_roles (user_id, role) values ('<UUID>', 'admin');
-- ============================================
