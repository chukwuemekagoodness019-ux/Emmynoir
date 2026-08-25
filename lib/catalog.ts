// Stage 1 in-memory demo products.
//
// These are kept for backward compatibility with Stage 1 components that
// haven't yet been migrated to the async data-access layer. New code should
// use the async fetchers in `lib/data/products` instead.
//
// All demo products are clearly marked and should be removed before launch.

export type ProductDivision = 'EMMY WEARS' | 'EMMY JEWELRIES' | 'EMMY LUXE';

export type Product = {
  id: string;
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  division: ProductDivision;
  category: string;
  collection: string;
  price: number;
  salePrice?: number;
  sizes: string[];
  colours: string[];
  stock: number;
  images: string[];
  featured?: boolean;
  availability: 'available' | 'coming-soon' | 'sold-out';
};

export const demoProducts: Product[] = [
  {
    id: 'demo-noir-001',
    slug: 'the-noir-tee',
    name: 'The Noir Tee',
    eyebrow: 'Noir Essentials',
    description: 'A considered everyday layer cut for a confident, quiet silhouette.',
    division: 'EMMY WEARS',
    category: 'T-shirts',
    collection: 'Noir Essentials',
    price: 45000,
    salePrice: 36000,
    sizes: ['S', 'M', 'L', 'XL'],
    colours: ['Noir', 'Ivory'],
    stock: 18,
    images: ['ink', 'ivory'],
    featured: true,
    availability: 'available',
  },
  {
    id: 'demo-noir-002',
    slug: 'after-dark-shirt',
    name: 'After Dark Shirt',
    eyebrow: 'EMMY WEARS',
    description: 'A fluid shirt with a soft structure and an easy after-hours attitude.',
    division: 'EMMY WEARS',
    category: 'Shirts',
    collection: 'After Dark',
    price: 68000,
    sizes: ['S', 'M', 'L'],
    colours: ['Noir'],
    stock: 9,
    images: ['charcoal', 'ink'],
    featured: true,
    availability: 'available',
  },
  {
    id: 'demo-noir-003',
    slug: 'linea-chain',
    name: 'Linea Chain',
    eyebrow: 'EMMY JEWELRIES',
    description: 'A fine statement chain designed to sit close and catch the light.',
    division: 'EMMY JEWELRIES',
    category: 'Necklaces',
    collection: 'Linea',
    price: 52000,
    sizes: ['One size'],
    colours: ['Champagne'],
    stock: 6,
    images: ['champagne', 'stone'],
    featured: true,
    availability: 'available',
  },
  {
    id: 'demo-noir-004',
    slug: 'luxe-object-01',
    name: 'Luxe Object 01',
    eyebrow: 'EMMY LUXE',
    description: 'A first glimpse of the house\u2019s upcoming elevated collection.',
    division: 'EMMY LUXE',
    category: 'Objects',
    collection: 'EMMY LUXE',
    price: 0,
    sizes: ['One size'],
    colours: ['Noir'],
    stock: 0,
    images: ['luxe', 'ink'],
    availability: 'coming-soon',
  },
];

export function getProductBySlug(slug: string) {
  return demoProducts.find((product) => product.slug === slug);
}

export { formatPrice, getDiscountPercentage } from '@/lib/format';
