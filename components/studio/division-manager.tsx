'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

type Division = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
};

export function DivisionManager({ divisions }: { divisions: Division[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Division | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      tagline: (formData.get('tagline') as string) || '',
      description: (formData.get('description') as string) || '',
      is_active: formData.get('is_active') === 'on',
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
    };

    try {
      const url = editing ? `/api/studio/divisions/${editing.id}` : '/api/studio/divisions';
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
      toast({ title: editing ? 'Division updated' : 'Division created' });
      setEditing(null);
      setCreating(false);
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{divisions.length} divisions</p>
        <Button onClick={() => { setCreating(true); setEditing(null); }} className="bg-noir text-ivory hover:bg-gold hover:text-noir">
          Add Division
        </Button>
      </div>

      <div className="grid gap-3">
        {divisions.map((d) => (
          <div key={d.id} className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-serif text-lg">{d.name}</h3>
              {d.tagline && <p className="text-xs text-muted-foreground">{d.tagline}</p>}
              <div className="mt-1 flex items-center gap-2">
                <span className={`text-[0.625rem] uppercase tracking-wider2 ${d.is_active ? 'text-gold' : 'text-muted-foreground'}`}>
                  {d.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-[0.625rem] text-muted-foreground">/{d.slug}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setEditing(d); setCreating(false); }}>
              Edit
            </Button>
          </div>
        ))}
      </div>

      {(editing || creating) && (
        <form onSubmit={handleSave} className="surface-card flex flex-col gap-4 p-6">
          <h2 className="eyebrow">{editing ? 'Edit Division' : 'New Division'}</h2>
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" defaultValue={editing?.name ?? ''} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" name="tagline" defaultValue={editing?.tagline ?? ''} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={editing?.description ?? ''} rows={3} className="mt-1.5" />
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
