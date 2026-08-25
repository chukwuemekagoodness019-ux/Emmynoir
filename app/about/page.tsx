import { SectionHeading } from '@/components/site/section-heading';
import { ProductImage } from '@/components/site/product-image';
import { getSettingsAsync } from '@/lib/data/site-settings';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const settings = await getSettingsAsync();

  return (
    <div className="container py-16 md:py-24">
      <SectionHeading eyebrow="The House" title="About EMMY NOIR" />

      <div className="mt-12 grid gap-12 md:grid-cols-2 md:items-center">
        <div className="space-y-6 text-sm text-muted-foreground md:text-base">
          <p>{settings.aboutShort}</p>
          <p>
            EMMY NOIR is built on two divisions — EMMY WEARS and EMMY JEWELRIES —
            with a future EMMY LUXE collection on the horizon. We design with
            restraint, favouring clean lines, premium materials, and a palette
            that lets each piece speak for itself.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ProductImage tone="ink" alt="Editorial" />
          <ProductImage tone="champagne" alt="Editorial" className="mt-10" />
        </div>
      </div>

      {/* Vision */}
      <div className="mt-20 border-t border-border pt-16">
        <div className="mx-auto max-w-editorial text-center">
          <span className="eyebrow">Vision</span>
          <p className="mt-6 font-serif text-2xl leading-relaxed md:text-3xl">
            &ldquo;We design for the person who values restraint — who understands
            that true luxury is quiet, considered, and built to last.&rdquo;
          </p>
          <span className="mt-6 inline-block gold-rule" />
          <p className="mt-4 text-sm text-muted-foreground">— EMMY NOIR</p>
        </div>
      </div>

      {/* Philosophy */}
      <div className="mt-20 grid gap-8 md:grid-cols-3">
        <div className="surface-card p-8 animate-fade-up" style={{ animationDelay: '0ms' }}>
          <span className="eyebrow text-gold">Philosophy</span>
          <p className="mt-4 text-sm text-muted-foreground">
            Every piece is intentional. We avoid excess, choosing instead to
            refine until only the essential remains.
          </p>
        </div>
        <div className="surface-card p-8 animate-fade-up" style={{ animationDelay: '80ms' }}>
          <span className="eyebrow text-gold">Craft</span>
          <p className="mt-4 text-sm text-muted-foreground">
            Premium materials, considered construction, and a commitment to
            pieces designed to be worn for years, not seasons.
          </p>
        </div>
        <div className="surface-card p-8 animate-fade-up" style={{ animationDelay: '160ms' }}>
          <span className="eyebrow text-gold">Identity</span>
          <p className="mt-4 text-sm text-muted-foreground">
            EMMY NOIR is modern fashion — confident without noise, elegant
            without effort, and rooted in a distinctly African perspective.
          </p>
        </div>
      </div>
    </div>
  );
}
