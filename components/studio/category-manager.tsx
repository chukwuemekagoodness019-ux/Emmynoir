'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  division_id: string | null;
  is_active: boolean;
  sort_order: number;
};

type Division = { id: string; name: string };

export function CategoryManager({
  categories,
  divisions,
}: {
  categories: Category[];
  divisions: Division[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [divisionId, setDivisionId] = useState<string>(editing?.division_id ?? '');

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || '',
      division_id: divisionId || null,
      is_active: formData.get('is_active') === 'on',
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
    };

    try {
      const url = editing ? `/api/studio/categories/${editing.id}` : '/api/studio/categories';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Failed to save');
      }
      toast({ title: editing ? 'Category updated' : 'Category created' });
      setEditing(null);
      setCreating(false);
      setDivisionId('');
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

  const handleDeactivate = async (id: string) => {
    try {
      const res = await fetch(`/api/studio/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to deactivate');
      toast({ title: 'Category deactivated' });
      router.refresh();
    } catch {
      toast({ title: 'Error', description: 'Could not deactivate category', variant: 'destructive' });
    }
  };

  const divisionName = (divId: string | null) =>
    divisions.find((d) => d.id === divId)?.name ?? 'No division';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{categories.length} categories</p>
        <Button onClick={() => { setCreating(true); setEditing(null); setDivisionId(''); }} className="bg-noir text-ivory hover:bg-gold hover:text-noir">
          Add Category
        </Button>
      </div>

      <div className="grid gap-3">
        {categories.map((c) => (
          <div key={c.id} className="surface-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base">{c.name}</h3>
                <span className={`text-[0.625rem] uppercase tracking-wider2 ${c.is_active ? 'text-gold' : 'text-muted-foreground'}`}>
                  {c.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{divisionName(c.division_id)} · /{c.slug}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditing(c); setCreating(false); setDivisionId(c.division_id ?? ''); }}>
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDeactivate(c.id)} className="text-muted-foreground">
                Deactivate
              </Button>
            </div>
          </div>
        ))}
      </div>

      {(editing || creating) && (
        <form onSubmit={handleSave} className="surface-card flex flex-col gap-4 p-6">
          <h2 className="eyebrow">{editing ? 'Edit Category' : 'New Category'}</h2>
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" defaultValue={editing?.name ?? ''} required className="mt-1.5" />
          </div>
          <div>
            <Label>Division</Label>
            <Select value={divisionId} onValueChange={setDivisionId}>
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
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={editing?.description ?? ''} rows={2} className="mt-1.5" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input id="sort_order" name="sort_order" type="number" defaultValue={editing?.sort_order ?? 0} className="mt-1.5" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch id="is_active" name="is_active" defaultChecked={editing?.is_active ?? true} />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="bg-noir text-ivory hover:bg-gold hover:text-noir">
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setEditing(null); setCreating(false); }}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
