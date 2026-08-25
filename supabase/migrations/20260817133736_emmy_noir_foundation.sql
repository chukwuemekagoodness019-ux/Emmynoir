/*
# EMMY NOIR — Foundation schema

## Purpose
Establishes the relational PostgreSQL foundation for the EMMY NOIR fashion
house. This is Stage 1: a clean, scalable schema that later stages build on
without rebuilding.

## New Tables
- `divisions` — top-level brand divisions (EMMY WEARS, EMMY JEWELRIES, EMMY LUXE).
- `categories` — product categories (T-shirts, Necklaces, etc.), each scoped to a division.
- `collections` — curated edits (Noir Essentials, After Dark, EMMY LUXE, etc.).
- `products` — the core catalogue entity.
- `product_images` — image metadata (URL, ordering, primary flag) per product.
- `product_variants` — size/colour combinations with independent stock.
- `orders` — order header with unique reference and lifecycle status.
- `order_items` — immutable per-line snapshots of an order.
- `discounts` — optional product-level discounts with optional date window.
- `site_settings` — single-row table for admin-managed business settings.

## Design notes
1. The catalogue is NOT hard-coded to two divisions. Divisions, categories,
   and collections are all rows in their own tables so admins can add new
   ones from the Studio without code changes.
2. Product images store URL/metadata only — large binaries live in external
   cloud storage. `product_images` has `sort_order` and `is_primary` so the
   admin can reorder and pick a main image.
3. `product_variants` holds per-variant stock so size/colour combinations
   can have independent quantities. A product also has a fallback `stock`
   for simple items.
4. Orders keep an immutable snapshot of each line in `order_items` (name,
   price, size, colour) so historical orders remain accurate even if the
   product later changes.
5. `site_settings` is a single-row table (enforced by a unique constraint on
   `id`) holding WhatsApp, social, email, phone, delivery message, and
   brand info — all admin-editable, never hard-coded in the app.
6. `discounts` supports an optional start/end window for future sale
   scheduling; the current release only needs the percentage + active flag.

## Security
- RLS enabled on every table.
- Customer-facing tables (divisions, categories, collections, products,
  product_images, product_variants, site_settings) are readable by
  `anon, authenticated` because the storefront has no sign-in screen.
  Writes to those tables are restricted to `authenticated` (admin) only.
- Orders and order_items: reads/writes restricted to `authenticated`
  (admin) only for Stage 1. A later stage may relax reads for customers
  with accounts.
- discounts: reads by anon/authenticated; writes by authenticated only.

## Important notes
1. No seed data is inserted — the app uses in-memory demo products in
   Stage 1. The schema is ready for real data in the next stage.
2. All tables use UUID primary keys and timestamptz timestamps.
3. Indexes added for common lookup columns (slug, division_id, etc.).
4. Policies use `auth.uid()` for admin writes; the admin auth flow is
   implemented in the next stage. Until then, writes from the anon key
   are intentionally blocked on admin tables.
*/

-- Extensions
create extension if not exists "pgcrypto";

-- Divisions ---------------------------------------------------------------
create table if not exists divisions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  tagline text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table divisions enable row level security;

drop policy if exists "read_divisions" on divisions;
create policy "read_divisions" on divisions for select
  to anon, authenticated using (true);

drop policy if exists "write_divisions_admin" on divisions;
create policy "write_divisions_admin" on divisions for all
  to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

