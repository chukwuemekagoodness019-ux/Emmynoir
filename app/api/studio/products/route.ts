import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminSupabase, requireAdmin, jsonError, slugify } from '../_helpers';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional().default(''),
  division_id: z.string().uuid().nullable(),
  category_id: z.string().uuid().nullable(),
  collection_id: z.string().uuid().nullable(),
  price: z.number().min(0, 'Price cannot be negative'),
  sale_price: z.number().min(0).nullable().optional(),
  sizes: z.array(z.string()).default([]),
  colours: z.array(z.string()).default([]),
  stock: z.number().int().min(0).default(0),
  care_info: z.string().optional().default(''),
  size_guide: z.string().optional().default(''),
  featured: z.boolean().default(false),
  availability: z.enum(['available', 'coming-soon', 'sold-out']).default('available'),
  is_published: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export async function GET() {
  const { data, error } = await adminSupabase
    .from('products')
    .select(`
      id, name, slug, description, price, sale_price, stock, featured,
      availability, is_published, sort_order, created_at,
      division:divisions(id, name, slug),
      category:categories(id, name, slug),
      collection:collections(id, name, slug)
    `)
    .order('sort_order', { ascending: true });

  if (error) return jsonError(error.message, 500);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const guard = requireAdmin();
  if (guard) return guard;

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? 'Invalid data', 422);
  }

  const slug = slugify(parsed.data.name);

  const { data, error } = await adminSupabase
    .from('products')
    .insert({
      ...parsed.data,
      slug,
      description: parsed.data.description || null,
      care_info: parsed.data.care_info || null,
      size_guide: parsed.data.size_guide || null,
    })
    .select('id, name, slug')
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json(data, { status: 201 });
}
