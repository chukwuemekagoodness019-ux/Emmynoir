import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminSupabase, requireAdmin, jsonError, slugify } from '../_helpers';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().default(''),
  division_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export async function GET() {
  const { data, error } = await adminSupabase
    .from('categories')
    .select('id, name, slug, description, division_id, sort_order, is_active, created_at, division:divisions(id, name)')
    .order('sort_order', { ascending: true });

  if (error) return jsonError(error.message, 500);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const guard = requireAdmin();
  if (guard) return guard;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Invalid data', 422);

  const { data, error } = await adminSupabase
    .from('categories')
    .insert({
      ...parsed.data,
      slug: slugify(parsed.data.name),
      description: parsed.data.description || null,
    })
    .select('id, name, slug')
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json(data, { status: 201 });
}
