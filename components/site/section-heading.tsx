import { cn } from '@/lib/utils';

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' && 'items-center text-center',
        className
      )}
    >
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="editorial-heading text-3xl leading-tight md:text-4xl">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'max-w-editorial text-sm text-muted-foreground md:text-base',
            align === 'center' && 'mx-auto'
          )}
        >
          {description}
        </p>
      )}
      <span className="gold-rule mt-1" />
    </div>
  );
}
