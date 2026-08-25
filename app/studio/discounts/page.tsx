import { adminSupabase } from '@/lib/admin-client';
import { DiscountManager } from '@/components/studio/discount-manager';

export const dynamic = 'force-dynamic';

export default async function StudioDiscountsPage() {
  const { data, error } = await adminSupabase
    .from('products')
    .select('id, name, slug, price, sale_price')
    .eq('is_published', true)
    .order('name', { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="editorial-heading text-3xl">Discounts</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage product-level sale pricing. Set a discounted price below the original to apply a discount.
        </p>
      </div>

      {error && (
        <div className="surface-card border-destructive p-4 text-sm text-destructive">
          Error loading products: {error.message}
        </div>
      )}

      <DiscountManager products={data ?? []} />
    </div>
  );
}
