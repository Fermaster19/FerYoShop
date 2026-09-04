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

create table if not exists public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamptz not null default now()
);

alter table public.usuarios enable row level security;

drop policy if exists "Users can read own profile" on public.usuarios;

create policy "Users can read own profile"
  on public.usuarios for select
  to authenticated
  using (auth.uid() = id);

create or replace function public.create_user_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.usuarios (id, username)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_user_profile();

insert into public.usuarios (id, username)
select id, 'yoyo1001'
from auth.users
where email = 'yoyo1001@feryo.local'
on conflict (id) do update set username = excluded.username;

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
