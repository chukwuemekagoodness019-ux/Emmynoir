import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { adminSupabase } from '@/lib/admin-client';
import { formatPrice, getDiscountPercentage } from '@/lib/format';
import { ProductImage } from '@/components/site/product-image';

export const dynamic = 'force-dynamic';

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  stock: number;
  featured: boolean;
  availability: string;
  is_published: boolean;
  division: { name: string } | null;
  category: { name: string } | null;
};

export default async function StudioProductsPage() {
  const { data, error } = await adminSupabase
    .from('products')
    .select(`
      id, name, slug, price, sale_price, stock, featured, availability, is_published,
      division:divisions(name), category:categories(name)
    `)
    .order('sort_order', { ascending: true });

  const products = (data ?? []) as unknown as ProductRow[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="editorial-heading text-3xl">Products</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {products.length} product{products.length !== 1 ? 's' : ''} in the catalogue.
          </p>
        </div>
        <Link
          href="/studio/products/new"
          className="inline-flex items-center gap-2 bg-noir px-5 py-2.5 text-xs uppercase tracking-editorial text-ivory transition-colors hover:bg-gold hover:text-noir"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {error && (
        <div className="surface-card border-destructive p-4 text-sm text-destructive">
          Error loading products: {error.message}
        </div>
      )}

      {products.length === 0 ? (
        <div className="surface-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No products yet. Add your first product to get started.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {products.map((product) => {
            const discount = getDiscountPercentage(product.price, product.sale_price);
            return (
              <Link
                key={product.id}
                href={`/studio/products/${product.slug}`}
                className="surface-card flex items-center gap-4 p-4 transition-colors hover:border-foreground"
              >
                <ProductImage
                  tone="ink"
                  alt={product.name}
                  aspect="square"
                  className="w-16 shrink-0"
                />
                <div className="flex flex-1 flex-col gap-1">
                  <span className="font-serif text-base">{product.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {product.division?.name ?? 'No division'} · {product.category?.name ?? 'No category'}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{formatPrice(product.price)}</span>
                    {discount > 0 && (
                      <span className="text-xs text-gold">{discount}% off</span>
                    )}
                    <span className={`text-xs ${product.stock < 5 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {product.stock} in stock
                    </span>
                    {product.featured && (
                      <span className="bg-gold/20 px-2 py-0.5 text-[0.625rem] uppercase tracking-wider2 text-gold">Featured</span>
                    )}
                    {!product.is_published && (
                      <span className="bg-muted px-2 py-0.5 text-[0.625rem] uppercase tracking-wider2 text-muted-foreground">Unpublished</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
