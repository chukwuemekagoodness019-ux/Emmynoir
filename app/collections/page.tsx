import Link from 'next/link';
import { getActiveCollections } from '@/lib/data/collections';
import { CollectionCard } from '@/components/site/collection-card';
import { SectionHeading } from '@/components/site/section-heading';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Collections — EMMY NOIR',
  description: 'Considered edits across the house, from everyday essentials to elevated jewellery.',
};

export default async function CollectionsPage() {
  const collections = await getActiveCollections();

  return (
    <div className="container py-16 md:py-24">
      <SectionHeading
        eyebrow="Edits"
        title="Collections"
        description="Considered edits across the house, from everyday essentials to elevated jewellery."
      />
      {collections.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="font-serif text-2xl">Collections coming soon</p>
          <p className="text-sm text-muted-foreground">
            We're curating our first edits. Check back shortly.
          </p>
        </div>
      ) : (
        <div className="mt-12 grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <CollectionCard
              key={c.id}
              title={c.name}
              description={c.description ?? ''}
              href={`/collections/${c.slug}`}
              tone={c.tone ?? 'ink'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
