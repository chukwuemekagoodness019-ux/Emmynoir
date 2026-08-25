import { cn } from '@/lib/utils';

type DiscountBadgeProps = {
  percentage: number;
  className?: string;
};

export function DiscountBadge({ percentage, className }: DiscountBadgeProps) {
  if (percentage <= 0) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center bg-noir px-2.5 py-1 text-[0.625rem] uppercase tracking-editorial text-ivory',
        className
      )}
    >
      {percentage}% Off
    </span>
  );
}
