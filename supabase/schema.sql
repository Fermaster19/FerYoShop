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

create index if not exists prendas_created_at_idx on public.prendas (created_at desc);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
