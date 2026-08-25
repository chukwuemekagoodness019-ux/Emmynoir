import { adminSupabase } from '@/lib/admin-client';
import { SettingsManager } from '@/components/studio/settings-manager';

export const dynamic = 'force-dynamic';

export default async function StudioSettingsPage() {
  const { data, error } = await adminSupabase
    .from('site_settings')
    .select('brand_name, tagline, whatsapp_number, whatsapp_url, instagram_url, tiktok_url, email, phone, delivery_message, about_short, logo_url')
    .eq('id', 1)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="editorial-heading text-3xl">Site Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage brand information, WhatsApp and social links, contact details, and delivery messaging. Changes appear on the storefront immediately.
        </p>
      </div>

      {error && (
        <div className="surface-card border-destructive p-4 text-sm text-destructive">
          Error loading settings: {error.message}
        </div>
      )}

      <SettingsManager initialSettings={data} />
    </div>
  );
}
