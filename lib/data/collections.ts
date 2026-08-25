import { supabase } from '@/lib/supabase-client';
import type { Collection } from '@/lib/types';

export async function getCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('id, name, slug, description, tone, status, division_id, cover_image_url, is_featured, sort_order')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapCollection);
}

export async function getActiveCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('id, name, slug, description, tone, status, division_id, cover_image_url, is_featured, sort_order')
    .in('status', ['active', 'coming-soon'])
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapCollection);
}

export async function getFeaturedCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('id, name, slug, description, tone, status, division_id, cover_image_url, is_featured, sort_order')
    .eq('is_featured', true)
    .in('status', ['active', 'coming-soon'])
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapCollection);
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const { data, error } = await supabase
    .from('collections')
    .select('id, name, slug, description, tone, status, division_id, cover_image_url, is_featured, sort_order')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data ? mapCollection(data) : null;
}

function mapCollection(row: Record<string, unknown>): Collection {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string) ?? null,
    tone: (row.tone as string) ?? null,
    status: row.status as Collection['status'],
    divisionId: (row.division_id as string) ?? null,
    coverImageUrl: (row.cover_image_url as string) ?? null,
    isFeatured: row.is_featured as boolean,
    sortOrder: row.sort_order as number,
  };
}
