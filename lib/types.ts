// Shared domain types for EMMY NOIR.
//
// These types represent the shape of data as it moves between the database,
// the data-access layer, and the frontend. They are intentionally separate
// from the raw Supabase row shapes so the frontend never couples to database
// column names directly.

export type Division = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  coverImageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type Category = {
  id: string;
  divisionId: string | null;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tone: string | null;
  status: 'active' | 'coming-soon' | 'archived';
  divisionId: string | null;
  coverImageUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type ProductVariant = {
  id: string;
  size: string | null;
  colour: string | null;
  stock: number;
  sku: string | null;
  priceAdjustment: number;
  availability: 'available' | 'sold-out' | 'coming-soon';
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  divisionId: string | null;
  divisionName: string | null;
  divisionSlug: string | null;
  categoryId: string | null;
  categoryName: string | null;
  collectionId: string | null;
  collectionName: string | null;
  price: number;
  salePrice: number | null;
  sizes: string[];
  colours: string[];
  stock: number;
  careInfo: string | null;
  sizeGuide: string | null;
  featured: boolean;
  availability: 'available' | 'coming-soon' | 'sold-out';
  isPublished: boolean;
  sortOrder: number;
  images: ProductImage[];
  variants: ProductVariant[];
};

export type OrderStatus =
  | 'new'
  | 'contacted'
  | 'payment-pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'refunded' | 'failed';

export type WhatsAppHandoffStatus = 'pending' | 'sent' | 'confirmed' | 'failed';

export type OrderItem = {
  id: string;
  productId: string | null;
  name: string;
  size: string | null;
  colour: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  reference: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  deliveryLocation: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  whatsappHandoffStatus: WhatsAppHandoffStatus;
  subtotal: number;
  deliveryFee: number | null;
  total: number | null;
  notes: string | null;
  items: OrderItem[];
};

export type HomepageSection = {
  id: string;
  sectionKey: string;
  title: string;
  subtitle: string | null;
  sectionType: string;
  isEnabled: boolean;
  sortOrder: number;
  config: Record<string, unknown>;
};

export type SiteSettings = {
  brandName: string;
  tagline: string | null;
  whatsappNumber: string | null;
  whatsappUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  email: string | null;
  phone: string | null;
  deliveryMessage: string | null;
  aboutShort: string | null;
  logoUrl: string | null;
};
