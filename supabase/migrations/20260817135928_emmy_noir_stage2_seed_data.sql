/*
# EMMY NOIR — Stage 2 development seed data

## Purpose
Inserts a small amount of clearly-identifiable development data so the
data-access layer and storefront can be verified against the real database.
All product names are prefixed with "DEMO" so they cannot be mistaken for
real EMMY NOIR products. This data should be removed before launch.

## Data inserted
- 3 divisions: EMMY WEARS, EMMY JEWELRIES, EMMY LUXE (inactive/coming-soon)
- 6 categories across the divisions
- 4 collections (including EMMY LUXE as coming-soon)
- 4 demo products with variants and placeholder image references
- 1 site_settings row with development placeholder contact info
- 9 homepage sections in display order

## Important notes
1. All products are prefixed "DEMO" and clearly marked.
2. Image URLs use the existing tonal placeholder system (ink, ivory, etc.)
   — real image URLs will come from the admin image-upload system later.
3. Site settings use example.com domains and placeholder phone numbers.
4. Uses ON CONFLICT DO NOTHING so re-running is safe.
*/

-- Divisions
insert into divisions (name, slug, tagline, description, sort_order, is_active)
values
  ('EMMY WEARS', 'emmy-wears', 'Clothing & accessories', 'The clothing and wearable accessories division.', 1, true),
  ('EMMY JEWELRIES', 'emmy-jewelries', 'Fine jewellery', 'The jewellery division — necklaces, rings, bracelets, earrings.', 2, true),
  ('EMMY LUXE', 'emmy-luxe', 'Coming soon', 'A future elevated collection. Currently inactive.', 3, false)
on conflict (slug) do nothing;

-- Categories
insert into categories (division_id, name, slug, description, sort_order, is_active)
select d.id, 'T-shirts', 't-shirts', 'T-shirts and tops.', 1, true from divisions d where d.slug = 'emmy-wears'
on conflict (slug) do nothing;

insert into categories (division_id, name, slug, description, sort_order, is_active)
select d.id, 'Shirts', 'shirts', 'Shirts and blouses.', 2, true from divisions d where d.slug = 'emmy-wears'
on conflict (slug) do nothing;

insert into categories (division_id, name, slug, description, sort_order, is_active)
select d.id, 'Hoodies', 'hoodies', 'Hoodies and sweatshirts.', 3, true from divisions d where d.slug = 'emmy-wears'
on conflict (slug) do nothing;

insert into categories (division_id, name, slug, description, sort_order, is_active)
select d.id, 'Necklaces', 'necklaces', 'Necklaces and chains.', 1, true from divisions d where d.slug = 'emmy-jewelries'
on conflict (slug) do nothing;

insert into categories (division_id, name, slug, description, sort_order, is_active)
select d.id, 'Rings', 'rings', 'Rings.', 2, true from divisions d where d.slug = 'emmy-jewelries'
on conflict (slug) do nothing;

insert into categories (division_id, name, slug, description, sort_order, is_active)
select d.id, 'Bracelets', 'bracelets', 'Bracelets and bangles.', 3, true from divisions d where d.slug = 'emmy-jewelries'
on conflict (slug) do nothing;

-- Collections
insert into collections (name, slug, description, tone, status, division_id, is_featured, sort_order)
select 'Noir Essentials', 'noir-essentials', 'Foundational pieces for the modern wardrobe.', 'ink', 'active', d.id, true, 1
from divisions d where d.slug = 'emmy-wears'
on conflict (slug) do nothing;

insert into collections (name, slug, description, tone, status, division_id, is_featured, sort_order)
select 'After Dark', 'after-dark', 'Evening-ready silhouettes with a quiet edge.', 'charcoal', 'active', d.id, false, 2
from divisions d where d.slug = 'emmy-wears'
on conflict (slug) do nothing;

insert into collections (name, slug, description, tone, status, division_id, is_featured, sort_order)
select 'Linea', 'linea', 'Fine jewellery designed to be lived in.', 'champagne', 'active', d.id, true, 3
from divisions d where d.slug = 'emmy-jewelries'
on conflict (slug) do nothing;

insert into collections (name, slug, description, tone, status, is_featured, sort_order)
values ('EMMY LUXE', 'emmy-luxe', 'A future collection. Coming soon.', 'luxe', 'coming-soon', true, 4)
on conflict (slug) do nothing;

-- Products (all prefixed DEMO)
insert into products (name, slug, description, division_id, category_id, collection_id, price, sale_price, sizes, colours, stock, care_info, size_guide, featured, availability, is_published, sort_order)
select
  'DEMO — The Noir Tee',
  'demo-the-noir-tee',
  'A considered everyday layer cut for a confident, quiet silhouette. DEMO PRODUCT — REMOVE BEFORE LAUNCH.',
  d.id, c.id, col.id,
  45000, 36000,
  array['S','M','L','XL'],
  array['Noir','Ivory'],
  18,
  'Machine wash cold. Hang dry.',
  'Model wears M. Regular fit.',
  true, 'available', true, 1
