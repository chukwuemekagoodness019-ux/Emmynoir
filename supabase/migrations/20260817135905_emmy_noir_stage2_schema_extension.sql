/*
# EMMY NOIR — Stage 2 schema extension

## Purpose
Extends the Stage 1 foundation with the additional fields and tables needed
for the real data and backend layer. No existing columns are dropped or
retyped — only additive changes.

## Changes to existing tables
- `divisions`: add `description`, `cover_image_url`.
- `collections`: add `division_id` (optional relationship), `cover_image_url`,
  `is_featured`.
- `products`: add `is_published` (separate from availability — a product can
  be in-stock but unpublished, or coming-soon but published as a teaser).
- `product_variants`: add `sku`, `price_adjustment`, `availability`.
- `orders`: add `delivery_location`, `payment_status` (separate from order
  status), `whatsapp_handoff_status`.

## New tables
- `homepage_sections` — ordered homepage content blocks (hero, featured
  products, featured collections, brand story, luxe teaser, etc.) that the
  admin can enable/disable and reorder. Keeps homepage content manageable
  without a page builder.

## Security
- New columns inherit existing RLS policies (policies are per-table, not
  per-column, so existing read/write policies apply automatically).
- `homepage_sections` gets the same anon-read / authenticated-write pattern
  as other customer-facing tables.

## Important notes
1. All additions are additive — no data loss.
2. `payment_status` is separate from order `status` so future online payments
   can integrate cleanly.
3. `is_published` lets admins save draft products without showing them on
   the storefront.
*/

-- Divisions: add description and cover image
alter table divisions
  add column if not exists description text,
  add column if not exists cover_image_url text;

-- Collections: add division relationship, cover image, featured flag
alter table collections
  add column if not exists division_id uuid references divisions(id) on delete set null,
  add column if not exists cover_image_url text,
  add column if not exists is_featured boolean not null default false;

create index if not exists idx_collections_division_id on collections(division_id);
create index if not exists idx_collections_featured on collections(is_featured);

-- Products: add is_published flag
alter table products
  add column if not exists is_published boolean not null default true;

create index if not exists idx_products_is_published on products(is_published);

-- Product variants: add sku, price_adjustment, availability
alter table product_variants
  add column if not exists sku text,
  add column if not exists price_adjustment numeric(12,2) not null default 0,
  add column if not exists availability text not null default 'available'
    check (availability in ('available','sold-out','coming-soon'));

create index if not exists idx_product_variants_sku on product_variants(sku);

-- Orders: add delivery_location, payment_status, whatsapp_handoff_status
alter table orders
  add column if not exists delivery_location text,
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid','pending','paid','refunded','failed')),
  add column if not exists whatsapp_handoff_status text not null default 'pending'
    check (whatsapp_handoff_status in ('pending','sent','confirmed','failed'));

create index if not exists idx_orders_payment_status on orders(payment_status);

-- Homepage sections -------------------------------------------------------
create table if not exists homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title text not null,
  subtitle text,
  section_type text not null default 'generic'
    check (section_type in ('hero','brand-intro','featured-collections','featured-products','division-wears','division-jewelries','luxe-teaser','brand-story','social-contact','generic')),
  is_enabled boolean not null default true,
  sort_order int not null default 0,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table homepage_sections enable row level security;

drop policy if exists "read_homepage_sections" on homepage_sections;
create policy "read_homepage_sections" on homepage_sections for select
  to anon, authenticated using (true);

drop policy if exists "write_homepage_sections_admin" on homepage_sections;
create policy "write_homepage_sections_admin" on homepage_sections for all
  to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

create index if not exists idx_homepage_sections_sort_order on homepage_sections(sort_order);
create index if not exists idx_homepage_sections_is_enabled on homepage_sections(is_enabled);

-- updated_at trigger for homepage_sections
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_homepage_sections_updated_at'
  ) then
    create trigger trg_homepage_sections_updated_at before update on homepage_sections
    for each row execute function emmy_set_updated_at();
  end if;
end $$;
