import { adminSupabase } from '@/lib/admin-client';
import { ProductForm } from '@/components/studio/product-form';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const [divisionsRes, categoriesRes, collectionsRes] = await Promise.all([
    adminSupabase.from('divisions').select('id, name').order('sort_order'),
    adminSupabase.from('categories').select('id, name, division_id').order('sort_order'),
    adminSupabase.from('collections').select('id, name').order('sort_order'),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="editorial-heading text-3xl">Add Product</h1>
        <p className="mt-2 text-sm text-muted-foreground">Create a new product for the EMMY NOIR catalogue.</p>
      </div>
      <ProductForm
        mode="create"
        divisions={divisionsRes.data ?? []}
        categories={categoriesRes.data ?? []}
        collections={collectionsRes.data ?? []}
      />
    </div>
  );
}
