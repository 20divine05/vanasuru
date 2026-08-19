-- ============================================================================
-- VANASURU NATURE RETREATS — SUPABASE MASTER DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- 1. Create public.users table (Admin & Guest User Accounts)
create table if not exists public.users (
  id text primary key,
  email text unique not null,
  password text not null,
  name text not null,
  role text not null check (role in ('admin', 'client')),
  created_at timestamptz not null default now()
);

-- 2. Create public.locations table (Resort Properties)
create table if not exists public.locations (
  id text primary key,
  key text unique not null,
  name text not null,
  address text not null,
  phone text not null,
  email text not null,
  tagline text,
  map_embed_url text,
  photos jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- 3. Create public.rooms table (Physical Guest Rooms & Cottages)
create table if not exists public.rooms (
  id text primary key,
  name text not null,
  property text not null references public.locations(key) on delete cascade,
  room_type_slug text not null,
  price_per_night numeric not null,
  advance_amount numeric not null default 1000,
  photos jsonb default '[]'::jsonb,
  max_guests integer default 4,
  max_adults integer default 2,
  max_kids integer default 1,
  bed_type text default 'King Bed',
  created_at timestamptz not null default now()
);

-- 4. Create public.bookings table (Room Stay Reservations)
create table if not exists public.bookings (
  id text primary key,
  user_email text not null,
  user_name text not null,
  property text not null,
  room_type_slug text not null,
  room_id text not null,
  check_in text not null,
  check_out text not null,
  adults integer not null default 1,
  children integer not null default 0,
  rooms_count integer not null default 1,
  price_per_night numeric,
  total_nights integer,
  guest_details jsonb not null,
  payment jsonb,
  payments_history jsonb default '[]'::jsonb,
  extra_charges jsonb default '[]'::jsonb,
  custom_grand_total numeric,
  status text not null check (status in ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
  created_at timestamptz not null default now(),
  checked_in_at text,
  checked_out_at text,
  email_notified boolean default false
);

-- 5. Create public.events table (Resort Celebrations & Function Halls)
create table if not exists public.events (
  id text primary key,
  title text not null,
  property text not null,
  venue text not null,
  description text not null,
  capacity text not null default '100',
  price numeric not null default 0,
  date text not null default 'Available Daily',
  tag text not null default 'Wedding',
  image_url text,
  photos jsonb default '[]'::jsonb,
  is_highlighted boolean not null default false,
  created_at timestamptz not null default now()
);

-- 6. Create public.event_bookings table (Client Event & Banquet Reservations)
create table if not exists public.event_bookings (
  id text primary key,
  event_id text,
  event_title text not null,
  property text not null,
  venue text not null,
  user_email text not null,
  user_name text not null,
  event_date text not null,
  guests_count integer not null default 1,
  guest_details jsonb not null,
  total_amount numeric,
  advance_amount numeric,
  payments_history jsonb default '[]'::jsonb,
  extra_charges jsonb default '[]'::jsonb,
  custom_grand_total numeric,
  status text not null check (status in ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
  created_at timestamptz not null default now(),
  checked_in_at text,
  checked_out_at text
);

-- 7. Create public.gallery_items table (Resort Photo Gallery Showcase)
create table if not exists public.gallery_items (
  id text primary key,
  src text not null,
  tag text not null default 'General',
  category text not null default 'Rooms',
  title text,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS) on all tables
alter table public.users enable row level security;
alter table public.locations enable row level security;
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;
alter table public.events enable row level security;
alter table public.event_bookings enable row level security;
alter table public.gallery_items enable row level security;

-- Setup full read/write access policies for application users
drop policy if exists "Allow users access" on public.users;
create policy "Allow users access" on public.users for all using (true) with check (true);

drop policy if exists "Allow locations access" on public.locations;
create policy "Allow locations access" on public.locations for all using (true) with check (true);

drop policy if exists "Allow rooms access" on public.rooms;
create policy "Allow rooms access" on public.rooms for all using (true) with check (true);

drop policy if exists "Allow bookings access" on public.bookings;
create policy "Allow bookings access" on public.bookings for all using (true) with check (true);

drop policy if exists "Allow events access" on public.events;
create policy "Allow events access" on public.events for all using (true) with check (true);

drop policy if exists "Allow event_bookings access" on public.event_bookings;
create policy "Allow event_bookings access" on public.event_bookings for all using (true) with check (true);

drop policy if exists "Allow gallery_items access" on public.gallery_items;
create policy "Allow gallery_items access" on public.gallery_items for all using (true) with check (true);

-- Performance Indexes
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_bookings_user_email on public.bookings(user_email);
create index if not exists idx_bookings_property on public.bookings(property);
create index if not exists idx_rooms_property on public.rooms(property);
create index if not exists idx_events_property on public.events(property);
create index if not exists idx_event_bookings_user_email on public.event_bookings(user_email);

-- Seed Master Admin Account (No fake data)
insert into public.users (id, email, password, name, role)
values 
  ('u-admin', 'vanasurumys@gmail.com', 'vanasuru', 'VANASURU Admin', 'admin')
on conflict (id) do update set email = excluded.email, password = excluded.password, name = excluded.name, role = excluded.role;

-- Seed Official Resort Property Locations (No fake data)
insert into public.locations (id, key, name, address, phone, email, tagline, map_embed_url)
values
  ('loc-mysore', 'mysore', 'VANASURU Silverleaf', 'Vanasuru, 227/9, CFTRI layout, Bogadi 2nd Stage, Bogadi, Mysuru, Karnataka 570022', '+91 78991 79979', 'vanasurumys@gmail.com', 'A serene nature retreat wrapped in gardens and gentle mornings.', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2753.269961454444!2d76.60362042044873!3d12.298387815407652!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baf7b7ec30ea817%3A0xf60112f9c3cfbb4c!2sVanasuru!5e0!3m2!1sen!2sin!4v1785132467896!5m2!1sen!2sin'),
  ('loc-mahadevapura', 'mahadevapura', 'VANASURU Village', 'Mahadevapura, Mysuru, Karnataka 571438 (12.3993043, 76.7884710)', '+91 78991 79979', 'vanasurumys@gmail.com', 'Modern luxury for business, celebrations, and the city''s finer moments.', 'https://www.google.com/maps/embed?pb=!1m24!1m8!1m3!1d706.6303616637013!2d76.78922865630193!3d12.399374526194144!3m2!1i1024!2i768!4f13.1!4m13!3e2!4m5!1s0x3baf750acd75b241%3A0x9bd965e0df844a91!2sSudha%20Marigowda%20Convention%20Hall%2C%20Vadiyandahalli%2C%20Karnataka%20571415!3m2!1d12.3992534!2d76.7879521!4m5!1s0x3baf750acd75b241%3A0x9bd965e0df844a91!2sSudha%20Marigowda%20Convention%20Hall%2C%20Vadiyandahalli%2C%20Karnataka%20571415!3m2!1d12.3992534!2d76.7879521!5e1!3m2!1sen!2sin!4v1786554867831!5m2!1sen!2sin')
on conflict (key) do nothing;
