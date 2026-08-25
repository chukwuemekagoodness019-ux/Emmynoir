'use client';

import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

type Variant = {
  id: string;
  size: string | null;
  colour: string | null;
  stock: number;
  sku: string | null;
  price_adjustment: number;
  availability: string;
};

export function ProductVariantsManager({
  productId,
  variants,
}: {
  productId: string;
  variants: Variant[];
}) {
  const [list, setList] = useState<Variant[]>(variants);
  const [size, setSize] = useState('');
  const [colour, setColour] = useState('');
  const [stock, setStock] = useState('0');
  const [sku, setSku] = useState('');
  const [adding, setAdding] = useState(false);

  const addVariant = async () => {
    setAdding(true);
    try {
      const res = await fetch(`/api/studio/products/${productId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          size: size || undefined,
          colour: colour || undefined,
          stock: parseInt(stock) || 0,
          sku: sku || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to add variant');
      const newVariant = await res.json();
      setList((prev) => [...prev, newVariant]);
      setSize('');
      setColour('');
      setStock('0');
      setSku('');
      toast({ title: 'Variant added' });
    } catch {
      toast({ title: 'Error', description: 'Could not add variant.', variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const removeVariant = async (variantId: string) => {
    try {
      const res = await fetch(`/api/studio/products/${productId}/variants?variantId=${variantId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove variant');
      setList((prev) => prev.filter((v) => v.id !== variantId));
      toast({ title: 'Variant removed' });
    } catch {
      toast({ title: 'Error', description: 'Could not remove variant.', variant: 'destructive' });
    }
  };

  return (
    <section className="surface-card p-6">
      <h2 className="eyebrow mb-4">Variants</h2>
      <p className="mb-4 text-xs text-muted-foreground">
        Add size/colour combinations with individual stock. Leave blank if not applicable.
      </p>

      {/* Add variant form */}
      <div className="grid gap-3 sm:grid-cols-5 sm:items-end">
        <div>
          <Label htmlFor="v-size">Size</Label>
          <Input id="v-size" value={size} onChange={(e) => setSize(e.target.value)} placeholder="M" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="v-colour">Colour</Label>
          <Input id="v-colour" value={colour} onChange={(e) => setColour(e.target.value)} placeholder="Noir" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="v-stock">Stock</Label>
          <Input id="v-stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="v-sku">SKU</Label>
          <Input id="v-sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Optional" className="mt-1.5" />
        </div>
        <Button onClick={addVariant} disabled={adding} className="bg-noir text-ivory hover:bg-gold hover:text-noir">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Variant list */}
      {list.length > 0 ? (
        <div className="mt-6 space-y-2">
          {list.map((v) => (
            <div key={v.id} className="flex items-center justify-between rounded border border-border px-4 py-2.5">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span>{v.size ?? '—'}</span>
                <span className="text-muted-foreground">·</span>
                <span>{v.colour ?? '—'}</span>
                <span className="text-muted-foreground">·</span>
                <span>{v.stock} in stock</span>
                {v.sku && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{v.sku}</span>
                  </>
                )}
              </div>
              <button
                onClick={() => removeVariant(v.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">No variants yet. Add one above.</p>
      )}
    </section>
  );
}
