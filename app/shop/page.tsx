import Link from 'next/link';
import { getProducts } from '@/lib/data/products';
import { getActiveDivisions } from '@/lib/data/divisions';
import { getActiveCategories } from '@/lib/data/categories';
import { StorefrontProductGrid } from '@/components/site/storefront-product-grid';
import { SectionHeading } from '@/components/site/section-heading';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop — EMMY NOIR',
  description: 'Browse the full EMMY NOIR catalogue across all divisions.',
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { division?: string; category?: string };
}) {
  const [products, divisions, categories] = await Promise.all([
    getProducts(),
    getActiveDivisions(),
    getActiveCategories(),
  ]);

  const activeDivision = searchParams.division;
  const activeCategory = searchParams.category;

  let filtered = products;
  if (activeDivision) {
    const division = divisions.find((d) => d.slug === activeDivision);
    if (division) {
      filtered = filtered.filter((p) => p.divisionId === division.id);
    }
  }
  if (activeCategory) {
    const category = categories.find((c) => c.slug === activeCategory);
    if (category) {
      filtered = filtered.filter((p) => p.categoryId === category.id);
    }
  }

  const categoriesForDivision = activeDivision
    ? categories.filter((c) => c.divisionId === divisions.find((d) => d.slug === activeDivision)?.id)
    : categories;

  return (
    <div className="container py-16 md:py-24">
      <SectionHeading
        eyebrow="All"
        title="Shop"
        description="Browse the full EMMY NOIR catalogue across both divisions."
      />

      {/* Filters */}
      <div className="mt-10 flex flex-col gap-4 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-2">Division:</span>
          <Link
            href="/shop"
            className={cn(
              'border px-3 py-1.5 text-xs uppercase tracking-wider2 transition-colors',
              !activeDivision ? 'border-noir bg-noir text-ivory' : 'border-border text-foreground hover:border-foreground'
            )}
          >
            All
          </Link>
          {divisions.map((d) => (
            <Link
              key={d.id}
              href={`/shop?division=${d.slug}`}
              className={cn(
                'border px-3 py-1.5 text-xs uppercase tracking-wider2 transition-colors',
                activeDivision === d.slug ? 'border-noir bg-noir text-ivory' : 'border-border text-foreground hover:border-foreground'
              )}
            >
              {d.name}
            </Link>
          ))}
        </div>

        {categoriesForDivision.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow mr-2">Category:</span>
            <Link
              href={activeDivision ? `/shop?division=${activeDivision}` : '/shop'}
              className={cn(
                'border px-3 py-1.5 text-xs uppercase tracking-wider2 transition-colors',
                !activeCategory ? 'border-noir bg-noir text-ivory' : 'border-border text-foreground hover:border-foreground'
              )}
            >
              All
            </Link>
            {categoriesForDivision.map((c) => (
              <Link
                key={c.id}
                href={`/shop?${new URLSearchParams({
                  ...(activeDivision ? { division: activeDivision } : {}),
                  category: c.slug,
                })}`}
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
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="font-serif text-2xl">No pieces found</p>
          <p className="text-sm text-muted-foreground">
            Try a different division or category, or explore the full catalogue.
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