-- Categories --------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  division_id uuid references divisions(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table categories enable row level security;

drop policy if exists "read_categories" on categories;
create policy "read_categories" on categories for select
  to anon, authenticated using (true);

drop policy if exists "write_categories_admin" on categories;
create policy "write_categories_admin" on categories for all
  to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

create index if not exists idx_categories_division_id on categories(division_id);

-- Collections ------------------------------------------------------------
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  tone text,
  status text not null default 'active' check (status in ('active','coming-soon','archived')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table collections enable row level security;

drop policy if exists "read_collections" on collections;
create policy "read_collections" on collections for select
  to anon, authenticated using (true);

drop policy if exists "write_collections_admin" on collections;
create policy "write_collections_admin" on collections for all
  to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

create index if not exists idx_collections_status on collections(status);

-- Products ---------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  division_id uuid references divisions(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  collection_id uuid references collections(id) on delete set null,
  price numeric(12,2) not null default 0,
  sale_price numeric(12,2),
  sizes text[] not null default '{}',
  colours text[] not null default '{}',
  stock int not null default 0,
  care_info text,
  size_guide text,
  featured boolean not null default false,
  availability text not null default 'available' check (availability in ('available','coming-soon','sold-out')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table products enable row level security;

drop policy if exists "read_products" on products;
create policy "read_products" on products for select
  to anon, authenticated using (true);

drop policy if exists "write_products_admin" on products;
create policy "write_products_admin" on products for all
  to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_division_id on products(division_id);
create index if not exists idx_products_category_id on products(category_id);
create index if not exists idx_products_collection_id on products(collection_id);
create index if not exists idx_products_featured on products(featured);

-- Product images ---------------------------------------------------------
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt text,
  sort_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
alter table product_images enable row level security;

drop policy if exists "read_product_images" on product_images;
create policy "read_product_images" on product_images for select
  to anon, authenticated using (true);

drop policy if exists "write_product_images_admin" on product_images;
create policy "write_product_images_admin" on product_images for all
  to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

create index if not exists idx_product_images_product_id on product_images(product_id);

-- Product variants --------------------------------------------------------
create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text,
  colour text,
  stock int not null default 0,
  created_at timestamptz not null default now()
);
alter table product_variants enable row level security;

drop policy if exists "read_product_variants" on product_variants;
create policy "read_product_variants" on product_variants for select
  to anon, authenticated using (true);

drop policy if exists "write_product_variants_admin" on product_variants;
create policy "write_product_variants_admin" on product_variants for all
  to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

create index if not exists idx_product_variants_product_id on product_variants(product_id);

-- Orders ------------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text,
  customer_phone text,
  customer_email text,
  status text not null default 'new' check (status in ('new','contacted','payment-pending','paid','processing','shipped','delivered','cancelled')),
  subtotal numeric(12,2) not null default 0,
  delivery_fee numeric(12,2),
  total numeric(12,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table orders enable row level security;

-- Orders are admin-only in Stage 1 (no customer accounts yet).
drop policy if exists "read_orders_admin" on orders;
create policy "read_orders_admin" on orders for select
  to authenticated using (auth.uid() is not null);

drop policy if exists "write_orders_admin" on orders;
create policy "write_orders_admin" on orders for all
  to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

create index if not exists idx_orders_reference on orders(reference);
create index if not exists idx_orders_status on orders(status);

-- Order items -------------------------------------------------------------
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name text not null,
  size text,
  colour text,
  quantity int not null default 1,
  unit_price numeric(12,2) not null default 0,
  line_total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);
alter table order_items enable row level security;

drop policy if exists "read_order_items_admin" on order_items;
create policy "read_order_items_admin" on order_items for select
  to authenticated using (auth.uid() is not null);

drop policy if exists "write_order_items_admin" on order_items;
create policy "write_order_items_admin" on order_items for all
  to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

create index if not exists idx_order_items_order_id on order_items(order_id);

-- Discounts --------------------------------------------------------------
create table if not exists discounts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  label text,
  percentage numeric(5,2) not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table discounts enable row level security;

drop policy if exists "read_discounts" on discounts;
create policy "read_discounts" on discounts for select
  to anon, authenticated using (true);

drop policy if exists "write_discounts_admin" on discounts;
create policy "write_discounts_admin" on discounts for all
  to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

create index if not exists idx_discounts_product_id on discounts(product_id);

-- Site settings (single row) ----------------------------------------------
create table if not exists site_settings (
  id int primary key default 1,
  brand_name text not null default 'EMMY NOIR',
  tagline text,
  whatsapp_number text,
  whatsapp_url text,
  instagram_url text,
  tiktok_url text,
  email text,
  phone text,
  delivery_message text,
  about_short text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_settings_single_row check (id = 1)
);
alter table site_settings enable row level security;

drop policy if exists "read_site_settings" on site_settings;
create policy "read_site_settings" on site_settings for select
  to anon, authenticated using (true);

drop policy if exists "write_site_settings_admin" on site_settings;
create policy "write_site_settings_admin" on site_settings for all
  to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

-- updated_at trigger -----------------------------------------------------
create or replace function emmy_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'divisions','categories','collections','products',
    'orders','discounts','site_settings'
  ]
  loop
    if not exists (
      select 1 from pg_trigger where tgname = 'trg_' || t || '_updated_at'
    ) then
      execute format(
        'create trigger trg_%I_updated_at before update on %I '
        'for each row execute function emmy_set_updated_at();',
        t, t
      );
    end if;
  end loop;
end $$;
