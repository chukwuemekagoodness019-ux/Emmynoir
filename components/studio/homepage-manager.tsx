'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Loader2, GripVertical } from 'lucide-react';

type Section = {
  id: string;
  section_key: string;
  title: string;
  subtitle: string | null;
  section_type: string;
  is_enabled: boolean;
  sort_order: number;
};

export function HomepageManager({ sections }: { sections: Section[] }) {
  const router = useRouter();
  const [localSections, setLocalSections] = useState(sections);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    setLocalSections(sections);
  }, [sections]);

  const handleToggle = async (section: Section) => {
    setSaving(section.id);
    try {
      const res = await fetch('/api/studio/homepage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId: section.id, is_enabled: !section.is_enabled }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast({ title: section.is_enabled ? 'Section disabled' : 'Section enabled' });
      setLocalSections((prev) =>
        prev.map((s) => (s.id === section.id ? { ...s, is_enabled: !s.is_enabled } : s))
      );
      router.refresh();
    } catch {
      toast({ title: 'Error', description: 'Could not update section', variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  const handleFieldUpdate = async (section: Section, field: 'title' | 'subtitle', value: string) => {
    setSaving(section.id);
    try {
      const res = await fetch('/api/studio/homepage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId: section.id, [field]: value }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast({ title: 'Section updated' });
      router.refresh();
    } catch {
      toast({ title: 'Error', description: 'Could not update section', variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  const handleReorder = async (section: Section, direction: 'up' | 'down') => {
    const currentIndex = localSections.findIndex((s) => s.id === section.id);
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= localSections.length) return;

    const newOrder = [...localSections];
    [newOrder[currentIndex], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[currentIndex]];

    setLocalSections(newOrder);

    setSaving(section.id);
    try {
      await Promise.all(
        newOrder.map((s, i) =>
          fetch('/api/studio/homepage', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sectionId: s.id, sort_order: i }),
          })
        )
      );
      toast({ title: 'Order updated' });
      router.refresh();
    } catch {
      toast({ title: 'Error', description: 'Could not reorder', variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {localSections.map((section, index) => (
        <div key={section.id} className="surface-card flex flex-col gap-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <div>
                <h3 className="font-serif text-base">{section.section_key.replace(/-/g, ' ')}</h3>
                <span className="text-[0.625rem] uppercase tracking-wider2 text-muted-foreground">{section.section_type}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => handleReorder(section, 'up')}
                  disabled={index === 0 || saving === section.id}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  aria-label="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={() => handleReorder(section, 'down')}
                  disabled={index === localSections.length - 1 || saving === section.id}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  aria-label="Move down"
                >
                  ▼
                </button>
              </div>
              <Switch
                checked={section.is_enabled}
                onCheckedChange={() => handleToggle(section)}
                disabled={saving === section.id}
              />
            </div>
          </div>

          {section.is_enabled && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor={`title-${section.id}`}>Title</Label>
                <Input
                  id={`title-${section.id}`}
                  defaultValue={section.title}
                  onBlur={(e) => {
                    if (e.target.value !== section.title) {
                      handleFieldUpdate(section, 'title', e.target.value);
                    }
                  }}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor={`subtitle-${section.id}`}>Subtitle</Label>
                <Input
                  id={`subtitle-${section.id}`}
                  defaultValue={section.subtitle ?? ''}
                  onBlur={(e) => {
                    if (e.target.value !== (section.subtitle ?? '')) {
                      handleFieldUpdate(section, 'subtitle', e.target.value);
                    }
                  }}
                  className="mt-1.5"
                />
              </div>
            </div>
          )}

          {saving === section.id && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving...
            </div>
          )}
        </div>
      ))}

      {localSections.length === 0 && (
        <div className="surface-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No homepage sections configured. Sections are created through database seeding.</p>
        </div>
      )}
    </div>
  );
}
