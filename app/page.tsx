import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { SectionHeading } from '@/components/site/section-heading';
import { StorefrontProductGrid } from '@/components/site/storefront-product-grid';
import { CollectionCard } from '@/components/site/collection-card';
import { ProductImage } from '@/components/site/product-image';
import { getFeaturedProducts, getProductsByDivision } from '@/lib/data/products';
import { getFeaturedCollections } from '@/lib/data/collections';
import { getDivisionBySlug, getActiveDivisions } from '@/lib/data/divisions';
import { getSettingsAsync } from '@/lib/data/site-settings';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'EMMY NOIR — Modern Fashion House',
  description:
    'EMMY NOIR is a premium fashion house featuring EMMY WEARS and EMMY JEWELRIES. Discover considered clothing, jewelry, and collections.',
  openGraph: {
    title: 'EMMY NOIR — Modern Fashion House',
    description:
      'A premium fashion house featuring EMMY WEARS and EMMY JEWELRIES.',
  },
};

export default async function Home() {
  const settings = await getSettingsAsync();

  const [featured, featuredCollections, allDivisions] = await Promise.all([
    getFeaturedProducts(),
    getFeaturedCollections(),
    getActiveDivisions(),
  ]);

  const wearsDivision = allDivisions.find((d) => d.slug === 'emmy-wears');
  const jewelriesDivision = allDivisions.find((d) => d.slug === 'emmy-jewelries');
  const luxeDivision = allDivisions.find((d) => d.slug === 'emmy-luxe');

  const [wears, jewelries] = await Promise.all([
    wearsDivision ? getProductsByDivision(wearsDivision.id) : Promise.resolve([]),
    jewelriesDivision ? getProductsByDivision(jewelriesDivision.id) : Promise.resolve([]),
  ]);

  const luxeIsActive = luxeDivision?.isActive ?? false;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-noir text-ivory">
        <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_70%_30%,rgba(201,168,119,0.18),transparent_55%)]" />
        <div className="container relative z-10 flex flex-col items-start gap-8 py-24 animate-fade-up">
          <span className="eyebrow text-ivory/60">EMMY NOIR · {settings.tagline || 'Modern Fashion House'}</span>
          <h1 className="max-w-3xl font-serif text-5xl leading-[1.05] md:text-7xl">
            Quiet luxury, <span className="text-gold">considered</span> design.
          </h1>
          <p className="max-w-xl text-sm text-ivory/70 md:text-base">
            A fashion house built on restraint. EMMY WEARS and EMMY JEWELRIES,
            crafted for a modern, intentional wardrobe.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-ivory px-6 py-3 text-xs uppercase tracking-editorial text-noir transition-colors hover:bg-gold"
            >
              Shop collection <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 border border-ivory/30 px-6 py-3 text-xs uppercase tracking-editorial text-ivory transition-colors hover:border-ivory"
            >
              View collections
            </Link>
          </div>
        </div>
      </section>

      {/* Brand introduction */}
      <section className="container py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="animate-fade-up">
            <span className="eyebrow">The House</span>
            <h2 className="mt-3 editorial-heading text-3xl md:text-4xl">
              EMMY NOIR is a study in modern elegance.
            </h2>
            <p className="mt-5 max-w-xl text-sm text-muted-foreground md:text-base">
              {settings.aboutShort} We design with intention — favouring clean
              lines, premium materials, and a restrained palette that lets each
              piece speak for itself.
            </p>
            <div className="mt-8">
              <Link
                href="/about"
                className="link-underline text-sm uppercase tracking-wider2 text-foreground"
              >
                Read our story
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ProductImage tone="ink" alt="Editorial" className="animate-fade-up" />
            <ProductImage tone="champagne" alt="Editorial" className="mt-10 animate-fade-up" style={{ animationDelay: '100ms' } as React.CSSProperties} />
          </div>
        </div>
      </section>

      {/* Featured collections */}
      {featuredCollections.length > 0 && (
        <section className="border-y border-border bg-secondary/40 py-20 md:py-28">
          <div className="container">
            <SectionHeading
              eyebrow="Curated"
              title="Featured collections"
              description="Considered edits across the house, from everyday essentials to elevated jewellery."
            />
            <div className="mt-12 grid gap-x-6 gap-y-10 md:grid-cols-3">
              {featuredCollections.slice(0, 3).map((c, i) => (
                <div key={c.id} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <CollectionCard
                    title={c.name}
                    description={c.description ?? ''}
                    href={`/collections/${c.slug}`}
                    tone={c.tone ?? 'ink'}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="container py-20 md:py-28">
          <div className="flex items-end justify-between gap-6">
            <SectionHeading eyebrow="Selected" title="Featured pieces" />
            <Link
              href="/shop"
              className="hidden link-underline text-sm uppercase tracking-wider2 text-foreground md:inline-flex"
            >
              View all
            </Link>
          </div>
          <StorefrontProductGrid products={featured.slice(0, 6)} columns={3} className="mt-12" />
        </section>
      )}

      {/* EMMY WEARS */}
      {wears.length > 0 && (
        <section className="border-t border-border bg-secondary/30 py-20 md:py-28">
          <div className="container">
            <SectionHeading
              eyebrow="Division"
              title="EMMY WEARS"
              description="Clothing and wearable accessories, cut for a confident, quiet silhouette."
            />
            <StorefrontProductGrid products={wears.slice(0, 6)} columns={3} className="mt-12" />
            <div className="mt-10 text-center">
              <Link
                href="/wears"
                className="link-underline text-sm uppercase tracking-wider2 text-foreground"
              >
                View all EMMY WEARS
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* EMMY JEWELRIES */}
      {jewelries.length > 0 && (
        <section className="container py-20 md:py-28">
          <SectionHeading
            eyebrow="Division"
            title="EMMY JEWELRIES"
            description="Jewellery crafted to catch the light and sit close to the skin."
          />
          <StorefrontProductGrid products={jewelries.slice(0, 6)} columns={3} className="mt-12" />
          <div className="mt-10 text-center">
            <Link
              href="/jewelries"
              className="link-underline text-sm uppercase tracking-wider2 text-foreground"
            >
              View all EMMY JEWELRIES
            </Link>
          </div>
        </section>
      )}

      {/* EMMY LUXE / Coming Soon */}
      <section className="relative overflow-hidden bg-noir py-24 text-ivory md:py-32">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_50%_50%,rgba(201,168,119,0.16),transparent_60%)]" />
        <div className="container relative z-10 flex flex-col items-center text-center animate-fade-up">
          <span className="eyebrow text-gold">{luxeIsActive ? 'Now Available' : 'Coming Soon'}</span>
          <h2 className="mt-4 font-serif text-4xl md:text-6xl">EMMY LUXE</h2>
          <p className="mt-5 max-w-xl text-sm text-ivory/70 md:text-base">
            {luxeIsActive
              ? 'Elevated objects and limited pieces, designed for the next chapter of the house.'
              : 'A future collection. Elevated objects and limited pieces, designed for the next chapter of the house.'}
          </p>
          {luxeIsActive ? (
            <Link
              href="/shop?division=emmy-luxe"
              className="mt-8 inline-flex items-center gap-2 bg-ivory px-6 py-3 text-xs uppercase tracking-editorial text-noir transition-colors hover:bg-gold"
            >
              Explore EMMY LUXE <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="mt-8 inline-flex items-center gap-2 border border-ivory/20 px-6 py-3 text-xs uppercase tracking-editorial text-ivory/80">
              Notify me on launch
            </span>
          )}
        </div>
      </section>

      {/* Brand story */}
      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-editorial text-center animate-fade-up">
          <span className="eyebrow">Our Story</span>
          <p className="mt-6 font-serif text-2xl leading-relaxed md:text-3xl">
            &ldquo;We design for the person who values restraint — who understands
            that true luxury is quiet, considered, and built to last.&rdquo;
          </p>
          <span className="mt-6 inline-block gold-rule" />
          <p className="mt-4 text-sm text-muted-foreground">— EMMY NOIR</p>
        </div>
      </section>

      {/* Social / contact */}
      <section className="border-t border-border bg-secondary/40 py-20 md:py-24">
        <div className="container flex flex-col items-center gap-6 text-center animate-fade-up">
          <span className="eyebrow">Stay Close</span>
          <h2 className="editorial-heading text-3xl md:text-4xl">
            Follow the house.
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            New collections, editorial moments, and behind-the-scenes from
            EMMY NOIR.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {settings.whatsappUrl && (
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-noir px-6 py-3 text-xs uppercase tracking-editorial text-ivory transition-colors hover:bg-gold hover:text-noir"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-border px-6 py-3 text-xs uppercase tracking-editorial text-foreground transition-colors hover:border-noir"
              >
                Instagram
              </a>
            )}
            {settings.tiktokUrl && (
              <a
                href={settings.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-border px-6 py-3 text-xs uppercase tracking-editorial text-foreground transition-colors hover:border-noir"
              >
                TikTok
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
