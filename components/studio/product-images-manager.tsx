'use client';

import { useState } from 'react';
import { Trash2, Star, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Image = {
  id: string;
  url: string;
  alt: string | null;
  sort_order: number;
  is_primary: boolean;
};

export function ProductImagesManager({
  productId,
  images,
}: {
  productId: string;
  images: Image[];
}) {
  const [list, setList] = useState<Image[]>(images);
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [adding, setAdding] = useState(false);

  const addImage = async () => {
    if (!url.trim()) {
      toast({ title: 'URL required', description: 'Please enter an image URL.', variant: 'destructive' });
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`/api/studio/products/${productId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), alt: alt.trim() || undefined }),
      });
      if (!res.ok) throw new Error('Failed to add image');
      const newImage = await res.json();
      setList((prev) => [...prev, newImage]);
      setUrl('');
      setAlt('');
      toast({ title: 'Image added' });
    } catch {
      toast({ title: 'Error', description: 'Could not add image. Is the server configured for admin operations?', variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const removeImage = async (imageId: string) => {
    try {
      const res = await fetch(`/api/studio/products/${productId}/images?imageId=${imageId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove image');
      setList((prev) => prev.filter((img) => img.id !== imageId));
      toast({ title: 'Image removed' });
    } catch {
      toast({ title: 'Error', description: 'Could not remove image.', variant: 'destructive' });
    }
  };

  const setPrimary = async (imageId: string) => {
    try {
      const res = await fetch(`/api/studio/products/${productId}/images`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, is_primary: true }),
      });
      if (!res.ok) throw new Error('Failed to set primary');
      setList((prev) =>
        prev.map((img) => ({ ...img, is_primary: img.id === imageId }))
      );
      toast({ title: 'Primary image updated' });
    } catch {
      toast({ title: 'Error', description: 'Could not update primary image.', variant: 'destructive' });
    }
  };

  return (
    <section className="surface-card p-6">
      <h2 className="eyebrow mb-4">Images</h2>

      {/* Upload note */}
      <div className="mb-6 rounded border border-border bg-secondary/30 p-4 text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <Upload className="h-3.5 w-3.5" />
          Enter an image URL to associate with this product. Production image upload to cloud storage requires configuring a storage provider (see Stage 3 notes).
        </p>
      </div>

      {/* Add image form */}
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <Label htmlFor="img-url">Image URL</Label>
          <Input id="img-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="img-alt">Alt text</Label>
          <Input id="img-alt" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Description..." className="mt-1.5" />
        </div>
        <Button onClick={addImage} disabled={adding} className="bg-noir text-ivory hover:bg-gold hover:text-noir">
          {adding ? 'Adding...' : 'Add Image'}
        </Button>
      </div>

      {/* Image grid */}
      {list.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-3 md:grid-cols-4">
          {list.map((img) => (
            <div key={img.id} className="group relative overflow-hidden rounded border border-border">
              <div className="aspect-square bg-secondary">
                {img.url.startsWith('http') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt={img.alt ?? ''} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    {img.url}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between p-2">
                <button
                  onClick={() => setPrimary(img.id)}
                  className={cn(
                    'inline-flex items-center gap-1 text-xs',
                    img.is_primary ? 'text-gold' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Star className={cn('h-3.5 w-3.5', img.is_primary && 'fill-current')} />
                  {img.is_primary ? 'Primary' : 'Set primary'}
                </button>
                <button
                  onClick={() => removeImage(img.id)}
                  className="inline-flex items-center text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">No images yet. Add an image URL above.</p>
      )}
    </section>
  );
}
