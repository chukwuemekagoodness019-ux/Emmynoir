import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminSupabase, requireAdmin, jsonError } from '../../_helpers';

const schema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  tone: z.string().optional(),
  status: z.enum(['active', 'coming-soon', 'archived']).optional(),
  division_id: z.string().uuid().nullable().optional(),
  cover_image_url: z.string().optional(),
  is_featured: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = requireAdmin();
  if (guard) return guard;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Invalid data', 422);

  const { data, error } = await adminSupabase
    .from('collections')
    .update(parsed.data)
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

  const { error } = await adminSupabase
    .from('collections')
    .update({ status: 'archived' })
    .eq('id', params.id);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ archived: true });
}
