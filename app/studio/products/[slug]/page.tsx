import { notFound } from 'next/navigation';
import { adminSupabase } from '@/lib/admin-client';
import { ProductForm } from '@/components/studio/product-form';
import { ProductImagesManager } from '@/components/studio/product-images-manager';
import { ProductVariantsManager } from '@/components/studio/product-variants-manager';
import { ArchiveProductButton } from '@/components/studio/archive-product-button';

export const dynamic = 'force-dynamic';

type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  division_id: string | null;
  category_id: string | null;
  collection_id: string | null;
  price: number;
  sale_price: number | null;
  sizes: string[];
  colours: string[];
  stock: number;
  care_info: string | null;
  size_guide: string | null;
  featured: boolean;
  availability: string;
  is_published: boolean;
  sort_order: number;
  images: { id: string; url: string; alt: string | null; sort_order: number; is_primary: boolean }[];
  variants: { id: string; size: string | null; colour: string | null; stock: number; sku: string | null; price_adjustment: number; availability: string }[];
};

export default async function EditProductPage({ params }: { params: { slug: string } }) {
  const { data: product, error } = await adminSupabase
    .from('products')
    .select(`
      id, name, slug, description, division_id, category_id, collection_id,
      price, sale_price, sizes, colours, stock, care_info, size_guide,
      featured, availability, is_published, sort_order
    `)
    .eq('slug', params.slug)
    .maybeSingle();

  if (error || !product) notFound();

  const [divisionsRes, categoriesRes, collectionsRes, imagesRes, variantsRes] = await Promise.all([
    adminSupabase.from('divisions').select('id, name').order('sort_order'),
    adminSupabase.from('categories').select('id, name, division_id').order('sort_order'),
    adminSupabase.from('collections').select('id, name').order('sort_order'),
    adminSupabase.from('product_images').select('id, url, alt, sort_order, is_primary').eq('product_id', product.id).order('sort_order'),
    adminSupabase.from('product_variants').select('id, size, colour, stock, sku, price_adjustment, availability').eq('product_id', product.id).order('created_at'),
  ]);

  const detail: ProductDetail = {
    ...product,
    images: imagesRes.data ?? [],
    variants: variantsRes.data ?? [],
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="editorial-heading text-3xl">{product.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Edit product details, images, and variants.</p>
        </div>
        <ArchiveProductButton productId={product.id} />
      </div>

      <ProductForm
        mode="edit"
        initialData={{
          id: product.id,
          name: product.name,
          description: product.description ?? '',
          division_id: product.division_id ?? '',
          category_id: product.category_id ?? '',
          collection_id: product.collection_id ?? '',
          price: String(product.price),
          sale_price: product.sale_price != null ? String(product.sale_price) : '',
          stock: String(product.stock),
          care_info: product.care_info ?? '',
          size_guide: product.size_guide ?? '',
          featured: product.featured,
          is_published: product.is_published,
          availability: product.availability,
          sort_order: String(product.sort_order),
          sizes: product.sizes,
          colours: product.colours,
        }}
        divisions={divisionsRes.data ?? []}
        categories={categoriesRes.data ?? []}
        collections={collectionsRes.data ?? []}
      />

      <ProductImagesManager productId={product.id} images={detail.images} />
      <ProductVariantsManager productId={product.id} variants={detail.variants} />
    </div>
  );
}
