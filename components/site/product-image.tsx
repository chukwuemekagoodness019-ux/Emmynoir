import { cn } from '@/lib/utils';

type ProductImageProps = {
  tone: string;
  alt: string;
  className?: string;
  aspect?: 'portrait' | 'square';
  priority?: boolean;
  fit?: 'cover' | 'contain';
};

// Product image component.
//
// If `tone` is an HTTP URL (from the database image system), renders the real
// image with proper optimization. Otherwise renders a tonal editorial
// placeholder so the layout reads as a premium fashion house.
const toneMap: Record<string, string> = {
  ink: 'from-noir to-[#1c1c1e]',
  ivory: 'from-[#e8e2d6] to-[#f3eee3]',
  charcoal: 'from-[#2a2a2c] to-[#3d3d40]',
  champagne: 'from-[#c9a877] to-[#d8be94]',
  stone: 'from-[#cfc7b8] to-[#e0d9cc]',
  luxe: 'from-[#0d0d0d] to-[#2b2418]',
};

export function ProductImage({
  tone,
  alt,
  className,
  aspect = 'portrait',
  priority = false,
  fit = 'cover',
}: ProductImageProps) {
  const isUrl = tone.startsWith('http://') || tone.startsWith('https://');

  if (isUrl) {
    return (
      <div
        className={cn(
          'relative overflow-hidden bg-secondary',
          aspect === 'portrait' ? 'aspect-[3/4]' : 'aspect-square',
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tone}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          className={cn(
            'h-full w-full transition-transform duration-700 ease-editorial',
            fit === 'cover' ? 'object-cover' : 'object-contain'
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gradient-to-br',
        toneMap[tone] ?? toneMap.ink,
        aspect === 'portrait' ? 'aspect-[3/4]' : 'aspect-square',
        className
      )}
      aria-label={alt}
      role="img"
    >
      <div className="absolute inset-0 opacity-30 mix-blend-overlay [background-image:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_55%)]" />
      <div className="absolute inset-0 flex items-end p-4">
        <span className="text-[0.625rem] uppercase tracking-editorial text-white/40">
          {priority ? 'Featured' : 'Placeholder'}
        </span>
      </div>
    </div>
  );
}