from divisions d, categories c, collections col
where d.slug = 'emmy-wears' and c.slug = 't-shirts' and col.slug = 'noir-essentials'
on conflict (slug) do nothing;

insert into products (name, slug, description, division_id, category_id, collection_id, price, sizes, colours, stock, care_info, size_guide, featured, availability, is_published, sort_order)
select
  'DEMO — After Dark Shirt',
  'demo-after-dark-shirt',
  'A fluid shirt with a soft structure and an easy after-hours attitude. DEMO PRODUCT — REMOVE BEFORE LAUNCH.',
  d.id, c.id, col.id,
  68000,
  array['S','M','L'],
  array['Noir'],
  9,
  'Dry clean recommended.',
  'Model wears M. Relaxed fit.',
  true, 'available', true, 2
from divisions d, categories c, collections col
where d.slug = 'emmy-wears' and c.slug = 'shirts' and col.slug = 'after-dark'
on conflict (slug) do nothing;

insert into products (name, slug, description, division_id, category_id, collection_id, price, sizes, colours, stock, care_info, size_guide, featured, availability, is_published, sort_order)
select
  'DEMO — Linea Chain',
  'demo-linea-chain',
  'A fine statement chain designed to sit close and catch the light. DEMO PRODUCT — REMOVE BEFORE LAUNCH.',
  d.id, c.id, col.id,
  52000,
  array['One size'],
  array['Champagne'],
  6,
  'Store in a dry pouch. Avoid contact with water.',
  'One size.',
  true, 'available', true, 3
from divisions d, categories c, collections col
where d.slug = 'emmy-jewelries' and c.slug = 'necklaces' and col.slug = 'linea'
on conflict (slug) do nothing;

insert into products (name, slug, description, division_id, category_id, collection_id, price, sizes, colours, stock, care_info, size_guide, featured, availability, is_published, sort_order)
select
  'DEMO — Luxe Object 01',
  'demo-luxe-object-01',
  'A first glimpse of the house''s upcoming elevated collection. DEMO PRODUCT — REMOVE BEFORE LAUNCH.',
  d.id, c.id, col.id,
  0,
  array['One size'],
  array['Noir'],
  0,
  'Handle with care.',
  'One size.',
  false, 'coming-soon', true, 4
from divisions d, categories c, collections col
where d.slug = 'emmy-luxe' and c.slug = 't-shirts' and col.slug = 'emmy-luxe'
on conflict (slug) do nothing;

-- Product variants for The Noir Tee
insert into product_variants (product_id, size, colour, stock, sku, price_adjustment, availability)
select p.id, 'S', 'Noir', 5, 'DEMO-NT-S-NR', 0, 'available' from products p where p.slug = 'demo-the-noir-tee'
on conflict do nothing;

insert into product_variants (product_id, size, colour, stock, sku, price_adjustment, availability)
select p.id, 'M', 'Noir', 6, 'DEMO-NT-M-NR', 0, 'available' from products p where p.slug = 'demo-the-noir-tee'
on conflict do nothing;

insert into product_variants (product_id, size, colour, stock, sku, price_adjustment, availability)
select p.id, 'L', 'Noir', 4, 'DEMO-NT-L-NR', 0, 'available' from products p where p.slug = 'demo-the-noir-tee'
on conflict do nothing;

insert into product_variants (product_id, size, colour, stock, sku, price_adjustment, availability)
select p.id, 'S', 'Ivory', 2, 'DEMO-NT-S-IV', 0, 'available' from products p where p.slug = 'demo-the-noir-tee'
on conflict do nothing;

insert into product_variants (product_id, size, colour, stock, sku, price_adjustment, availability)
select p.id, 'M', 'Ivory', 1, 'DEMO-NT-M-IV', 0, 'available' from products p where p.slug = 'demo-the-noir-tee'
on conflict do nothing;

-- Product variants for After Dark Shirt
insert into product_variants (product_id, size, colour, stock, sku, price_adjustment, availability)
select p.id, 'S', 'Noir', 3, 'DEMO-AD-S-NR', 0, 'available' from products p where p.slug = 'demo-after-dark-shirt'
on conflict do nothing;

insert into product_variants (product_id, size, colour, stock, sku, price_adjustment, availability)
select p.id, 'M', 'Noir', 4, 'DEMO-AD-M-NR', 0, 'available' from products p where p.slug = 'demo-after-dark-shirt'
on conflict do nothing;

