import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductImage } from './product-image';

type CollectionCardProps = {
  title: string;
  description?: string;
  href: string;
  tone: string;
  className?: string;
};

export function CollectionCard({
  title,
  description,
  href,
  tone,
  className,
}: CollectionCardProps) {
  return (
    <Link href={href} className={cn('group block', className)}>
      <div className="relative overflow-hidden">
        <ProductImage tone={tone} alt={title} aspect="portrait" />
        <div className="absolute inset-0 bg-noir/20 transition-opacity duration-500 group-hover:bg-noir/10" />
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl leading-snug">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors group-hover:border-noir group-hover:bg-noir group-hover:text-ivory">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
