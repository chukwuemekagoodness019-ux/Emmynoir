import Link from 'next/link';
import { cn } from '@/lib/utils';

type BrandProps = {
  className?: string;
  variant?: 'full' | 'mark';
  asLink?: boolean;
};

// Replaceable brand asset.
//
// The official EMMY NOIR logo will be supplied separately. Until then we
// render a clean typographic wordmark so the rest of the UI can be built
// without inventing a permanent logo. Swapping in a real asset later only
// requires updating this component.
export function Brand({ className, variant = 'full', asLink = true }: BrandProps) {
  const content = (
    <span className={cn('inline-flex flex-col leading-none', className)}>
      <span className="font-serif text-xl tracking-[0.2em] uppercase">
        EMMY NOIR
      </span>
      {variant === 'full' && (
        <span className="mt-1 text-[0.625rem] uppercase tracking-editorial text-muted-foreground">
          Modern Fashion House
        </span>
      )}
    </span>
  );

  if (!asLink) return content;

  return (
    <Link href="/" aria-label="EMMY NOIR home" className="inline-flex">
      {content}
    </Link>
  );
}