insert into product_variants (product_id, size, colour, stock, sku, price_adjustment, availability)
select p.id, 'L', 'Noir', 2, 'DEMO-AD-L-NR', 0, 'available' from products p where p.slug = 'demo-after-dark-shirt'
on conflict do nothing;

-- Product variants for Linea Chain
insert into product_variants (product_id, size, colour, stock, sku, price_adjustment, availability)
select p.id, 'One size', 'Champagne', 6, 'DEMO-LC-OS-CH', 0, 'available' from products p where p.slug = 'demo-linea-chain'
on conflict do nothing;

-- Product images (placeholder tone references)
insert into product_images (product_id, url, alt, sort_order, is_primary)
select p.id, 'ink', 'DEMO Noir Tee — primary', 1, true from products p where p.slug = 'demo-the-noir-tee'
on conflict do nothing;

insert into product_images (product_id, url, alt, sort_order, is_primary)
select p.id, 'ivory', 'DEMO Noir Tee — alternate', 2, false from products p where p.slug = 'demo-the-noir-tee'
on conflict do nothing;

insert into product_images (product_id, url, alt, sort_order, is_primary)
select p.id, 'charcoal', 'DEMO After Dark Shirt — primary', 1, true from products p where p.slug = 'demo-after-dark-shirt'
on conflict do nothing;

insert into product_images (product_id, url, alt, sort_order, is_primary)
select p.id, 'ink', 'DEMO After Dark Shirt — alternate', 2, false from products p where p.slug = 'demo-after-dark-shirt'
on conflict do nothing;

insert into product_images (product_id, url, alt, sort_order, is_primary)
select p.id, 'champagne', 'DEMO Linea Chain — primary', 1, true from products p where p.slug = 'demo-linea-chain'
on conflict do nothing;

insert into product_images (product_id, url, alt, sort_order, is_primary)
select p.id, 'stone', 'DEMO Linea Chain — alternate', 2, false from products p where p.slug = 'demo-linea-chain'
on conflict do nothing;

insert into product_images (product_id, url, alt, sort_order, is_primary)
select p.id, 'luxe', 'DEMO Luxe Object 01 — primary', 1, true from products p where p.slug = 'demo-luxe-object-01'
on conflict do nothing;

insert into product_images (product_id, url, alt, sort_order, is_primary)
select p.id, 'ink', 'DEMO Luxe Object 01 — alternate', 2, false from products p where p.slug = 'demo-luxe-object-01'
on conflict do nothing;

-- Site settings (single row, development placeholders)
insert into site_settings (
  id, brand_name, tagline, whatsapp_number, whatsapp_url,
  instagram_url, tiktok_url, email, phone, delivery_message, about_short, logo_url
)
values (
  1, 'EMMY NOIR', 'Modern Fashion House',
  '+234 800 000 0000', 'https://wa.me/2348000000000',
  'https://instagram.com/emmynoir', 'https://tiktok.com/@emmynoir',
  'hello@emmynoir.example', '+234 800 000 0000',
  'Delivery is available across Nigeria. Delivery fees are confirmed with our team through WhatsApp.',
  'EMMY NOIR is a modern fashion house built on quiet luxury and considered design.',
  null
)
on conflict (id) do nothing;

-- Homepage sections
insert into homepage_sections (section_key, title, subtitle, section_type, is_enabled, sort_order, config)
values
  ('hero', 'Quiet luxury, considered design.', 'A fashion house built on restraint.', 'hero', true, 1, '{}'::jsonb),
  ('brand-intro', 'The House', 'EMMY NOIR is a study in modern elegance.', 'brand-intro', true, 2, '{}'::jsonb),
  ('featured-collections', 'Featured collections', 'Considered edits across the house.', 'featured-collections', true, 3, '{}'::jsonb),
  ('featured-products', 'Featured pieces', 'Selected from across the catalogue.', 'featured-products', true, 4, '{}'::jsonb),
  ('division-wears', 'EMMY WEARS', 'Clothing and wearable accessories.', 'division-wears', true, 5, '{}'::jsonb),
  ('division-jewelries', 'EMMY JEWELRIES', 'Jewellery crafted to catch the light.', 'division-jewelries', true, 6, '{}'::jsonb),
  ('luxe-teaser', 'EMMY LUXE', 'A future collection. Coming soon.', 'luxe-teaser', true, 7, '{}'::jsonb),
  ('brand-story', 'Our Story', 'We design for the person who values restraint.', 'brand-story', true, 8, '{}'::jsonb),
  ('social-contact', 'Stay Close', 'Follow the house.', 'social-contact', true, 9, '{}'::jsonb)
on conflict (section_key) do nothing;
