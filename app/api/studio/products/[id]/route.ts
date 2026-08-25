import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminSupabase, requireAdmin, jsonError, slugify } from '../../_helpers';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  division_id: z.string().uuid().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  collection_id: z.string().uuid().nullable().optional(),
  price: z.number().min(0).optional(),
  sale_price: z.number().min(0).nullable().optional(),
  sizes: z.array(z.string()).optional(),
  colours: z.array(z.string()).optional(),
  stock: z.number().int().min(0).optional(),
  care_info: z.string().optional(),
  size_guide: z.string().optional(),
  featured: z.boolean().optional(),
  availability: z.enum(['available', 'coming-soon', 'sold-out']).optional(),
  is_published: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data, error } = await adminSupabase
    .from('products')
    .select(`
      id, name, slug, description, price, sale_price, sizes, colours, stock,
      care_info, size_guide, featured, availability, is_published, sort_order,
      division_id, category_id, collection_id,
      division:divisions(id, name, slug),
      category:categories(id, name, slug),
      collection:collections(id, name, slug)
    `)
    .eq('id', params.id)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError('Product not found', 404);

  const [imagesRes, variantsRes] = await Promise.all([
    adminSupabase
      .from('product_images')
      .select('id, url, alt, sort_order, is_primary')
      .eq('product_id', params.id)
      .order('sort_order', { ascending: true }),
    adminSupabase
      .from('product_variants')
      .select('id, size, colour, stock, sku, price_adjustment, availability')
      .eq('product_id', params.id)
      .order('created_at', { ascending: true }),
  ]);

  if (imagesRes.error) return jsonError(imagesRes.error.message, 500);
  if (variantsRes.error) return jsonError(variantsRes.error.message, 500);

  return NextResponse.json({ ...data, images: imagesRes.data ?? [], variants: variantsRes.data ?? [] });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = requireAdmin();
  if (guard) return guard;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? 'Invalid data', 422);
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.name) {
    updateData.slug = slugify(parsed.data.name);
  }
  if (parsed.data.description !== undefined) {
    updateData.description = parsed.data.description || null;
  }

  const { data, error } = await adminSupabase
    .from('products')
    .update(updateData)
    .eq('id', params.id)
    .select('id, name, slug')
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = requireAdmin();
  if (guard) return guard;

  // Archive instead of delete to preserve historical order references.
  const { error } = await adminSupabase
    .from('products')
    .update({ is_published: false, availability: 'sold-out' })
    .eq('id', params.id);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ archived: true });
}
