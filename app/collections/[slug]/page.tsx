import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCollectionBySlug, getActiveCollections } from '@/lib/data/collections';
import { getProductsByCollection } from '@/lib/data/products';
import { StorefrontProductGrid } from '@/components/site/storefront-product-grid';
import { SectionHeading } from '@/components/site/section-heading';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const collection = await getCollectionBySlug(params.slug);
  if (!collection) return { title: 'Collection not found — EMMY NOIR' };
  return {
    title: `${collection.name} — EMMY NOIR`,
    description: collection.description ?? `Explore the ${collection.name} collection.`,
  };
}

export default async function CollectionPage({ params }: { params: { slug: string } }) {
  const collection = await getCollectionBySlug(params.slug);
  if (!collection) notFound();

  const products = await getProductsByCollection(collection.id);

  if (collection.status === 'coming-soon') {
    return (
      <div className="relative overflow-hidden bg-noir py-24 text-ivory md:py-32">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_50%_50%,rgba(201,168,119,0.16),transparent_60%)]" />
        <div className="container relative z-10 flex flex-col items-center text-center">
          <span className="eyebrow text-gold">Coming Soon</span>
          <h1 className="mt-4 font-serif text-4xl md:text-6xl">{collection.name}</h1>
          {collection.description && (
            <p className="mt-5 max-w-xl text-sm text-ivory/70 md:text-base">
              {collection.description}
            </p>
          )}
          <Link
            href="/collections"
            className="mt-8 inline-flex items-center gap-2 border border-ivory/20 px-6 py-3 text-xs uppercase tracking-editorial text-ivory/80 transition-colors hover:border-ivory"
          >
            View other collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-16 md:py-24">
      <SectionHeading
        eyebrow="Collection"
        title={collection.name}
        description={collection.description ?? ''}
      />
      {products.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="font-serif text-2xl">No pieces in this collection yet</p>
          <p className="text-sm text-muted-foreground">
            We're adding pieces to this edit. Explore the full catalogue in the meantime.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-noir px-6 py-3 text-xs uppercase tracking-editorial text-ivory transition-colors hover:bg-gold hover:text-noir"
          >
            View all products
          </Link>
        </div>
      ) : (
        <StorefrontProductGrid products={products} columns={3} className="mt-12" />
      )}
    </div>
  );
}
