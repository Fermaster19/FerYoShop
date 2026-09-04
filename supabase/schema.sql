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
  created_at bigint not null,
  owner_id uuid references auth.users(id)
);

alter table public.prendas enable row level security;
alter table public.prendas add column if not exists owner_id uuid references auth.users(id);

create index if not exists prendas_created_at_idx on public.prendas (created_at desc);

drop policy if exists "Public can read visible products" on public.prendas;
drop policy if exists "Authenticated users can insert products" on public.prendas;
drop policy if exists "Owners can update products" on public.prendas;
drop policy if exists "Owners can delete products" on public.prendas;

create policy "Public can read visible products"
  on public.prendas for select
  using (estado <> 'Oculta' or auth.uid() = owner_id);

create policy "Authenticated users can insert products"
  on public.prendas for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "Owners can update products"
  on public.prendas for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners can delete products"
  on public.prendas for delete
  to authenticated
  using (auth.uid() = owner_id);
