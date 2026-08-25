'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ProductImage } from './product-image';
import type { ProductImage as ProductImageType } from '@/lib/types';

type ProductGalleryProps = {
  images: ProductImageType[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <ProductImage tone="ink" alt={productName} aspect="portrait" priority />
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className="flex flex-col gap-4">
      <ProductImage
        tone={activeImage.url}
        alt={activeImage.alt ?? productName}
        aspect="portrait"
        priority
      />
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                'overflow-hidden border-2 transition-colors',
                i === activeIndex ? 'border-noir' : 'border-transparent hover:border-border'
              )}
            >
              <ProductImage
                tone={img.url}
                alt={img.alt ?? `${productName} ${i + 1}`}
                aspect="square"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
