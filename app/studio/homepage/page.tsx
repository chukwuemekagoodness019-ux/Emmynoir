import { adminSupabase } from '@/lib/admin-client';
import { HomepageManager } from '@/components/studio/homepage-manager';

export const dynamic = 'force-dynamic';

export default async function StudioHomepagePage() {
  const { data, error } = await adminSupabase
    .from('homepage_sections')
    .select('id, section_key, title, subtitle, section_type, is_enabled, sort_order')
    .order('sort_order', { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="editorial-heading text-3xl">Homepage</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enable or disable homepage sections, edit titles and subtitles, and reorder sections. Changes appear on the storefront immediately.
        </p>
      </div>

      {error && (
        <div className="surface-card border-destructive p-4 text-sm text-destructive">
          Error loading homepage sections: {error.message}
        </div>
      )}

      <HomepageManager sections={data ?? []} />
    </div>
  );
}
