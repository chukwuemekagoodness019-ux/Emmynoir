import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatPrice, getDiscountPercentage } from '@/lib/format';
import { ProductImage } from './product-image';
import type { Product } from '@/lib/types';

type StorefrontProductCardProps = {
  product: Product;
  className?: string;
  index?: number;
};

export function StorefrontProductCard({ product, className, index = 0 }: StorefrontProductCardProps) {
  const discount = getDiscountPercentage(product.price, product.salePrice);
  const isComingSoon = product.availability === 'coming-soon';
  const isSoldOut = product.availability === 'sold-out' || product.stock === 0;
  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];
  const eyebrow = product.collectionName ?? product.divisionName ?? '';

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn('group flex flex-col animate-fade-up', className)}
      style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
    >
      <div className="relative overflow-hidden">
        <ProductImage
          tone={primaryImage?.url ?? 'ink'}
          alt={primaryImage?.alt ?? product.name}
          priority={product.featured}
          className="transition-transform duration-700 ease-editorial group-hover:scale-[1.03]"
        />
        {discount > 0 && (
          <span className="absolute left-3 top-3 bg-noir px-2.5 py-1 text-[0.625rem] uppercase tracking-editorial text-ivory">
            {discount}% Off
          </span>
        )}
        {isComingSoon && (
          <span className="absolute left-3 top-3 bg-gold px-2.5 py-1 text-[0.625rem] uppercase tracking-editorial text-noir">
            Coming Soon
          </span>
        )}
        {isSoldOut && !isComingSoon && (
          <span className="absolute left-3 top-3 bg-muted px-2.5 py-1 text-[0.625rem] uppercase tracking-editorial text-muted-foreground">
            Sold Out
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h3 className="mt-1 font-serif text-lg leading-snug transition-colors group-hover:text-gold">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2 text-sm">
          {product.salePrice && product.salePrice < product.price ? (
            <>
              <span className="text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
              <span className="font-medium text-foreground">
                {formatPrice(product.salePrice)}
              </span>
            </>
          ) : (
            <span className="font-medium text-foreground">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
