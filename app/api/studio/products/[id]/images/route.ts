import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminSupabase, requireAdmin, jsonError } from '../../../_helpers';

const imageSchema = z.object({
  url: z.string().min(1, 'Image URL is required'),
  alt: z.string().optional().default(''),
  is_primary: z.boolean().default(false),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = requireAdmin();
  if (guard) return guard;

  const body = await req.json();
  const parsed = imageSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Invalid data', 422);

  // Get current max sort_order
  const { data: existing } = await adminSupabase
    .from('product_images')
    .select('sort_order')
    .eq('product_id', params.id)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSort = (existing?.[0]?.sort_order ?? 0) + 1;

  // If setting as primary, unset other primaries
  if (parsed.data.is_primary) {
    await adminSupabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', params.id);
  }

  const { data, error } = await adminSupabase
    .from('product_images')
    .insert({
      product_id: params.id,
      url: parsed.data.url,
      alt: parsed.data.alt || null,
      sort_order: nextSort,
      is_primary: parsed.data.is_primary,
    })
    .select('id, url, alt, sort_order, is_primary')
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
  const imageId = searchParams.get('imageId');
  if (!imageId) return jsonError('imageId is required', 400);

  const { error } = await adminSupabase
    .from('product_images')
    .delete()
    .eq('id', imageId)
    .eq('product_id', params.id);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ deleted: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = requireAdmin();
  if (guard) return guard;

  const body = await req.json();
  const { imageId, is_primary, sort_order } = body as {
    imageId?: string;
    is_primary?: boolean;
    sort_order?: number;
  };

  if (!imageId) return jsonError('imageId is required', 400);

  if (is_primary) {
    await adminSupabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', params.id);
  }

  const updateData: Record<string, unknown> = {};
  if (is_primary !== undefined) updateData.is_primary = is_primary;
  if (sort_order !== undefined) updateData.sort_order = sort_order;

  const { error } = await adminSupabase
    .from('product_images')
    .update(updateData)
    .eq('id', imageId)
    .eq('product_id', params.id);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ updated: true });
}
