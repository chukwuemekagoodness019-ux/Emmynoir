import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminSupabase, requireAdmin, jsonError } from '../_helpers';

const schema = z.object({
  brand_name: z.string().min(1, 'Brand name is required'),
  tagline: z.string().optional().default(''),
  whatsapp_number: z.string().optional().default(''),
  whatsapp_url: z.string().optional().default(''),
  instagram_url: z.string().optional().default(''),
  tiktok_url: z.string().optional().default(''),
  email: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  delivery_message: z.string().optional().default(''),
  about_short: z.string().optional().default(''),
  logo_url: z.string().optional().default(''),
});

export async function GET() {
  const { data, error } = await adminSupabase
    .from('site_settings')
    .select('brand_name, tagline, whatsapp_number, whatsapp_url, instagram_url, tiktok_url, email, phone, delivery_message, about_short, logo_url')
    .eq('id', 1)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const guard = requireAdmin();
  if (guard) return guard;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Invalid data', 422);

  const { error } = await adminSupabase
    .from('site_settings')
    .update({
      brand_name: parsed.data.brand_name,
      tagline: parsed.data.tagline || null,
      whatsapp_number: parsed.data.whatsapp_number || null,
      whatsapp_url: parsed.data.whatsapp_url || null,
      instagram_url: parsed.data.instagram_url || null,
      tiktok_url: parsed.data.tiktok_url || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      delivery_message: parsed.data.delivery_message || null,
      about_short: parsed.data.about_short || null,
      logo_url: parsed.data.logo_url || null,
    })
    .eq('id', 1);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ saved: true });
}
