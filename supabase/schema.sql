create extension if not exists pgcrypto;

create table if not exists public.prendas (
  id text primary key,
  nombre text not null,
  precio numeric not null check (precio >= 0),
  categoria text not null,
  talle text not null,
  condicion text not null default 'Nuevo',
  descripcion text not null default '',
  imagen text not null,
  estado text not null default 'Disponible' check (estado in ('Disponible', 'Reservada', 'Vendida', 'Oculta')),
  created_at bigint not null
);

alter table public.prendas enable row level security;

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password text not null,
  created_at timestamptz not null default now()
);

alter table public.usuarios enable row level security;
alter table public.usuarios add column if not exists password text;
alter table public.usuarios drop constraint if exists usuarios_id_fkey;

drop policy if exists "Users can read own profile" on public.usuarios;
drop policy if exists "Public can check credentials" on public.usuarios;

create policy "Public can check credentials"
  on public.usuarios for select
  using (true);

insert into public.usuarios (id, username, password)
values (gen_random_uuid(), 'yoyo1001', 'Yohan100106')
on conflict (username) do update set password = excluded.password;

create index if not exists prendas_created_at_idx on public.prendas (created_at desc);

drop policy if exists "Public can read visible products" on public.prendas;
drop policy if exists "Authenticated users can insert products" on public.prendas;
drop policy if exists "Owners can update products" on public.prendas;
drop policy if exists "Owners can delete products" on public.prendas;
drop policy if exists "Public can manage products" on public.prendas;

create policy "Public can read visible products"
  on public.prendas for select
  using (estado <> 'Oculta');

create policy "Public can manage products"
  on public.prendas for all
  using (true)
  with check (true);
