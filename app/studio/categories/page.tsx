import { adminSupabase } from '@/lib/admin-client';
import { CategoryManager } from '@/components/studio/category-manager';

export const dynamic = 'force-dynamic';

export default async function StudioCategoriesPage() {
  const [categoriesRes, divisionsRes] = await Promise.all([
    adminSupabase
      .from('categories')
      .select('id, name, slug, description, division_id, is_active, sort_order')
      .order('sort_order', { ascending: true }),
    adminSupabase
      .from('divisions')
      .select('id, name')
      .order('sort_order', { ascending: true }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="editorial-heading text-3xl">Categories</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create and manage product categories. Assign each category to a division.
        </p>
      </div>

      {categoriesRes.error && (
        <div className="surface-card border-destructive p-4 text-sm text-destructive">
          Error loading categories: {categoriesRes.error.message}
        </div>
      )}

      <CategoryManager categories={categoriesRes.data ?? []} divisions={divisionsRes.data ?? []} />
    </div>
  );
}
