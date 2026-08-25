import { supabase } from '@/lib/supabase-client';
import type { SiteSettings } from '@/lib/types';
import { fallbackSettings, type ResolvedSiteSettings } from './site-settings-fallback';

export { fallbackSettings };

export async function getSettingsAsync(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('brand_name, tagline, whatsapp_number, whatsapp_url, instagram_url, tiktok_url, email, phone, delivery_message, about_short, logo_url')
    .eq('id', 1)
    .maybeSingle();

  if (error || !data) {
    return fallbackSettings;
  }

  return {
    brandName: data.brand_name ?? fallbackSettings.brandName,
    tagline: data.tagline ?? fallbackSettings.tagline,
    whatsappNumber: data.whatsapp_number ?? fallbackSettings.whatsappNumber,
    whatsappUrl: data.whatsapp_url ?? fallbackSettings.whatsappUrl,
    instagramUrl: data.instagram_url ?? fallbackSettings.instagramUrl,
    tiktokUrl: data.tiktok_url ?? fallbackSettings.tiktokUrl,
    email: data.email ?? fallbackSettings.email,
    phone: data.phone ?? fallbackSettings.phone,
    deliveryMessage: data.delivery_message ?? fallbackSettings.deliveryMessage,
    aboutShort: data.about_short ?? fallbackSettings.aboutShort,
    logoUrl: data.logo_url ?? null,
  };
}

export type { ResolvedSiteSettings };
