import { supabase } from '@/lib/supabase-client';
import type { Product, ProductImage, ProductVariant } from '@/lib/types';

// Product fetch with joined division, category, collection names plus
// nested images and variants. Only published products are returned for
// the storefront.

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, description,
      division_id, division:divisions(id, name, slug),
      category_id, category:categories(id, name, slug),
      collection_id, collection:collections(id, name, slug),
      price, sale_price, sizes, colours, stock, care_info, size_guide,
      featured, availability, is_published, sort_order
    `)
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return enrichProducts(data ?? []);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, description,
      division_id, division:divisions(id, name, slug),
      category_id, category:categories(id, name, slug),
      collection_id, collection:collections(id, name, slug),
      price, sale_price, sizes, colours, stock, care_info, size_guide,
      featured, availability, is_published, sort_order
    `)
    .eq('is_published', true)
    .eq('featured', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return enrichProducts(data ?? []);
}

export async function getProductsByDivision(divisionId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, description,
      division_id, division:divisions(id, name, slug),
      category_id, category:categories(id, name, slug),
      collection_id, collection:collections(id, name, slug),
      price, sale_price, sizes, colours, stock, care_info, size_guide,
      featured, availability, is_published, sort_order
    `)
    .eq('is_published', true)
    .eq('division_id', divisionId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return enrichProducts(data ?? []);
}

export async function getProductsByCollection(collectionId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, description,
      division_id, division:divisions(id, name, slug),
      category_id, category:categories(id, name, slug),
      collection_id, collection:collections(id, name, slug),
      price, sale_price, sizes, colours, stock, care_info, size_guide,
      featured, availability, is_published, sort_order
    `)
    .eq('is_published', true)
    .eq('collection_id', collectionId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return enrichProducts(data ?? []);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, description,
      division_id, division:divisions(id, name, slug),
      category_id, category:categories(id, name, slug),
      collection_id, collection:collections(id, name, slug),
      price, sale_price, sizes, colours, stock, care_info, size_guide,
      featured, availability, is_published, sort_order
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const products = await enrichProducts([data]);
  return products[0] ?? null;
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, description,
      division_id, division:divisions(id, name, slug),
      category_id, category:categories(id, name, slug),
      collection_id, collection:collections(id, name, slug),
      price, sale_price, sizes, colours, stock, care_info, size_guide,
      featured, availability, is_published, sort_order
    `)
    .eq('is_published', true)
    .eq('category_id', categoryId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return enrichProducts(data ?? []);
}

// Fetch images and variants for a list of product IDs in one query each,
// then merge them into the product objects.
async function enrichProducts(rows: Record<string, unknown>[]): Promise<Product[]> {
  if (rows.length === 0) return [];

  const productIds = rows.map((r) => r.id as string);

  const [imagesResult, variantsResult] = await Promise.all([
    supabase
      .from('product_images')
      .select('id, product_id, url, alt, sort_order, is_primary')
      .in('product_id', productIds)
      .order('sort_order', { ascending: true }),
    supabase
      .from('product_variants')
      .select('id, product_id, size, colour, stock, sku, price_adjustment, availability')
      .in('product_id', productIds)
      .order('created_at', { ascending: true }),
  ]);

  if (imagesResult.error) throw imagesResult.error;
  if (variantsResult.error) throw variantsResult.error;

  const imagesByProduct = groupBy(imagesResult.data ?? [], 'product_id');
  const variantsByProduct = groupBy(variantsResult.data ?? [], 'product_id');

  return rows.map((row) => {
    const id = row.id as string;
    const division = row.division as Record<string, unknown> | null;
    const category = row.category as Record<string, unknown> | null;
    const collection = row.collection as Record<string, unknown> | null;

    return {
      id,
      name: row.name as string,
      slug: row.slug as string,
      description: (row.description as string) ?? null,
      divisionId: (row.division_id as string) ?? null,
      divisionName: (division?.name as string) ?? null,
      divisionSlug: (division?.slug as string) ?? null,
      categoryId: (row.category_id as string) ?? null,
      categoryName: (category?.name as string) ?? null,
      collectionId: (row.collection_id as string) ?? null,
      collectionName: (collection?.name as string) ?? null,
      price: Number(row.price ?? 0),
      salePrice: row.sale_price != null ? Number(row.sale_price) : null,
      sizes: (row.sizes as string[]) ?? [],
      colours: (row.colours as string[]) ?? [],
      stock: row.stock as number,
      careInfo: (row.care_info as string) ?? null,
      sizeGuide: (row.size_guide as string) ?? null,
      featured: row.featured as boolean,
      availability: row.availability as Product['availability'],
      isPublished: row.is_published as boolean,
      sortOrder: row.sort_order as number,
      images: (imagesByProduct[id] ?? []).map(mapImage),
      variants: (variantsByProduct[id] ?? []).map(mapVariant),
    };
  });
}

function groupBy(rows: Record<string, unknown>[], key: string): Record<string, Record<string, unknown>[]> {
  const acc: Record<string, Record<string, unknown>[]> = {};
  for (const row of rows) {
    const k = row[key] as string;
    if (!acc[k]) acc[k] = [];
    acc[k].push(row);
  }
  return acc;
}

function mapImage(row: Record<string, unknown>): ProductImage {
  return {
    id: row.id as string,
    url: row.url as string,
    alt: (row.alt as string) ?? null,
    sortOrder: row.sort_order as number,
    isPrimary: row.is_primary as boolean,
  };
}

function mapVariant(row: Record<string, unknown>): ProductVariant {
  return {
    id: row.id as string,
    size: (row.size as string) ?? null,
    colour: (row.colour as string) ?? null,
    stock: row.stock as number,
    sku: (row.sku as string) ?? null,
    priceAdjustment: Number(row.price_adjustment ?? 0),
    availability: row.availability as ProductVariant['availability'],
  };
}
