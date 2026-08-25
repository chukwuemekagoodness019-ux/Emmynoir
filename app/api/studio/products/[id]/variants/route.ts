import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminSupabase, requireAdmin, jsonError } from '../../../_helpers';

const variantSchema = z.object({
  size: z.string().optional().default(''),
  colour: z.string().optional().default(''),
  stock: z.number().int().min(0).default(0),
  sku: z.string().optional().default(''),
  price_adjustment: z.number().min(0).default(0),
  availability: z.enum(['available', 'sold-out', 'coming-soon']).default('available'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = requireAdmin();
  if (guard) return guard;

  const body = await req.json();
  const parsed = variantSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Invalid data', 422);

  const { data, error } = await adminSupabase
    .from('product_variants')
    .insert({
      product_id: params.id,
      size: parsed.data.size || null,
      colour: parsed.data.colour || null,
      stock: parsed.data.stock,
      sku: parsed.data.sku || null,
      price_adjustment: parsed.data.price_adjustment,
      availability: parsed.data.availability,
    })
    .select('id, size, colour, stock, sku, price_adjustment, availability')
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = requireAdmin();
  if (guard) return guard;

  const { searchParams } = new URL(req.url);
  const variantId = searchParams.get('variantId');
  if (!variantId) return jsonError('variantId is required', 400);

  const { error } = await adminSupabase
    .from('product_variants')
    .delete()
    .eq('id', variantId)
    .eq('product_id', params.id);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ deleted: true });
}
