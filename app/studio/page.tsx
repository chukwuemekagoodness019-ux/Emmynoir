import Link from 'next/link';
import { Package, ShoppingBag, FolderOpen, Settings, AlertTriangle, ClipboardList, Plus, Users, TrendingUp, Home, Tag } from 'lucide-react';
import { adminSupabase } from '@/lib/admin-client';

export const dynamic = 'force-dynamic';

async function getDashboardStats() {
  const [
    allProductsRes,
    activeProductsRes,
    outOfStockRes,
    ordersRes,
    newOrdersRes,
    paidOrdersRes,
    collectionsRes,
    customersRes,
    lowStockRes,
    featuredRes,
  ] = await Promise.all([
    adminSupabase.from('products').select('id', { count: 'exact', head: true }),
    adminSupabase.from('products').select('id', { count: 'exact', head: true }).eq('is_published', true),
    adminSupabase.from('products').select('id', { count: 'exact', head: true }).eq('stock', 0),
    adminSupabase.from('orders').select('id', { count: 'exact', head: true }),
    adminSupabase.from('orders').select('id', { count: 'exact', head: true }).in('status', ['new', 'contacted']),
    adminSupabase.from('orders').select('id', { count: 'exact', head: true }).eq('payment_status', 'paid'),
    adminSupabase.from('collections').select('id', { count: 'exact', head: true }).in('status', ['active', 'coming-soon']),
    adminSupabase.from('orders').select('customer_phone, customer_name', { count: 'exact', head: true }),
    adminSupabase.from('products').select('name, slug, stock').lt('stock', 5).eq('is_published', true).order('stock', { ascending: true }).limit(5),
    adminSupabase.from('products').select('id', { count: 'exact', head: true }).eq('featured', true).eq('is_published', true),
  ]);

  return {
    totalProducts: allProductsRes.count ?? 0,
    activeProducts: activeProductsRes.count ?? 0,
    outOfStock: outOfStockRes.count ?? 0,
    totalOrders: ordersRes.count ?? 0,
    newOrders: newOrdersRes.count ?? 0,
    paidOrders: paidOrdersRes.count ?? 0,
    collections: collectionsRes.count ?? 0,
    customers: customersRes.count ?? 0,
    featuredProducts: featuredRes.count ?? 0,
    lowStock: lowStockRes.data ?? [],
  };
}

export default async function StudioDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: 'Total Products', value: stats.totalProducts, href: '/studio/products', icon: Package },
    { label: 'Active Products', value: stats.activeProducts, href: '/studio/products', icon: TrendingUp },
    { label: 'Out of Stock', value: stats.outOfStock, href: '/studio/products', icon: AlertTriangle },
    { label: 'Featured', value: stats.featuredProducts, href: '/studio/products', icon: ShoppingBag },
    { label: 'Total Orders', value: stats.totalOrders, href: '/studio/orders', icon: ClipboardList },
    { label: 'New Orders', value: stats.newOrders, href: '/studio/orders', icon: ClipboardList },
    { label: 'Paid Orders', value: stats.paidOrders, href: '/studio/orders', icon: Tag },
    { label: 'Collections', value: stats.collections, href: '/studio/collections', icon: FolderOpen },
  ];

  const quickActions = [
    { label: 'Add Product', href: '/studio/products/new', icon: Plus },
    { label: 'Create Collection', href: '/studio/collections', icon: FolderOpen },
    { label: 'View Orders', href: '/studio/orders', icon: ClipboardList },
    { label: 'Edit Homepage', href: '/studio/homepage', icon: Home },
    { label: 'Manage Discounts', href: '/studio/discounts', icon: Tag },
    { label: 'Site Settings', href: '/studio/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="editorial-heading text-3xl">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Overview of the EMMY NOIR house.
          </p>
        </div>
        <Link
          href="/studio/products/new"
          className="inline-flex items-center gap-2 bg-noir px-5 py-2.5 text-xs uppercase tracking-editorial text-ivory transition-colors hover:bg-gold hover:text-noir"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="surface-card flex flex-col gap-3 p-5 transition-colors hover:border-foreground"
          >
            <card.icon className="h-5 w-5 text-gold" />
            <span className="text-3xl font-serif">{card.value}</span>
            <span className="eyebrow">{card.label}</span>
          </Link>
        ))}
      </div>

      {/* Low stock alert */}
      {stats.lowStock.length > 0 && (
        <div className="surface-card p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-gold" />
            <h2 className="eyebrow">Low Stock Alert</h2>
          </div>
          <div className="mt-4 space-y-2">
            {stats.lowStock.map((p) => (
              <Link
                key={p.slug}
                href={`/studio/products/${p.slug}`}
                className="flex items-center justify-between rounded border border-border px-4 py-2.5 text-sm transition-colors hover:border-foreground"
              >
                <span>{p.name}</span>
                <span className={p.stock === 0 ? 'text-destructive' : 'text-gold'}>
                  {p.stock} left
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="eyebrow mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="surface-card flex items-center gap-3 p-5 text-sm transition-colors hover:border-foreground"
            >
              <action.icon className="h-5 w-5 text-gold" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
