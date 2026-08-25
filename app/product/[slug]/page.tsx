import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getProductBySlug } from '@/lib/data/products';
import { formatPrice, getDiscountPercentage } from '@/lib/format';
import { ProductGallery } from '@/components/site/product-gallery';
import { StorefrontAddToBag } from '@/components/site/storefront-add-to-bag';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: 'Product not found — EMMY NOIR' };
  return {
    title: `${product.name} — EMMY NOIR`,
    description: product.description ?? `Discover ${product.name} at EMMY NOIR.`,
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const discount = getDiscountPercentage(product.price, product.salePrice);
  const isComingSoon = product.availability === 'coming-soon';
  const isSoldOut = product.availability === 'sold-out' || product.stock === 0;
  const eyebrow = [product.collectionName, product.divisionName].filter(Boolean).join(' · ');

  return (
    <div className="container py-10 md:py-16">
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-wider2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="flex flex-col gap-6">
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h1 className="mt-2 font-serif text-3xl leading-tight md:text-4xl">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {product.salePrice && product.salePrice < product.price ? (
              <>
                <span className="font-serif text-2xl text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="font-serif text-2xl font-medium">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="bg-noir px-2.5 py-1 text-[0.625rem] uppercase tracking-editorial text-ivory">
                  {discount}% Off
                </span>
              </>
            ) : (
              <span className="font-serif text-2xl font-medium">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {product.description && (
            <p className="max-w-xl text-sm text-muted-foreground md:text-base">
              {product.description}
            </p>
          )}

          {/* Availability indicator */}
          <div className="text-xs uppercase tracking-wider2">
            {isComingSoon ? (
              <span className="text-gold">Coming Soon</span>
            ) : isSoldOut ? (
              <span className="text-muted-foreground">Sold Out</span>
            ) : product.stock <= 5 ? (
              <span className="text-gold">Only {product.stock} left</span>
            ) : (
              <span className="text-muted-foreground">In stock</span>
            )}
          </div>

          {!isComingSoon && !isSoldOut && (
            <StorefrontAddToBag product={product} />
          )}

          {isComingSoon && (
            <p className="surface-card p-4 text-sm text-muted-foreground">
              This piece is part of a future collection. Sign up to be notified
              on launch.
            </p>
          )}

          {/* Size guide + care info */}
          <div className="flex flex-col gap-4 border-t border-border pt-6">
            {product.sizeGuide && (
              <div>
                <span className="eyebrow">Size Guide</span>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
                  {product.sizeGuide}
                </p>
              </div>
            )}
            {product.careInfo && (
              <div>
                <span className="eyebrow">Care</span>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
                  {product.careInfo}
                </p>
              </div>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-6 text-sm">
            {product.divisionName && (
              <>
                <dt className="eyebrow">Division</dt>
                <dd>{product.divisionName}</dd>
              </>
            )}
            {product.categoryName && (
              <>
                <dt className="eyebrow">Category</dt>
                <dd>{product.categoryName}</dd>
              </>
            )}
            {product.collectionName && (
              <>
                <dt className="eyebrow">Collection</dt>
                <dd>{product.collectionName}</dd>
              </>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
