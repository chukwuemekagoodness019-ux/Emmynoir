'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, MessageCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useBag, type BagItem } from '@/components/site/bag-context';
import { formatPrice } from '@/lib/format';
import { ProductImage } from '@/components/site/product-image';
import type { SiteSettings } from '@/lib/types';

type CustomerInfo = {
  name: string;
  phone: string;
  deliveryLocation: string;
};

export function BagContent({ settings }: { settings: SiteSettings }) {
  const { items, subtotal, updateQuantity, removeItem, clear } = useBag();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    deliveryLocation: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center gap-6 py-24 text-center">
        <h1 className="editorial-heading text-3xl md:text-4xl">Your bag is empty</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Explore the house and add pieces to your bag. When you're ready, you'll
          be able to send your order through WhatsApp.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-noir px-6 py-3 text-xs uppercase tracking-editorial text-ivory transition-colors hover:bg-gold hover:text-noir"
        >
          Explore the shop <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const handleOrderViaWhatsApp = async () => {
    if (!customerInfo.name.trim() || !customerInfo.phone.trim()) {
      setError('Please provide your name and phone number.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
          deliveryLocation: customerInfo.deliveryLocation,
          items: items.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            size: item.size,
            colour: item.colour,
            quantity: item.quantity,
            unitPrice: item.product.salePrice ?? item.product.price,
          })),
          subtotal,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to create order');
      }

      const { order } = await response.json();

      const message = buildWhatsAppMessage({
        items,
        subtotal,
        orderRef: order.reference,
        brandName: settings.brandName,
        customerInfo,
      });

      const whatsappBase = settings.whatsappUrl ?? 'https://wa.me/2348000000000';
      const whatsappHref = `${whatsappBase}?text=${encodeURIComponent(message)}`;

      window.open(whatsappHref, '_blank', 'noopener,noreferrer');
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-12 md:py-16">
      <h1 className="editorial-heading text-3xl md:text-4xl">Shopping Bag</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="flex flex-col divide-y divide-border">
          {items.map((item) => (
            <div key={item.key} className="flex gap-4 py-6 animate-fade-in">
              <ProductImage
                tone={item.product.images[0]?.url ?? 'ink'}
                alt={item.product.name}
                aspect="square"
                className="w-24 shrink-0"
              />
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-lg">{item.product.name}</h3>
                    {(item.size !== 'One size' || item.colour !== 'Default') && (
                      <p className="mt-1 text-xs uppercase tracking-wider2 text-muted-foreground">
                        {[item.size, item.colour].filter((v) => v && v !== 'Default' && v !== 'One size').join(' · ')}
                      </p>
                    )}
                  </div>
                  <p className="font-medium">
                    {formatPrice(
                      (item.product.salePrice ?? item.product.price) * item.quantity
                    )}
                  </p>
                </div>
                <div className="mt-auto flex items-center gap-4 pt-4">
                  <div className="flex items-center border border-border">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      className="inline-flex h-9 w-9 items-center justify-center text-foreground hover:bg-secondary"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="inline-flex h-9 w-9 items-center justify-center text-foreground hover:bg-secondary"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    aria-label="Remove item"
                    onClick={() => removeItem(item.key)}
                    className="inline-flex items-center gap-1 text-xs uppercase tracking-wider2 text-muted-foreground hover:text-foreground"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary + customer info */}
        <aside className="surface-card h-fit p-6">
          <h2 className="eyebrow">Order summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="text-muted-foreground">Confirmed via WhatsApp</dd>
            </div>
          </dl>
          <div className="mt-6 flex justify-between border-t border-border pt-6">
            <span className="eyebrow">Total</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>

          {/* Customer info form */}
          <div className="mt-6 flex flex-col gap-3">
            <span className="eyebrow">Your details</span>
            <input
              type="text"
              placeholder="Full name *"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              className="border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-noir focus:outline-none"
            />
            <input
              type="tel"
              placeholder="WhatsApp / phone number *"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              className="border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-noir focus:outline-none"
            />
            <textarea
              placeholder="Delivery location (city, area, landmark)"
              value={customerInfo.deliveryLocation}
              onChange={(e) => setCustomerInfo({ ...customerInfo, deliveryLocation: e.target.value })}
              rows={2}
              className="resize-none border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-noir focus:outline-none"
            />
          </div>

          {error && (
            <p className="mt-4 text-xs text-destructive">{error}</p>
          )}

          <button
            onClick={handleOrderViaWhatsApp}
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-noir px-6 py-3 text-xs uppercase tracking-editorial text-ivory transition-colors hover:bg-gold hover:text-noir disabled:opacity-60"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Creating order...</>
            ) : (
              <><MessageCircle className="h-4 w-4" /> Order via WhatsApp</>
            )}
          </button>
          {settings.deliveryMessage && (
            <p className="mt-4 text-xs text-muted-foreground">
              {settings.deliveryMessage}
            </p>
          )}
          <Link
            href="/shop"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-border px-6 py-3 text-xs uppercase tracking-editorial text-foreground transition-colors hover:border-noir"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

function buildWhatsAppMessage({
  items,
  subtotal,
  orderRef,
  brandName,
  customerInfo,
}: {
  items: BagItem[];
  subtotal: number;
  orderRef: string;
  brandName: string;
  customerInfo: CustomerInfo;
}) {
  const lines: string[] = [
    `*${brandName} ORDER*`,
    `Order Reference: ${orderRef}`,
    ``,
  ];

  if (customerInfo.name) {
    lines.push(`Customer: ${customerInfo.name}`);
  }
  if (customerInfo.phone) {
    lines.push(`Phone: ${customerInfo.phone}`);
  }

  lines.push('', 'Items:');

  items.forEach((item, i) => {
    const price = item.product.salePrice ?? item.product.price;
    lines.push(`${i + 1}. ${item.product.name}`);
    if (item.size && item.size !== 'One size') {
      lines.push(`   Size: ${item.size}`);
    }
    if (item.colour && item.colour !== 'Default') {
      lines.push(`   Colour: ${item.colour}`);
    }
    lines.push(`   Quantity: ${item.quantity}`);
    lines.push(`   Price: ${formatPrice(price)}`);
  });

  lines.push(
    '',
    `Subtotal: ${formatPrice(subtotal)}`,
    '',
    'Delivery: To be confirmed',
  );

  if (customerInfo.deliveryLocation) {
    lines.push('', `Customer delivery location: ${customerInfo.deliveryLocation}`);
  }

  return lines.join('\n');
}
