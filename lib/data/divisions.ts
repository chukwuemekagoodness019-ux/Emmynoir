import { supabase } from '@/lib/supabase-client';
import type { Division } from '@/lib/types';

export async function getDivisions(): Promise<Division[]> {
  const { data, error } = await supabase
    .from('divisions')
    .select('id, name, slug, tagline, description, cover_image_url, sort_order, is_active')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapDivision);
}

export async function getActiveDivisions(): Promise<Division[]> {
  const { data, error } = await supabase
    .from('divisions')
    .select('id, name, slug, tagline, description, cover_image_url, sort_order, is_active')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapDivision);
}

export async function getDivisionBySlug(slug: string): Promise<Division | null> {
  const { data, error } = await supabase
    .from('divisions')
    .select('id, name, slug, tagline, description, cover_image_url, sort_order, is_active')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data ? mapDivision(data) : null;
}

function mapDivision(row: Record<string, unknown>): Division {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    tagline: (row.tagline as string) ?? null,
    description: (row.description as string) ?? null,
    coverImageUrl: (row.cover_image_url as string) ?? null,
    sortOrder: row.sort_order as number,
    isActive: row.is_active as boolean,
  };
}
