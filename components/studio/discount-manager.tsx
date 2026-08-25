'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { formatPrice, getDiscountPercentage } from '@/lib/format';

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
};

export function DiscountManager({ products }: { products: Product[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Product | null>(null);
  const [salePrice, setSalePrice] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editing) return;
    const price = parseFloat(salePrice);
    if (isNaN(price) || price < 0) {
      toast({ title: 'Invalid price', description: 'Enter a valid non-negative number', variant: 'destructive' });
      return;
    }
    if (price >= editing.price) {
      toast({ title: 'Invalid discount', description: 'Sale price must be less than original price', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/studio/products/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sale_price: price }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast({ title: 'Discount applied' });
      setEditing(null);
      setSalePrice('');
      router.refresh();
    } catch {
      toast({ title: 'Error', description: 'Could not apply discount', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (product: Product) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/studio/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sale_price: null }),
      });
      if (!res.ok) throw new Error('Failed to remove');
      toast({ title: 'Discount removed' });
      router.refresh();
    } catch {
      toast({ title: 'Error', description: 'Could not remove discount', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3">
        {products.map((p) => {
          const discount = getDiscountPercentage(p.price, p.sale_price);
          return (
            <div key={p.id} className="surface-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="font-serif text-base">{p.name}</h3>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{formatPrice(p.price)}</span>
                  {discount > 0 && (
                    <>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium text-gold">{formatPrice(p.sale_price!)}</span>
                      <span className="bg-gold/20 px-2 py-0.5 text-[0.625rem] uppercase tracking-wider2 text-gold">{discount}% off</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setEditing(p); setSalePrice(p.sale_price ? String(p.sale_price) : ''); }}
                >
                  {discount > 0 ? 'Edit Discount' : 'Add Discount'}
                </Button>
                {discount > 0 && (
                  <Button variant="outline" size="sm" onClick={() => handleRemove(p)} disabled={saving} className="text-muted-foreground">
                    Remove
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="surface-card flex flex-col gap-4 p-6">
          <h2 className="eyebrow">Set Discount for {editing.name}</h2>
          <div className="text-sm text-muted-foreground">
            Original price: <span className="font-medium text-foreground">{formatPrice(editing.price)}</span>
          </div>
          <div>
            <Label htmlFor="sale_price">Sale Price (₦)</Label>
            <Input
              id="sale_price"
              type="number"
              min="0"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="e.g. 40000"
              className="mt-1.5"
            />
            {salePrice && parseFloat(salePrice) > 0 && parseFloat(salePrice) < editing.price && (
              <p className="mt-1 text-xs text-gold">
                {getDiscountPercentage(editing.price, parseFloat(salePrice))}% off
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="bg-noir text-ivory hover:bg-gold hover:text-noir">
              {saving ? 'Saving...' : 'Apply'}
            </Button>
            <Button variant="outline" onClick={() => { setEditing(null); setSalePrice(''); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
