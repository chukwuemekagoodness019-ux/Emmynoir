import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase, requireAdmin, jsonError } from '../_helpers';

export async function GET() {
  const { data, error } = await adminSupabase
    .from('homepage_sections')
    .select('id, section_key, title, subtitle, section_type, is_enabled, sort_order, config')
    .order('sort_order', { ascending: true });

  if (error) return jsonError(error.message, 500);
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const guard = requireAdmin();
  if (guard) return guard;

  const body = await req.json();
  const { sectionId, is_enabled, sort_order, title, subtitle } = body as {
    sectionId?: string;
    is_enabled?: boolean;
    sort_order?: number;
    title?: string;
    subtitle?: string;
  };

  if (!sectionId) return jsonError('sectionId is required', 400);

  const updateData: Record<string, unknown> = {};
  if (is_enabled !== undefined) updateData.is_enabled = is_enabled;
  if (sort_order !== undefined) updateData.sort_order = sort_order;
  if (title !== undefined) updateData.title = title;
  if (subtitle !== undefined) updateData.subtitle = subtitle;

  if (Object.keys(updateData).length === 0) {
    return jsonError('No valid fields to update', 400);
  }

  const { error } = await adminSupabase
    .from('homepage_sections')
    .update(updateData)
    .eq('id', sectionId);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ updated: true });
}
