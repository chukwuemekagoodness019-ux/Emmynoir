import { adminSupabase } from '@/lib/admin-client';
import { formatPrice } from '@/lib/format';

export const dynamic = 'force-dynamic';

type OrderRow = {
  id: string;
  reference: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  delivery_location: string | null;
  status: string;
  subtotal: number;
  created_at: string;
};

export default async function StudioCustomersPage() {
  const { data: orders, error } = await adminSupabase
    .from('orders')
    .select('id, reference, customer_name, customer_phone, customer_email, delivery_location, status, subtotal, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="editorial-heading text-3xl">Customers</h1>
        </div>
        <div className="surface-card border-destructive p-4 text-sm text-destructive">
          Error loading data: {error.message}
        </div>
      </div>
    );
  }

  const orderList = (orders ?? []) as OrderRow[];

  // Group by phone (or name if phone missing) to identify unique customers
  const customerMap = new Map<string, {
    name: string;
    phone: string | null;
    email: string | null;
    location: string | null;
    orderCount: number;
    totalSpent: number;
    lastOrder: string;
  }>();

  for (const order of orderList) {
    const key = order.customer_phone ?? order.customer_name ?? order.id;
    const existing = customerMap.get(key);
    if (existing) {
      existing.orderCount++;
      existing.totalSpent += Number(order.subtotal);
      existing.lastOrder = order.created_at;
    } else {
      customerMap.set(key, {
        name: order.customer_name ?? 'Guest',
        phone: order.customer_phone,
        email: order.customer_email,
        location: order.delivery_location,
        orderCount: 1,
        totalSpent: Number(order.subtotal),
        lastOrder: order.created_at,
      });
    }
  }

  const customers = Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="editorial-heading text-3xl">Customers</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {customers.length} customer{customers.length !== 1 ? 's' : ''} from order history. No registration required.
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="surface-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No customers yet. Customer information will appear here when orders are placed.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {customers.map((c, i) => (
            <div key={i} className="surface-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="font-serif text-base">{c.name}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                  {c.phone && <span>{c.phone}</span>}
                  {c.email && <span>{c.email}</span>}
                  {c.location && <span>{c.location}</span>}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-right">
                  <div className="font-medium">{formatPrice(c.totalSpent)}</div>
                  <div className="text-xs text-muted-foreground">{c.orderCount} order{c.orderCount !== 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
