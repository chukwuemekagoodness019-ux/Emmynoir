// Development placeholder fallback for site settings.
// Used when the database row is not yet populated or the fetch fails.
// All fields are guaranteed non-null so the UI always has real values.

export type ResolvedSiteSettings = {
  brandName: string;
  tagline: string;
  whatsappNumber: string;
  whatsappUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  email: string;
  phone: string;
  deliveryMessage: string;
  aboutShort: string;
  logoUrl: string | null;
};

export const fallbackSettings: ResolvedSiteSettings = {
  brandName: 'EMMY NOIR',
  tagline: 'Modern Fashion House',
  whatsappNumber: '+234 800 000 0000',
  whatsappUrl: 'https://wa.me/2348000000000',
  instagramUrl: 'https://instagram.com/emmynoir',
  tiktokUrl: 'https://tiktok.com/@emmynoir',
  email: 'hello@emmynoir.example',
  phone: '+234 800 000 0000',
  deliveryMessage:
    'Delivery is available across Nigeria. Delivery fees are confirmed with our team through WhatsApp.',
  aboutShort:
    'EMMY NOIR is a modern fashion house built on quiet luxury and considered design.',
  logoUrl: null,
};
