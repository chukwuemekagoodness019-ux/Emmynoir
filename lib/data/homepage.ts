import { supabase } from '@/lib/supabase-client';
import type { HomepageSection } from '@/lib/types';

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const { data, error } = await supabase
    .from('homepage_sections')
    .select('id, section_key, title, subtitle, section_type, is_enabled, sort_order, config')
    .eq('is_enabled', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapSection);
}

export async function getAllHomepageSections(): Promise<HomepageSection[]> {
  const { data, error } = await supabase
    .from('homepage_sections')
    .select('id, section_key, title, subtitle, section_type, is_enabled, sort_order, config')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapSection);
}

function mapSection(row: Record<string, unknown>): HomepageSection {
  return {
    id: row.id as string,
    sectionKey: row.section_key as string,
    title: row.title as string,
    subtitle: (row.subtitle as string) ?? null,
    sectionType: row.section_type as string,
    isEnabled: row.is_enabled as boolean,
    sortOrder: row.sort_order as number,
    config: (row.config as Record<string, unknown>) ?? {},
  };
}
