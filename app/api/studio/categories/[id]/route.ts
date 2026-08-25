import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminSupabase, requireAdmin, jsonError } from '../../_helpers';

const schema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  division_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
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
    .from('categories')
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
    .from('categories')
    .update({ is_active: false })
    .eq('id', params.id);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ deactivated: true });
}
