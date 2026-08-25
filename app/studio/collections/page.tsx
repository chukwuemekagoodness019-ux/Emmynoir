import { adminSupabase } from '@/lib/admin-client';
import { CollectionManager } from '@/components/studio/collection-manager';

export const dynamic = 'force-dynamic';

export default async function StudioCollectionsPage() {
  const [collectionsRes, divisionsRes] = await Promise.all([
    adminSupabase
      .from('collections')
      .select('id, name, slug, description, tone, status, division_id, cover_image_url, is_featured, sort_order')
      .order('sort_order', { ascending: true }),
    adminSupabase
      .from('divisions')
      .select('id, name')
      .order('sort_order', { ascending: true }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="editorial-heading text-3xl">Collections</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create and manage collections. Set featured collections to appear on the homepage.
        </p>
      </div>

      {collectionsRes.error && (
        <div className="surface-card border-destructive p-4 text-sm text-destructive">
          Error loading collections: {collectionsRes.error.message}
        </div>
      )}

      <CollectionManager collections={collectionsRes.data ?? []} divisions={divisionsRes.data ?? []} />
    </div>
  );
}
