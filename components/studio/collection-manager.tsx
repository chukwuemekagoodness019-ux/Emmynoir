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

type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tone: string | null;
  status: string;
  division_id: string | null;
  cover_image_url: string | null;
  is_featured: boolean;
  sort_order: number;
};

type Division = { id: string; name: string };

export function CollectionManager({
  collections,
  divisions,
}: {
  collections: Collection[];
  divisions: Division[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Collection | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [divisionId, setDivisionId] = useState<string>(editing?.division_id ?? '');
  const [status, setStatus] = useState<string>(editing?.status ?? 'active');

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || '',
      tone: (formData.get('tone') as string) || '',
      status,
      division_id: divisionId || null,
      cover_image_url: (formData.get('cover_image_url') as string) || '',
      is_featured: formData.get('is_featured') === 'on',
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
    };

    try {
      const url = editing ? `/api/studio/collections/${editing.id}` : '/api/studio/collections';
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
      toast({ title: editing ? 'Collection updated' : 'Collection created' });
      setEditing(null);
      setCreating(false);
      setDivisionId('');
      setStatus('active');
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

  const handleArchive = async (id: string) => {
    try {
      const res = await fetch(`/api/studio/collections/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to archive');
      toast({ title: 'Collection archived' });
      router.refresh();
    } catch {
      toast({ title: 'Error', description: 'Could not archive collection', variant: 'destructive' });
    }
  };

  const statusColor = (s: string) => {
    if (s === 'active') return 'text-gold';
    if (s === 'coming-soon') return 'text-muted-foreground';
    return 'text-muted-foreground/60';
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{collections.length} collections</p>
        <Button onClick={() => { setCreating(true); setEditing(null); setDivisionId(''); setStatus('active'); }} className="bg-noir text-ivory hover:bg-gold hover:text-noir">
          Add Collection
        </Button>
      </div>

      <div className="grid gap-3">
        {collections.map((c) => (
          <div key={c.id} className="surface-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif text-base">{c.name}</h3>
                <span className={`text-[0.625rem] uppercase tracking-wider2 ${statusColor(c.status)}`}>
                  {c.status}
                </span>
                {c.is_featured && (
                  <span className="bg-gold/20 px-2 py-0.5 text-[0.625rem] uppercase tracking-wider2 text-gold">Featured</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {divisions.find((d) => d.id === c.division_id)?.name ?? 'No division'} · /{c.slug}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditing(c); setCreating(false); setDivisionId(c.division_id ?? ''); setStatus(c.status); }}>
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleArchive(c.id)} className="text-muted-foreground">
                Archive
              </Button>
            </div>
          </div>
        ))}
      </div>

      {(editing || creating) && (
        <form onSubmit={handleSave} className="surface-card flex flex-col gap-4 p-6">
          <h2 className="eyebrow">{editing ? 'Edit Collection' : 'New Collection'}</h2>
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" defaultValue={editing?.name ?? ''} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={editing?.description ?? ''} rows={3} className="mt-1.5" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
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
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="coming-soon">Coming Soon</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="tone">Tone (visual identifier)</Label>
              <Input id="tone" name="tone" defaultValue={editing?.tone ?? ''} placeholder="ink, champagne, stone..." className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="cover_image_url">Cover Image URL</Label>
              <Input id="cover_image_url" name="cover_image_url" defaultValue={editing?.cover_image_url ?? ''} placeholder="https://..." className="mt-1.5" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input id="sort_order" name="sort_order" type="number" defaultValue={editing?.sort_order ?? 0} className="mt-1.5" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch id="is_featured" name="is_featured" defaultChecked={editing?.is_featured ?? false} />
              <Label htmlFor="is_featured">Featured</Label>
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
