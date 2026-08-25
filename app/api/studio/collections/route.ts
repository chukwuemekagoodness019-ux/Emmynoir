import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminSupabase, requireAdmin, jsonError, slugify } from '../_helpers';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().default(''),
  tone: z.string().optional().default(''),
  status: z.enum(['active', 'coming-soon', 'archived']).default('active'),
  division_id: z.string().uuid().nullable().optional(),
  cover_image_url: z.string().optional().default(''),
  is_featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

export async function GET() {
  const { data, error } = await adminSupabase
    .from('collections')
    .select('id, name, slug, description, tone, status, division_id, cover_image_url, is_featured, sort_order, created_at')
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
    .from('collections')
    .insert({
      ...parsed.data,
      slug: slugify(parsed.data.name),
      description: parsed.data.description || null,
      tone: parsed.data.tone || null,
      cover_image_url: parsed.data.cover_image_url || null,
    })
    .select('id, name, slug')
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json(data, { status: 201 });
}
