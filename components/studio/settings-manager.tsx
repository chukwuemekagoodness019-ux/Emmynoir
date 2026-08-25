'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

type Settings = {
  brand_name: string;
  tagline: string;
  whatsapp_number: string;
  whatsapp_url: string;
  instagram_url: string;
  tiktok_url: string;
  email: string;
  phone: string;
  delivery_message: string;
  about_short: string;
  logo_url: string;
};

export function SettingsManager({ initialSettings }: { initialSettings: Settings | null }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Settings>({
    brand_name: initialSettings?.brand_name ?? '',
    tagline: initialSettings?.tagline ?? '',
    whatsapp_number: initialSettings?.whatsapp_number ?? '',
    whatsapp_url: initialSettings?.whatsapp_url ?? '',
    instagram_url: initialSettings?.instagram_url ?? '',
    tiktok_url: initialSettings?.tiktok_url ?? '',
    email: initialSettings?.email ?? '',
    phone: initialSettings?.phone ?? '',
    delivery_message: initialSettings?.delivery_message ?? '',
    about_short: initialSettings?.about_short ?? '',
    logo_url: initialSettings?.logo_url ?? '',
  });

  useEffect(() => {
    if (initialSettings) {
      setForm({
        brand_name: initialSettings.brand_name ?? '',
        tagline: initialSettings.tagline ?? '',
        whatsapp_number: initialSettings.whatsapp_number ?? '',
        whatsapp_url: initialSettings.whatsapp_url ?? '',
        instagram_url: initialSettings.instagram_url ?? '',
        tiktok_url: initialSettings.tiktok_url ?? '',
        email: initialSettings.email ?? '',
        phone: initialSettings.phone ?? '',
        delivery_message: initialSettings.delivery_message ?? '',
        about_short: initialSettings.about_short ?? '',
        logo_url: initialSettings.logo_url ?? '',
      });
    }
  }, [initialSettings]);

  const update = (field: keyof Settings, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brand_name.trim()) {
      toast({ title: 'Brand name required', variant: 'destructive' });
      return;
    }

    // Validate URLs if provided
    const urls: (keyof Settings)[] = ['whatsapp_url', 'instagram_url', 'tiktok_url', 'logo_url'];
    for (const field of urls) {
      const val = form[field];
      if (val && !val.startsWith('http://') && !val.startsWith('https://') && !val.startsWith('wa.me')) {
        toast({ title: 'Invalid URL', description: `${field} must start with http:// or https://`, variant: 'destructive' });
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch('/api/studio/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Failed to save');
      }
      toast({ title: 'Settings saved' });
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
    <form onSubmit={handleSave} className="flex flex-col gap-8">
      {/* Brand */}
      <section className="surface-card p-6">
        <h2 className="eyebrow mb-4">Brand</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="brand_name">Brand Name *</Label>
            <Input id="brand_name" value={form.brand_name} onChange={(e) => update('brand_name', e.target.value)} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" value={form.tagline} onChange={(e) => update('tagline', e.target.value)} placeholder="Modern Fashion House" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="about_short">About / Brand Story</Label>
            <Textarea id="about_short" value={form.about_short} onChange={(e) => update('about_short', e.target.value)} rows={4} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input id="logo_url" value={form.logo_url} onChange={(e) => update('logo_url', e.target.value)} placeholder="https://..." className="mt-1.5" />
          </div>
        </div>
      </section>

      {/* WhatsApp + Social */}
      <section className="surface-card p-6">
        <h2 className="eyebrow mb-4">WhatsApp &amp; Social Links</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
            <Input id="whatsapp_number" value={form.whatsapp_number} onChange={(e) => update('whatsapp_number', e.target.value)} placeholder="+234 800 000 0000" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="whatsapp_url">WhatsApp Link</Label>
            <Input id="whatsapp_url" value={form.whatsapp_url} onChange={(e) => update('whatsapp_url', e.target.value)} placeholder="https://wa.me/2348000000000" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="instagram_url">Instagram URL</Label>
            <Input id="instagram_url" value={form.instagram_url} onChange={(e) => update('instagram_url', e.target.value)} placeholder="https://instagram.com/..." className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="tiktok_url">TikTok URL</Label>
            <Input id="tiktok_url" value={form.tiktok_url} onChange={(e) => update('tiktok_url', e.target.value)} placeholder="https://tiktok.com/@..." className="mt-1.5" />
          </div>
        </div>
      </section>

      {/* Contact + Delivery */}
      <section className="surface-card p-6">
        <h2 className="eyebrow mb-4">Contact &amp; Delivery</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="email">Business Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="hello@emmynoir.com" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="phone">Business Phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+234 800 000 0000" className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="delivery_message">Delivery Message</Label>
            <Textarea id="delivery_message" value={form.delivery_message} onChange={(e) => update('delivery_message', e.target.value)} rows={3} className="mt-1.5" />
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving} className="bg-noir text-ivory hover:bg-gold hover:text-noir">
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Settings</>}
        </Button>
      </div>
    </form>
  );
}
