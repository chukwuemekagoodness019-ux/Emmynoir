import { supabase } from '@/lib/supabase-client';
import type { Category } from '@/lib/types';

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, division_id, name, slug, description, sort_order, is_active')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

export async function getActiveCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, division_id, name, slug, description, sort_order, is_active')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

export async function getCategoriesByDivision(divisionId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, division_id, name, slug, description, sort_order, is_active')
    .eq('division_id', divisionId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    divisionId: (row.division_id as string) ?? null,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string) ?? null,
    sortOrder: row.sort_order as number,
    isActive: row.is_active as boolean,
  };
}
