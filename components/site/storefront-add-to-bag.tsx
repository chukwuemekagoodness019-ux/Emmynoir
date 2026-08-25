'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBag } from './bag-context';
import { cn } from '@/lib/utils';
import type { Product, ProductVariant } from '@/lib/types';

type StorefrontAddToBagProps = {
  product: Product;
};

export function StorefrontAddToBag({ product }: StorefrontAddToBagProps) {
  const { addItem } = useBag();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColour, setSelectedColour] = useState('');
  const [added, setAdded] = useState(false);

  const hasSizes = product.sizes.length > 0;
  const hasColours = product.colours.length > 0;
  const hasVariants = product.variants.length > 0;

  // Check variant availability
  const isVariantAvailable = (size: string, colour: string): boolean => {
    if (!hasVariants) return product.stock > 0;
    const variant = product.variants.find(
      (v) =>
        (size === '' || v.size === size) &&
        (colour === '' || v.colour === colour)
    );
    if (!variant) return true; // no matching variant, allow it
    return variant.availability !== 'sold-out' && variant.stock !== 0;
  };

  const handleAdd = () => {
    const size = hasSizes ? selectedSize : '';
    const colour = hasColours ? selectedColour : '';

    if (hasSizes && !size) return;
    if (hasColours && !colour) return;

    addItem(product, size || 'One size', colour || 'Default');
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const canAdd = (!hasSizes || selectedSize) && (!hasColours || selectedColour);

  return (
    <div className="flex flex-col gap-5">
      {hasSizes && (
        <div>
          <span className="eyebrow">Size</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.sizes.map((s) => {
              const available = isVariantAvailable(s, selectedColour);
              return (
                <button
                  key={s}
                  type="button"
                  disabled={!available}
                  onClick={() => setSelectedSize(s)}
                  className={cn(
                    'min-w-10 border px-3 py-2 text-xs uppercase tracking-wider2 transition-colors',
                    selectedSize === s
                      ? 'border-noir bg-noir text-ivory'
                      : 'border-border text-foreground hover:border-foreground',
                    !available && 'cursor-not-allowed border-border/50 text-muted-foreground/50 line-through hover:border-border/50'
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hasColours && (
        <div>
          <span className="eyebrow">Colour</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.colours.map((c) => {
              const available = isVariantAvailable(selectedSize, c);
              return (
                <button
                  key={c}
                  type="button"
                  disabled={!available}
                  onClick={() => setSelectedColour(c)}
                  className={cn(
                    'border px-3 py-2 text-xs uppercase tracking-wider2 transition-colors',
                    selectedColour === c
                      ? 'border-noir bg-noir text-ivory'
                      : 'border-border text-foreground hover:border-foreground',
                    !available && 'cursor-not-allowed border-border/50 text-muted-foreground/50 line-through hover:border-border/50'
                  )}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Button
        onClick={handleAdd}
        disabled={!canAdd}
        className="w-full bg-noir text-ivory hover:bg-gold hover:text-noir"
      >
        <ShoppingBag className="mr-2 h-4 w-4" />
        {added ? 'Added to bag' : 'Add to bag'}
      </Button>
    </div>
  );
}
