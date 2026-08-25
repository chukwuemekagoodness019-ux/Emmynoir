import { cn } from '@/lib/utils';
import { StorefrontProductCard } from './storefront-product-card';
import type { Product } from '@/lib/types';

type StorefrontProductGridProps = {
  products: Product[];
  className?: string;
  columns?: 2 | 3 | 4;
};

const gridCols = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};

export function StorefrontProductGrid({ products, className, columns = 3 }: StorefrontProductGridProps) {
  return (
    <div className={cn('grid gap-x-6 gap-y-10', gridCols[columns], className)}>
      {products.map((product, i) => (
        <StorefrontProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  );
}
