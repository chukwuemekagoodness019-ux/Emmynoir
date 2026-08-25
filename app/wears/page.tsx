import Link from 'next/link';
import { getProductsByDivision } from '@/lib/data/products';
import { getDivisionBySlug, getActiveDivisions } from '@/lib/data/divisions';
import { getCategoriesByDivision } from '@/lib/data/categories';
import { StorefrontProductGrid } from '@/components/site/storefront-product-grid';
import { SectionHeading } from '@/components/site/section-heading';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'EMMY WEARS — EMMY NOIR',
  description: 'Clothing and wearable accessories cut for a confident, quiet silhouette.',
};

export default async function WearsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const division = await getDivisionBySlug('emmy-wears');

  if (!division) {
    return (
      <div className="container py-24 text-center">
        <h1 className="editorial-heading text-3xl">Division not found</h1>
      </div>
    );
  }

  const [products, categories] = await Promise.all([
    getProductsByDivision(division.id),
    getCategoriesByDivision(division.id),
  ]);

  const activeCategory = searchParams.category;
  let filtered = products;
  if (activeCategory) {
    const category = categories.find((c) => c.slug === activeCategory);
    if (category) {
      filtered = products.filter((p) => p.categoryId === category.id);
    }
  }

  return (
    <div className="container py-16 md:py-24">
      <SectionHeading
        eyebrow="Division"
        title="EMMY WEARS"
        description={division.description ?? 'Clothing and wearable accessories cut for a confident, quiet silhouette.'}
      />

      {categories.length > 0 && (
        <div className="mt-10 flex flex-wrap items-center gap-2 border-b border-border pb-6">
          <span className="eyebrow mr-2">Category:</span>
          <Link
            href="/wears"
            className={cn(
              'border px-3 py-1.5 text-xs uppercase tracking-wider2 transition-colors',
              !activeCategory ? 'border-noir bg-noir text-ivory' : 'border-border text-foreground hover:border-foreground'
            )}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/wears?category=${c.slug}`}
              className={cn(
                'border px-3 py-1.5 text-xs uppercase tracking-wider2 transition-colors',
                activeCategory === c.slug ? 'border-noir bg-noir text-ivory' : 'border-border text-foreground hover:border-foreground'
              )}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="font-serif text-2xl">No pieces found</p>
          <p className="text-sm text-muted-foreground">
            New pieces are on the way. Explore the full catalogue in the meantime.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-noir px-6 py-3 text-xs uppercase tracking-editorial text-ivory transition-colors hover:bg-gold hover:text-noir"
          >
            View all products
          </Link>
        </div>
      ) : (
        <StorefrontProductGrid products={filtered} columns={3} className="mt-12" />
      )}
    </div>
  );
}
