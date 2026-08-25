'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export type DivisionOption = { id: string; name: string };
export type CategoryOption = { id: string; name: string; division_id: string | null };
export type CollectionOption = { id: string; name: string };

export type ProductFormData = {
  id?: string;
  name: string;
  description: string;
  division_id: string;
  category_id: string;
  collection_id: string;
  price: string;
  sale_price: string;
  stock: string;
  care_info: string;
  size_guide: string;
  featured: boolean;
  is_published: boolean;
  availability: string;
  sort_order: string;
  sizes: string[];
  colours: string[];
};

export function ProductForm({
  mode,
  initialData,
  divisions,
  categories,
  collections,
}: {
  mode: 'create' | 'edit';
  initialData?: Partial<ProductFormData>;
  divisions: DivisionOption[];
  categories: CategoryOption[];
  collections: CollectionOption[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [sizesInput, setSizesInput] = useState((initialData?.sizes ?? []).join(', '));
  const [coloursInput, setColoursInput] = useState((initialData?.colours ?? []).join(', '));
  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    division_id: initialData?.division_id ?? '',
    category_id: initialData?.category_id ?? '',
    collection_id: initialData?.collection_id ?? '',
    price: initialData?.price ?? '',
    sale_price: initialData?.sale_price ?? '',
    stock: initialData?.stock ?? '0',
    care_info: initialData?.care_info ?? '',
    size_guide: initialData?.size_guide ?? '',
    featured: initialData?.featured ?? false,
    is_published: initialData?.is_published ?? true,
    availability: initialData?.availability ?? 'available',
    sort_order: initialData?.sort_order ?? '0',
    sizes: initialData?.sizes ?? [],
    colours: initialData?.colours ?? [],
  });

  const update = (field: keyof ProductFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) {
      toast({ title: 'Invalid price', description: 'Price must be a valid non-negative number.', variant: 'destructive' });
      setSaving(false);
      return;
    }

    const salePrice = form.sale_price ? parseFloat(form.sale_price) : null;
    if (salePrice !== null && salePrice > price) {
      toast({ title: 'Invalid discount', description: 'Discounted price cannot exceed original price.', variant: 'destructive' });
      setSaving(false);
      return;
    }

    const stock = parseInt(form.stock) || 0;
    if (stock < 0) {
      toast({ title: 'Invalid stock', description: 'Stock cannot be negative.', variant: 'destructive' });
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name,
      description: form.description || null,
      division_id: form.division_id || null,
      category_id: form.category_id || null,
      collection_id: form.collection_id || null,
      price,
      sale_price: salePrice,
      sizes: sizesInput.split(',').map((s) => s.trim()).filter(Boolean),
      colours: coloursInput.split(',').map((s) => s.trim()).filter(Boolean),
      stock,
      care_info: form.care_info || null,
      size_guide: form.size_guide || null,
      featured: form.featured,
      is_published: form.is_published,
      availability: form.availability,
      sort_order: parseInt(form.sort_order) || 0,
    };

    try {
      const url = mode === 'create' ? '/api/studio/products' : `/api/studio/products/${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Failed to save product');
      }

      toast({ title: mode === 'create' ? 'Product created' : 'Product updated' });
      router.push('/studio/products');
      router.refresh();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Basic Information */}
      <section className="surface-card p-6">
        <h2 className="eyebrow mb-4">Basic Information</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
              placeholder="e.g. Classic Noir Shirt"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={4}
              placeholder="Product description..."
              className="mt-1.5"
            />
          </div>
        </div>
      </section>

      {/* Classification */}
      <section className="surface-card p-6">
        <h2 className="eyebrow mb-4">Classification</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Division</Label>
            <Select value={form.division_id} onValueChange={(v) => update('division_id', v)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select division" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category_id} onValueChange={(v) => update('category_id', v)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Collection</Label>
            <Select value={form.collection_id} onValueChange={(v) => update('collection_id', v)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="surface-card p-6">
        <h2 className="eyebrow mb-4">Pricing</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="price">Original Price (₦) *</Label>
            <Input
              id="price"
              type="number"
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              required
              min="0"
              placeholder="50000"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="sale_price">Discounted Price (₦)</Label>
            <Input
              id="sale_price"
              type="number"
              value={form.sale_price}
              onChange={(e) => update('sale_price', e.target.value)}
              min="0"
              placeholder="40000"
              className="mt-1.5"
            />
            {form.price && form.sale_price && parseFloat(form.sale_price) < parseFloat(form.price) && (
              <p className="mt-1 text-xs text-gold">
                {Math.round(((parseFloat(form.price) - parseFloat(form.sale_price)) / parseFloat(form.price)) * 100)}% off
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Variants & Stock */}
      <section className="surface-card p-6">
        <h2 className="eyebrow mb-4">Variants & Stock</h2>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sizes">Sizes (comma-separated)</Label>
              <Input
                id="sizes"
                value={sizesInput}
                onChange={(e) => setSizesInput(e.target.value)}
                placeholder="S, M, L, XL"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="colours">Colours (comma-separated)</Label>
              <Input
                id="colours"
                value={coloursInput}
                onChange={(e) => setColoursInput(e.target.value)}
                placeholder="Noir, Ivory"
                className="mt-1.5"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="stock">Stock Quantity</Label>
            <Input
              id="stock"
              type="number"
              value={form.stock}
              onChange={(e) => update('stock', e.target.value)}
              min="0"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Availability</Label>
            <Select value={form.availability} onValueChange={(v) => update('availability', v)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="coming-soon">Coming Soon</SelectItem>
                <SelectItem value="sold-out">Sold Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="surface-card p-6">
        <h2 className="eyebrow mb-4">Images</h2>
        <p className="text-sm text-muted-foreground">
          {mode === 'edit'
            ? 'Manage images for this product below after saving basic details.'
            : 'After creating the product, you can upload and manage images from the product edit page.'}
        </p>
      </section>

      {/* Additional Information */}
      <section className="surface-card p-6">
        <h2 className="eyebrow mb-4">Additional Information</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="care_info">Care Information</Label>
            <Textarea
              id="care_info"
              value={form.care_info}
              onChange={(e) => update('care_info', e.target.value)}
              rows={2}
              placeholder="e.g. Machine wash cold. Hang dry."
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="size_guide">Size Guide</Label>
            <Textarea
              id="size_guide"
              value={form.size_guide}
              onChange={(e) => update('size_guide', e.target.value)}
              rows={2}
              placeholder="e.g. Model wears M. Regular fit."
              className="mt-1.5"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Switch
                id="featured"
                checked={form.featured}
                onCheckedChange={(v) => update('featured', v)}
              />
              <Label htmlFor="featured">Featured product</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="published"
                checked={form.is_published}
                onCheckedChange={(v) => update('is_published', v)}
              />
              <Label htmlFor="published">Published</Label>
            </div>
          </div>
          <div>
            <Label htmlFor="sort_order">Display Order</Label>
            <Input
              id="sort_order"
              type="number"
              value={form.sort_order}
              onChange={(e) => update('sort_order', e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving} className="bg-noir text-ivory hover:bg-gold hover:text-noir">
          {saving ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
